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

async function updateKhonkaenPassword() {
    try {
        console.log('⏳ กำลังเชื่อมต่อ MongoDB...');
        await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/sugarcane_db', {
            connectTimeoutMS: 30000,
            socketTimeoutMS: 30000,
            serverSelectionTimeoutMS: 30000,
        });
        console.log('✅ เชื่อมต่อ MongoDB สำเร็จ\n');

        // Find the Khonkaen shop
        const targetShopName = 'ร้านอ้อยขอนแก่น';
        console.log(`🔍 กำลังค้นหา: ${targetShopName}`);
        
        const shop = await Shop.findOne({ shopName: targetShopName });
        
        if (!shop) {
            console.log('❌ ไม่พบร้านค้า: ' + targetShopName);
            await mongoose.connection.close();
            process.exit(1);
        }

        console.log('\n📋 ข้อมูลร้านค้าปัจจุบัน:');
        console.log(`   ชื่อร้าน: ${shop.shopName}`);
        console.log(`   Username: ${shop.username}`);
        console.log(`   Email: ${shop.email}`);
        console.log(`   Phone: ${shop.phone}`);
        console.log(`   ที่อยู่: ${shop.address}`);
        console.log(`   อำเภอ: ${shop.district}`);
        console.log(`   จังหวัด: ${shop.province}`);

        // Generate new password
        const newPassword = 'Khonkaen@2024';
        console.log(`\n🔄 กำลังอัพเดตรหัสผ่านใหม่: ${newPassword}`);
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await Shop.updateOne(
            { shopName: targetShopName },
            { password: hashedPassword }
        );

        if (result.modifiedCount === 0) {
            console.log('❌ ไม่สามารถอัพเดตรหัสผ่านได้');
            await mongoose.connection.close();
            process.exit(1);
        }

        console.log('✅ อัพเดตรหัสผ่านสำเร็จ!');
        
        // Verify the new password
        const updatedShop = await Shop.findOne({ shopName: targetShopName });
        const isMatch = await bcrypt.compare(newPassword, updatedShop.password);
        console.log(`\n✓ ยืนยัน: password ใหม่ match: ${isMatch ? '✅' : '❌'}`);

        console.log(`\n📝 ใช้ข้อมูลนี้เข้าสู่ระบบ:`);
        console.log(`   ชื่อร้าน: ${shop.shopName}`);
        console.log(`   Email: ${shop.email}`);
        console.log(`   Username: ${shop.username}`);
        console.log(`   Password: ${newPassword}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
}

updateKhonkaenPassword();
