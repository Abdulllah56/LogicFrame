import { db } from './utils/db';
import { tools } from './utils/db/schema';

async function listTools() {
    try {
        const allTools = await db.query.tools.findMany();
        console.log('--- DATABASE TOOLS ---');
        allTools.forEach(t => {
            const normalized = t.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
            console.log(`Name: ${t.name} | Slug: ${t.slug} | Normalized: ${normalized}`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error fetching tools:', error);
        process.exit(1);
    }
}

listTools();
