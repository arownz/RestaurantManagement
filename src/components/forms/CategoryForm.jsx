import { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CategoryForm() {
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!category.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      await axios.post('http://localhost:3006/api/Category', { Category: category });
      setSuccess('Category added successfully!');
      setCategory('');
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/categories');
      }, 1500);
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Failed to add category. Please try again.');
    }
  };

  return (
    <Container className="mt-4">
      <h1>Add New Category</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit} className="form-container mt-4">
        <Form.Group className="mb-3">
          <Form.Label>Category Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter category name"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </Form.Group>
        
        <div className="d-flex justify-content-between">
          <Button variant="secondary" onClick={() => navigate('/categories')}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Add Category
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default CategoryForm;
