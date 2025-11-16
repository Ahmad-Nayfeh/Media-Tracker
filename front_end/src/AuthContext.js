// src/AuthContext.js

import React, { useState, createContext } from 'react';

// 1. Create the Context
export const AuthContext = createContext();

// 2. Create the Provider
export const AuthProvider = (props) => {
  // 3. The state is now the token. We check localStorage to see if
  //    we are already logged in from a previous session.
  const [authToken, setAuthToken] = useState(localStorage.getItem('token'));

  // 4. This function will be called by our LoginPage
  //    It saves the token to state AND localStorage.
  const login = (token) => {
    localStorage.setItem('token', token);
    setAuthToken(token);
  };

  // 5. This function will be called by our Logout button
  //    It removes the token from state AND localStorage.
  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
  };

  // 6. We provide the token and the functions to the whole app.
  //    The '!!authToken' is a trick to convert the token (a string)
  //    into a boolean (true/false) for 'isLoggedIn'.
  const providerValue = {
    token: authToken,
    isLoggedIn: !!authToken,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={providerValue}>
      {props.children}
    </AuthContext.Provider>
  );
};