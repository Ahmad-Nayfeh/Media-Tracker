from tortoise.models import Model
from tortoise import fields

from tortoise.contrib.pydantic import pydantic_model_creator
from pydantic import BaseModel


# --- Level 0: User Model (Our Foundation) ---
# We need this for authentication
class User(Model):
    id = fields.IntField(pk=True)
    # 1. Add 'unique=True' to make usernames unique
    username = fields.CharField(max_length=100, unique=True)
    # 2. Rename 'password_hash' to 'password' for clarity
    password = fields.CharField(max_length=255)

    def __str__(self):
        return self.username
    
# --- Level 1: Category Model ---
# This is for "Books", "Podcasts", etc.
class Category(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100)
    
    description = fields.CharField(max_length=200, default="No description.")

    # This is our Foriegn Key that links this category to a a User
    # 'models.User' refers to the User model defined above
    # 'related_name="categories"' = The "reverse lookup".
    # It allows us to access all categories of a user via user.categories
    owner = fields.ForeignKeyField('models.User', related_name='categories')


    def __str__(self):
        return self.name
    

# --- Level 2: Field Model ---
# This defines the *structure* of a category
# e.g., "Title", "Author", "Pages", etc.
class Field(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100)

    # This will store the data type of the field: "Text", "Number", "Date", etc.
    type = fields.CharField(max_length=50)

    # This is a special field to store a list of options
    # for when the tpye is "Select". E.g., ["Fiction", "Non-Fiction", "Sci-Fi"]
    options = fields.JSONField(null=True)

    # This links the Field to the Category it belongs to
    category = fields.ForeignKeyField('models.Category', related_name='fields')

    def __str__(self):
        return self.name

# --- Level 3: Item Model ---
# This is the actual data entry, e.g., the book "Atomic Habits"
class Item(Model):
    id = fields.IntField(pk=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    category = fields.ForeignKeyField('models.Category', related_name='items')

    # *** THIS IS THE MOST IMPORTANT FIELD ***
    # Instead of 'title', 'author', etc., (which are inflexible),
    # we use a JSONField. This is like a flxible "dictionary"
    # where we can store any data we want.
    # e.g., data = {"title": "Atomic Habits", "author": "James Clear", "pages": 320}
    # e.g., data = {"Podcast Title": "The Daily", "Host": "Michael Barbaro", etc.}
    data = fields.JSONField()

    def __str__(self):
        return f"Item {self.id} in Category {self.category_id}"
    


# ----------------------------------------------------
# ------------- Pydantic models for USER -------------
# ----------------------------------------------------

# This is for creating a new user (signup)
class UserIn_Pydantic(BaseModel):
    username: str
    password: str

# This is for reading a user (but hiding the password)
User_Pydantic = pydantic_model_creator(User, name="User", exclude=("password", ))

# This is what we send back to the user when they log in
class Token(BaseModel):
    access_token: str
    token_type: str



# --- Pydantic models for CATEGORY (Level 1) ---
Category_Pydantic = pydantic_model_creator(Category, name="Category")
Category_Pydantic_IN = pydantic_model_creator(Category, name="CategoryIn", 
                                              exclude_readonly=True,
                                              # We need to manually exclude owner
                                              # so that API knows to get it from
                                              # the logged-in user, not the request.
                                              exclude=("owner",))


# --- Pydantic Models for FIELD (Level 2) ---
Field_Pydantic = pydantic_model_creator(Field, name="Field")
Field_Pydantic_IN = pydantic_model_creator(Field, name="FieldIn",
                                           exclude_readonly=True)


# --- Pydantic Models for ITEM (Level 3) ---
Item_Pydantic = pydantic_model_creator(Item, name="Item")
Item_Pydantic_IN = pydantic_model_creator(Item, name="ItemIn",
                                          exclude_readonly=True)