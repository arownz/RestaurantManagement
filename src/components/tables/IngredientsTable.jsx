import { useState, useEffect } from 'react';
import { Table, Button, Container, Alert, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

function IngredientsTable() {
  const [ingredients, setIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editIngredient, setEditIngredient] = useState({
    IngredientsID: '',
    IngredientName: '',
    UnitOfMeasurement: '',
    CategoryID: ''
  });

  // Fetch ingredients and categories data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ingredientsRes, categoriesRes] = await Promise.all([
          axios.get('http://localhost:3006/api/Ingredients'),
          axios.get('http://localhost:3006/api/Category')
        ]);
        setIngredients(ingredientsRes.data);
        setCategories(categoriesRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ingredient?')) {
      try {
        await axios.delete(`http://localhost:3006/api/Ingredients/${id}`);
        setIngredients(ingredients.filter(ingredient => ingredient.IngredientsID !== id));
      } catch (err) {
        console.error('Error deleting ingredient:', err);
        setError('Failed to delete ingredient. It may be referenced by other tables.');
      }
    }
  };

  const handleEdit = (ingredient) => {
    setEditIngredient(ingredient);
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:3006/api/Ingredients/${editIngredient.IngredientsID}`, editIngredient);
      
      setIngredients(ingredients.map(item => 
        item.IngredientsID === editIngredient.IngredientsID ? editIngredient : item
      ));
      
      setShowModal(false);
    } catch (err) {
      console.error('Error updating ingredient:', err);
      setError('Failed to update ingredient.');
    }
  };

  // Find category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.CategoryID === categoryId);
    return category ? category.Category : 'Unknown';
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Ingredients</h1>
        <Button as={Link} to="/add/ingredient" variant="success">Add New Ingredient</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Ingredient Name</th>
            <th>Unit of Measurement</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.length > 0 ? (
            ingredients.map(ingredient => (
              <tr key={ingredient.IngredientsID}>
                <td>{ingredient.IngredientsID}</td>
                <td>{ingredient.IngredientName}</td>
                <td>{ingredient.UnitOfMeasurement}</td>
                <td>{getCategoryName(ingredient.CategoryID)}</td>
                <td>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="me-2"
                    onClick={() => handleEdit(ingredient)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleDelete(ingredient.IngredientsID)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">No ingredients found</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Ingredient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Ingredient Name</Form.Label>
              <Form.Control 
                type="text" 
                value={editIngredient.IngredientName || ''}
                onChange={(e) => setEditIngredient({...editIngredient, IngredientName: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Unit of Measurement</Form.Label>
              <Form.Control 
                type="text" 
                value={editIngredient.UnitOfMeasurement || ''}
                onChange={(e) => setEditIngredient({...editIngredient, UnitOfMeasurement: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={editIngredient.CategoryID || ''}
                onChange={(e) => setEditIngredient({...editIngredient, CategoryID: parseInt(e.target.value)})}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.CategoryID} value={cat.CategoryID}>
                    {cat.Category}
                  </option>
                ))}
              </Form.Select>
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

export default IngredientsTable;
