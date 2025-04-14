import { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function OrdersForm() {
  const [order, setOrder] = useState({
    MenuID: '',
    Quantity: 1
  });
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Fetch menu items for dropdown
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get('http://localhost:3006/api/MenuItems');
        setMenuItems(response.data);
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError('Failed to load menu items. Please try again.');
      }
    };

    fetchMenuItems();
  }, []);

  // Update selected menu item when MenuID changes
  useEffect(() => {
    if (order.MenuID) {
      const selected = menuItems.find(item => item.MenuID === parseInt(order.MenuID));
      setSelectedMenuItem(selected);
    } else {
      setSelectedMenuItem(null);
    }
  }, [order.MenuID, menuItems]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrder({
      ...order,
      [name]: name === 'MenuID' ? parseInt(value) : name === 'Quantity' ? parseInt(value) || 1 : value
    });
  };

  const calculateTotalPrice = () => {
    if (!selectedMenuItem) return 0;
    return selectedMenuItem.SellingPrice * order.Quantity;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!order.MenuID) {
      setError('Please select a menu item');
      return;
    }
    if (!order.Quantity || order.Quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    try {
      const totalPrice = calculateTotalPrice();
      await axios.post('http://localhost:3006/api/Orders', {
        ...order,
        TotalPrice: totalPrice
      });
      setSuccess('Order placed successfully!');
      setOrder({
        MenuID: '',
        Quantity: 1
      });
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place order. Please try again.');
    }
  };

  return (
    <Container className="mt-4">
      <h1>Place New Order</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit} className="form-container mt-4">
        <Form.Group className="mb-3">
          <Form.Label>Menu Item</Form.Label>
          <Form.Select
            name="MenuID"
            value={order.MenuID}
            onChange={handleChange}
          >
            <option value="">Select a menu item</option>
            {menuItems.map(item => (
              <option key={item.MenuID} value={item.MenuID}>
                {item.Menu} - ${parseFloat(item.SellingPrice).toFixed(2)}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Quantity</Form.Label>
          <Form.Control
            type="number"
            name="Quantity"
            value={order.Quantity}
            onChange={handleChange}
            min="1"
          />
        </Form.Group>
        
        {selectedMenuItem && (
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <Card.Text>
                <strong>Item:</strong> {selectedMenuItem.Menu}<br />
                <strong>Price per item:</strong> ${parseFloat(selectedMenuItem.SellingPrice).toFixed(2)}<br />
                <strong>Quantity:</strong> {order.Quantity}<br />
                <strong>Total:</strong> ${calculateTotalPrice().toFixed(2)}
              </Card.Text>
            </Card.Body>
          </Card>
        )}
        
        <div className="d-flex justify-content-between">
          <Button variant="secondary" onClick={() => navigate('/orders')}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Place Order
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default OrdersForm;
