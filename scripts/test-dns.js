
const dns = require('dns');
const url = require('url');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.CENTRAL_DATABASE_URL;

if (!connectionString) {
    console.log('No connection string found.');
    process.exit(1);
}

// Clean string logic from utils/db/index.ts
let cleaned = connectionString.trim().replace(/^["']|["']$/g, '');

try {
    const parsed = new URL(cleaned);
    console.log('Hostname:', parsed.hostname);

    // Lookup IPv4
    dns.resolve4(parsed.hostname, (err, addresses) => {
        if (err) console.error('IPv4 Lookup Failed:', err.message);
        else console.log('IPv4 Addresses:', addresses);
    });

    // Lookup IPv6
    dns.resolve6(parsed.hostname, (err, addresses) => {
        if (err) console.error('IPv6 Lookup Failed:', err.message);
        else console.log('IPv6 Addresses:', addresses);
    });

    // Default Lookup (what node uses by default)
    dns.lookup(parsed.hostname, (err, address, family) => {
        console.log('Default Lookup Address:', address);
        console.log('Default Lookup Family:', family);
    });

} catch (e) {
    console.error('Invalid URL:', e.message);
}
