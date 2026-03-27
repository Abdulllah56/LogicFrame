require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.CENTRAL_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const schema = `
CREATE TABLE IF NOT EXISTS scopecreep_user_settings (
  user_id UUID PRIMARY KEY,
  settings JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);
`;

async function run() {
    try {
        await pool.query(schema);
        console.log("Migration for user settings successful!");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await pool.end();
    }
}
run();
