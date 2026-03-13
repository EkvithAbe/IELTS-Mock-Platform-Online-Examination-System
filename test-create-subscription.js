import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mockpaperilets',
  port: process.env.DB_PORT || 3306,
};

async function createTestSubscription() {
  let connection;
  
  try {
    console.log('🔄 Connecting to MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected to MySQL\n');

    // Check existing subscriptions
    const [existingSubs] = await connection.execute(
      'SELECT * FROM subscriptions'
    );

    console.log(`📊 Current Subscriptions: ${existingSubs.length}\n`);

    if (existingSubs.length === 0) {
      console.log('🆕 No subscriptions found. Creating test subscription...\n');
      
      // Get admin user ID
      const [adminUser] = await connection.execute(
        'SELECT id FROM users WHERE role = ? LIMIT 1',
        ['admin']
      );

      if (adminUser.length === 0) {
        console.log('❌ No admin user found!');
        return;
      }

      const userId = adminUser[0].id;

      // Create a test subscription
      await connection.execute(
        `INSERT INTO subscriptions 
        (user_id, test_type, test_module, price, status, payment_status, 
         payment_method, tests_allowed, tests_used, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          'Academic',
          'listening',
          99.99,
          'pending',
          'pending',
          'bank_transfer',
          1,
          0,
          'Test subscription for admin review'
        ]
      );

      console.log('✅ Test subscription created!');
    } else {
      console.log('📋 Existing subscriptions:');
      existingSubs.forEach((sub, index) => {
        console.log(`\n${index + 1}. Subscription ID: ${sub.id}`);
        console.log(`   User ID: ${sub.user_id}`);
        console.log(`   Module: ${sub.test_module}`);
        console.log(`   Price: $${sub.price}`);
        console.log(`   Status: ${sub.status}`);
        console.log(`   Payment Status: ${sub.payment_status}`);
      });
    }

    // Show summary
    const [stats] = await connection.execute(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(price) as total_amount
      FROM subscriptions
      GROUP BY status
    `);

    console.log('\n📊 Subscription Stats:');
    stats.forEach(stat => {
      console.log(`   ${stat.status}: ${stat.count} (Total: $${stat.total_amount})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createTestSubscription();
