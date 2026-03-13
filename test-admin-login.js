import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mockpaperilets',
  port: process.env.DB_PORT || 3306,
};

async function testAdminLogin() {
  let connection;
  
  try {
    console.log('🔄 Connecting to MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected to MySQL\n');

    // Check if admin user exists
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['admin@gmail.com']
    );

    if (users.length === 0) {
      console.log('❌ Admin user not found in database!');
      console.log('Creating admin user...\n');
      
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin@123', salt);
      
      await connection.execute(
        `INSERT INTO users (name, email, phone, password, role, is_active) 
         VALUES (?, ?, ?, ?, 'admin', TRUE)`,
        ['Admin', 'admin@gmail.com', '0000000000', hashedPassword]
      );
      
      console.log('✅ Admin user created!');
    } else {
      const admin = users[0];
      console.log('✅ Admin user found in database:');
      console.log('   ID:', admin.id);
      console.log('   Name:', admin.name);
      console.log('   Email:', admin.email);
      console.log('   Role:', admin.role);
      console.log('   Active:', admin.is_active);
      console.log('   Password Hash:', admin.password.substring(0, 20) + '...\n');

      // Test password
      const testPassword = 'admin@123';
      const isMatch = await bcrypt.compare(testPassword, admin.password);
      
      console.log('🔐 Testing password "admin@123":');
      console.log('   Result:', isMatch ? '✅ CORRECT' : '❌ INCORRECT');
      
      if (!isMatch) {
        console.log('\n⚠️  Password does not match! Resetting password...');
        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash('admin@123', salt);
        
        await connection.execute(
          'UPDATE users SET password = ? WHERE email = ?',
          [newHashedPassword, 'admin@gmail.com']
        );
        
        console.log('✅ Password reset to: admin@123');
      }
    }

    console.log('\n📋 Login Credentials:');
    console.log('   Email: admin@gmail.com');
    console.log('   Password: admin@123');
    console.log('\n✅ You can now login with these credentials!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testAdminLogin();
