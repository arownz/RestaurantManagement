import { useState, useEffect } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function RecipesForm() {
  const [recipe, setRecipe] = useState({
    MenuID: '',
    IngredientsID: '',
    Quantity: ''
  });
  const [menuItems, setMenuItems] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Fetch menu items and ingredients for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuResponse, ingredientsResponse] = await Promise.all([
          axios.get('http://localhost:3006/api/MenuItems'),
          axios.get('http://localhost:3006/api/Ingredients')
        ]);
        setMenuItems(menuResponse.data);
        setIngredients(ingredientsResponse.data);
      } catch (err) {
        console.error('Error fetching data for recipe form:', err);
        setError('Failed to load data. Please try again.');
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe({
      ...recipe,
      [name]: ['MenuID', 'IngredientsID'].includes(name) 
        ? parseInt(value) 
        : name === 'Quantity' 
          ? parseFloat(value) || '' 
          : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!recipe.MenuID) {
      setError('Please select a menu item');
      return;
    }
    if (!recipe.IngredientsID) {
      setError('Please select an ingredient');
      return;
    }
    if (!recipe.Quantity || recipe.Quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    try {
      await axios.post('http://localhost:3006/api/Recipes', recipe);
      setSuccess('Recipe added successfully!');
      setRecipe({
        MenuID: '',
        IngredientsID: '',
        Quantity: ''
      });
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/recipes');
      }, 1500);
    } catch (err) {
      console.error('Error adding recipe:', err);
      setError('Failed to add recipe. Please try again.');
    }
  };

  return (
    <Container className="mt-4">
      <h1>Add New Recipe</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit} className="form-container mt-4">
        <Form.Group className="mb-3">
          <Form.Label>Menu Item</Form.Label>
          <Form.Select
            name="MenuID"
            value={recipe.MenuID}
            onChange={handleChange}
          >
            <option value="">Select a menu item</option>
            {menuItems.map(item => (
              <option key={item.MenuID} value={item.MenuID}>
                {item.Menu}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Ingredient</Form.Label>
          <Form.Select
            name="IngredientsID"
            value={recipe.IngredientsID}
            onChange={handleChange}
          >
            <option value="">Select an ingredient</option>
            {ingredients.map(ingredient => (
              <option key={ingredient.IngredientsID} value={ingredient.IngredientsID}>
                {ingredient.IngredientName} ({ingredient.UnitOfMeasurement})
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Quantity</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter quantity needed"
            name="Quantity"
            value={recipe.Quantity}
            onChange={handleChange}
            min="0.01"
            step="0.01"
          />
          <Form.Text className="text-muted">
            Quantity in the ingredient's unit of measurement
          </Form.Text>
        </Form.Group>
        
        <div className="d-flex justify-content-between">
          <Button variant="secondary" onClick={() => navigate('/recipes')}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Add Recipe
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default RecipesForm;
