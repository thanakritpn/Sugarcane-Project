import bcrypt from 'bcryptjs';
import User from '../models/User';

// Admin configuration
export const ADMIN_CONFIG = {
    username: 'admin',
    email: 'admin@gmail.com',
    password: 'admin_12345678',
    role: 'Admin'
};

export async function ensureAdminExists(): Promise<any> {
    try {
        // Check if admin exists
        const existingAdmin = await User.findOne({
            $or: [
                { username: ADMIN_CONFIG.username },
                { email: ADMIN_CONFIG.email },
                { role: 'Admin' }
            ]
        });

        if (existingAdmin) {
            // Admin exists, make sure it has correct data
            if (existingAdmin.role !== 'Admin' || 
                existingAdmin.username !== ADMIN_CONFIG.username || 
                existingAdmin.email !== ADMIN_CONFIG.email) {
                
                console.log('🔧 Updating admin user data...');
                
                const salt = await bcrypt.genSalt(12);
                const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.password, salt);
                
                existingAdmin.username = ADMIN_CONFIG.username;
                existingAdmin.email = ADMIN_CONFIG.email;
                existingAdmin.password = hashedPassword;
                existingAdmin.role = ADMIN_CONFIG.role;
                
                await existingAdmin.save();
                console.log('✅ Admin user updated on startup');
            } else {
                console.log('✅ Admin user already exists and is properly configured');
            }
            return existingAdmin;
        }

        // Create new admin if none exists
        console.log('➕ Creating admin user on startup...');
        
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.password, salt);
        
        const newAdmin = new User({
            username: ADMIN_CONFIG.username,
            email: ADMIN_CONFIG.email,
            password: hashedPassword,
            role: ADMIN_CONFIG.role,
            profile_image: ''
        });
        
        await newAdmin.save();
        console.log('✅ Admin user created on startup');
        console.log(`   Username: ${ADMIN_CONFIG.username}`);
        console.log(`   Password: ${ADMIN_CONFIG.password}`);
        
        return newAdmin;
        
    } catch (error: any) {
        console.error('❌ Error ensuring admin exists:', error.message);
        // Don't throw error to prevent server from failing to start
        return null;
    }
}