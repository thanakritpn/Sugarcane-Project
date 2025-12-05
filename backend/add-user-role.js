require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('✓ Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: 'User', enum: ['Super Admin', 'Admin', 'Contributor', 'User'] },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function addRoleToUsers() {
    try {
        console.log('Adding role field to all users...');
        
        // Update all users to have role='User' if they don't already have a role
        const result = await User.updateMany(
            { role: { $exists: false } },
            { $set: { role: 'User' } }
        );
        
        console.log(`Updated ${result.modifiedCount} users`);
        
        // Show all users
        const allUsers = await User.find().select('email username role createdAt');
        console.log('\nAll users:');
        allUsers.forEach(user => {
            console.log(`  - ${user.username} (${user.email}) - Role: ${user.role}`);
        });
        
        console.log('\n✓ Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

addRoleToUsers();
