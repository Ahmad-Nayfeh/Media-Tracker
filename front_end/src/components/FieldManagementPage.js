// src/components/FieldManagementPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ListGroup, Alert, Modal, Button, Spinner } from 'react-bootstrap';
import FieldRow from './FieldRow'; // Our new row component

import { secureFetch } from '../api';

function FieldManagementPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", content: "" });

  // --- State for the Delete Modal ---
  const [showModal, setShowModal] = useState(false);
  const [targetFieldId, setTargetFieldId] = useState(null);

  // --- Fetch Fields on Page Load ---
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await secureFetch(`http://127.0.0.1:8000/categories/${categoryId}/fields`);
        const data = await response.json();
        if (data.status === 'ok') {
          setFields(data.data);
        } else {
          setMessage({ type: "danger", content: "Failed to load fields." });
        }
      } catch (error) {
        setMessage({ type: "danger", content: "An error occurred." });
      }
      setLoading(false);
    };
    fetchFields();
  }, [categoryId]);

  // --- Delete Modal Functions ---
  const openConfirmModal = (id) => {
    setTargetFieldId(id);
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const confirmDelete = async () => {
    try {
      // Call our 'DELETE /fields/{id}' API
      const response = await secureFetch(`http://127.0.0.1:8000/fields/${targetFieldId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.status === 'ok') {
        // Update local state
        setFields(fields.filter((field) => field.id !== targetFieldId));
        setMessage({ type: "success", content: "Field deleted." });
      } else {
        setMessage({ type: "danger", content: "Failed to delete field." });
      }
    } catch (error) {
      setMessage({ type: "danger", content: "An error occurred." });
    }
    closeModal();
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h2 className="mb-3">Manage Fields</h2>
      
      {message.content && (
        <Alert variant={message.type} onClose={() => setMessage({ content: "" })} dismissible>
          {message.content}
        </Alert>
      )}

      {/* Button to go to the "Add Field" page we already built */}
      <Button 
        variant="primary" 
        className="mb-3" 
        onClick={() => navigate(`/category/${categoryId}/add-field`)}
      >
        + Add New Field
      </Button>

      <ListGroup>
        {fields.length === 0 ? (
          <ListGroup.Item>No fields found for this category.</ListGroup.Item>
        ) : (
          fields.map((field) => (
            <FieldRow
              key={field.id}
              field={field}
              openDeleteModal={openConfirmModal}
              categoryId={categoryId}
            />
          ))
        )}
      </ListGroup>

      {/* --- Delete Confirmation Modal --- */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this field? All data in this "column" will be lost!</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete Field</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default FieldManagementPage;