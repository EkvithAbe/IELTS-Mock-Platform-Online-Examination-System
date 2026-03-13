const mongoose = require('mongoose');

const uri = 'mongodb+srv://ekvith2003_db_user:2KMF7Lq4R0dTOOyL@mockpaper.szsj0ah.mongodb.net/ielts_mock_platform?retryWrites=true&w=majority&appName=Mockpaper';

console.log('\n🔍 Testing direct connection...\n');

mongoose.connect(uri)
  .then(() => {
    console.log('✅ SUCCESS! Connected to MongoDB');
    console.log('Database:', mongoose.connection.name);
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ FAILED:', error.message);
    process.exit(1);
  });
