import { useState, useEffect } from 'react';
import { Table, Button, Container, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

function OrdersTable() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, menuItemsRes] = await Promise.all([
          axios.get('http://localhost:3006/api/Orders'),
          axios.get('http://localhost:3006/api/MenuItems')
        ]);
        
        setOrders(ordersRes.data);
        setMenuItems(menuItemsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order data:', err);
        setError('Failed to fetch orders. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getMenuName = (menuId) => {
    const menuItem = menuItems.find(item => item.MenuID === menuId);
    return menuItem ? menuItem.Menu : 'Unknown Menu Item';
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        console.log('Deleting order:', id);
        const response = await axios.delete(`http://localhost:3006/api/Orders/${id}`);
        console.log('Delete response:', response);
        setOrders(orders.filter(order => order.OrderID !== id));
      } catch (err) {
        console.error('Error deleting order:', err);
        if (err.response && err.response.data) {
          setError(`Failed to delete order: ${err.response.data.error || err.message}`);
        } else {
          setError('Failed to delete order. Server error occurred.');
        }
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Orders</h1>
        <Button as={Link} to="/add/order" variant="success">Place New Order</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Menu Item</th>
            <th>Quantity</th>
            <th>Total Price</th>
            <th>Order Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map(order => (
              <tr key={order.OrderID}>
                <td>{order.OrderID}</td>
                <td>{getMenuName(order.MenuID)}</td>
                <td>{order.Quantity}</td>
                <td>${parseFloat(order.TotalPrice).toFixed(2)}</td>
                <td>{formatDate(order.OrderDate)}</td>
                <td>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleDelete(order.OrderID)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">No orders found</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default OrdersTable;
