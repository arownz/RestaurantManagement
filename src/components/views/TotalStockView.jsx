import { useState, useEffect } from 'react';
import { Table, Container, Alert } from 'react-bootstrap';
import axios from 'axios';

function TotalStockView() {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const response = await axios.get('http://localhost:3006/api/View_TotalStockByIngredient');
        setStockData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to fetch total stock data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <Container>
      <h1 className="my-4">Total Stock by Ingredient</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <div className="mb-3">
        <p>This view shows the total quantity of each ingredient currently in stock.</p>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Ingredient ID</th>
            <th>Ingredient Name</th>
            <th>Unit of Measurement</th>
            <th>Total Stock</th>
          </tr>
        </thead>
        <tbody>
          {stockData.length > 0 ? (
            stockData.map((item, index) => (
              <tr key={index}>
                <td>{item.IngredientsID}</td>
                <td>{item.IngredientName}</td>
                <td>{item.UnitOfMeasurement}</td>
                <td>{item.TotalStock}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">No stock data available</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default TotalStockView;
