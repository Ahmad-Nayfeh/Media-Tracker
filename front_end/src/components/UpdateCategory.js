// src/components/UpdateCategory.js

import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { UpdateCategoryContext } from '../UpdateCategoryContext';
import { CategoryContext } from '../CategoryContext';
import { secureFetch } from '../api'; // Import secureFetch

function UpdateCategory() {
  const [updateCategory] = useContext(UpdateCategoryContext);
  const { setAllCategories, setDisplayedCategories } = useContext(CategoryContext);
  
  // --- 1. ADD NEW STATE FOR DESCRIPTION ---
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");

  const [message, setMessage] = useState({ type: "", content: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (updateCategory) {
      setCategoryName(updateCategory.name);
      // 2. --- PRE-FILL THE DESCRIPTION ---
      setDescription(updateCategory.description || ""); // Pre-fill
    } else {
      navigate('/');
    }
  }, [updateCategory, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 3. --- UPDATE THE REQUEST BODY ---
      const response = await secureFetch(`http://127.0.0.1:8000/categories/${updateCategory.id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          name: categoryName, 
          description: description // Send the new description
        }),
      });

      const data = await response.json();
      if (data.status === 'ok') {
        const updateList = (prevList) => 
          prevList.map((cat) =>
            cat.id === data.data.id ? data.data : cat
          );
        setAllCategories(updateList);
        setDisplayedCategories(updateList);
        
        setMessage({ type: "success", content: "Category updated!" });
        setTimeout(() => navigate('/'), 1000);
      } else {
        setMessage({ type: "danger", content: "Failed to update category." });
      }
    } catch (error) {
      console.error("Error updating category:", error);
      if (error.message !== 'Unauthorized') {
        setMessage({ type: "danger", content: "An error occurred." });
      }
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: '600px' }}>
      <Card>
        <Card.Body>
          <Card.Title>Update Category</Card.Title>
          {message.content && <Alert variant={message.type}>{message.content}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
            </Form.Group>
            
            {/* 4. --- ADD THE DESCRIPTION TEXTAREA --- */}
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
              />
              <Form.Text className="text-muted">
                {description.length} / 200
              </Form.Text>
            </Form.Group>

            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default UpdateCategory;