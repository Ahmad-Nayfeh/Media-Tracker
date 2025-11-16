// src/components/AddFieldPage.js

import React, { useState } from 'react';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';
// We need 'useNavigate' to redirect and 'useParams' to get the category ID
import { useNavigate, useParams } from 'react-router-dom';
import { secureFetch } from '../api';

function AddFieldPage() {
  // 1. Get the categoryId from the URL (e.g., "/category/1/add-field")
  const { categoryId } = useParams();
  const navigate = useNavigate();

  // 2. Create state for all our form inputs
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("Text"); // Default type
  const [fieldOptions, setFieldOptions] = useState(""); // For 'Select' type

  // State for success/error messages
  const [message, setMessage] = useState({ type: "", content: "" });

  // 3. This function runs when the user clicks "Add Field"
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 4. Prepare the data payload to send to the backend
    const fieldData = {
      name: fieldName,
      type: fieldType,
    };

    // 5. If the type is "Select", we process the 'options' string
    if (fieldType === "Select") {
      // Split the string "Read, Reading" into an array ["Read", "Reading"]
      // .trim() removes any extra spaces
      fieldData.options = fieldOptions.split(',').map(option => option.trim());
    }

    // 6. Send the data to our backend API
    try {
      const response = await secureFetch(`http://127.0.0.1:8000/categories/${categoryId}/fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fieldData),
      });

      const data = await response.json();

      if (data.status === 'ok') {
        setMessage({ type: "success", content: "Field added successfully!" });
        // 7. After 1.5s, redirect back to the category's detail page
        setTimeout(() => navigate(`/category/${categoryId}`), 1500);
      } else {
        setMessage({ type: "danger", content: data.message || "Failed to add field." });
      }
    } catch (error) {
      console.error("Error submitting field:", error);
      setMessage({ type: "danger", content: "An error occurred." });
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: '600px' }}>
      <Card>
        <Card.Body>
          <Card.Title>Add New Field</Card.Title>
          
          {message.content && (
            <Alert variant={message.type}>{message.content}</Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {/* --- Field Name Input --- */}
            <Form.Group className="mb-3">
              <Form.Label>Field Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Title, Author, Rating"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                required
              />
            </Form.Group>

            {/* --- Field Type Select --- */}
            <Form.Group className="mb-3">
              <Form.Label>Field Type</Form.Label>
              <Form.Select
                value={fieldType}
                onChange={(e) => setFieldType(e.target.value)}
              >
                <option value="Text">Text</option>
                <option value="Notes">Notes</option>
                <option value="Number">Number</option>
                <option value="Date">Date</option>
                <option value="Boolean">Boolean (Checkbox)</option>
                <option value="Select">Select (Dropdown)</option>
              </Form.Select>
            </Form.Group>

            {/* --- 8. CONDITIONAL "Options" Input --- */}
            {/* This block only appears if fieldType is "Select" */}
            {fieldType === "Select" && (
              <Form.Group className="mb-3">
                <Form.Label>Options (comma-separated)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Read, Reading, Unread"
                  value={fieldOptions}
                  onChange={(e) => setFieldOptions(e.target.value)}
                  required
                />
              </Form.Group>
            )}

            <Button variant="primary" type="submit">
              Add Field
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AddFieldPage;