// src/components/LoginPage.js

import React, { useState, useContext } from 'react';
import { Form, Button, Container, Card, Alert, Spinner } from 'react-bootstrap'; // 1. Import Spinner
import { AuthContext } from '../AuthContext';
import { Link } from 'react-router-dom';

function LoginPage() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  
  // 2. --- ADD LOADING STATE ---
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true); // 3. Set loading to true
    
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.access_token);
      } else {
        setError(data.detail || "Failed to log in.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
    
    setLoading(false); // 4. Set loading to false
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '400px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Log In</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            {/* ... (Username and Password fields are the same) ... */}
            <Form.Group className="mb-3">
              <Form.Label>Username (Email)</Form.Label>
              <Form.Control type="email" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Form.Group>
            
            {/* 5. --- UPDATE THE BUTTON --- */}
            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              ) : (
                "Log In"
              )}
            </Button>
          </Form>
          <div className="w-100 text-center mt-3">
            <Link to="/signup">Need an account? Sign Up</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default LoginPage;