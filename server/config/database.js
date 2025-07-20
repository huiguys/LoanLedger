const path = require('path');
const fs = require('fs');
const os = require('os');
const Database = require('better-sqlite3');

// Use the system's temporary directory to avoid all permission issues.
const dbDir = path.join(os.tmpdir(), 'loanledger_db');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'auth.db');
let db;

try {
    // Connect to the database. This is synchronous.
    db = new Database(dbPath, { verbose: console.log });
    console.log(`Successfully connected to SQLite database at: ${dbPath}`);

    // Apply the schema immediately.
    const schemaPath = path.resolve(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
    console.log('Database schema applied successfully.');

} catch (err) {
    console.error('FATAL: Could not initialize database.', err);
    process.exit(1); // Exit if we fail.
}

// Ensure the database connection closes when the app exits.
process.on('exit', () => db.close());

module.exports = db;