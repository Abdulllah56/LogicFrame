const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

async function verifyProfiles() {
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

    // Check how many profiles we have
    const profilesRes = await client.query("SELECT COUNT(*) FROM public.profiles");
    console.log(`Number of profiles: ${profilesRes.rows[0].count}`);

    // Check how many users we have in auth.users
    const authUsersRes = await client.query("SELECT COUNT(*) FROM auth.users");
    console.log(`Number of auth users: ${authUsersRes.rows[0].count}`);

    // If counts don't match, run backfill
    if (profilesRes.rows[0].count !== authUsersRes.rows[0].count) {
      console.log("Counts mismatch, backfilling profiles...");
      await client.query(`
        INSERT INTO public.profiles (id, email, full_name)
        SELECT id, email, raw_user_meta_data->>'full_name'
        FROM auth.users
        ON CONFLICT (id) DO NOTHING;
      `);
      console.log("Backfill complete");
    } else {
      console.log("Profile counts match.");
    }

  } catch (err) {
    console.error("Error verifying profiles:", err);
  } finally {
    await client.end();
  }
}

verifyProfiles();
