const { Client } = require('pg');

// Log all available environment variables to see what Render is providing.
// This is for debugging and will help us if there's still an issue.
console.log('--- All Environment Variables ---');
console.log(process.env);
console.log('---------------------------------');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('FATAL ERROR: DATABASE_URL environment variable was not found!');
  // Exit the process immediately if the database URL is missing.
  process.exit(1);
}

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function connectDb() {
  try {
    await client.connect();
    console.log('Successfully connected to Supabase PostgreSQL database.');
  } catch (err) {
    console.error('FATAL: Could not connect to the database.', err);
    process.exit(1);
  }
}

// Export the client and the connection function separately
module.exports = {
  client,
  connectDb
};