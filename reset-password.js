const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.log('Usage: node reset-password.js <email> <new-password>');
    console.log('Example: node reset-password.js admin@gmail.com admin123');
    process.exit(1);
  }

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'mockpaperilets',
      port: process.env.DB_PORT || 3306
    });

    console.log('✓ Database connected');

    // Check if user exists
    const [users] = await connection.execute(
      'SELECT id, name, email, role FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      console.log(`❌ User with email "${email}" not found`);
      await connection.end();
      process.exit(1);
    }

    const user = users[0];
    console.log(`\nFound user: ${user.name} (${user.email}) - Role: ${user.role}`);

    // Hash new password
    console.log('\nHashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await connection.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, user.id]
    );

    console.log(`✓ Password updated successfully for ${user.email}`);
    console.log(`\nYou can now login with:`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Password: ${newPassword}`);

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
