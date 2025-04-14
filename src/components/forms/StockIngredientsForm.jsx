import { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function StockIngredientsForm() {
  const [stockIngredient, setStockIngredient] = useState({
    IngredientsID: '',
    Container: '',
    Quantity: '',
    Container_Size: '',
    Container_Price: ''
  });
  const [ingredients, setIngredients] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Fetch ingredients for dropdown
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await axios.get('http://localhost:3006/api/Ingredients');
        setIngredients(response.data);
      } catch (err) {
        console.error('Error fetching ingredients:', err);
        setError('Failed to load ingredients. Please try again.');
      }
    };

    fetchIngredients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStockIngredient({
      ...stockIngredient,
      [name]: ['IngredientsID', 'Quantity', 'Container_Size', 'Container_Price'].includes(name) 
        ? parseFloat(value) || '' 
        : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!stockIngredient.IngredientsID) {
      setError('Please select an ingredient');
      return;
    }
    if (!stockIngredient.Container.trim()) {
      setError('Container type is required');
      return;
    }
    if (!stockIngredient.Quantity || stockIngredient.Quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }
    if (!stockIngredient.Container_Size || stockIngredient.Container_Size <= 0) {
      setError('Container size must be greater than 0');
      return;
    }
    if (!stockIngredient.Container_Price || stockIngredient.Container_Price <= 0) {
      setError('Container price must be greater than 0');
      return;
    }

    try {
      await axios.post('http://localhost:3006/api/StockIngredients', stockIngredient);
      setSuccess('Stock ingredient added successfully!');
      setStockIngredient({
        IngredientsID: '',
        Container: '',
        Quantity: '',
        Container_Size: '',
        Container_Price: ''
      });
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/stock');
      }, 1500);
    } catch (err) {
      console.error('Error adding stock ingredient:', err);
      setError('Failed to add stock ingredient. Please try again.');
    }
  };

  return (
    <Container className="mt-4">
      <h1>Add New Stock</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit} className="form-container mt-4">
        <Form.Group className="mb-3">
          <Form.Label>Ingredient</Form.Label>
          <Form.Select
            name="IngredientsID"
            value={stockIngredient.IngredientsID}
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
        
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Container Type</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., bottle, box, sachet"
                name="Container"
                value={stockIngredient.Container}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                placeholder="Number of containers"
                name="Quantity"
                value={stockIngredient.Quantity}
                onChange={handleChange}
                min="1"
              />
            </Form.Group>
          </Col>
        </Row>
        
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Container Size</Form.Label>
              <Form.Control
                type="number"
                placeholder="Size of each container"
                name="Container_Size"
                value={stockIngredient.Container_Size}
                onChange={handleChange}
                min="0.01"
                step="0.01"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Container Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Price per container"
                name="Container_Price"
                value={stockIngredient.Container_Price}
                onChange={handleChange}
                min="0.01"
                step="0.01"
              />
            </Form.Group>
          </Col>
        </Row>
        
        <div className="d-flex justify-content-between">
          <Button variant="secondary" onClick={() => navigate('/stock')}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Add Stock
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default StockIngredientsForm;
