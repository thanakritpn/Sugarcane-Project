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

async function updateShopPassword() {
    try {
        console.log('⏳ กำลังเชื่อมต่อ MongoDB...');
        await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/sugarcane_db', {
            connectTimeoutMS: 30000,
            socketTimeoutMS: 30000,
            serverSelectionTimeoutMS: 30000,
        });
        console.log('✅ เชื่อมต่อ MongoDB สำเร็จ');

        // Get all shops
        console.log('\n📋 ร้านค้าที่มีใน Database:');
        const shops = await Shop.find({}, 'username email shopName phone -_id');
        
        if (shops.length === 0) {
            console.log('⚠️ ไม่มีร้านค้าในฐานข้อมูล');
            await mongoose.connection.close();
            process.exit(0);
        }

        shops.forEach((shop, index) => {
            console.log(`\n${index + 1}. ชื่อร้าน: ${shop.shopName}`);
            console.log(`   Username: ${shop.username}`);
            console.log(`   Email: ${shop.email}`);
            console.log(`   Phone: ${shop.phone}`);
        });

        // Update password for the first shop
        const shopToUpdate = shops[0];
        const newPassword = 'Test123456!'; // ต้องมี 8+ chars, uppercase, lowercase, number, special char

        console.log(`\n🔄 กำลังอัพเดตรหัสผ่านสำหรับ: ${shopToUpdate.shopName}`);
        console.log(`   Email: ${shopToUpdate.email}`);
        console.log(`   รหัสผ่านใหม่: ${newPassword}`);

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await Shop.updateOne(
            { email: shopToUpdate.email },
            { password: hashedPassword }
        );

        console.log('\n✅ อัพเดตรหัสผ่านสำเร็จ!');
        console.log(`\nขอให้ใช้ข้อมูลนี้เข้าสู่ระบบ:`);
        console.log(`   Email: ${shopToUpdate.email}`);
        console.log(`   Password: ${newPassword}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
}

updateShopPassword();
