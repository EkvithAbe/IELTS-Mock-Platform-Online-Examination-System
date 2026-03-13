const fetch = require('node-fetch');

async function testLogin() {
  const credentials = [
    { email: 'admin@gmail.com', password: 'admin123' },
    { email: 'ekvith2003@gmail.com', password: 'student123' }
  ];

  for (const cred of credentials) {
    console.log(`\n--- Testing login for ${cred.email} ---`);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cred),
      });

      const data = await response.json();

      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(data, null, 2));

      if (response.ok) {
        console.log('✓ Login successful!');
        console.log('  Token:', data.token.substring(0, 20) + '...');
        console.log('  User:', data.user.name, `(${data.user.role})`);
      } else {
        console.log('❌ Login failed');
        console.log('  Error:', data.message);
      }
    } catch (error) {
      console.log('❌ Request failed:', error.message);
    }
  }
}

testLogin();
