const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Load env
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

async function check() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [columns] = await pool.execute('DESCRIBE user_loans');
        console.log('Columns:', columns.map(c => c.Field));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

check();
