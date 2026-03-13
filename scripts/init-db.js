import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mockpaperilets',
  port: process.env.DB_PORT || 3306,
  multipleStatements: true
};

async function initDatabase() {
  let connection;
  
  try {
    console.log('🔄 Connecting to MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected to MySQL');

    // Read and execute schema file
    console.log('🔄 Creating tables...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await connection.query(schema);
    console.log('✅ Tables created successfully');

    // Create admin user
    console.log('🔄 Creating admin user...');
    const adminEmail = 'admin@ielts.com';
    // Generate a secure random password
    const adminPassword = require('crypto').randomBytes(16).toString('hex');
    const adminName = 'Admin';
    const adminPhone = '0000000000';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Insert admin user
    const [result] = await connection.execute(
      `INSERT INTO users (name, email, phone, password, role, is_active)
       VALUES (?, ?, ?, ?, 'admin', TRUE)
       ON DUPLICATE KEY UPDATE
       password = VALUES(password),
       role = 'admin',
       is_active = TRUE`,
      [adminName, adminEmail, adminPhone, hashedPassword]
    );

    console.log('✅ Admin user created successfully');
    console.log('\n🔐 IMPORTANT: Save these admin credentials securely!');
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
    console.log('   ⚠️  This password will NOT be shown again. Save it now!');
    console.log('\n⚠️  Please change the admin password after first login!\n');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

// Run the initialization
initDatabase()
  .then(() => {
    console.log('\n✅ Database initialization completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database initialization failed:', error);
    process.exit(1);
  });
