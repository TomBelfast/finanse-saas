// Test script to check MariaDB connection
const mysql = require('mysql2/promise');

const config = {
  host: '192.168.0.9',
  port: 3306,
  user: 'Saas',
  password: 'Finanse2025',
  database: 'Finanse',
};

async function testConnection() {
  let connection;
  try {
    console.log('Próba połączenia z MariaDB...');
    console.log('Host:', config.host);
    console.log('Port:', config.port);
    console.log('Database:', config.database);
    console.log('User:', config.user);
    
    connection = await mysql.createConnection(config);
    console.log('✅ Połączenie z bazą danych udane!');
    
    const [rows] = await connection.execute('SELECT DATABASE() as current_db, USER() as current_user');
    console.log('Aktualna baza:', rows[0].current_db);
    console.log('Aktualny użytkownik:', rows[0].current_user);
    
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📊 Dostępne tabele:');
    tables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${Object.values(table)[0]}`);
    });
    
    await connection.end();
    console.log('\n✅ Test zakończony pomyślnie!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Błąd połączenia:', error.message);
    console.error('Kod błędu:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Wskazówka: Port 3306 może być zamknięty przez skip-networking.');
      console.error('   Sprawdź konfigurację MariaDB i upewnij się, że skip-networking jest wyłączony.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Wskazówka: Błędne dane logowania. Sprawdź użytkownika i hasło.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Wskazówka: Baza danych nie istnieje. Sprawdź nazwę bazy danych.');
    }
    
    process.exit(1);
  }
}

testConnection();

