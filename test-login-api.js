import fetch from 'node-fetch';

async function testLogin() {
  console.log('🧪 Testing Login API...\n');
  
  const loginData = {
    email: 'admin@gmail.com',
    password: 'admin@123'
  };
  
  console.log('📤 Sending login request:');
  console.log('   Email:', loginData.email);
  console.log('   Password:', loginData.password);
  console.log('');
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });
    
    const data = await response.json();
    
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Login SUCCESSFUL!');
      console.log('👤 User:', data.user.name);
      console.log('🔑 Role:', data.user.role);
      console.log('🎫 Token:', data.token ? 'Generated' : 'Missing');
    } else {
      console.log('\n❌ Login FAILED!');
      console.log('Error:', data.message);
    }
    
  } catch (error) {
    console.error('\n❌ Error testing login:', error.message);
  }
}

testLogin();
