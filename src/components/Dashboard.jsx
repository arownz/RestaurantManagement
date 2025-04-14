import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const [counts, setCounts] = useState({
    categories: 0,
    ingredients: 0,
    menu: 0,
    orders: 0
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [categoriesRes, ingredientsRes, menuRes, ordersRes] = await Promise.all([
          axios.get('http://localhost:3006/api/Category'),
          axios.get('http://localhost:3006/api/Ingredients'),
          axios.get('http://localhost:3006/api/MenuItems'),
          axios.get('http://localhost:3006/api/Orders')
        ]);
        
        setCounts({
          categories: categoriesRes.data.length,
          ingredients: ingredientsRes.data.length,
          menu: menuRes.data.length,
          orders: ordersRes.data.length
        });
      } catch (error) {
        console.error('Error fetching data counts:', error);
      }
    };
    
    fetchCounts();
  }, []);

  return (
    <Container>
      <h1 className="my-4">Restaurant Inventory Dashboard</h1>
      
      <Row className="mb-4">
        <Col md={3}>
          <Card className="dashboard-card">
            <Card.Body>
              <Card.Title>Categories</Card.Title>
              <Card.Text className="display-4">{counts.categories}</Card.Text>
              <Button as={Link} to="/categories" variant="primary">View Categories</Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="dashboard-card">
            <Card.Body>
              <Card.Title>Ingredients</Card.Title>
              <Card.Text className="display-4">{counts.ingredients}</Card.Text>
              <Button as={Link} to="/ingredients" variant="primary">View Ingredients</Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="dashboard-card">
            <Card.Body>
              <Card.Title>Menu Items</Card.Title>
              <Card.Text className="display-4">{counts.menu}</Card.Text>
              <Button as={Link} to="/menu" variant="primary">View Menu</Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="dashboard-card">
            <Card.Body>
              <Card.Title>Orders</Card.Title>
              <Card.Text className="display-4">{counts.orders}</Card.Text>
              <Button as={Link} to="/orders" variant="primary">View Orders</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={4}>
          <Card className="dashboard-card h-100">
            <Card.Body>
              <Card.Title>Inventory Management</Card.Title>
              <Card.Text>
                Manage your restaurant's inventory, check stock levels, and track ingredients.
              </Card.Text>
              <Button as={Link} to="/views/remaining-ingredients" variant="success">View Inventory</Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="dashboard-card h-100">
            <Card.Body>
              <Card.Title>Recipe Management</Card.Title>
              <Card.Text>
                Create and manage recipes for your menu items.
              </Card.Text>
              <Button as={Link} to="/recipes" variant="success">Manage Recipes</Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="dashboard-card h-100">
            <Card.Body>
              <Card.Title>Quick Actions</Card.Title>
              <div className="d-grid gap-2">
                <Button as={Link} to="/add/ingredient" variant="outline-primary">Add Ingredient</Button>
                <Button as={Link} to="/add/menu" variant="outline-primary">Add Menu Item</Button>
                <Button as={Link} to="/add/order" variant="outline-primary">Place Order</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
