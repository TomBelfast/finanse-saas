
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// Also try local .env if top level fails or for override
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

async function deduplicateTable(
    connection: mysql.Connection,
    tableName: string,
    uniqueColumns: string[]
) {
    console.log(`Analyzing duplicates in ${tableName}...`);

    // 1. Identify duplicates based on uniqueColumns
    const cols = uniqueColumns.join(', ');
    // Group by unique keys and select IDs of duplicates (keeping the one with the lowest ID, or latest created_at)
    // Let's keep the OLDEST record (lowest ID strings might not correlate to time if UUID, so better check created_at if possible)
    // Assuming UUIDs, min(id) is arbitrary. Let's look for created_at.

    // Strategy:
    // Find groups of records with same (uniqueColumns).
    // For each group, keep one ID. Delete others.

    // Get all rows
    const [rows] = await connection.execute<any[]>(`SELECT * FROM ${tableName}`);

    const groups = new Map<string, any[]>();

    rows.forEach(row => {
        // specific logic for cleaning up strings if needed?
        // Let's assume exact match.
        const key = uniqueColumns.map(c => String(row[c] || '').trim().toLowerCase()).join('|');
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)!.push(row);
    });

    let deletedCount = 0;

    for (const [key, group] of groups.entries()) {
        if (group.length > 1) {
            // Sort by created_at (keep oldest), if created_at doesn't exist, sort by ID
            group.sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateA - dateB;
                // If dates are equal (or 0), we could sort by ID to be deterministic, but keeping first is fine.
            });

            // Keep the first one (index 0)
            const toKeep = group[0];
            const toDelete = group.slice(1);

            console.log(`Found duplicates for key [${key}]: keeping ${toKeep.id}, deleting ${toDelete.length} others.`);

            for (const item of toDelete) {
                await connection.execute(`DELETE FROM ${tableName} WHERE id = ?`, [item.id]);
                deletedCount++;
            }
        }
    }

    console.log(`Finished ${tableName}. Removed ${deletedCount} duplicate records.`);
}

async function main() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '192.168.0.9',
            user: process.env.DB_USER || 'Saas',
            password: process.env.DB_PASSWORD || 'Finanse2025',
            database: process.env.DB_NAME || 'Finanse',
            port: Number(process.env.DB_PORT) || 3306,
        });

        console.log('Connected to database.');

        // 1. User Subscriptions
        // Unique: user_id, name, amount ? Or just user_id + name?
        // Let's assume unique combination of user, name, amount and renewal_date makes it truly duplicate if active.
        await deduplicateTable(connection, 'user_subscriptions', ['user_id', 'name', 'amount', 'renewal_date']);

        // 2. User Insurances
        await deduplicateTable(connection, 'user_insurances', ['user_id', 'name', 'policy_number']);

        // 3. User Loans
        await deduplicateTable(connection, 'user_loans', ['user_id', 'name', 'total_amount']);

        await connection.end();
        console.log('Done.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
