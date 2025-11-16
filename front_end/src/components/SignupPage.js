// src/components/SignupPage.js

import React, { useState } from 'react';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';
// 1. Import 'Link' to link back to the login page
import { Link, useNavigate } from 'react-router-dom';

import { secureFetch } from '../api';

function SignupPage() {
  const navigate = useNavigate();
  
  // 2. State to hold the form data
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ type: "", content: "" }); // For errors/success

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", content: "" }); // Clear old messages

    try {
      // 3. Our /signup route expects JSON, so we can send it directly
      const response = await secureFetch('http://127.0.0.1:8000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 4. Success! Show a message and redirect to login.
        setMessage({ type: "success", content: "Signup successful! Please log in." });
        setTimeout(() => navigate('/login'), 2000); // Wait 2s
      } else {
        // 5. Show an error (e.g., "Username already registered")
        setMessage({ type: "danger", content: data.detail || "Failed to sign up." });
      }
    } catch (err) {
      setMessage({ type: "danger", content: "An error occurred. Please try again." });
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '400px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Sign Up</h2>
          {message.content && <Alert variant={message.type}>{message.content}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username (Email)</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Choose a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Sign Up
            </Button>
          </Form>
          <div className="w-100 text-center mt-3">
            {/* 6. Link to go back to the login page */}
            <Link to="/login">Already have an account? Log In</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default SignupPage;