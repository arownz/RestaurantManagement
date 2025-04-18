import express from 'express';
import cors from 'cors';
import db from './db.js';  // Note the .js extension is required in ES modules

const app = express();
const PORT = 3006; // Using port 3006 to avoid conflict with MySQL's default port 3306

app.use(cors());
app.use(express.json());

// Special case for Ingredients to ensure CategoryID is a number
app.post('/api/Ingredients', async (req, res) => {
  try {
    // Ensure CategoryID is a number
    const ingredientData = {
      ...req.body,
      CategoryID: parseInt(req.body.CategoryID)
    };
    
    console.log('Adding new ingredient:', ingredientData);
    
    const [result] = await db.query('INSERT INTO Ingredients SET ?', [ingredientData]);
    res.status(201).json({ id: result.insertId, ...ingredientData });
  } catch (error) {
    console.error('Error creating Ingredient:', error);
    res.status(500).json({ 
      error: 'Failed to create Ingredient', 
      details: error.message,
      sqlMessage: error.sqlMessage 
    });
  }
});

// Generic function for table endpoints
const createTableEndpoints = (tableName, primaryKey = `${tableName.charAt(0).toUpperCase() + tableName.slice(1)}ID`) => {
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

  // Create new record (except for Ingredients which has special handling)
  if (tableName !== 'Ingredients') {
    app.post(`/api/${tableName}`, async (req, res) => {
      try {
        console.log(`Adding new ${tableName}:`, req.body);
        const [result] = await db.query(`INSERT INTO ${tableName} SET ?`, [req.body]);
        res.status(201).json({ id: result.insertId, ...req.body });
      } catch (error) {
        console.error(`Error creating ${tableName}:`, error);
        res.status(500).json({
          error: `Failed to create ${tableName}`,
          details: error.message,
          sqlMessage: error.sqlMessage
        });
      }
    });
  }

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
      console.log(`Updating ${tableName}:`, req.params.id, req.body);
      const [result] = await db.query(`UPDATE ${tableName} SET ? WHERE ${primaryKey} = ?`, [req.body, req.params.id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Record not found' });
      }
      
      res.json({ id: req.params.id, ...req.body });
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      
      // Improved error handling for foreign key constraint violations
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ 
          error: `Failed to update ${tableName}. One or more references don't exist.`,
          details: "The referenced ID doesn't exist in the parent table."
        });
      }
      
      res.status(500).json({ 
        error: `Failed to update ${tableName}`, 
        details: error.message,
        code: error.code 
      });
    }
  });

  // Delete record with improved error handling
  app.delete(`/api/${tableName}/:id`, async (req, res) => {
    try {
      const [result] = await db.query(`DELETE FROM ${tableName} WHERE ${primaryKey} = ?`, [req.params.id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Record not found' });
      }
      
      res.json({ message: 'Record deleted successfully' });
    } catch (error) {
      console.error(`Error deleting ${tableName}:`, error);
      
      // Better error handling for foreign key constraint violations
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        let errorMessage = `Cannot delete this ${tableName.toLowerCase()} because it's being used by other records.`;
        
        // Provide specific guidance based on the table
        if (tableName === 'Category') {
          errorMessage += ' Please remove or update the ingredients that use this category first.';
        } else if (tableName === 'Ingredients') {
          errorMessage += ' Please remove any recipes or stock entries that use this ingredient first.';
        } else if (tableName === 'MenuItems') {
          errorMessage += ' Please remove any recipes or orders that use this menu item first.';
        }
        
        return res.status(409).json({ 
          error: errorMessage,
          code: 'FOREIGN_KEY_CONSTRAINT'
        });
      }
      
      res.status(500).json({ 
        error: `Failed to delete ${tableName}`, 
        details: error.message,
        code: error.code 
      });
    }
  });
};

// Create endpoints for each table
createTableEndpoints('Category');
createTableEndpoints('Ingredients');  // Still create the GET, PUT, DELETE endpoints
createTableEndpoints('MenuItems');
createTableEndpoints('Orders');

// We're going to create a special instance of createTableEndpoints for Recipes
// that doesn't include the GET all endpoint
const createTableEndpointsExceptGet = (tableName, primaryKey = `${tableName.charAt(0).toUpperCase() + tableName.slice(1)}ID`) => {
  // Create new record
  app.post(`/api/${tableName}`, async (req, res) => {
    try {
      console.log(`Adding new ${tableName}:`, req.body);
      const [result] = await db.query(`INSERT INTO ${tableName} SET ?`, [req.body]);
      res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
      console.error(`Error creating ${tableName}:`, error);
      res.status(500).json({
        error: `Failed to create ${tableName}`,
        details: error.message,
        sqlMessage: error.sqlMessage
      });
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

// Use our special function for Recipes instead of the regular createTableEndpoints
createTableEndpointsExceptGet('Recipes');

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

// Custom route for Recipes with JOIN operations
app.get('/api/Recipes', async (req, res) => {
  try {
    console.log('Fetching recipes with joins...');
    const [rows] = await db.query(`
      SELECT r.*, i.IngredientName, m.Menu
      FROM Recipes r
      LEFT JOIN Ingredients i ON r.IngredientsID = i.IngredientsID
      LEFT JOIN MenuItems m ON r.MenuID = m.MenuID
    `);
    console.log('Recipes fetched:', rows);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching Recipes:', error);
    res.status(500).json({ error: 'Failed to fetch Recipes', details: error.message });
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

// Add a special delete endpoint for Ingredients with cascade option
app.delete('/api/Ingredients/:id/cascade', async (req, res) => {
  const conn = await db.getConnection();
  
  try {
    await conn.beginTransaction();
    
    // Delete any recipes that use this ingredient
    await conn.query('DELETE FROM Recipes WHERE IngredientsID = ?', [req.params.id]);
    
    // Delete any stock entries that use this ingredient
    await conn.query('DELETE FROM StockIngredients WHERE IngredientsID = ?', [req.params.id]);
    
    // Finally delete the ingredient itself
    const [result] = await conn.query('DELETE FROM Ingredients WHERE IngredientsID = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    
    await conn.commit();
    res.json({ message: 'Ingredient and all related records deleted successfully' });
    
  } catch (error) {
    await conn.rollback();
    console.error('Error performing cascade delete:', error);
    res.status(500).json({ 
      error: 'Failed to delete ingredient and related records', 
      details: error.message 
    });
  } finally {
    conn.release();
  }
});

// Add a similar cascade delete for menu items
app.delete('/api/MenuItems/:id/cascade', async (req, res) => {
  const conn = await db.getConnection();
  
  try {
    await conn.beginTransaction();
    
    // Delete any recipes that use this menu item
    await conn.query('DELETE FROM Recipes WHERE MenuID = ?', [req.params.id]);
    
    // Delete any orders that use this menu item
    await conn.query('DELETE FROM Orders WHERE MenuID = ?', [req.params.id]);
    
    // Finally delete the menu item itself
    const [result] = await conn.query('DELETE FROM MenuItems WHERE MenuID = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    await conn.commit();
    res.json({ message: 'Menu item and all related records deleted successfully' });
    
  } catch (error) {
    await conn.rollback();
    console.error('Error performing cascade delete:', error);
    res.status(500).json({ 
      error: 'Failed to delete menu item and related records', 
      details: error.message 
    });
  } finally {
    conn.release();
  }
});

// Add a cascade delete for categories
app.delete('/api/Category/:id/cascade', async (req, res) => {
  const conn = await db.getConnection();
  
  try {
    await conn.beginTransaction();
    
    // Get all ingredients in this category
    const [ingredients] = await conn.query('SELECT IngredientsID FROM Ingredients WHERE CategoryID = ?', [req.params.id]);
    
    // For each ingredient, delete recipes and stock
    for (const ingredient of ingredients) {
      await conn.query('DELETE FROM Recipes WHERE IngredientsID = ?', [ingredient.IngredientsID]);
      await conn.query('DELETE FROM StockIngredients WHERE IngredientsID = ?', [ingredient.IngredientsID]);
    }
    
    // Now delete the ingredients
    await conn.query('DELETE FROM Ingredients WHERE CategoryID = ?', [req.params.id]);
    
    // Finally delete the category
    const [result] = await conn.query('DELETE FROM Category WHERE CategoryID = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Category not found' });
    }
    
    await conn.commit();
    res.json({ message: 'Category and all related records deleted successfully' });
    
  } catch (error) {
    await conn.rollback();
    console.error('Error performing cascade delete:', error);
    res.status(500).json({ 
      error: 'Failed to delete category and related records', 
      details: error.message 
    });
  } finally {
    conn.release();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
