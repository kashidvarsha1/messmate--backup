import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Provider from '../models/Provider.js';
import bcrypt from 'bcryptjs';

// Load environment variables from parent folder
dotenv.config({ path: '../.env' });

const createTestData = async () => {
  try {
    console.log('\n🔧 ========== STARTING TEST DATA CREATION ==========\n');
    
    await connectDB();
    console.log('✅ Connected to MongoDB\n');
    
    console.log('📝 Step 1: Creating test owner user...');
    
    const hashedPassword = await bcrypt.hash('owner123', 10);
    
    let owner = await User.findOne({ email: 'testowner@example.com' });
    
    if (!owner) {
      owner = await User.create({
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
        profilePicture: 'default-avatar.png'
      });
      console.log('   ✅ Owner created successfully!');
      console.log(`   📧 Email: ${owner.email}`);
      console.log(`   🔑 Password: owner123`);
      console.log(`   🆔 ID: ${owner._id}\n`);
    } else {
      console.log('   ℹ️ Owner already exists!');
      console.log(`   📧 Email: ${owner.email}`);
      console.log(`   🆔 ID: ${owner._id}\n`);
    }
    
    console.log('📝 Step 2: Creating test customer user...');
    
    let customer = await User.findOne({ email: 'testcustomer@example.com' });
    
    if (!customer) {
      const customerPassword = await bcrypt.hash('customer123', 10);
      customer = await User.create({
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
        profilePicture: 'default-avatar.png'
      });
      console.log('   ✅ Customer created successfully!');
      console.log(`   📧 Email: ${customer.email}`);
      console.log(`   🔑 Password: customer123`);
      console.log(`   🆔 ID: ${customer._id}\n`);
    } else {
      console.log('   ℹ️ Customer already exists!');
      console.log(`   📧 Email: ${customer.email}`);
      console.log(`   🆔 ID: ${customer._id}\n`);
    }
    
    console.log('📝 Step 3: Creating test provider...');
    
    if (owner) {
      const existingProvider = await Provider.findOne({ name: "Varsha's Homemade Kitchen" });
      
      if (!existingProvider) {
        const provider = await Provider.create({
          name: "Varsha's Homemade Kitchen",
          providerType: "mess",
          ownerId: owner._id,
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
          validTill: new Date(Date.now() + 3 * 60 * 60 * 1000),
          trustScore: 70,
          uptimeScore: 80
        });
        console.log('   ✅ Provider created successfully!');
        console.log(`   🏪 Name: ${provider.name}`);
        console.log(`   🆔 ID: ${provider._id}\n`);
      } else {
        console.log('   ℹ️ Provider already exists!');
        console.log(`   🏪 Name: ${existingProvider.name}\n`);
      }
    } else {
      console.log('   ❌ Cannot create provider: Owner not found!\n');
    }
    
    console.log('📊 ========== SUMMARY ==========\n');
    
    const users = await User.find({}, 'name email role userTrustScore');
    console.log('👥 Users:');
    users.forEach(u => {
      console.log(`   • ${u.name} (${u.role}) - Trust: ${u.userTrustScore}/100`);
    });
    
    const providers = await Provider.find({}, 'name status trustScore pricePerMeal');
    console.log('\n🏪 Providers:');
    providers.forEach(p => {
      console.log(`   • ${p.name} - ${p.status} - Trust: ${p.trustScore}/100 - ₹${p.pricePerMeal}`);
    });
    
    console.log('\n✅ ========== TEST DATA CREATION COMPLETE ==========\n');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database\n');
  }
};

createTestData();
