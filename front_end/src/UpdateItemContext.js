// src/UpdateItemContext.js

import React, { useState, createContext } from 'react';

// 1. Create the Context
export const UpdateItemContext = createContext();

// 2. Create the Provider
export const UpdateItemProvider = (props) => {
  // 3. Define the state to hold the item being edited
  const [updateItem, setUpdateItem] = useState(null); // Default is null

  // 4. Return the Provider component
  return (
    <UpdateItemContext.Provider value={[updateItem, setUpdateItem]}>
      {props.children}
    </UpdateItemContext.Provider>
  );
};