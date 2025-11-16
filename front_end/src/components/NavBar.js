// src/components/NavBar.js

import React, { useState, useContext } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Navbar, Nav, Container, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { CategoryContext } from '../CategoryContext';
import { AuthContext } from '../AuthContext';

// 1. --- IMPORT THE NEW CSS FILE ---
import './NavBar.css'; 

function NavBar() {
  const { filterCategories } = useContext(CategoryContext);
  const { isLoggedIn, logout } = useContext(AuthContext);
  
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    filterCategories(searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm("");
    filterCategories("");
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="light" variant="light" expand="lg" className="border-bottom shadow-sm">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>
            My Media Tracker
          </Navbar.Brand>
        </LinkContainer>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          
          {isLoggedIn && (
            <>
              {/* 2. --- REMOVED ALL STYLING CLASSES --- */}
              {/* The 'NavBar.css' file will handle the layout now */}
              <Nav> 
                
                {/* 3. The Form is back to its simple version */}
                <Form className="d-flex" onSubmit={handleSearch}>
                  <Form.Control
                    type="search"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline-primary" type="submit">Search</Button>
                  <Button variant="outline-secondary" onClick={clearSearch}>Clear</Button>
                </Form>

                <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
              </Nav>
            </>
          )}

        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;