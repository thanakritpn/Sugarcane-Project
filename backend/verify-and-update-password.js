require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Shop Schema
const shopSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    shopName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String, required: true },
    shop_image: { type: String, default: '' },
}, { timestamps: true });

const Shop = mongoose.model('Shop', shopSchema);

async function updateShopPasswordByEmail() {
    try {
        console.log('⏳ กำลังเชื่อมต่อ MongoDB...');
        await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/sugarcane_db', {
            connectTimeoutMS: 30000,
            socketTimeoutMS: 30000,
            serverSelectionTimeoutMS: 30000,
        });
        console.log('✅ เชื่อมต่อ MongoDB สำเร็จ');

        // Find the shop with email shop.udon@example.com
        const targetEmail = 'shop.udon@example.com';
        console.log(`\n🔍 กำลังค้นหา: ${targetEmail}`);
        
        const shop = await Shop.findOne({ email: targetEmail });
        
        if (!shop) {
            console.log('❌ ไม่พบร้านค้าที่มี email: ' + targetEmail);
            await mongoose.connection.close();
            process.exit(1);
        }

        console.log('\n📋 ข้อมูลร้านค้า:');
        console.log(`   ชื่อร้าน: ${shop.shopName}`);
        console.log(`   Username: ${shop.username}`);
        console.log(`   Email: ${shop.email}`);
        console.log(`   Phone: ${shop.phone}`);
        console.log(`   Password hash: ${shop.password.substring(0, 20)}...`);

        // Test the password
        const testPassword = 'Tukta_071046';
        console.log(`\n🔐 ทดสอบ password: ${testPassword}`);
        
        const isMatch = await bcrypt.compare(testPassword, shop.password);
        console.log(`   ผลลัพธ์: ${isMatch ? '✅ ตรงกัน' : '❌ ไม่ตรงกัน'}`);

        // Update password
        const newPassword = 'Tukta_071046!'; // ต้องมีอักขระพิเศษ
        console.log(`\n🔄 กำลังอัพเดตรหัสผ่าน: ${newPassword}`);
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await Shop.updateOne(
            { email: targetEmail },
            { password: hashedPassword }
        );

        console.log('✅ อัพเดตรหัสผ่านสำเร็จ!');
        
        // Verify the new password
        const updatedShop = await Shop.findOne({ email: targetEmail });
        const newIsMatch = await bcrypt.compare(newPassword, updatedShop.password);
        console.log(`\n✓ ยืนยัน: password ใหม่ match: ${newIsMatch ? '✅' : '❌'}`);

        console.log(`\n📝 ใช้ข้อมูลนี้เข้าสู่ระบบ:`);
        console.log(`   Email: ${shop.email}`);
        console.log(`   Password: ${newPassword}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
}

updateShopPasswordByEmail();
