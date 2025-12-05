const mongoose = require('mongoose');
require('dotenv').config();

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, default: 'User', enum: ['Admin', 'User'] },
  profile_image: { type: String, default: '' }, // profile image filename
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function checkDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('✓ Connected to MongoDB');

        // Count all users
        const totalUsers = await User.countDocuments();
        console.log(`📊 Total users in database: ${totalUsers}`);

        // Check for admin users
        const adminUsers = await User.find({ role: 'Admin' }).select('username email role createdAt');
        console.log(`👑 Admin users found: ${adminUsers.length}`);
        
        if (adminUsers.length > 0) {
            console.log('Admin users:');
            adminUsers.forEach((admin, index) => {
                console.log(`  ${index + 1}. Username: ${admin.username}`);
                console.log(`     Email: ${admin.email}`);
                console.log(`     Created: ${admin.createdAt}`);
                console.log('');
            });
        }

        // Check for specific admin user
        const specificAdmin = await User.findOne({ 
            $or: [
                { username: 'admin' },
                { email: 'admin@gmail.com' }
            ]
        });
        
        if (specificAdmin) {
            console.log('🎯 Found our admin user:');
            console.log(`   Username: ${specificAdmin.username}`);
            console.log(`   Email: ${specificAdmin.email}`);
            console.log(`   Role: ${specificAdmin.role}`);
            console.log(`   Created: ${specificAdmin.createdAt}`);
        } else {
            console.log('❌ Admin user (admin@gmail.com) NOT FOUND in database');
        }

        // List all users for debugging
        const allUsers = await User.find().select('username email role createdAt');
        console.log('\n📋 All users in database:');
        if (allUsers.length === 0) {
            console.log('   (No users found)');
        } else {
            allUsers.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.username} (${user.email}) - ${user.role} - Created: ${user.createdAt}`);
            });
        }

    } catch (error) {
        console.error('❌ Error checking database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('✓ Database connection closed');
    }
}

// Run the script
checkDatabase();