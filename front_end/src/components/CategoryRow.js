// src/components/CategoryRow.js

import React, { useContext } from 'react';
import { ListGroup, Button, Col, Row } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom'; // 1. Import 'Link'
import { UpdateCategoryContext } from '../UpdateCategoryContext';

function CategoryRow({ category, openDeleteModal }) {
  
  const [_, setUpdateCategory] = useContext(UpdateCategoryContext);
  const navigate = useNavigate();

  const handleUpdateClick = () => {
    setUpdateCategory(category);
    navigate(`/update-category/${category.id}`);
  };

  return (
    <ListGroup.Item>
      <Row className="align-items-center">
        <Col>
          {/* 2. Wrap the name in a Link component */}
          {/* This turns the name into a link to "/category/1" etc. */}
          <Link to={`/category/${category.id}`} style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '1.2rem', color: 'black' }}>
              {category.name}
            </span>
          </Link>
        </Col>

        <Col xs="auto">
          <Button 
            variant="outline-info" 
            size="sm" 
            className="me-2"
            onClick={handleUpdateClick}
          >
            Update
          </Button>
          <Button 
            variant="outline-danger" 
            size="sm" 
            onClick={() => openDeleteModal(category.id)}
          >
            Delete
          </Button>
        </Col>
      </Row>
    </ListGroup.Item>
  );
}

export default CategoryRow;