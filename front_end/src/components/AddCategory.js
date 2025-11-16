// src/components/AddCategory.js

import React, { useState, useContext } from 'react';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { CategoryContext } from '../CategoryContext';
import { secureFetch } from '../api'; // Import secureFetch

function AddCategory() {
  const [categoryName, setCategoryName] = useState("");
  // --- 1. ADD NEW STATE FOR DESCRIPTION ---
  const [description, setDescription] = useState("");

  const [message, setMessage] = useState({ type: "", content: "" });
  const { allCategories, setAllCategories, setDisplayedCategories } = useContext(CategoryContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 2. --- UPDATE THE REQUEST BODY ---
      const response = await secureFetch('http://127.0.0.1:8000/categories', {
        method: 'POST',
        body: JSON.stringify({ 
          name: categoryName, 
          description: description  // Send the description
        }),
      });

      const data = await response.json();

      if (data.status === 'ok') {
        const newList = [...allCategories, data.data];
        setAllCategories(newList);
        setDisplayedCategories(newList);
        
        setMessage({ type: "success", content: "Category added!" });
        setCategoryName("");
        setDescription(""); // Clear the form
        
        setTimeout(() => navigate('/'), 1000);
      } else {
        setMessage({ type: "danger", content: "Failed to add category." });
      }
    } catch (error) {
      console.error("Error submitting category:", error);
      if (error.message !== 'Unauthorized') {
        setMessage({ type: "danger", content: "An error occurred." });
      }
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: '600px' }}>
      <Card>
        <Card.Body>
          <Card.Title>Add New Category</Card.Title>
          {message.content && <Alert variant={message.type}>{message.content}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Books, Movies, Podcasts"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
            </Form.Group>
            
            {/* 3. --- ADD THE DESCRIPTION TEXTAREA --- */}
            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="What is this collection for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
              />
              <Form.Text className="text-muted">
                {description.length} / 200
              </Form.Text>
            </Form.Group>

            <Button variant="primary" type="submit">
              Add Category
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AddCategory;