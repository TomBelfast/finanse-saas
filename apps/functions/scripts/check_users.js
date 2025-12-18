
const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function checkUsersTable() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'Finanse',
    });

    try {
        const [cols] = await pool.execute('DESCRIBE users');
        console.log('Columns in users table:', cols.map(c => `${c.Field} (${c.Type})`));

        const [rows] = await pool.execute('SELECT * FROM users LIMIT 3');
        console.log('Sample users:', rows);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkUsersTable();
