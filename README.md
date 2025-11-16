### **Project Title: "Media Tracker"**

### **Project Concept**

A full-stack web application (FastAPI + React) that allows authenticated users to build, design, and manage their own personal media databases. Users can create "Categories" (e.g., "Books") and then define the "Fields" (e.g., "Author," "Rating") they want to track for that category.

---

### **Core Features by Level**

This project is built on a foundation of user authentication and three main data management levels.

#### **Level 0: User Authentication (Foundation)**

The entire system is private and user-specific.

- **Sign Up:** Users can create a new account with a username/email and password.
    
- **Log In:** Registered users can log in to access their data.
    
- **Data Ownership:** All data (Categories, Fields, and Items) is linked to the logged-in user. A user can _only_ see and manage their own data.
    

#### **Level 1: Category Management (CRUD)**

This level handles the high-level collections (the "databases").

- **Create:** A user can create a new, empty Category (e.g., "Books," "Podcasts").
    
- **Read:** A user can see a list of all Categories they have created.
    
- **Update:** A user can rename an existing Category.
    
- **Delete:** A user can delete a Category. This will also delete all Fields and Items associated with it.
    

#### **Level 2: Field Management (CRUD)**

This is the "design mode" where users define the _structure_ of a Category.

- **Create:** For a chosen Category, a user can add a new Field. This requires two inputs:
    
    1. **Field Name:** (e.g., "Title," "Status,", "Author").
        
    2. **Field Type:** The user must select from a predefined list of types:
        
        - `Text`: For short, single-line text.
            
        - `Notes`: For long, multi-line text.
            
        - `Number`: For numerical values.
            
        - `Date`: A date picker.
            
        - `Boolean`: A true/false checkbox.
            
        - `Select`: A dropdown menu. When creating this type, the user must also provide the list of options (e.g., "Option 1", "Option 2").
            
- **Read:** Users can see all fields for a given category in its "settings" or when viewing an item.
    
- **Update:** A user can update the **name** of an existing field. (The `type` will be permanent to avoid data conflicts).
    
- **Delete:** A user can delete a field. This will also delete all data for that field from all items in the category.
    

#### **Level 3: Item Management (CRUD)**

This is the "data entry mode" for adding items to the categories.

- **Create:** A user can add a new Item to a Category. The "New Item" form will be **dynamically generated** based on the Fields defined in Level 2.
    
- **Read:** A user can view a list of all Items within a selected Category.
    
- **Update:** A user can edit the data in the fields of an existing Item.
    
- **Delete:** A user can delete a specific Item.
    

---

### **Additional Functionality**

- **Search:** On the "Read Items" (Level 3) view, a search bar will allow the user to filter items based on their field values.
    
- **Sort:** On the "Read Items" (Level 3) view, the user can sort the list by clicking on a Field's name (e.g., sort by "Rating").
    

---

### **Default Content (On First User Sign Up)**

To provide a starting point, the application will automatically create the following two Categories and their Fields for a new user. The user can modify or delete these as they wish.

**1. Category: Books**

- **Fields:**
    
    - `Title`: (Type: `Text`)
        
    - `Author`: (Type: `Text`)
        
    - `Publish Date`: (Type: `Date`)
        
    - `Status`: (Type: `Select` | Options: "Read", "Reading", "To Be Read Next", "Not Read")
        
    - `Rating`: (Type: `Select` | Options: "⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐")
        
    - `Summary`: (Type: `Notes`)
        

**2. Category: Podcasts**

- **Fields:**
    
    - `Podcast Title`: (Type: `Text`)
        
    - `Podcast Period`: (Type: `Text`) - _For duration, e.g., "2h 30m"_
        
    - `Host`: (Type: `Text`)
        
    - `Guest`: (Type: `Text`)
        
    - `Publish Date`: (Type: `Date`)
        
    - `Rating`: (Type: `Select` | Options: "⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐")
        
    - `Notes`: (Type: `Notes`)
        

---
