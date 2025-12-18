
const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testCreateUser() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'Finanse',
    });

    try {
        const userId = 'user_36sook65tk9RGG1XQJW5MKPrB9j';

        // Check if user exists
        const [existingRows] = await pool.execute('SELECT uid, email FROM users WHERE uid = ?', [userId]);
        console.log('Existing user check:', existingRows);

        if (existingRows.length === 0) {
            console.log('User does not exist, creating...');
            await pool.execute(
                `INSERT INTO users (uid, email, first_name, last_name, terms_and_privacy_policy, lang, timezone, default_currency, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [userId, 'test@example.com', 'Test', 'User', 1, 'pl', 'Europe/Warsaw', 'pln']
            );
            console.log('User created!');
        } else {
            console.log('User already exists');
        }

        // Verify
        const [newRows] = await pool.execute('SELECT uid, email, first_name FROM users WHERE uid = ?', [userId]);
        console.log('After creation:', newRows);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

testCreateUser();
