// src/components/ProtectedRoute.js

import React, { useContext } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

// 1. This component takes a component 'element' as a prop
function ProtectedRoute({ element }) {
  // 2. Get the 'isLoggedIn' value from our "brain"
  const { isLoggedIn } = useContext(AuthContext);

  // 3. Check if the user is logged in
  if (isLoggedIn) {
    // 4. If YES, show the element they asked for (e.g., <CategoryList />)
    return element;
  } else {
    // 5. If NO, forcibly redirect them to the /login page
    return <Navigate to="/login" replace />;
  }
}

export default ProtectedRoute;