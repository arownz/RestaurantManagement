import { useState, useEffect } from 'react';
import { Table, Button, Container, Alert, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

function MenuItemsTable() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMenuItem, setEditMenuItem] = useState({ MenuID: '', Menu: '', SellingPrice: '' });

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get('http://localhost:3006/api/MenuItems');
        setMenuItems(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError('Failed to fetch menu items. Please try again later.');
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await axios.delete(`http://localhost:3006/api/MenuItems/${id}`);
        setMenuItems(menuItems.filter(item => item.MenuID !== id));
      } catch (err) {
        console.error('Error deleting menu item:', err);
        
        // Check if it's a foreign key constraint error
        if (err.response && err.response.data && err.response.data.code === 'FOREIGN_KEY_CONSTRAINT') {
          const shouldCascade = window.confirm(
            `${err.response.data.error}\n\nWould you like to delete this menu item and ALL related recipes and orders? This action cannot be undone.`
          );
          
          if (shouldCascade) {
            try {
              await axios.delete(`http://localhost:3006/api/MenuItems/${id}/cascade`);
              setMenuItems(menuItems.filter(item => item.MenuID !== id));
            } catch (cascadeErr) {
              console.error('Error cascading delete:', cascadeErr);
              setError('Failed to delete menu item and related records. Please try again.');
            }
          }
        } else {
          setError('Failed to delete menu item. It may be referenced by other tables.');
        }
      }
    }
  };

  const handleEdit = (menuItem) => {
    setEditMenuItem(menuItem);
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      console.log('Updating menu item:', editMenuItem);
      const payload = {
        Menu: editMenuItem.Menu,
        SellingPrice: parseFloat(editMenuItem.SellingPrice)
      };
      const response = await axios.put(`http://localhost:3006/api/MenuItems/${editMenuItem.MenuID}`, payload);
      console.log('Update response:', response);
      
      setMenuItems(menuItems.map(item => 
        item.MenuID === editMenuItem.MenuID ? 
        { ...item, Menu: editMenuItem.Menu, SellingPrice: parseFloat(editMenuItem.SellingPrice) } : item
      ));
      
      setShowModal(false);
    } catch (err) {
      console.error('Error updating menu item:', err);
      if (err.response && err.response.data) {
        setError(`Failed to update menu item: ${err.response.data.error || err.message}`);
      } else {
        setError('Failed to update menu item. Server error occurred.');
      }
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Menu Items</h1>
        <Button as={Link} to="/add/menu" variant="success">Add New Menu Item</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Menu Item</th>
            <th>Selling Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {menuItems.length > 0 ? (
            menuItems.map(item => (
              <tr key={item.MenuID}>
                <td>{item.MenuID}</td>
                <td>{item.Menu}</td>
                <td>${parseFloat(item.SellingPrice).toFixed(2)}</td>
                <td>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="me-2"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleDelete(item.MenuID)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">No menu items found</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Menu Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Menu Item Name</Form.Label>
              <Form.Control 
                type="text" 
                value={editMenuItem.Menu || ''}
                onChange={(e) => setEditMenuItem({...editMenuItem, Menu: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Selling Price</Form.Label>
              <Form.Control 
                type="number" 
                step="0.01"
                value={editMenuItem.SellingPrice || ''}
                onChange={(e) => setEditMenuItem({...editMenuItem, SellingPrice: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default MenuItemsTable;
