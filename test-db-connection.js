const mysql = require('mysql2/promise');

async function testConnection(password) {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: password,
      database: 'mockpaperilets',
      port: 3306
    });

    console.log(`✓ Connected with password: "${password}"`);
    await connection.end();
    return true;
  } catch (error) {
    console.log(`❌ Failed with password: "${password}"`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function findCorrectPassword() {
  console.log('Testing different password configurations...\n');

  const passwords = [
    '',                              // Empty password
    'your_secure_password_here',     // Current .env value
    'root',                          // Common default
    'password',                      // Another common default
  ];

  for (const pwd of passwords) {
    const success = await testConnection(pwd);
    if (success) {
      console.log(`\n✓ Correct password found: "${pwd}"`);
      console.log('\nUpdate your .env file with:');
      console.log(`DB_PASSWORD=${pwd}`);
      return;
    }
  }

  console.log('\n❌ None of the common passwords worked.');
  console.log('Please check your MySQL root password.');
}

findCorrectPassword();
