
import { createPool } from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env
const envPath = path.resolve(__dirname, '../../.env.local');
dotenv.config({ path: envPath });

async function checkTables() {
    console.log('Checking database tables...');

    if (!process.env.DB_PASSWORD) {
        console.error('DB_PASSWORD not found in env');
        process.exit(1);
    }

    const pool = createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'Finanse',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        const [rows] = await pool.execute('SHOW TABLES');
        console.log('Tables in database:', rows);

        // Check if user_subscriptions exists and show columns
        const [cols] = await pool.execute('DESCRIBE user_subscriptions');
        console.log('Columns in user_subscriptions:', cols);

    } catch (error) {
        console.error('Error querying database:', error);
    } finally {
        await pool.end();
    }
}

checkTables();
