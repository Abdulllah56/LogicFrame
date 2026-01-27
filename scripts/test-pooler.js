
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const originalString = process.env.CENTRAL_DATABASE_URL;

if (!originalString) {
    console.error('No CENTRAL_DATABASE_URL found');
    process.exit(1);
}

// Clean it
let cleaned = originalString.trim().replace(/^["']|["']$/g, '');

try {
    const url = new URL(cleaned);

    // Extract Project ID from hostname: db.onxittqxvkzwetazcimx.supabase.co
    const parts = url.hostname.split('.');
    const projectRef = parts[1]; // onxittqxvkzwetazcimx

    if (!projectRef) {
        console.error('Could not extract project ref from hostname:', url.hostname);
        process.exit(1);
    }

    // Construct Pooler URL
    // Host: aws-0-us-west-1.pooler.supabase.com
    // User: postgres.[project-ref]
    // Port: 6543 (Transaction Mode - standard for pooler) or 5432 (Session Mode)
    // Let's try 5432 (Session) first as it mimics the direct connection behavior closer.
    // Actually, Supavisor usually runs on 6543 for transaction mode, which is fine for simple queries.
    // But let's try 5432 first.

    url.hostname = 'aws-0-us-west-1.pooler.supabase.com';
    url.strictContentLength = false; // Internal Node/URL thing? No.

    // Update username
    // url.username is likely 'postgres'
    url.username = `${url.username}.${projectRef}`;

    // url.port = '6543'; // Optional: try switching port if 5432 fails
    // But let's keep 5432 for now to match session mode expectations.
    // If user needs session variables, 6543 (transaction) breaks them.
    // Supavisor supports session mode on port 5432? 
    // Docs say: Port 5432 is Direct/Session. Port 6543 is Transaction.
    // BUT we are changing the host to the POOLER host.
    // The pooler listening on 5432 IS Session mode? Let's assume so.

    console.log('Testing connection to IPv4 Pooler Host:');
    console.log('Host:', url.hostname);
    console.log('User:', url.username);
    console.log('Port:', url.port);

    const poolerString = url.toString();

    const pool = new Pool({
        connectionString: poolerString,
        ssl: { rejectUnauthorized: false }, // Required for AWS/Supabase often
        connectionTimeoutMillis: 5000
    });

    pool.query('SELECT NOW() as now, version()', (err, res) => {
        if (err) {
            console.error('❌ Connection Failed:', err.message);
            if (err.code) console.error('Code:', err.code);
        } else {
            console.log('✅ Connection Successful!');
            console.log('Time:', res.rows[0].now);
            console.log('Version:', res.rows[0].version);
        }
        pool.end();
    });

} catch (e) {
    console.error('Error constructing URL:', e.message);
}
