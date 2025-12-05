require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connection to MongoDB with proper timeout settings
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/sugarcane_db', {
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    retryWrites: true,
    w: 'majority'
});

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

// ShopInventory Schema
const shopInventorySchema = new mongoose.Schema({
    shopId: { type: mongoose.Types.ObjectId, ref: 'Shop', required: true },
    varietyId: { type: mongoose.Types.ObjectId, ref: 'Variety', required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['available', 'out_of_stock'], default: 'available' },
    quantity: { type: Number, required: false },
}, { timestamps: true });

// Variety Schema
const varietySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    soil_type: { type: String, required: true },
    pest: { type: [String], required: true },
    disease: { type: [String], required: true },
    yield: { type: String, required: true },
    age: { type: String, required: true },
    sweetness: { type: String, required: true },
    variety_image: { type: String, required: false, default: 'sugarcane-default.jpg' },
    parent_varieties: { type: String, required: false },
    growth_characteristics: { type: [String], required: false },
    planting_tips: { type: [String], required: false },
    suitable_for: { type: [String], required: false },
}, { timestamps: true });

const Shop = mongoose.model('Shop', shopSchema);
const ShopInventory = mongoose.model('ShopInventory', shopInventorySchema);
const Variety = mongoose.model('Variety', varietySchema);

// Sample data for shops
const shopsData = [
    {
        username: 'shop_chiangmai',
        email: 'shop.chiangmai@example.com',
        password: bcrypt.hashSync('Password123!', 10),
        shopName: 'ร้านอ้อยเชียงใหม่',
        phone: '0531234567',
        address: '123 ถนนท่าแพ ตำบลศรีภูมิ',
        district: 'เมืองเชียงใหม่',
        province: 'เชียงใหม่',
        shop_image: 'shop-chiangmai.jpg',
    },
    {
        username: 'shop_khonkaen',
        email: 'shop.khonkaen@example.com',
        password: bcrypt.hashSync('Password456@', 10),
        shopName: 'ร้านอ้อยขอนแก่น',
        phone: '0432345678',
        address: '456 ถนนสีชัง ตำบลศรีมหา',
        district: 'เมืองขอนแก่น',
        province: 'ขอนแก่น',
        shop_image: 'shop-khonkaen.jpg',
    },
    {
        username: 'shop_nakhon',
        email: 'shop.nakhon@example.com',
        password: bcrypt.hashSync('Password789#', 10),
        shopName: 'ร้านอ้อยนครราชสีมา',
        phone: '0443456789',
        address: '789 ถนนจังสมบัติ ตำบลหนองไข่',
        district: 'เมืองนครราชสีมา',
        province: 'นครราชสีมา',
        shop_image: 'shop-nakhon.jpg',
    },
];

async function seedData() {
    try {
        // Wait for connection to be established
        console.log('⏳ กำลังเชื่อมต่อ MongoDB...');
        await new Promise(resolve => {
            mongoose.connection.on('connected', () => {
                console.log('✅ เชื่อมต่อ MongoDB สำเร็จ');
                resolve();
            });
        });

        // Clear existing data
        console.log('🗑️  กำลังลบข้อมูลเก่า...');
        await Shop.deleteMany({});
        await ShopInventory.deleteMany({});
        console.log('✅ ลบข้อมูลเก่าเสร็จ');

        // Insert shops
        console.log('📝 กำลังสร้างร้านค้า...');
        const insertedShops = await Shop.insertMany(shopsData);
        console.log('✅ สร้างร้านค้า 3 แห่ง สำเร็จ');

        // Get a variety to link with shop inventory
        console.log('🔍 กำลังค้นหาสายพันธุ์อ้อย...');
        const varieties = await Variety.find().limit(5);

        if (varieties.length === 0) {
            console.log('⚠️ ไม่มีข้อมูลสายพันธุ์อ้อย กรุณาสร้างข้อมูล Variety ก่อน');
            console.log('\n💡 ลองรัน: node seed-with-description.js');
            process.exit(1);
        }

        console.log(`✅ พบสายพันธุ์อ้อย ${varieties.length} พันธุ์`);

        // Create shop inventory for each shop
        console.log('📦 กำลังสร้าง ShopInventory...');
        const inventoryData = [];
        for (const shop of insertedShops) {
            for (const variety of varieties) {
                inventoryData.push({
                    shopId: shop._id,
                    varietyId: variety._id,
                    price: Math.floor(Math.random() * 5000) + 2000, // 2000-7000
                    status: Math.random() > 0.3 ? 'available' : 'out_of_stock',
                    quantity: Math.floor(Math.random() * 100) + 10,
                });
            }
        }

        await ShopInventory.insertMany(inventoryData);
        console.log(`✅ สร้าง ShopInventory ${inventoryData.length} รายการ สำเร็จ`);

        console.log('\n📊 ข้อมูลที่สร้างขึ้น:');
        console.log('\n🏪 ร้านค้า:');
        insertedShops.forEach((shop, index) => {
            console.log(`   ${index + 1}. ${shop.shopName} (${shop.username})`);
            console.log(`      Email: ${shop.email} | Phone: ${shop.phone}`);
            console.log(`      ${shop.address}, ${shop.district}, ${shop.province}`);
        });

        console.log('\n✅ Seed data สำเร็จ!');
        process.exit(0);
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error.message);
        process.exit(1);
    }
}

seedData();
