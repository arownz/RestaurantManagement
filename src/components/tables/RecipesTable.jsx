import { useState, useEffect } from 'react';
import { Table, Button, Container, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

function RecipesTable() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get('http://localhost:3006/api/Recipes');
        setRecipes(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError('Failed to fetch recipes. Please try again later.');
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        console.log('Deleting recipe:', id);
        const response = await axios.delete(`http://localhost:3006/api/Recipes/${id}`);
        console.log('Delete response:', response);
        setRecipes(recipes.filter(recipe => recipe.RecipeID !== id));
      } catch (err) {
        console.error('Error deleting recipe:', err);
        if (err.response && err.response.data) {
          setError(`Failed to delete recipe: ${err.response.data.error || err.message}`);
        } else {
          setError('Failed to delete recipe. Server error occurred.');
        }
      }
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Recipes</h1>
        <Button as={Link} to="/add/recipe" variant="success">Add New Recipe</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Recipe ID</th>
            <th>Menu Item</th>
            <th>Ingredient</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {recipes.length > 0 ? (
            recipes.map(recipe => (
              <tr key={recipe.RecipeID}>
                <td>{recipe.RecipeID}</td>
                <td>{recipe.Menu}</td>
                <td>{recipe.IngredientName}</td>
                <td>{recipe.Quantity}</td>
                <td>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleDelete(recipe.RecipeID)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">No recipes found</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default RecipesTable;
