const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema - ต้องเหมือนกับที่ใช้จริงใน application
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, default: 'User', enum: ['Admin', 'User'] },
  profile_image: { type: String, default: '' }, // profile image filename
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Admin user configuration
const ADMIN_CONFIG = {
    username: 'admin',
    email: 'admin@gmail.com',
    password: 'admin_12345678',
    role: 'Admin'
};

async function createPersistentAdmin(retryCount = 0) {
    const maxRetries = 3;
    
    try {
        console.log(`🔄 Attempt ${retryCount + 1}/${maxRetries + 1} - Creating admin user...`);
        
        // Connect to MongoDB with retry
        await mongoose.connect(process.env.DATABASE_URL, {
            serverSelectionTimeoutMS: 10000, // 10 second timeout
            heartbeatFrequencyMS: 2000
        });
        console.log('✓ Connected to MongoDB successfully');

        // Check database connection health
        const adminDb = mongoose.connection.db.admin();
        const result = await adminDb.ping();
        console.log('✓ Database ping successful');

        // Verify the connection is working
        await mongoose.connection.db.stats();
        console.log('✓ Database statistics retrieved successfully');

        // Step 1: Check if admin already exists (multiple ways)
        console.log('\n📋 Checking existing admin users...');
        
        const existingAdminByUsername = await User.findOne({ username: ADMIN_CONFIG.username });
        const existingAdminByEmail = await User.findOne({ email: ADMIN_CONFIG.email });
        const existingAdminByRole = await User.findOne({ role: 'Admin' });
        
        console.log(`   Admin by username "${ADMIN_CONFIG.username}": ${existingAdminByUsername ? 'EXISTS' : 'NOT FOUND'}`);
        console.log(`   Admin by email "${ADMIN_CONFIG.email}": ${existingAdminByEmail ? 'EXISTS' : 'NOT FOUND'}`);
        console.log(`   Any Admin role user: ${existingAdminByRole ? 'EXISTS' : 'NOT FOUND'}`);

        let adminUser = existingAdminByUsername || existingAdminByEmail || existingAdminByRole;

        if (adminUser) {
            console.log('\n🔧 Updating existing admin user...');
            
            // Hash new password
            const salt = await bcrypt.genSalt(12); // Increased salt rounds
            const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.password, salt);
            
            // Update admin with correct credentials
            adminUser.username = ADMIN_CONFIG.username;
            adminUser.email = ADMIN_CONFIG.email;
            adminUser.password = hashedPassword;
            adminUser.role = ADMIN_CONFIG.role;
            
            await adminUser.save();
            console.log('✅ Admin user updated successfully');
            
        } else {
            console.log('\n➕ Creating new admin user...');
            
            // Hash password
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.password, salt);
            
            // Create new admin
            adminUser = new User({
                username: ADMIN_CONFIG.username,
                email: ADMIN_CONFIG.email,
                password: hashedPassword,
                role: ADMIN_CONFIG.role,
                profile_image: ''
            });
            
            await adminUser.save();
            console.log('✅ New admin user created successfully');
        }

        // Step 2: Verify admin was created/updated
        console.log('\n🔍 Verifying admin user...');
        
        const verifyAdmin = await User.findById(adminUser._id);
        if (!verifyAdmin) {
            throw new Error('Admin user verification failed - user not found after creation');
        }
        
        console.log('✅ Admin user verified in database:');
        console.log(`   ID: ${verifyAdmin._id}`);
        console.log(`   Username: ${verifyAdmin.username}`);
        console.log(`   Email: ${verifyAdmin.email}`);
        console.log(`   Role: ${verifyAdmin.role}`);
        console.log(`   Created: ${verifyAdmin.createdAt}`);
        console.log(`   Updated: ${verifyAdmin.updatedAt}`);

        // Step 3: Test password hash
        const isPasswordValid = await bcrypt.compare(ADMIN_CONFIG.password, verifyAdmin.password);
        if (!isPasswordValid) {
            throw new Error('Password verification failed');
        }
        console.log('✅ Password hash verification successful');

        // Step 4: Final count verification
        const adminCount = await User.countDocuments({ role: 'Admin' });
        console.log(`\n📊 Total Admin users in database: ${adminCount}`);
        
        if (adminCount === 0) {
            throw new Error('No admin users found after creation');
        }

        console.log('\n🎉 SUCCESS! Admin user is ready for login:');
        console.log(`   Username: ${ADMIN_CONFIG.username}`);
        console.log(`   Password: ${ADMIN_CONFIG.password}`);
        console.log(`   Email: ${ADMIN_CONFIG.email}`);
        
        return adminUser;

    } catch (error) {
        console.error(`❌ Error on attempt ${retryCount + 1}:`, error.message);
        
        if (retryCount < maxRetries) {
            console.log(`⏳ Retrying in 2 seconds... (${retryCount + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return createPersistentAdmin(retryCount + 1);
        } else {
            console.error('💥 Failed to create admin after maximum retries');
            throw error;
        }
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('✓ Database connection closed safely');
        }
    }
}

// Additional check function to run immediately after creation
async function immediateVerification() {
    try {
        console.log('\n🔄 Running immediate verification...');
        
        await mongoose.connect(process.env.DATABASE_URL);
        
        const admin = await User.findOne({ 
            $or: [
                { username: ADMIN_CONFIG.username },
                { email: ADMIN_CONFIG.email }
            ]
        });
        
        if (admin && admin.role === 'Admin') {
            console.log('✅ Immediate verification PASSED - Admin exists');
            return true;
        } else {
            console.log('❌ Immediate verification FAILED - Admin not found');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Verification error:', error.message);
        return false;
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
    }
}

// Main execution
async function main() {
    console.log('🚀 Starting Admin User Creation Process...');
    console.log('================================================\n');
    
    try {
        // Create admin
        await createPersistentAdmin();
        
        // Wait a moment and verify
        console.log('\n⏳ Waiting 3 seconds before verification...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const isVerified = await immediateVerification();
        
        if (isVerified) {
            console.log('\n🎯 FINAL RESULT: SUCCESS');
            console.log('Admin user is created and verified!');
            console.log('\nYou can now login to admin panel with:');
            console.log(`Username: ${ADMIN_CONFIG.username}`);
            console.log(`Password: ${ADMIN_CONFIG.password}`);
        } else {
            console.log('\n⚠️  FINAL RESULT: WARNING');
            console.log('Admin user creation completed but verification failed.');
            console.log('Please check database manually.');
        }
        
    } catch (error) {
        console.error('\n💥 FINAL RESULT: FAILURE');
        console.error('Failed to create admin user:', error.message);
        process.exit(1);
    }
}

// Run the main function
main();