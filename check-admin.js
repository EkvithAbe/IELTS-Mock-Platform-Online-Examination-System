const mysql = require('mysql2/promise');

async function checkAdmin() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'mockpaperilets',
      port: process.env.DB_PORT || 3306
    });

    console.log('✓ Database connected');

    // Check if admin user exists
    const [users] = await connection.execute(
      "SELECT id, name, email, role, is_active FROM users WHERE email = 'admin@gmail.com'"
    );

    if (users.length === 0) {
      console.log('\n❌ Admin user NOT FOUND in database');
      console.log('\nYou need to create an admin user. Run: node scripts/create-admin.js');
    } else {
      const user = users[0];
      console.log('\n✓ Admin user found:');
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Active: ${user.is_active ? 'Yes' : 'No'}`);

      if (!user.is_active) {
        console.log('\n⚠️  WARNING: User is deactivated!');
      }
      if (user.role !== 'admin') {
        console.log('\n⚠️  WARNING: User role is not admin!');
      }
    }

    // Show all users
    const [allUsers] = await connection.execute(
      'SELECT id, name, email, role, is_active FROM users ORDER BY created_at DESC LIMIT 5'
    );

    console.log('\n--- Recent Users in Database ---');
    if (allUsers.length === 0) {
      console.log('No users found in database');
    } else {
      allUsers.forEach(u => {
        console.log(`${u.id}. ${u.name} (${u.email}) - Role: ${u.role}, Active: ${u.is_active}`);
      });
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\nDatabase "mockpaperilets" does not exist. Create it first:');
      console.log('  mysql -u root -e "CREATE DATABASE mockpaperilets;"');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\nMySQL server is not running. Start it first.');
    }
  }
}

checkAdmin();
