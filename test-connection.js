// Quick MongoDB connection test
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

console.log('\n🔍 Testing MongoDB Connection...\n');

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  console.log('\n📝 Follow MONGODB_SETUP.md to set up MongoDB Atlas\n');
  process.exit(1);
}

console.log('📡 Connecting to MongoDB...');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ SUCCESS! MongoDB connected');
    console.log(`📚 Database: ${mongoose.connection.name}`);
    console.log('\n🎉 Your app is ready to use!\n');
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Connection FAILED');
    console.error('Error:', error.message);
    console.log('\n💡 Common fixes:');
    console.log('  1. Check MONGODB_URI is correct in .env.local');
    console.log('  2. Ensure IP is whitelisted in MongoDB Atlas');
    console.log('  3. Verify username/password are correct');
    console.log('  4. Follow MONGODB_SETUP.md for complete setup\n');
    process.exit(1);
  });
