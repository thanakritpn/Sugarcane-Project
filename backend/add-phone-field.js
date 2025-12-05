require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('✓ Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define User Schema (แบบเดิม)
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: 'User', enum: ['Admin', 'User'] },
    profile_image: { type: String, default: '' },
    phone: { type: String, default: '' }, // ฟิลด์ใหม่
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function addPhoneFieldToUsers() {
    try {
        console.log('🔄 กำลังเพิ่มฟิลด์ phone ให้กับ users ที่มีอยู่แล้ว...');
        
        // หา users ทั้งหมดที่ยังไม่มี phone field
        const usersWithoutPhone = await User.find({
            $or: [
                { phone: { $exists: false } },
                { phone: null }
            ]
        });
        
        console.log(`📊 พบ users ที่ต้องอัปเดท: ${usersWithoutPhone.length} คน`);
        
        if (usersWithoutPhone.length === 0) {
            console.log('✅ ทุก users มี phone field แล้ว');
            return;
        }
        
        // อัปเดททุก users ให้มี phone field เป็น string ว่าง
        const result = await User.updateMany(
            {
                $or: [
                    { phone: { $exists: false } },
                    { phone: null }
                ]
            },
            { $set: { phone: '' } }
        );
        
        console.log(`✅ อัปเดทสำเร็จ: ${result.modifiedCount} users`);
        
        // แสดงตัวอย่าง users หลังอัปเดท
        const sampleUsers = await User.find().select('username email phone').limit(5);
        console.log('\n📋 ตัวอย่าง users หลังอัปเดท:');
        sampleUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.username} (${user.email}) - Phone: "${user.phone}"`);
        });
        
        console.log('\n✅ Migration เสร็จสิ้น!');
        
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error);
    } finally {
        await mongoose.connection.close();
        console.log('✓ ปิดการเชื่อมต่อ Database แล้ว');
    }
}

// เรียกใช้ migration
addPhoneFieldToUsers();