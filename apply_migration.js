const fs = require('fs');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

async function run() {
  const connectionString = process.env.CENTRAL_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("No connection string found");
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const sql = fs.readFileSync(path.join(__dirname, 'supabase', 'migrations', 'invoicechase_schema.sql'), 'utf8');
    await client.query(sql);
    console.log("Migration applied successfully!");
  } catch (err) {
    console.error("Error applying migration:", err);
  } finally {
    await client.end();
  }
}

run();
