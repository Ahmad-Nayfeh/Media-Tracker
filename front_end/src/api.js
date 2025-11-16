// src/api.js

// This file will be our new "smart" fetch function

// This function gets the token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// This is our new, secure fetch function
export const secureFetch = async (url, options = {}) => {
  const token = getToken();
  
  // 1. Initialize headers if they don't exist
  if (!options.headers) {
    options.headers = {};
  }
  
  // 2. Add the "wristband" (token) to the request
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  // 3. Set default 'Content-Type' if we are sending a 'body'
  if (options.body && !options.headers['Content-Type']) {
    options.headers['Content-Type'] = 'application/json';
  }

  // 4. Make the request
  const response = await fetch(url, options);

  // 5. If the token is expired or invalid, log the user out
  if (response.status === 401) {
    localStorage.removeItem('token');
    // Reload the page, which will force a redirect to /login
    window.location.href = '/login'; 
    throw new Error('Unauthorized');
  }

  return response;
};