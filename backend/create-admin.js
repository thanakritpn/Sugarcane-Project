const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('✓ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ 
            $or: [
                { email: 'admin@gmail.com' },
                { username: 'admin' }
            ]
        });

        if (existingAdmin) {
            console.log('❌ Admin user already exists:', {
                username: existingAdmin.username,
                email: existingAdmin.email,
                role: existingAdmin.role
            });
            
            // Update existing admin's password if needed
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin_12345678', salt);
            
            await User.findByIdAndUpdate(existingAdmin._id, {
                email: 'admin@gmail.com',
                username: 'admin',
                password: hashedPassword,
                role: 'Admin'
            });
            
            console.log('✓ Admin user updated successfully!');
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin_12345678', salt);

        // Create new admin user
        const adminUser = new User({
            email: 'admin@gmail.com',
            username: 'admin',
            password: hashedPassword,
            role: 'Admin',
            profile_image: ''
        });

        await adminUser.save();

        console.log('✓ Admin user created successfully!');
        console.log('Admin details:');
        console.log('  Email: admin@gmail.com');
        console.log('  Username: admin');
        console.log('  Password: admin_12345678');
        console.log('  Role: Admin');

    } catch (error) {
        console.error('❌ Error creating admin:', error);
    } finally {
        await mongoose.connection.close();
        console.log('✓ Database connection closed');
    }
}

// Run the script
createAdmin();