// src/components/AddItemPage.js

import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

import { secureFetch } from '../api';

function AddItemPage() {
  const { categoryId } = useParams(); // Get category ID from URL
  const navigate = useNavigate();

  // --- State Management ---
  // 1. To store the "rules" (the fields)
  const [fields, setFields] = useState([]);
  // 2. To store the data the user types into the form
  //    (e.g., { Title: "Dune", Author: "Frank Herbert" })
  const [formData, setFormData] = useState({});
  // 3. Loading and error states
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", content: "" });

  // --- 1. secureFetch the "Rules" (Fields) ---
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await secureFetch(`http://127.0.0.1:8000/categories/${categoryId}/fields`);
        const data = await response.json();
        if (data.status === 'ok') {
          setFields(data.data);
          // Dynamically initialize our form state
          let initialState = {};
          data.data.forEach(field => {
            initialState[field.name] = ""; // Set all fields to empty string
          });
          setFormData(initialState);
          setLoading(false);
        } else {
          setMessage({ type: "danger", content: "Failed to load fields." });
        }
      } catch (error) {
        console.error("Failed to fetch fields:", error);
        setMessage({ type: "danger", content: "An error occurred." });
      }
    };
    fetchFields();
  }, [categoryId]);

  // --- 2. Handle Form Input ---
  // A generic handler that updates the correct field in our formData state
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkboxes (for Boolean) vs. other inputs
    const inputValue = type === 'checkbox' ? checked : value;

    setFormData({
      ...formData,
      [name]: inputValue,
    });
  };

  // --- 3. Render the correct input based on field type ---
  const renderField = (field) => {
    // This is our "smart" logic
    switch (field.type) {
      case 'Text':
        return <Form.Control type="text" name={field.name} onChange={handleInputChange} />;
      case 'Number':
        return <Form.Control type="number" name={field.name} onChange={handleInputChange} />;
      case 'Date':
        return <Form.Control type="date" name={field.name} onChange={handleInputChange} />;
      case 'Boolean':
        return <Form.Check type="checkbox" name={field.name} onChange={handleInputChange} />;
      case 'Notes':
        return <Form.Control as="textarea" rows={3} name={field.name} onChange={handleInputChange} />;
      case 'Select':
        return (
          <Form.Select name={field.name} onChange={handleInputChange}>
            <option value="">-- Select an option --</option>
            {field.options.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </Form.Select>
        );
      default:
        return null;
    }
  };

  // --- 4. Handle Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Send the 'formData' object inside the 'data' key,
    // just like our backend API expects
    const payload = {
      data: formData,
    };

    try {
      const response = await secureFetch(`http://127.0.0.1:8000/categories/${categoryId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.status === 'ok') {
        setMessage({ type: "success", content: "Item added successfully!" });
        // Redirect back to the category page
        setTimeout(() => navigate(`/category/${categoryId}`), 1500);
      } else {
        setMessage({ type: "danger", content: "Failed to add item." });
      }
    } catch (error) {
      console.error("Error submitting item:", error);
      setMessage({ type: "danger", content: "An error occurred." });
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <Container className="mt-4" style={{ maxWidth: '600px' }}>
      <Card>
        <Card.Body>
          <Card.Title>Add New Item</Card.Title>
          {message.content && <Alert variant={message.type}>{message.content}</Alert>}
          <Form onSubmit={handleSubmit}>
            {/* 5. Dynamically create the form */}
            {fields.map(field => (
              <Form.Group key={field.id} className="mb-3">
                <Form.Label>{field.name}</Form.Label>
                {renderField(field)}
              </Form.Group>
            ))}
            <Button variant="primary" type="submit">
              Add Item
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AddItemPage;