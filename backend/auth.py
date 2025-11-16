# backend/auth.py

from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

# --- HASHING (THE "PAPER SHREDDER") ---

# 1. This is our "shredder" using the bcrypt algorithm
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """Checks if the plain password shreds to the same hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Shreds a new password."""
    return pwd_context.hash(password)


# --- TOKENS (THE "WRISTBANDS") ---

# This should be a long, random, secret string.
# For now, we'll hardcode it, but in a real app,
# you would load this from your .env file.
SECRET_KEY = "your-very-secret-key-that-is-long-and-random"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 # A wristband is valid for 30 minutes

def create_access_token(data: dict):
    """Creates a new wristband (Token)."""
    to_encode = data.copy()

    # Set an expiration time for the wristband
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    # Create the token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str):
    """Checks a wristband to see if it's valid and who it belongs to."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Get the 'sub' (subject) from the token, which is our username
        username: str = payload.get("sub")
        if username is None:
            return None # Invalid token
        return username
    except JWTError:
        return None # Invalid token (expired, wrong signature, etc.)