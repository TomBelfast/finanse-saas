
const mysql = require('mysql2/promise');

async function checkUser(email) {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: '192.168.0.9',
            user: 'finanse_user',
            password: 'SkomplikowaneHaslo123!',
            database: 'finanse_db',
            port: 3306
        });

        console.log(`Connected! Searching for '${email}'...`);

        const query = 'SELECT uid, email, contact_email, created_at, updated_at FROM users WHERE email = ? OR contact_email = ?';
        const [rows] = await connection.execute(query, [email, email]);

        console.log(`Found ${rows.length} users.`);

        for (const user of rows) {
            console.log(`\n--- USER: ${user.email} (${user.uid}) ---`);
            console.log(`Contact: ${user.contact_email}`);
            console.log(`Created: ${user.created_at}`);

            const [subs] = await connection.execute('SELECT count(*) as count FROM user_subscriptions WHERE user_id = ?', [user.uid]);
            const [loans] = await connection.execute('SELECT count(*) as count FROM user_loans WHERE user_id = ?', [user.uid]);
            console.log(`DATA: ${subs[0].count} subscriptions, ${loans[0].count} loans.`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (connection) await connection.end();
    }
}

checkUser('tomaszpasiekauk@gmail.com'); 
