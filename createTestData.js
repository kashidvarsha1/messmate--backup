import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const createTestData = async () => {
  try {
    console.log('\n🔧 ======== STARTING TEST DATA CREATION ==========\n');
    
    await connectDB();
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    // Delete existing test data
    await db.collection('users').deleteMany({ 
      email: { $in: ['testowner@example.com', 'testcustomer@example.com'] } 
    });
    await db.collection('providers').deleteMany({ 
      name: "Varsha's Homemade Kitchen" 
    });
    
    console.log('📝 Step 1: Creating test owner user...');
    
    const hashedPassword = await bcrypt.hash('owner123', 10);
    
    const ownerResult = await db.collection('users').insertOne({
      name: 'Test Owner',
      email: 'testowner@example.com',
      phone: '9998887776',
      password: hashedPassword,
      role: 'owner',
      userTrustScore: 70,
      totalReports: 0,
      reportsResolved: 0,
      totalReviews: 0,
      helpfulVotes: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const ownerId = ownerResult.insertedId;
    console.log('   ✅ Owner created successfully!');
    console.log(`   📧 Email: testowner@example.com`);
    console.log(`   🔑 Password: owner123`);
    console.log(`   🆔 ID: ${ownerId}\n`);
    
    console.log('📝 Step 2: Creating test customer user...');
    
    const customerPassword = await bcrypt.hash('customer123', 10);
    
    const customerResult = await db.collection('users').insertOne({
      name: 'Test Customer',
      email: 'testcustomer@example.com',
      phone: '8887776665',
      password: customerPassword,
      role: 'customer',
      userTrustScore: 50,
      totalReports: 0,
      reportsResolved: 0,
      totalReviews: 0,
      helpfulVotes: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const customerId = customerResult.insertedId;
    console.log('   ✅ Customer created successfully!');
    console.log(`   📧 Email: testcustomer@example.com`);
    console.log(`   🔑 Password: customer123`);
    console.log(`   🆔 ID: ${customerId}\n`);
    
    console.log('📝 Step 3: Creating test provider...');
    
    const providerResult = await db.collection('providers').insertOne({
      name: "Varsha's Homemade Kitchen",
      providerType: "mess",
      ownerId: ownerId,
      description: "Authentic homemade Maharashtrian food. Daily thali includes 2 vegetables, dal, rice, chapati, and dessert.",
      address: {
        street: "123 Shivaji Nagar",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411005",
        coordinates: {
          type: "Point",
          coordinates: [73.8567, 18.5204]
        }
      },
      pricePerMeal: 85,
      mealTypes: ["lunch", "dinner"],
      cuisineType: ["maharashtrian"],
      isVegetarian: true,
      status: "open",
      reason: "",
      lastUpdated: new Date(),
      validTill: new Date(Date.now() + 3 * 60 * 60 * 1000),
      trustScore: 70,
      uptimeScore: 80,
      hygieneProof: [],
      averageRating: 0,
      totalReviews: 0,
      reportCount: 0,
      isUnderReview: false,
      isActive: true,
      verificationStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('   ✅ Provider created successfully!');
    console.log(`   🏪 Name: Varsha's Homemade Kitchen`);
    console.log(`   🆔 ID: ${providerResult.insertedId}\n`);
    
    console.log('📊 ========== SUMMARY ==========\n');
    
    const users = await db.collection('users').find({}).toArray();
    console.log('👥 Users:');
    users.forEach(u => {
      console.log(`   • ${u.name} (${u.role}) - Trust: ${u.userTrustScore}/100`);
    });
    
    const providers = await db.collection('providers').find({}).toArray();
    console.log('\n🏪 Providers:');
    providers.forEach(p => {
      console.log(`   • ${p.name} - ${p.status} - Trust: ${p.trustScore}/100 - ₹${p.pricePerMeal}`);
    });
    
    console.log('\n✅ ========== TEST DATA CREATION COMPLETE ==========\n');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database\n');
  }
};

createTestData();
