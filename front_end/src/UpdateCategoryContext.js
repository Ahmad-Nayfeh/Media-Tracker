// src/UpdateCategoryContext.js

import React, { useState, createContext } from 'react';

// 1. Create the Context
export const UpdateCategoryContext = createContext();

// 2. Create the Provider
export const UpdateCategoryProvider = (props) => {
  // 3. Define the state to hold the category being edited
  const [updateCategory, setUpdateCategory] = useState(null); // Default is null

  // 4. Return the Provider component
  return (
    <UpdateCategoryContext.Provider value={[updateCategory, setUpdateCategory]}>
      {props.children}
    </UpdateCategoryContext.Provider>
  );
};