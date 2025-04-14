import { useState, useEffect } from 'react';
import { Table, Container, Alert } from 'react-bootstrap';
import axios from 'axios';

function IngredientsUsedView() {
  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3006/api/View_TotalIngredientsUsed');
        setUsageData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching ingredients usage data:', err);
        setError('Failed to fetch ingredients usage data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <Container>
      <h1 className="my-4">Total Ingredients Used</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <div className="mb-3">
        <p>This view shows the total quantity of each ingredient used in orders.</p>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Ingredient ID</th>
            <th>Ingredient Name</th>
            <th>Total Used</th>
          </tr>
        </thead>
        <tbody>
          {usageData.length > 0 ? (
            usageData.map((item, index) => (
              <tr key={index}>
                <td>{item.IngredientsID}</td>
                <td>{item.IngredientName}</td>
                <td>{item.TotalUsed}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">No usage data available</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default IngredientsUsedView;
