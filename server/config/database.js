const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => console.log('Successfully connected to Supabase PostgreSQL database.'))
  .catch(err => console.error('FATAL: Could not connect to the database.', err));

module.exports = client;