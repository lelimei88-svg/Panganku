import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.ts';

// Function to create a new connection pool with robust keepalive & timeout settings
export const createPool = () => {
  const user = process.env.SQL_USER || process.env.SQL_ADMIN_USER;
  const password = process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD;

  return new Pool({
    host: process.env.SQL_HOST,
    user: user,
    password: password,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 15000,
    // Keep-alive is highly critical in Cloud Run to prevent firewall/NAT
    // gateways from dropping inactive TCP connections silently.
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    // Reclaim idle connections quickly before they are dropped by the host.
    idleTimeoutMillis: 20000,
    max: 10,
  });
};

const pool = createPool();

// Prevent unhandled pool-level errors from crashing the application
pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });
