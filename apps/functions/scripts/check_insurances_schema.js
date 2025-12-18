require('dotenv').config();
const mysql = require('mysql2/promise');

async function check() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || '192.168.0.9',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'Finanse'
    });

    try {
        const [columns] = await pool.execute('DESCRIBE user_insurances');
        console.log('Columns:', columns.map(c => c.Field));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

check();
