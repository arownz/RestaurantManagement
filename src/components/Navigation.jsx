import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="flex-column" style={{ width: '250px', height: '100vh', position: 'sticky', top: 0 }}>
      <Container className="d-flex flex-column align-items-start">
        <Navbar.Brand as={Link} to="/" className="mb-4 mt-3">Restaurant Inventory</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="w-100">
          <Nav className="flex-column w-100">
            <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
            
            <NavDropdown title="Tables" id="tables-dropdown">
              <NavDropdown.Item as={Link} to="/categories">Categories</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/ingredients">Ingredients</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/stock">Stock Ingredients</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/menu">Menu Items</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/recipes">Recipes</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/orders">Orders</NavDropdown.Item>
            </NavDropdown>
            
            <NavDropdown title="Views" id="views-dropdown">
              <NavDropdown.Item as={Link} to="/views/total-stock">Total Stock by Ingredient</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/views/ingredients-used">Total Ingredients Used</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/views/remaining-ingredients">Remaining Ingredients</NavDropdown.Item>
            </NavDropdown>
            
            <NavDropdown title="Add New" id="add-dropdown">
              <NavDropdown.Item as={Link} to="/add/category">Add Category</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/add/ingredient">Add Ingredient</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/add/stock">Add Stock</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/add/menu">Add Menu Item</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/add/recipe">Add Recipe</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/add/order">Place Order</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;
