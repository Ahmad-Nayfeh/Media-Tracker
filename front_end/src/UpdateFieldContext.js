// src/UpdateFieldContext.js

import React, { useState, createContext } from 'react';

export const UpdateFieldContext = createContext();

export const UpdateFieldProvider = (props) => {
  const [updateField, setUpdateField] = useState(null); // Default is null

  return (
    <UpdateFieldContext.Provider value={[updateField, setUpdateField]}>
      {props.children}
    </UpdateFieldContext.Provider>
  );
};