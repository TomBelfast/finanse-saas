// Script to create user_ai table in MariaDB
const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || '192.168.0.9',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'Saas',
  password: process.env.DB_PASSWORD || 'Finanse2025',
  database: process.env.DB_NAME || 'Finanse',
};

async function createTable() {
  let connection;
  try {
    console.log('Łączenie z bazą danych...');
    connection = await mysql.createConnection(config);
    console.log('✅ Połączono z bazą danych');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS user_ai (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'PLN',
        period_start DATETIME NOT NULL,
        period_end DATETIME NOT NULL,
        renewal_date DATETIME NOT NULL,
        insurance_company VARCHAR(255) NOT NULL,
        policy_number VARCHAR(255) NULL,
        insured_object VARCHAR(255) NULL,
        description TEXT NULL,
        insurance_type ENUM('health', 'life', 'car', 'home', 'travel', 'business', 'other') NOT NULL,
        status ENUM('active', 'expired', 'cancelled', 'pending') NOT NULL DEFAULT 'active',
        documents JSON NULL,
        category VARCHAR(100) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_renewal_date (renewal_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    console.log('Tworzenie tabeli user_ai...');
    await connection.execute(createTableSQL);
    console.log('✅ Tabela user_ai została utworzona pomyślnie!');

    // Verify table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'user_ai'");
    if (tables.length > 0) {
      console.log('✅ Weryfikacja: Tabela user_ai istnieje w bazie danych');
    } else {
      console.log('⚠️  Ostrzeżenie: Tabela user_ai nie została znaleziona po utworzeniu');
    }

    await connection.end();
    console.log('\n✅ Migracja zakończona pomyślnie!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Błąd podczas tworzenia tabeli:', error.message);
    console.error('Kod błędu:', error.code);
    
    if (error.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('\n💡 Tabela user_ai już istnieje. To nie jest błąd.');
      process.exit(0);
    }
    
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

createTable();

