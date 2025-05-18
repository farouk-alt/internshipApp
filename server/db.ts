// Replace NeonDB imports with standard PostgreSQL client
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const DATABASE_URL = "postgresql://postgres:fqrouk1122@localhost:5432/internship_db";


console.log('Using DATABASE_URL:', DATABASE_URL);

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is required in .env file');
  process.exit(1);
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false, // Disable SSL for local connections
  max: 20,    // Set connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Test connection
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
  } catch (err) {
    if (err instanceof Error) {
      console.error('❌ Database connection failed:', err.message);
    } else {
      console.error('❌ Database connection failed:', err);
    }
    console.log('Please verify:');
    console.log('1. PostgreSQL is running');
    console.log('2. Connection string is correct in .env');
    console.log('3. Your password is correct');
    console.log('4. Port 5432 is accessible');
    process.exit(1);
  }
})();

export const db = drizzle(pool);