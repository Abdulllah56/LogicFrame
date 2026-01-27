
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const connectionString = process.env.CENTRAL_DATABASE_URL;

console.log('--- Database Debug Info ---');

if (!connectionString) {
    console.error('❌ CENTRAL_DATABASE_URL is not set in .env.local');
    process.exit(1);
}

try {
    const url = new URL(connectionString);
    console.log('✅ Connection string parsed successfully');
    console.log('Protocol:', url.protocol);
    console.log('Hostname:', url.hostname);
    console.log('Port:', url.port);
    console.log('Database:', url.pathname);
    console.log('User:', url.username);
    console.log('Password Length:', url.password.length);
    // Do not print the actual password
} catch (e) {
    console.error('❌ Failed to parse connection string URL:', e.message);
    console.log('Raw String (Masked):', connectionString.replace(/:([^:@]+)@/, ':****@'));
}

console.log('\n--- Attempting Connection ---');

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }, // Try permissive SSL
    connectionTimeoutMillis: 5000,
});

pool.query('SELECT NOW() as now', (err, res) => {
    if (err) {
        console.error('❌ Connection Failed:', err.message);
        console.error('Error Code:', err.code);
        if (err.cause) console.error('Cause:', err.cause);
    } else {
        console.log('✅ Connection Successful!');
        console.log('Server Time:', res.rows[0].now);
    }
    pool.end();
});
