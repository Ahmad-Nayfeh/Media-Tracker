// src/components/UpdateItemPage.js

import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Container, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { UpdateItemContext } from '../UpdateItemContext'; // Our new "brain"

import { secureFetch } from '../api';

function UpdateItemPage() {
  const navigate = useNavigate();

  // 1. Get the item-to-be-edited from the "brain"
  const [updateItem] = useContext(UpdateItemContext);

  // 2. State for the form
  const [fields, setFields] = useState([]); // To store the "rules" (fields)
  const [formData, setFormData] = useState({}); // To store what user types
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", content: "" });

  // 3. This 'useEffect' fetches the rules AND pre-fills the form
  useEffect(() => {
    if (!updateItem) {
      // If no item is in context (e.g., page reload), go home
      navigate('/');
      return;
    }

    const fetchFields = async () => {
      try {
        // Fetch the fields for this item's category
        const response = await secureFetch(`http://127.0.0.1:8000/categories/${updateItem.category_id}/fields`);
        const data = await response.json();
        
        if (data.status === 'ok') {
          setFields(data.data);
          // Pre-fill the form state with the item's existing data!
          setFormData(updateItem.data); 
          setLoading(false);
        } else {
          setMessage({ type: "danger", content: "Failed to load fields." });
        }
      } catch (error) {
        setMessage({ type: "danger", content: "An error occurred." });
      }
    };
    fetchFields();
  }, [updateItem, navigate]);

  // 4. Handle Form Input (same as AddItemPage)
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: inputValue });
  };

  // 5. Render the correct input (same as AddItemPage)
  const renderField = (field) => {
    const value = formData[field.name] || ""; // Get the pre-filled value

    switch (field.type) {
      case 'Text':
        return <Form.Control type="text" name={field.name} value={value} onChange={handleInputChange} />;
      case 'Number':
        return <Form.Control type="number" name={field.name} value={value} onChange={handleInputChange} />;
      case 'Date':
        return <Form.Control type="date" name={field.name} value={value} onChange={handleInputChange} />;
      case 'Boolean':
        // 'checked' must be used for checkboxes
        return <Form.Check type="checkbox" name={field.name} checked={!!value} onChange={handleInputChange} />;
      case 'Notes':
        return <Form.Control as="textarea" rows={3} name={field.name} value={value} onChange={handleInputChange} />;
      case 'Select':
        return (
          <Form.Select name={field.name} value={value} onChange={handleInputChange}>
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

  // 6. Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { data: formData }; // Prepare the payload

    try {
      // 7. Call the 'PUT' endpoint for the specific item ID
      const response = await secureFetch(`http://127.0.0.1:8000/items/${updateItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.status === 'ok') {
        setMessage({ type: "success", content: "Item updated successfully!" });
        // Go back to the category detail page
        setTimeout(() => navigate(`/category/${updateItem.category_id}`), 1500);
      } else {
        setMessage({ type: "danger", content: "Failed to update item." });
      }
    } catch (error) {
      setMessage({ type: "danger", content: "An error occurred." });
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <Container className="mt-4" style={{ maxWidth: '600px' }}>
      <Card>
        <Card.Body>
          <Card.Title>Update Item</Card.Title>
          {message.content && <Alert variant={message.type}>{message.content}</Alert>}
          <Form onSubmit={handleSubmit}>
            {fields.map(field => (
              <Form.Group key={field.id} className="mb-3">
                <Form.Label>{field.name}</Form.Label>
                {renderField(field)}
              </Form.Group>
            ))}
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default UpdateItemPage;