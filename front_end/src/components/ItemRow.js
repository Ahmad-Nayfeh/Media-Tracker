// src/components/ItemRow.js

import React, { useContext } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { UpdateItemContext } from '../UpdateItemContext';

// 1. Receive the new 'categoryId' prop
function ItemRow({ item, fields, openDeleteModal, categoryId }) {
  
  const [_, setUpdateItem] = useContext(UpdateItemContext);
  const navigate = useNavigate();

  const handleUpdateClick = () => {
    
    // 2. --- THIS IS THE FIX ---
    //    Create a new object that includes the item's data
    //    *and* the categoryId from the parent page.
    const itemWithCategory = {
      ...item,
      category_id: categoryId // Add the missing category ID
    };
    
    // 3. Save the *new* complete object (with category_id) to the "brain"
    setUpdateItem(itemWithCategory);
    
    navigate(`/update-item/${item.id}`);
  };

  return (
    <tr>
      {fields.map((field) => (
        <td key={field.id}>
          {item.data[field.name]}
        </td>
      ))}
      
      <td>
        <Button 
          variant="outline-secondary" 
          size="sm" 
          className="me-2"
          onClick={handleUpdateClick}
        >
          Update
        </Button>
        <Button 
          variant="outline-danger" 
          size="sm"
          onClick={() => openDeleteModal(item.id)}
        >
          Delete
        </Button>
      </td>
    </tr>
  );
}

export default ItemRow;