
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

if (!process.env.CENTRAL_DATABASE_URL) {
    throw new Error("CENTRAL_DATABASE_URL must be set");
}

let connectionString = process.env.CENTRAL_DATABASE_URL;
// Remove any surrounding quotes or whitespace that might have been pasted into .env
connectionString = connectionString.trim().replace(/^["']|["']$/g, '');

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }, // Required for Supabase Pooler
    max: 20, // Connection pool limit
});

export const db = drizzle(pool, { schema });
