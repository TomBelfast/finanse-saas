
const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Load env
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

async function checkData() {
    console.log('Checking database data...');

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
        const [counts] = await pool.execute('SELECT COUNT(*) as count FROM user_subscriptions');
        console.log('Total subscriptions:', counts[0].count);

        const [rows] = await pool.execute('SELECT id, name, user_id, created_at FROM user_subscriptions ORDER BY created_at DESC LIMIT 5');
        console.log('Recent subscriptions:', rows);

        const [users] = await pool.execute('SELECT id, email, first_name, last_name FROM users LIMIT 5');
        console.log('Users:', users);

    } catch (error) {
        console.error('Error querying database:', error);
    } finally {
        await pool.end();
    }
}

checkData();
