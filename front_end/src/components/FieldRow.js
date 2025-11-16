// src/components/FieldRow.js

import React, { useContext } from 'react';
import { ListGroup, Button, Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { UpdateFieldContext } from '../UpdateFieldContext';

// 1. Receive 'categoryId' as a prop
function FieldRow({ field, openDeleteModal, categoryId }) {
  
  const [_, setUpdateField] = useContext(UpdateFieldContext);
  const navigate = useNavigate();

  const handleUpdateClick = () => {
    // 2. --- THIS IS THE FIX ---
    //    Create a new object that includes the 'field' data
    //    *and* the parent 'category_id'.
    const fieldWithCategory = {
      ...field,
      category_id: categoryId
    };

    // 3. Save the *new* complete object to the "brain"
    setUpdateField(fieldWithCategory);
    navigate(`/update-field/${field.id}`);
  };

  return (
    <ListGroup.Item>
      <Row className="align-items-center">
        <Col>
          <span style={{ fontSize: '1.2rem' }}>{field.name}</span>
          <br />
          <small className="text-muted">Type: {field.type}</small>
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
            onClick={() => openDeleteModal(field.id)}
          >
            Delete
          </Button>
        </Col>
      </Row>
    </ListGroup.Item>
  );
}

export default FieldRow;