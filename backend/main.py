from fastapi import FastAPI, Depends, HTTPException, status
from tortoise.contrib.fastapi import register_tortoise
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer

from models import (
    User, Category, Field, Item,
    Category_Pydantic, Category_Pydantic_IN,
    Field_Pydantic, Field_Pydantic_IN,
    Item_Pydantic, Item_Pydantic_IN,
    User_Pydantic, UserIn_Pydantic, Token  # Added auth models
)

from fastapi import BackgroundTasks
from starlette.responses import JSONResponse
from starlette.requests import Request
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import BaseModel, EmailStr
from typing import List

# dotenv
from dotenv import dotenv_values

# --- Import our new auth functions ---
from auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_token
)

# credentials
credentials = dotenv_values(".env")

# CORS
from fastapi.middleware.cors import CORSMiddleware


# Create an instance of the FastAPI application
app = FastAPI()


# CORS Middleware
origins = [
    'http://localhost:3000'  # React frontend default adress
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# --- NEW: Authentication "Gatekeeper" ---

# This tells FastAPI where to check for the token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    This is our new "gatekeeper" or "dependency".
    It decodes the token, finds the user, and returns the User object.
    It will be run on every protected route.
    """
    username = decode_token(token)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get the user from the database
    user = await User.get_or_none(username=username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# --- END "Test User" Functions ---


# --- PUBLIC AUTH ROUTES ---

@app.post("/signup", response_model=User_Pydantic)
async def create_user(user_in: UserIn_Pydantic):
    """
    Creates a new user.
    """
    # Check if user already exists
    user = await User.get_or_none(username=user_in.username)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
        
    # Hash the password
    hashed_password = get_password_hash(user_in.password)
    
    # Create the new user in the database
    new_user = await User.create(
        username=user_in.username, 
        password=hashed_password
    )
    
    # Return the user (pydantic model hides the password)
    return new_user


@app.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    Logs in a user and returns a token.
    FastAPI's OAuth2PasswordRequestForm needs 'username' and 'password'
    sent as form-data, not JSON.
    """
    user = await User.get_or_none(username=form_data.username)
    
    # Check if user exists and password is correct
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Create the token (wristband)
    access_token = create_access_token(data={"sub": user.username})
    
    # Return the token
    return {"access_token": access_token, "token_type": "bearer"}


# --- END PUBLIC AUTH ROUTES ---


# Define a "route" for the root URL ("/")
@app.get("/")
def read_root():
    return {"Hello": "World", "Project": "My Media Tracker"}


# --- PROTECTED CATEGORY ROUTES (Level 1) ---

# 1. CREATE
@app.post('/categories')
async def create_category(
    category_info: Category_Pydantic_IN,
    user: User = Depends(get_current_user)
):
    category_obj = await Category.create(
        **category_info.dict(exclude_unset=True), 
        owner=user
    )
    response = await Category_Pydantic.from_tortoise_orm(category_obj)
    return {"status": "ok", "data": response}

# 2. READ (All)
@app.get('/categories')
async def get_all_categories(user: User = Depends(get_current_user)):
    response = await Category_Pydantic.from_queryset(user.categories.all())
    return {"status": "ok", "data": response}

# 3. READ (One)
@app.get('/categories/{category_id}')
async def get_one_category(
    category_id: int, 
    user: User = Depends(get_current_user)
):
    query = Category.get(id=category_id, owner=user)
    response = await Category_Pydantic.from_queryset_single(query)
    return {"status": "ok", "data": response}

# 4. UPDATE
@app.put('/categories/{category_id}')
async def update_category(
    category_id: int, 
    category_info: Category_Pydantic_IN,
    user: User = Depends(get_current_user)
):
    category = await Category.get(id=category_id, owner=user)
    update_data = category_info.dict(exclude_unset=True)
    category.name = update_data['name']
    category.description = update_data.get('description', category.description)
    await category.save()
    response = await Category_Pydantic.from_tortoise_orm(category)
    return {"status": "ok", "data": response}

# 5. DELETE
@app.delete('/categories/{category_id}')
async def delete_category(
    category_id: int, 
    user: User = Depends(get_current_user)
):
    await Category.get(id=category_id, owner=user).delete()
    return {"status": "ok"}


# --- PROTECTED FIELD ROUTES (Level 2) ---

# 1. CREATE
@app.post('/categories/{category_id}/fields')
async def create_field_for_category(
    category_id: int, 
    field_info: Field_Pydantic_IN,
    user: User = Depends(get_current_user)
):
    try:
        category = await Category.get(id=category_id, owner=user)
    except:
        return {"status": "error", "message": "Category not found"}
        
    field_obj = await Field.create(
        **field_info.dict(exclude_unset=True), 
        category=category
    )
    response = await Field_Pydantic.from_tortoise_orm(field_obj)
    return {"status": "ok", "data": response}

# 2. READ (All for one Category)
@app.get('/categories/{category_id}/fields')
async def get_fields_for_category(
    category_id: int, 
    user: User = Depends(get_current_user)
):
    try:
        category = await Category.get(id=category_id, owner=user)
    except:
        return {"status": "error", "message": "Category not found"}
    
    response = await Field_Pydantic.from_queryset(category.fields.all())
    return {"status": "ok", "data": response}

# 3. READ (One Specific Field)
@app.get('/fields/{field_id}')
async def get_one_field(
    field_id: int, 
    user: User = Depends(get_current_user)
):
    try:
        query = Field.get(id=field_id, category__owner=user)
        response = await Field_Pydantic.from_queryset_single(query)
        return {"status": "ok", "data": response}
    except:
        return {"status": "error", "message": "Field not found"}

# 4. UPDATE
@app.put('/fields/{field_id}')
async def update_field(
    field_id: int, 
    field_info: Field_Pydantic_IN,
    user: User = Depends(get_current_user)
):
    try:
        field = await Field.get(id=field_id, category__owner=user)
        update_data = field_info.dict(exclude_unset=True)
        new_name = update_data['name']
        
        old_name = field.name
        if old_name != new_name:
            category = await field.category
            items_to_migrate = await Item.filter(category=category)
            
            for item in items_to_migrate:
                if old_name in item.data:
                    item.data[new_name] = item.data.pop(old_name)
                    await item.save()

        field.name = new_name
        field.type = update_data['type']
        field.options = update_data.get('options')
        
        await field.save()
        
        response = await Field_Pydantic.from_tortoise_orm(field)
        return {"status": "ok", "data": response}
        
    except:
        return {"status": "error", "message": "Field not found or update failed"}

# 5. DELETE
@app.delete('/fields/{field_id}')
async def delete_field(
    field_id: int, 
    user: User = Depends(get_current_user)
):
    try:
        field_to_delete = await Field.get(id=field_id, category__owner=user)
        field_name = field_to_delete.name
        
        category = await field_to_delete.category
        items_to_clean = await Item.filter(category=category)

        for item in items_to_clean:
            if field_name in item.data:
                del item.data[field_name]
                await item.save()
        
        await field_to_delete.delete()
        
        return {"status": "ok"}
    except:
        return {"status": "error", "message": "Field not found"}


# --- PROTECTED ITEM ROUTES (Level 3) ---

# 1. CREATE
@app.post('/categories/{category_id}/items')
async def create_item_for_category(
    category_id: int, 
    item_info: Item_Pydantic_IN,
    user: User = Depends(get_current_user)
):
    try:
        category = await Category.get(id=category_id, owner=user)
    except:
        return {"status": "error", "message": "Category not found"}
        
    item_obj = await Item.create(
        data=item_info.data, 
        category=category
    )
    response = await Item_Pydantic.from_tortoise_orm(item_obj)
    return {"status": "ok", "data": response}

# 2. READ (All for one Category)
@app.get('/categories/{category_id}/items')
async def get_items_for_category(
    category_id: int, 
    user: User = Depends(get_current_user)
):
    try:
        category = await Category.get(id=category_id, owner=user)
    except:
        return {"status": "error", "message": "Category not found"}
    
    response = await Item_Pydantic.from_queryset(category.items.all())
    return {"status": "ok", "data": response}

# 3. READ (One Specific Item)
@app.get('/items/{item_id}')
async def get_one_item(
    item_id: int, 
    user: User = Depends(get_current_user)
):
    try:
        query = Item.get(id=item_id, category__owner=user)
        response = await Item_Pydantic.from_queryset_single(query)
        return {"status": "ok", "data": response}
    except:
        return {"status": "error", "message": "Item not found"}

# 4. UPDATE
@app.put('/items/{item_id}')
async def update_item(
    item_id: int, 
    item_info: Item_Pydantic_IN,
    user: User = Depends(get_current_user)
):
    try:
        item = await Item.get(id=item_id, category__owner=user)
    except:
        return {"status": "error", "message": "Item not found"}

    update_data = item_info.dict(exclude_unset=True)
    item.data = update_data['data'] 
    await item.save()
    
    response = await Item_Pydantic.from_tortoise_orm(item)
    return {"status": "ok", "data": response}

# 5. DELETE
@app.delete('/items/{item_id}')
async def delete_item(
    item_id: int, 
    user: User = Depends(get_current_user)
):
    try:
        item_to_delete = await Item.get(id=item_id, category__owner=user)
        await item_to_delete.delete()
        return {"status": "ok"}
    except:
        return {"status": "error", "message": "Item not found"}


# --- PROTECTED EMAIL SETUP ---

class EmailSchema(BaseModel):
    email: List[EmailStr]

class EmailContent(BaseModel):
    message: str
    subject: str

conf = ConnectionConfig(
    MAIL_USERNAME=credentials['EMAIL'],
    MAIL_PASSWORD=credentials['PASS'],
    MAIL_FROM=credentials['EMAIL'],
    MAIL_PORT=465,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=True,
    USE_CREDENTIALS=True
)

# --- Test Email Route ---
@app.post('/test-email')
async def send_email_to_test_user(
    content: EmailContent, 
    user: User = Depends(get_current_user)
):
    """
    Sends an email to the currently logged-in user.
    Assumes the user's 'username' is their email address.
    """
    user_email = [user.username] # Use the logged-in user's username

    html = f"""
    <h5>My Media Tracker Test</h5> 
    <br>
    <p>{content.message}</p>
    """

    message = MessageSchema(
        subject=content.subject,
        recipients=user_email,
        body=html,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)
    return {"status": "ok", "message": f"Email sent to {user_email}"}

# --- END EMAIL SETUP ---


# This is the function call that connects FastAPI to our database
register_tortoise(
    app,
    db_url='sqlite://db.sqlite3',  # Using SQLite for simplicity
    modules={'models': ['models']},  # Pointing to our "models.py" file
    generate_schemas=True,  # Auto-generate database schemas (tables)
    add_exception_handlers=True,  # Helps with error handling
)