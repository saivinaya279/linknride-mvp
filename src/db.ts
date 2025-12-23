import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const connectDB = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('📦 Connected to PostgreSQL successfully');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
};

export default pool;
