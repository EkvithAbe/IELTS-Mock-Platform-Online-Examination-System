import mysql from 'mysql2/promise';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'mockpaperilets';
const DB_PORT = process.env.DB_PORT || 3306;

// Create a connection pool
let pool = null;

async function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
    console.log('✅ MySQL connection pool created successfully');
  }
  return pool;
}

async function connectDB() {
  try {
    const pool = await getPool();
    // Test the connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    connection.release();
    return pool;
  } catch (error) {
    console.error('❌ MySQL connection error:', error.message);
    throw error;
  }
}

// Execute a query
export async function query(sql, params) {
  try {
    const pool = await getPool();
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Get a connection from the pool
export async function getConnection() {
  const pool = await getPool();
  return await pool.getConnection();
}

export default connectDB;
