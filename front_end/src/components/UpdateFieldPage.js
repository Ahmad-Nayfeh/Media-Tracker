// src/components/UpdateFieldPage.js

import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Container, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { UpdateFieldContext } from '../UpdateFieldContext';

import { secureFetch } from '../api';

function UpdateFieldPage() {
  const navigate = useNavigate();
  // 1. Get the field-to-be-edited from the "brain"
  const [updateField] = useContext(UpdateFieldContext);

  // 2. State for form inputs
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("Text");
  const [fieldOptions, setFieldOptions] = useState("");
  
  const [message, setMessage] = useState({ type: "", content: "" });

  // 3. This 'useEffect' pre-fills the form
  useEffect(() => {
    if (updateField) {
      setFieldName(updateField.name);
      setFieldType(updateField.type);
      // Join the options array back into a comma-separated string
      if (updateField.type === "Select" && updateField.options) {
        setFieldOptions(updateField.options.join(', '));
      }
    } else {
      navigate('/'); // Go home if no field is in context
    }
  }, [updateField, navigate]);

  // 4. Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fieldData = {
      name: fieldName,
      type: fieldType,
    };

    if (fieldType === "Select") {
      fieldData.options = fieldOptions.split(',').map(option => option.trim());
    }

    try {
      // 5. Call the 'PUT /fields/{id}' API
      const response = await secureFetch(`http://127.0.0.1:8000/fields/${updateField.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fieldData),
      });

      const data = await response.json();

      if (data.status === 'ok') {
        setMessage({ type: "success", content: "Field updated successfully!" });
        // Go back to the category detail page
        setTimeout(() => navigate(`/category/${updateField.category_id}`), 1500);
      } else {
        setMessage({ type: "danger", content: "Failed to update field." });
      }
    } catch (error) {
      setMessage({ type: "danger", content: "An error occurred." });
    }
  };

  if (!updateField) return <Spinner animation="border" />; // Show loading

  return (
    <Container className="mt-4" style={{ maxWidth: '600px' }}>
      <Card>
        <Card.Body>
          <Card.Title>Update Field</Card.Title>
          {message.content && <Alert variant={message.type}>{message.content}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Field Name</Form.Label>
              <Form.Control
                type="text"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                required
              />
            </Form.Group>

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

            {fieldType === "Select" && (
              <Form.Group className="mb-3">
                <Form.Label>Options (comma-separated)</Form.Label>
                <Form.Control
                  type="text"
                  value={fieldOptions}
                  onChange={(e) => setFieldOptions(e.target.value)}
                  required
                />
              </Form.Group>
            )}

            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default UpdateFieldPage;