
const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function checkAll() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'Finanse',
    });

    try {
        console.log('=== USERS ===');
        const [users] = await pool.execute('SELECT uid, email, first_name, default_currency FROM users');
        console.log('Users:', users);

        console.log('\n=== SUBSCRIPTIONS ===');
        const [subs] = await pool.execute('SELECT id, user_id, name, amount, status FROM user_subscriptions ORDER BY created_at DESC LIMIT 5');
        console.log('Recent subscriptions:', subs);

        console.log('\n=== INSURANCES ===');
        const [ins] = await pool.execute('SELECT id, user_id, name, amount FROM user_insurances ORDER BY created_at DESC LIMIT 5');
        console.log('Recent insurances:', ins);

        console.log('\n=== LOANS ===');
        const [loans] = await pool.execute('SELECT id, user_id, name, total_amount FROM user_loans ORDER BY created_at DESC LIMIT 5');
        console.log('Recent loans:', loans);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkAll();
