import { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function MenuItemsForm() {
  const [menuItem, setMenuItem] = useState({
    Menu: '',
    SellingPrice: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMenuItem({
      ...menuItem,
      [name]: name === 'SellingPrice' ? parseFloat(value) || '' : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!menuItem.Menu.trim()) {
      setError('Menu item name is required');
      return;
    }
    if (!menuItem.SellingPrice || menuItem.SellingPrice <= 0) {
      setError('Selling price must be greater than 0');
      return;
    }

    try {
      await axios.post('http://localhost:3006/api/MenuItems', menuItem);
      setSuccess('Menu item added successfully!');
      setMenuItem({
        Menu: '',
        SellingPrice: ''
      });
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/menu');
      }, 1500);
    } catch (err) {
      console.error('Error adding menu item:', err);
      setError('Failed to add menu item. Please try again.');
    }
  };

  return (
    <Container className="mt-4">
      <h1>Add New Menu Item</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit} className="form-container mt-4">
        <Form.Group className="mb-3">
          <Form.Label>Menu Item Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter menu item name"
            name="Menu"
            value={menuItem.Menu}
            onChange={handleChange}
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Selling Price</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter selling price"
            name="SellingPrice"
            value={menuItem.SellingPrice}
            onChange={handleChange}
            min="0.01"
            step="0.01"
          />
        </Form.Group>
        
        <div className="d-flex justify-content-between">
          <Button variant="secondary" onClick={() => navigate('/menu')}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Add Menu Item
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default MenuItemsForm;
