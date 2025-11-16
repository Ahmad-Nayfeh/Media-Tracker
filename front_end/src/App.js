import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import NavBar from './components/NavBar';
import './App.css';
import { CategoryProvider } from './CategoryContext';
import CategoryList from './components/CategoryList';
import AddCategory from './components/AddCategory';
import { UpdateCategoryProvider } from './UpdateCategoryContext';
import UpdateCategory from './components/UpdateCategory';
import CategoryDetailPage from './components/CategoryDetailPage';
import AddFieldPage from './components/AddFieldPage';
import AddItemPage from './components/AddItemPage';
import { UpdateItemProvider } from './UpdateItemContext';
import UpdateItemPage from './components/UpdateItemPage';
import { UpdateFieldProvider } from './UpdateFieldContext';
import FieldManagementPage from './components/FieldManagementPage';
import UpdateFieldPage from './components/UpdateFieldPage';

import { AuthProvider, AuthContext } from './AuthContext'; // 1. Import AuthContext
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ProtectedRoute from './components/ProtectedRoute'; // 2. Import our gatekeeper

// 3. This is a new "wrapper" for our main app
function AppContent() {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <UpdateFieldProvider>
      <UpdateItemProvider>
        <UpdateCategoryProvider>
          <CategoryProvider>
            <NavBar />
            <Container className="mt-4" style={{ maxWidth: '900px' }}>
              <Routes>
                {/* --- Public Routes --- */}
                {/* If you are logged in and visit /login, redirect to home */}
                <Route 
                  path="/login" 
                  element={isLoggedIn ? <Navigate to="/" replace /> : <LoginPage />} 
                />
                <Route 
                  path="/signup" 
                  element={isLoggedIn ? <Navigate to="/" replace /> : <SignupPage />} 
                />

                {/* --- Protected Routes --- */}
                {/* All your app routes are now wrapped in our gatekeeper */}
                <Route path="/update-field/:fieldId" element={<ProtectedRoute element={<UpdateFieldPage />} />} />
                <Route path="/category/:categoryId/manage-fields" element={<ProtectedRoute element={<FieldManagementPage />} />} />
                <Route path="/update-item/:itemId" element={<ProtectedRoute element={<UpdateItemPage />} />} />
                <Route path="/category/:categoryId/add-item" element={<ProtectedRoute element={<AddItemPage />} />} />
                <Route path="/category/:categoryId/add-field" element={<ProtectedRoute element={<AddFieldPage />} />} />
                <Route path="/category/:categoryId" element={<ProtectedRoute element={<CategoryDetailPage />} />} />
                <Route path="/update-category/:id" element={<ProtectedRoute element={<UpdateCategory />} />} />
                <Route path="/add-category" element={<ProtectedRoute element={<AddCategory />} />} />
                <Route path="/" element={<ProtectedRoute element={<CategoryList />} />} />
              </Routes>
            </Container>
          </CategoryProvider>
        </UpdateCategoryProvider>
      </UpdateItemProvider>
    </UpdateFieldProvider>
  );
}

// 4. App.js is now just the AuthProvider and the AppContent
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;