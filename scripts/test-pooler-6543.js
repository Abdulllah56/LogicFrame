
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const originalString = process.env.CENTRAL_DATABASE_URL;

if (!originalString) {
    console.error('No CENTRAL_DATABASE_URL found');
    process.exit(1);
}

let cleaned = originalString.trim().replace(/^["']|["']$/g, '');

try {
    const url = new URL(cleaned);
    const parts = url.hostname.split('.');
    const projectRef = parts[0] === 'db' ? parts[1] : null;
    // if hostname is db.xyz.supabase.co, parts[1] is xyz.

    if (!projectRef) {
        console.error('Could not extract project ref from hostname:', url.hostname);
        console.log('Assuming hostname IS the project ref or something else?');
        // process.exit(1);
        // Let's try to proceed if the user already put the pooler url but maybe port is wrong?
    } else {
        console.log('Project Ref extracted:', projectRef);

        // FORCE POOLER SETTINGS
        url.hostname = 'aws-0-us-west-1.pooler.supabase.com';
        url.port = '6543'; // Transaction mode
        url.username = `${url.username}.${projectRef}`;
        // Remove sslmode=require if present to avoid conflicts with strict SSL object below
        url.search = '';
    }

    console.log('Testing connection to IPv4 Pooler Host (Port 6543):');
    console.log('Host:', url.hostname);
    console.log('User:', url.username);
    console.log('Port:', url.port);

    const poolerString = url.toString();

    const pool = new Pool({
        connectionString: poolerString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
    });

    pool.query('SELECT NOW() as now, version()', (err, res) => {
        if (err) {
            console.error('❌ Connection Failed:', err.message);
            if (err.code) console.error('Code:', err.code);
        } else {
            console.log('✅ Connection Successful!');
            console.log('Time:', res.rows[0].now);
        }
        pool.end();
    });

} catch (e) {
    console.error('Error constructing URL:', e.message);
}
