import mysql from 'mysql2/promise';

// Create connection pool
const pool = mysql.createPool({
  host: 'localhost',  // Connect to local MySQL server
  user: 'root',       // MySQL username
  password: '',       // MySQL password
  database: 'restaurant_inventory',  // Your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
