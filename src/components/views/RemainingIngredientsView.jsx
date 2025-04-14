import { useState, useEffect } from 'react';
import { Table, Container, Alert } from 'react-bootstrap';
import axios from 'axios';

function RemainingIngredientsView() {
  const [remainingData, setRemainingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3006/api/View_RemainingIngredients');
        setRemainingData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching remaining ingredients data:', err);
        setError('Failed to fetch remaining ingredients data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <Container>
      <h1 className="my-4">Remaining Ingredients</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <div className="mb-3">
        <p>This view shows the remaining stock of each ingredient after deducting usage from orders.</p>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Ingredient ID</th>
            <th>Ingredient Name</th>
            <th>Unit of Measurement</th>
            <th>Total Stock</th>
            <th>Total Used</th>
            <th>Remaining Stock</th>
          </tr>
        </thead>
        <tbody>
          {remainingData.length > 0 ? (
            remainingData.map((item, index) => (
              <tr key={index}>
                <td>{item.IngredientsID}</td>
                <td>{item.IngredientName}</td>
                <td>{item.UnitOfMeasurement}</td>
                <td>{item.TotalStock}</td>
                <td>{item.TotalUsed}</td>
                <td>{item.RemainingStock}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">No remaining ingredients data available</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default RemainingIngredientsView;
