const { Client } = require('pg');

// Get the database URL from Render's environment variables
const connectionString = process.env.DATABASE_URL;

// If the DATABASE_URL is missing, exit with a clear error.
if (!connectionString) {
  console.error('FATAL: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => console.log('Successfully connected to Supabase PostgreSQL database.'))
  .catch(err => {
    console.error('FATAL: Could not connect to the database.', err);
    process.exit(1);
  });

module.exports = client;