import { query } from '../lib/mysql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('🚀 Running migration: Add speaking tracking fields...\n');

  try {
    // Add modules_attempted column
    console.log('Adding modules_attempted column...');
    await query(`
      ALTER TABLE subscriptions
      ADD COLUMN modules_attempted JSON DEFAULT NULL COMMENT 'Tracks which modules have been attempted (listening, reading, writing, speaking)'
    `).catch(err => {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('  ✓ modules_attempted column already exists');
      } else {
        throw err;
      }
    });

    // Add speaking_completed column
    console.log('Adding speaking_completed column...');
    await query(`
      ALTER TABLE subscriptions
      ADD COLUMN speaking_completed BOOLEAN DEFAULT FALSE COMMENT 'Tracks if speaking appointment has been completed'
    `).catch(err => {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('  ✓ speaking_completed column already exists');
      } else {
        throw err;
      }
    });

    // Add speaking_completed_at column
    console.log('Adding speaking_completed_at column...');
    await query(`
      ALTER TABLE subscriptions
      ADD COLUMN speaking_completed_at DATETIME DEFAULT NULL COMMENT 'Timestamp when speaking was completed'
    `).catch(err => {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('  ✓ speaking_completed_at column already exists');
      } else {
        throw err;
      }
    });

    // Add index for speaking_completed
    console.log('Adding index for speaking_completed...');
    await query(`
      ALTER TABLE subscriptions
      ADD INDEX idx_speaking_completed (speaking_completed)
    `).catch(err => {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('  ✓ Index idx_speaking_completed already exists');
      } else {
        throw err;
      }
    });

    console.log('\n✅ Migration completed successfully!');
    console.log('   - modules_attempted: JSON field to track which modules attempted');
    console.log('   - speaking_completed: Boolean to track speaking completion');
    console.log('   - speaking_completed_at: Timestamp of speaking completion');
    console.log('   - Index added for faster queries\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
