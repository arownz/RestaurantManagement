import express from 'express';
import cors from 'cors';
import db from './db.js';  // Note the .js extension is required in ES modules

const app = express();
const PORT = 3006; // Using port 3006 to avoid conflict with MySQL's default port 3306

app.use(cors());
app.use(express.json());

// Generic function for table endpoints
const createTableEndpoints = (tableName, primaryKey = `${tableName.charAt(0).toUpperCase() + tableName.slice(1)}ID`) =>  {
  // Get all records
  app.get(`/api/${tableName}`, async (req, res) => {
    try {
      const [rows] = await db.query(`SELECT * FROM ${tableName}`);
      res.json(rows);
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      res.status(500).json({ error: `Failed to fetch ${tableName}` });
    }
  });

  // Create new record
  app.post(`/api/${tableName}`, async (req, res) => {
    try {
      const [result] = await db.query(`INSERT INTO ${tableName} SET ?`, [req.body]);
      res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
      console.error(`Error creating ${tableName}:`, error);
      res.status(500).json({ error: `Failed to create ${tableName}` });
    }
  });

  // Get single record
  app.get(`/api/${tableName}/:id`, async (req, res) => {
    try {
      const [rows] = await db.query(`SELECT * FROM ${tableName} WHERE ${primaryKey} = ?`, [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
      res.json(rows[0]);
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      res.status(500).json({ error: `Failed to fetch ${tableName}` });
    }
  });

  // Update record
  app.put(`/api/${tableName}/:id`, async (req, res) => {
    try {
      await db.query(`UPDATE ${tableName} SET ? WHERE ${primaryKey} = ?`, [req.body, req.params.id]);
      res.json({ id: req.params.id, ...req.body });
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      res.status(500).json({ error: `Failed to update ${tableName}` });
    }
  });

  // Delete record
  app.delete(`/api/${tableName}/:id`, async (req, res) => {
    try {
      await db.query(`DELETE FROM ${tableName} WHERE ${primaryKey} = ?`, [req.params.id]);
      res.json({ message: 'Record deleted successfully' });
    } catch (error) {
      console.error(`Error deleting ${tableName}:`, error);
      res.status(500).json({ error: `Failed to delete ${tableName}` });
    }
  });
};

// Create endpoints for each table
createTableEndpoints('Category');
createTableEndpoints('Ingredients');
createTableEndpoints('MenuItems');
createTableEndpoints('Orders');

// Special handling for StockIngredients and Recipes due to composite keys
app.get('/api/StockIngredients', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, i.IngredientName 
      FROM StockIngredients s
      JOIN Ingredients i ON s.IngredientsID = i.IngredientsID
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching StockIngredients:', error);
    res.status(500).json({ error: 'Failed to fetch StockIngredients' });
  }
});

// Add StockIngredients
app.post('/api/StockIngredients', async (req, res) => {
  try {
    // Calculate total quantity and unit price
    const totalQuantity = req.body.Quantity * req.body.Container_Size;
    const totalPrice = req.body.Quantity * req.body.Container_Price;
    const unitPrice = totalPrice / totalQuantity;
    
    const stockData = {
      ...req.body,
      Total_Quantity: totalQuantity,
      Total_Price: totalPrice,
      Unit_Price: unitPrice
    };
    
    const [result] = await db.query(`INSERT INTO StockIngredients SET ?`, [stockData]);
    res.status(201).json({ id: result.insertId, ...stockData });
  } catch (error) {
    console.error('Error creating StockIngredients:', error);
    res.status(500).json({ error: 'Failed to create StockIngredients' });
  }
});

// Delete StockIngredients
app.delete('/api/StockIngredients/:stockId/:ingredientId', async (req, res) => {
  try {
    await db.query(
      `DELETE FROM StockIngredients WHERE StockIngredientsID = ? AND IngredientsID = ?`, 
      [req.params.stockId, req.params.ingredientId]
    );
    res.json({ message: 'Stock ingredient deleted successfully' });
  } catch (error) {
    console.error('Error deleting StockIngredients:', error);
    res.status(500).json({ error: 'Failed to delete StockIngredients' });
  }
});

app.get('/api/Recipes', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, i.IngredientName, m.Menu
      FROM Recipes r
      JOIN Ingredients i ON r.IngredientsID = i.IngredientsID
      JOIN MenuItems m ON r.MenuID = m.MenuID
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching Recipes:', error);
    res.status(500).json({ error: 'Failed to fetch Recipes' });
  }
});

// Endpoints for views
app.get('/api/View_TotalStockByIngredient', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM View_TotalStockByIngredient');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching View_TotalStockByIngredient:', error);
    res.status(500).json({ error: 'Failed to fetch View_TotalStockByIngredient' });
  }
});

app.get('/api/View_TotalIngredientsUsed', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM View_TotalIngredientsUsed');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching View_TotalIngredientsUsed:', error);
    res.status(500).json({ error: 'Failed to fetch View_TotalIngredientsUsed' });
  }
});

app.get('/api/View_RemainingIngredients', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM View_RemainingIngredients');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching View_RemainingIngredients:', error);
    res.status(500).json({ error: 'Failed to fetch View_RemainingIngredients' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
