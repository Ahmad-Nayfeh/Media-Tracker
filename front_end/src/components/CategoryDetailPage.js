// src/components/CategoryDetailPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Spinner, Alert, Button, Modal, Form, Row, Col, Card, InputGroup } from 'react-bootstrap'; 
import ItemRow from './ItemRow';
import './CategoryDetailPage.css'; // Make sure CSS is imported
import { secureFetch } from '../api';


function CategoryDetailPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  // --- All of our state (no changes) ---
  const [category, setCategory] = useState(null);
  const [fields, setFields] = useState([]);
  const [masterItems, setMasterItems] = useState([]); 
  const [displayedItems, setDisplayedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [targetItemId, setTargetItemId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [filterValues, setFilterValues] = useState({}); 

  // --- All logic (useEffect, useMemo, handlers) is unchanged ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const catResponse = await secureFetch(`http://127.0.0.1:8000/categories/${categoryId}`);
        const catData = await catResponse.json();
        const fieldsResponse = await secureFetch(`http://127.0.0.1:8000/categories/${categoryId}/fields`);
        const fieldsData = await fieldsResponse.json();
        const itemsResponse = await secureFetch(`http://127.0.0.1:8000/categories/${categoryId}/items`);
        const itemsData = await itemsResponse.json();
        if (catData.status === 'ok' && fieldsData.status === 'ok' && itemsData.status === 'ok') {
          setCategory(catData.data);
          setFields(fieldsData.data);
          setMasterItems(itemsData.data);
        } else { setError("Failed to fetch data."); }
      } catch (err) { if (err.message !== 'Unauthorized') setError("An error occurred while fetching data."); }
      setLoading(false);
    };
    fetchData();
  }, [categoryId]);

  useMemo(() => {
    let items = masterItems;
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      items = items.filter(item => Object.values(item.data).some(val => String(val).toLowerCase().includes(lowerSearchTerm)));
    }
    const activeFilters = Object.entries(filterValues).filter(([_, val]) => val !== "");
    if (activeFilters.length > 0) {
      items = items.filter(item => activeFilters.every(([key, val]) => item.data[key] === val));
    }
    setDisplayedItems(items);
  }, [masterItems, searchTerm, filterValues]);
  
  const handleFilterChange = (fieldName, value) => setFilterValues(prev => ({ ...prev, [fieldName]: value }));
  const clearFilters = () => { setFilterValues({}); setSearchTerm(""); };
  const handleManageFieldsClick = () => navigate(`/category/${categoryId}/manage-fields`);
  const handleAddItemClick = () => navigate(`/category/${categoryId}/add-item`);
  const openItemDeleteModal = (id) => { setTargetItemId(id); setShowItemModal(true); };
  const closeItemDeleteModal = () => setShowItemModal(false);
  const confirmItemDelete = async () => {
    if (!targetItemId) return;
    try {
      const res = await secureFetch(`http://127.0.0.1:8000/items/${targetItemId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'ok') {
        setMasterItems(prev => prev.filter(item => item.id !== targetItemId));
      } else { setError("Failed to delete item."); }
    } catch (err) { if (err.message !== 'Unauthorized') setError("An error occurred."); }
    closeItemDeleteModal();
  };
  const handleSearchSubmit = (e) => e.preventDefault(); 

  // --- RENDER PAGE ---
  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!category) return <Alert variant="warning">Category not found.</Alert>;

  // --- 3. THIS IS THE NEW, STYLED RETURN STATEMENT ---
  return (
    <div>
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {/* --- Page Header (with button spacing fixed) --- */}
      <div className="page-header">
        <div>
          <h2>{category.name}</h2>
          <p className="text-muted mb-0">{category.description}</p>
        </div>
        <div>
          <Button 
            variant="outline-secondary"
            className="me-2"  /* <-- 1. FIX: Added margin */
            onClick={handleManageFieldsClick}
          >
            Manage Fields
          </Button>
          <Button 
            variant="success"
            onClick={handleAddItemClick}
          >
            + Add New Item
          </Button>
        </div>
      </div>

      {/* --- 2. NEW: Controls Card --- */}
      <Card className="controls-card">
        <Card.Body>
          <Row className="align-items-end g-3">
            
            {/* --- 3. Filters (now inside the card) --- */}
            {fields.filter(field => field.type === 'Select').map(field => (
              <Col md={3} key={field.id}>
                <Form.Group>
                  <Form.Label>{field.name}</Form.Label>
                  <Form.Select
                    value={filterValues[field.name] || ""}
                    onChange={(e) => handleFilterChange(field.name, e.target.value)}
                  >
                    <option value="">All</option>
                    {field.options.map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            ))}
            
            {/* --- 4. Search Bar (with height fixed) --- */}
            <Col md>
              <Form.Group>
                <Form.Label>Search</Form.Label>
                {/* We use InputGroup to "glue" the button to the input */}
                <InputGroup className="search-input-group">
                  <Form.Control
                    type="search"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline-secondary" onClick={clearFilters}>Clear All</Button>
                </InputGroup>
              </Form.Group>
            </Col>

          </Row>
        </Card.Body>
      </Card>

      {/* --- Styled Table (no changes) --- */}
      <Table striped bordered hover responsive className="item-table">
        <thead>
          <tr>
            {fields.map((field) => (
              <th key={field.id}>{field.name}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedItems.length === 0 ? (
            <tr className="no-items-row">
              <td colSpan={fields.length + 1} className="text-center">
                {searchTerm || Object.values(filterValues).some(v => v) ? "No items match your filters." : "No items in this category yet."}
              </td>
            </tr>
          ) : (
            displayedItems.map((item) => (
              <ItemRow 
                key={item.id} 
                item={item} 
                fields={fields}
                openDeleteModal={openItemDeleteModal} 
                categoryId={categoryId}
              />
            ))
          )}
        </tbody>
      </Table>

      {/* --- Modal (no changes) --- */}
      <Modal show={showItemModal} onHide={closeItemDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Item Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this item?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeItemDeleteModal}>Cancel</Button>
          <Button variant="danger" onClick={confirmItemDelete}>Delete Item</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CategoryDetailPage;