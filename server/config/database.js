const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

// This check is crucial for debugging. It will immediately stop the server
// if the DATABASE_URL is not provided by the Render environment.
if (!connectionString) {
  console.error('FATAL ERROR: DATABASE_URL environment variable is not set!');
  process.exit(1); // Exit the application with an error code.
}

const client = new Client({
  connectionString: connectionString,
  // This is required to connect to services like Supabase and Render that use SSL.
  ssl: {
    rejectUnauthorized: false
  }
});

// Function to connect to the database.
async function connectDb() {
  try {
    await client.connect();
    console.log('Successfully connected to Supabase PostgreSQL database.');
  } catch (err) {
    console.error('FATAL: Could not connect to the database.', err);
    process.exit(1);
  }
}

// Export the client for use in other files and the connect function.
module.exports = {
  dbClient: client,
  connectDb
};