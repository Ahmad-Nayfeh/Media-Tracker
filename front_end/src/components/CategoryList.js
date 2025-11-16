// src/components/CategoryList.js

import React, { useEffect, useContext, useState } from 'react';
import { CategoryContext } from '../CategoryContext';
// 1. We no longer need ListGroup. We need Row and Col.
import { Alert, Modal, Button, Row, Col, Card } from 'react-bootstrap'; 
import { Link } from 'react-router-dom';
// 2. Import our new Card component
import CategoryCard from './CategoryCard';
import { secureFetch } from '../api';

function CategoryList() {
  const {
    displayedCategories, 
    setAllCategories,      
    setDisplayedCategories 
  } = useContext(CategoryContext);
  
  const [message, setMessage] = useState({ type: "", content: "" });
  const [showModal, setShowModal] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState(null);

  // --- This useEffect is unchanged ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await secureFetch('http://127.0.0.1:8000/categories');
        const data = await response.json();
        if (data.status === 'ok') {
          setAllCategories(data.data);
          setDisplayedCategories(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        if (error.message !== 'Unauthorized') {
          setMessage({ type: "danger", content: "Could not load categories." });
        }
      }
    };
    fetchCategories();
  }, [setAllCategories, setDisplayedCategories]); 

  // --- This delete logic is unchanged ---
  const confirmDelete = async () => {
    if (!targetCategoryId) return;
    try {
      const response = await secureFetch(`http://127.0.0.1:8000/categories/${targetCategoryId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.status === 'ok') {
        setAllCategories(
          (prev) => prev.filter((category) => category.id !== targetCategoryId)
        );
        setDisplayedCategories(
          (prev) => prev.filter((category) => category.id !== targetCategoryId)
        );
        setMessage({ type: "success", content: "Category deleted." });
      } else {
        setMessage({ type: "danger", content: "Failed to delete category." });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      if (error.message !== 'Unauthorized') {
        setMessage({ type: "danger", content: "An error occurred." });
      }
    }
    closeModal();
  };
  
  const openConfirmModal = (id) => { setTargetCategoryId(id); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  // 3. --- THIS IS THE NEW, STYLED RETURN STATEMENT ---
  return (
    <div>
      <Row className="align-items-center mb-3">
        <Col>
          <h2>My Categories</h2>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/add-category">
            + Add New Category
          </Button>
        </Col>
      </Row>
      
      {message.content && (
        <Alert variant={message.type} onClose={() => setMessage({ content: "" })} dismissible>
          {message.content}
        </Alert>
      )}

      {/* 4. Use a <Row> to create a grid */}
      <Row>
        {displayedCategories.length === 0 ? (
          <Col>
            <Card>
              <Card.Body>No categories found.</Card.Body>
            </Card>
          </Col>
        ) : (
          // 5. Loop over and render our new CategoryCard
          displayedCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              openDeleteModal={openConfirmModal}
            />
          ))
        )}
      </Row>

      {/* Modal code remains the same */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this category? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete Field</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CategoryList;