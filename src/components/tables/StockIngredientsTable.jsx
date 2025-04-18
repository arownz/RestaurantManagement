import { useState, useEffect } from 'react';
import { Table, Button, Container, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

function StockIngredientsTable() {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockItems = async () => {
      try {
        const response = await axios.get('http://localhost:3006/api/StockIngredients');
        setStockItems(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stock items:', err);
        setError('Failed to fetch stock items. Please try again later.');
        setLoading(false);
      }
    };

    fetchStockItems();
  }, []);

  const handleDelete = async (stockId, ingredientId) => {
    if (window.confirm('Are you sure you want to delete this stock entry?')) {
      try {
        // This would need a custom endpoint in your API
        await axios.delete(`http://localhost:3006/api/StockIngredients/${stockId}/${ingredientId}`);
        setStockItems(stockItems.filter(item => 
          !(item.StockIngredientsID === stockId && item.IngredientsID === ingredientId)
        ));
      } catch (err) {
        console.error('Error deleting stock entry:', err);
        setError('Failed to delete stock entry.');
      }
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Stock Ingredients</h1>
        <Button as={Link} to="/add/stock" variant="success">Add New Stock</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Stock ID</th>
            <th>Ingredient</th>
            <th>Container</th>
            <th>Quantity</th>
            <th>Container Size</th>
            <th>Container Price</th>
            <th>Total Quantity</th>
            <th>Total Price</th>
            <th>Unit Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stockItems.length > 0 ? (
            stockItems.map((item, index) => (
              <tr key={index}>
                <td>{item.StockIngredientsID}</td>
                <td>{item.IngredientName}</td>
                <td>{item.Container}</td>
                <td>{item.Quantity}</td>
                <td>{item.Container_Size}</td>
                <td>${typeof item.Container_Price === 'number' ? item.Container_Price.toFixed(2) : parseFloat(item.Container_Price).toFixed(2)}</td>
                <td>{item.Total_Quantity}</td>
                <td>${typeof item.Total_Price === 'number' ? item.Total_Price.toFixed(2) : parseFloat(item.Total_Price).toFixed(2)}</td>
                <td>${typeof item.Unit_Price === 'number' ? item.Unit_Price.toFixed(4) : parseFloat(item.Unit_Price).toFixed(4)}</td>
                <td>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleDelete(item.StockIngredientsID, item.IngredientsID)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="text-center">No stock items found</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default StockIngredientsTable;
