// src/CategoryContext.js

import React, { useState, createContext } from 'react';

export const CategoryContext = createContext();

export const CategoryProvider = (props) => {
  // 1. "Master list" - This list *never* changes after loading.
  const [allCategories, setAllCategories] = useState([]);
  
  // 2. "Display list" - This is the one our components will show.
  const [displayedCategories, setDisplayedCategories] = useState([]);

  // 3. This is the new filter function we'll give to the NavBar.
  const filterCategories = (searchTerm) => {
    if (searchTerm === "") {
      // If search is empty, show the full master list
      setDisplayedCategories(allCategories);
    } else {
      // Otherwise, filter the master list...
      const filtered = allCategories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      // ...and set the display list to the results
      setDisplayedCategories(filtered);
    }
  };

  // 4. We now provide *all* these values to our app.
  //    We've changed the 'value' from an array to an object.
  const providerValue = {
    allCategories,
    setAllCategories,
    displayedCategories,
    setDisplayedCategories,
    filterCategories, // Provide the new filter function
  };

  return (
    <CategoryContext.Provider value={providerValue}>
      {props.children}
    </CategoryContext.Provider>
  );
};