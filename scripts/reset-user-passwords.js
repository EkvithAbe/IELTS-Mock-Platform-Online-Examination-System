import bcrypt from 'bcryptjs';
import { query } from '../lib/mysql.js';

async function resetPasswords() {
  console.log('🔄 Resetting user passwords...\n');

  try {
    // Admin password: admin123
    const adminPassword = await bcrypt.hash('admin123', 10);
    await query(
      'UPDATE users SET password = ? WHERE email = ?',
      [adminPassword, 'admin@gmail.com']
    );
    console.log('✅ Admin password reset');
    console.log('   Email: admin@gmail.com');
    console.log('   Password: admin123\n');

    // Student password: student123
    const studentPassword = await bcrypt.hash('student123', 10);
    await query(
      'UPDATE users SET password = ? WHERE email = ?',
      [studentPassword, 'ekvith2003@gmail.com']
    );
    console.log('✅ Student password reset');
    console.log('   Email: ekvith2003@gmail.com');
    console.log('   Password: student123\n');

    console.log('✅ All passwords reset successfully!');
    console.log('\n📝 Login credentials:');
    console.log('━'.repeat(50));
    console.log('ADMIN:');
    console.log('  Email: admin@gmail.com');
    console.log('  Password: admin123');
    console.log('\nSTUDENT:');
    console.log('  Email: ekvith2003@gmail.com');
    console.log('  Password: student123');
    console.log('━'.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting passwords:', error.message);
    process.exit(1);
  }
}

resetPasswords();
