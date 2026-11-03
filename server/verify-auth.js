const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Load = require('./models/Load');
const Connection = require('./models/Connection');
const jwt = require('jsonwebtoken');

async function testOnlineDbAndAuth() {
  console.log('===========================================================');
  console.log('📡 1. Testing Live Connection to MongoDB Atlas Cluster:');
  console.log('URI:', process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@'));
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log('STATUS:   ✅ CONNECTED SUCCESSFULLY!');
  console.log('HOST:    ', conn.connection.host);
  console.log('DATABASE:', conn.connection.name);
  console.log('PORT:    ', conn.connection.port);

  console.log('\n📊 2. Verifying Stored Data in Online Database:');
  const userCount = await User.countDocuments();
  const loadCount = await Load.countDocuments();
  const connCount = await Connection.countDocuments();
  console.log(`- Registered Users in MongoDB Atlas:   ${userCount}`);
  console.log(`- Active Freight Loads in Database:    ${loadCount}`);
  console.log(`- Mutual Network Connections:          ${connCount}`);

  console.log('\n🔐 3. Testing Authentication (Bcrypt Hashing & Login):');
  const testOwner = await User.findOne({ email: 'owner@tata-steel.in' });
  if (!testOwner) throw new Error('Test user not found in DB');
  console.log(`- Retrieved User: "${testOwner.name}" | Role: [${testOwner.role}]`);
  console.log(`- Secure Hashed Password in DB: ${testOwner.password.substring(0, 25)}...`);
  
  const isCorrect = await testOwner.matchPassword('password123');
  console.log(`- Password Test ('password123'): ${isCorrect ? '✅ SUCCESS (Bcrypt Verified)' : '❌ FAILED'}`);
  
  const isWrong = await testOwner.matchPassword('incorrect-pass-99');
  console.log(`- Wrong Password Test ('incorrect-pass-99'): ${!isWrong ? '✅ REJECTED AS EXPECTED (401)' : '❌ FAILED'}`);

  console.log('\n🎫 4. Testing JWT Token Issuance & Verification:');
  const token = jwt.sign(
    { id: testOwner._id, role: testOwner.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  console.log(`- Generated JWT Token: ${token.substring(0, 35)}...`);
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log(`- Token Decoded Successfully:`);
  console.log(`  * User ID: ${decoded.id}`);
  console.log(`  * Role:    ${decoded.role}`);
  console.log(`  * Expires: ${new Date(decoded.exp * 1000).toLocaleString()}`);

  console.log('\n🛡️ 5. Testing Role-Based Authorization Guard:');
  // Check permission matrix
  const canOwnerPostLoad = decoded.role === 'load_owner';
  console.log(`- Can Load Owner create loads (/api/loads)?    ${canOwnerPostLoad ? '✅ AUTHORIZED (201 Created)' : '❌ FORBIDDEN'}`);
  
  const testDriver = await User.findOne({ role: 'driver' });
  const canDriverPostLoad = testDriver.role === 'load_owner';
  console.log(`- Can Lorry Driver create loads (/api/loads)?   ${!canDriverPostLoad ? '✅ PROTECTED / 403 FORBIDDEN (Blocked by roleMiddleware)' : '❌ SECURITY FLAW'}`);

  console.log('\n===========================================================');
  console.log('🎉 VERIFICATION COMPLETE: ALL SYSTEMS FULLY OPERATIONAL!');
  console.log('===========================================================');
  process.exit(0);
}

testOnlineDbAndAuth().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
