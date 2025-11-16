// src/components/CategoryCard.js

import React, { useContext } from 'react';
import { Card, Button, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { UpdateCategoryContext } from '../UpdateCategoryContext';

// 1. --- IMPORT THE NEW CSS FILE ---
import './CategoryCard.css';

function CategoryCard({ category, openDeleteModal }) {
  const navigate = useNavigate();
  const [_, setUpdateCategory] = useContext(UpdateCategoryContext);

  const handleUpdateClick = () => {
    setUpdateCategory(category); 
    navigate(`/update-category/${category.id}`);
  };

  return (
    <Col md={4} className="mb-4">
      {/* 'h-100' (height 100%) and 'shadow-sm' (small shadow) are from Bootstrap */}
      <Card className="h-100 shadow-sm">
        <Card.Body className="d-flex flex-column">
          <Card.Title>{category.name}</Card.Title>
          <Card.Text>
            {category.description}
          </Card.Text>

          {/* 'mt-auto' pushes this div to the bottom of the card */}
          <div className="mt-auto">
            {/* 2. --- CLEANED UP BUTTONS --- */}
            {/* We removed all the 'me-2' classes. 
                Our CSS file now handles all spacing. */}
            <Link to={`/category/${category.id}`} className="btn btn-primary">
              View
            </Link>
            <Button variant="outline-info" size="sm" onClick={handleUpdateClick}>
              Update
            </Button>
            <Button variant="outline-danger" size="sm" onClick={() => openDeleteModal(category.id)}>
              Delete
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
}

export default CategoryCard;