import { query } from '../lib/mysql.js';

async function migrate() {
  try {
    console.log('Adding modules_attempted column to subscriptions table...');

    await query(`
      ALTER TABLE subscriptions
      ADD COLUMN modules_attempted JSON DEFAULT NULL
      COMMENT 'Tracks which modules (listening/reading/writing/speaking) have been attempted'
    `);

    console.log('✅ Successfully added modules_attempted column!');
    console.log('   Format: {"listening": true, "reading": false, "writing": false, "speaking": false}');

    process.exit(0);
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('✅ Column already exists, skipping migration.');
      process.exit(0);
    } else {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }
  }
}

migrate();
