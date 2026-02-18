
const mysql = require('mysql2/promise');

async function checkUser(email) {
    const connection = await mysql.createConnection({
        host: '192.168.0.9',
        user: 'finanse_user',
        password: 'SkomplikowaneHaslo123!',
        database: 'finanse_db',
        port: 3306
    });

    try {
        console.log(`Checking creating connection...`);
        const [rows] = await connection.execute(
            'SELECT uid, email, contact_email, created_at, updated_at FROM users WHERE email LIKE ? OR contact_email LIKE ?',
            [`%${email}%`, `%${email}%`]
        );

        console.log('Found users:', rows);

        // Check dependent tables for context
        if (rows.length > 0) {
            for (const user of rows) {
                const [subs] = await connection.execute('SELECT count(*) as count FROM user_subscriptions WHERE user_id = ?', [user.uid]);
                const [loans] = await connection.execute('SELECT count(*) as count FROM user_loans WHERE user_id = ?', [user.uid]);
                console.log(`User ${user.uid} has ${subs[0].count} subscriptions and ${loans[0].count} loans.`);
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await connection.end();
    }
}

// Check for default email or similar
checkUser('tomek'); 
