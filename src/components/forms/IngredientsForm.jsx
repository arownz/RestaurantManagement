import { useState, useEffect } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function IngredientsForm() {
  const [ingredient, setIngredient] = useState({
    IngredientName: '',
    UnitOfMeasurement: '',
    CategoryID: ''
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Fetch categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:3006/api/Category');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again.');
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIngredient({
      ...ingredient,
      [name]: name === 'CategoryID' ? parseInt(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!ingredient.IngredientName.trim()) {
      setError('Ingredient name is required');
      return;
    }

    if (!ingredient.UnitOfMeasurement.trim()) {
      setError('Unit of measurement is required');
      return;
    }

    if (!ingredient.CategoryID) {
      setError('Category is required');
      return;
    }

    try {
      await axios.post('http://localhost:3006/api/Ingredients', ingredient);
      setSuccess('Ingredient added successfully!');
      setIngredient({
        IngredientName: '',
        UnitOfMeasurement: '',
        CategoryID: ''
      });
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/ingredients');
      }, 1500);
    } catch (err) {
      console.error('Error adding ingredient:', err);
      setError('Failed to add ingredient. Please try again.');
    }
  };

  return (
    <Container className="mt-4">
      <h1>Add New Ingredient</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit} className="form-container mt-4">
        <Form.Group className="mb-3">
          <Form.Label>Ingredient Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter ingredient name"
            name="IngredientName"
            value={ingredient.IngredientName}
            onChange={handleChange}
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Unit of Measurement</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g., grams, ml, pieces"
            name="UnitOfMeasurement"
            value={ingredient.UnitOfMeasurement}
            onChange={handleChange}
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Select
            name="CategoryID"
            value={ingredient.CategoryID}
            onChange={handleChange}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.CategoryID} value={category.CategoryID}>
                {category.Category}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        
        <div className="d-flex justify-content-between">
          <Button variant="secondary" onClick={() => navigate('/ingredients')}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Add Ingredient
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default IngredientsForm;
