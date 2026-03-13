const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  try {
    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'mockpaperilets',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });

    console.log('✓ Connected to database');

    // List of migration files in order
    const migrations = [
      'create-appointments-table.sql',
      'create-notification-logs-table.sql',
      'create-google-oauth-tokens-table.sql'
    ];

    console.log('\nRunning migrations...\n');

    for (const migrationFile of migrations) {
      const filePath = path.join(__dirname, migrationFile);

      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${migrationFile} (file not found)`);
        continue;
      }

      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`Running: ${migrationFile}`);
      await connection.query(sql);
      console.log(`✓ ${migrationFile} completed\n`);
    }

    // Verify tables were created
    console.log('Verifying tables...\n');

    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);

    const requiredTables = ['appointments', 'notification_logs', 'google_oauth_tokens'];

    for (const table of requiredTables) {
      if (tableNames.includes(table)) {
        console.log(`✓ Table "${table}" exists`);
      } else {
        console.log(`❌ Table "${table}" NOT FOUND`);
      }
    }

    // Show table structure
    console.log('\n--- Appointments Table Structure ---');
    const [appointmentCols] = await connection.query('DESCRIBE appointments');
    console.log(`Columns: ${appointmentCols.length}`);
    appointmentCols.slice(0, 10).forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    await connection.end();
    console.log('\n✓ All migrations completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
