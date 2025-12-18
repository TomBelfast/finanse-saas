
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load env
const envPath = path.resolve(__dirname, '../.env.local');
// Manually parse env if dotenv fails or just use it
const envConfig = dotenv.config({ path: envPath });

console.log('Env loaded:', envConfig.error ? 'Error' : 'Success');
console.log('DB_HOST:', process.env.DB_HOST);

async function checkTables() {
    console.log('Checking database tables...');

    if (!process.env.DB_PASSWORD) {
        console.error('DB_PASSWORD not found in env');
        process.exit(1);
    }

    const pool = mysql.createPool({
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
        try {
            const [cols] = await pool.execute('DESCRIBE user_subscriptions');
            console.log('Columns in user_subscriptions:', cols.map(c => c.Field));
        } catch (e) {
            console.log('user_subscriptions table does not exist or error describing it:', e.message);
        }

    } catch (error) {
        console.error('Error querying database:', error);
    } finally {
        await pool.end();
    }
}

checkTables();
