const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

async function verify() {
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
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices'");
    if (res.rows.length > 0) {
      console.log('Table "invoices" exists in schema "public"');
    } else {
      console.log('Table "invoices" is missing');
    }
  } catch (err) {
    console.error("Error verifying table:", err);
  } finally {
    await client.end();
  }
}

verify();
