# backend/seed.py

import asyncio
from tortoise import Tortoise, run_async
from models import User, Category, Field, Item
from auth import get_password_hash # We need this to create the user

# --- Database Config (same as before) ---
DB_CONFIG = {
    "connections": {
        "default": "sqlite://db.sqlite3",
    },
    "apps": {
        "models": {
            "models": ["models"],
            "default_connection": "default",
        },
    },
}

async def seed_database():
    """
    Connects to the DB, wipes it, and populates it with your
    specific user, categories, fields, and items.
    """
    print("--- Connecting to database... ---")
    try:
        await Tortoise.init(config=DB_CONFIG)
        # This *deletes* old tables and creates new ones
        await Tortoise.generate_schemas(safe=False) 
        print("--- Database tables (re)created. ---")

        # --- 1. Create a hashed password ---
        hashed_password = get_password_hash("password123")

        # --- 2. Create Your User ---
        print("Creating user: 'ahmad@example.com'")
        user = await User.create(
            username="ahmad@example.com", 
            password=hashed_password
        )

        # --- 3. Create Your Categories ---
        print("Creating your 7 categories...")
        books_cat = await Category.create(
            name="Books",
            description="My personal collection of fiction and non-fiction.",
            owner=user
        )
        await Category.create(
            name="Podcasts",
            description="Shows and episodes I'm tracking.",
            owner=user
        )
        await Category.create(
            name="People",
            description="A personal CRM for contacts and notes.",
            owner=user
        )
        await Category.create(
            name="Courses",
            description="Online courses and tutorials.",
            owner=user
        )
        await Category.create(
            name="Articles",
            description="Interesting articles and posts from the web.",
            owner=user
        )
        await Category.create(
            name="Github",
            description="Repos I want to follow or contribute to.",
            owner=user
        )
        await Category.create(
            name="Software",
            description="Useful software, tools, and SaaS products.",
            owner=user
        )

        # --- 4. Create Fields for "Books" ---
        print("Creating fields for 'Books' category...")
        await Field.create(name="Title", type="Text", category=books_cat)
        await Field.create(name="Author", type="Text", category=books_cat)
        await Field.create(name="Status", type="Select", options=["Read", "Reading", "Unread"], category=books_cat)
        await Field.create(name="My Rating", type="Select", options=["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"], category=books_cat)
        await Field.create(name="Page Count", type="Number", category=books_cat)
        await Field.create(name="Date Finished", type="Date", category=books_cat)
        await Field.create(name="My Summary", type="Notes", category=books_cat)

        # --- 5. Create Items for "Books" ---
        print("Creating your 9 book items...")
        await Item.create(category=books_cat, data={
            "Title": "Atomic Habits", "Author": "James Clear", "Status": "Read", "My Rating": "⭐⭐⭐⭐⭐", "Page Count": 320, "Date Finished": "2024-01-15", "My Summary": "Great book on building small, consistent habits."
        })
        await Item.create(category=books_cat, data={
            "Title": "I Don't Have Enough Faith to be an Atheist", "Author": "Frank Turek", "Status": "Read", "My Rating": "⭐⭐⭐⭐", "Page Count": 448, "Date Finished": "2023-05-20", "My Summary": "A compelling logical argument."
        })
        await Item.create(category=books_cat, data={
            "Title": "The Crowd: A Study of the Popular Mind", "Author": "Gustave Le Bon", "Status": "Reading", "My Rating": "", "Page Count": 160, "Date Finished": "", "My Summary": ""
        })
        await Item.create(category=books_cat, data={
            "Title": "Man, the Unknown", "Author": "Alexis Carrel", "Status": "Unread", "My Rating": "", "Page Count": 346, "Date Finished": "", "My Summary": ""
        })
        await Item.create(category=books_cat, data={
            "Title": "Islam Between East and West", "Author": "Alija Izetbegović", "Status": "Read", "My Rating": "⭐⭐⭐⭐⭐", "Page Count": 450, "Date Finished": "2023-11-10", "My Summary": "A profound philosophical take."
        })
        await Item.create(category=books_cat, data={
            "Title": "Crime and Punishment", "Author": "Fyodor Dostoevsky", "Status": "Read", "My Rating": "⭐⭐⭐⭐⭐", "Page Count": 576, "Date Finished": "2022-03-01", "My Summary": "A masterpiece."
        })
        await Item.create(category=books_cat, data={
            "Title": "The Brothers Karamazov", "Author": "Fyodor Dostoevsky", "Status": "Reading", "My Rating": "", "Page Count": 824, "Date Finished": "", "My Summary": ""
        })
        await Item.create(category=books_cat, data={
            "Title": "Anna Karenina", "Author": "Leo Tolstoy", "Status": "Unread", "My Rating": "", "Page Count": 864, "Date Finished": "", "My Summary": ""
        })
        await Item.create(category=books_cat, data={
            "Title": "War and Peace", "Author": "Leo Tolstoy", "Status": "Unread", "My Rating": "", "Page Count": 1225, "Date Finished": "", "My Summary": ""
        })

        print("--- Database seeding complete! ---")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        await Tortoise.close_connections()
        print("--- Database connections closed. ---")

# This is the standard way to run an async function from a script
if __name__ == "__main__":
    run_async(seed_database())