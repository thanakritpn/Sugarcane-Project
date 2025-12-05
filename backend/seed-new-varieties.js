require('dotenv').config();
const mongoose = require('mongoose');

// Connection to MongoDB with proper timeout settings
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/sugarcane_db', {
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    retryWrites: true,
    w: 'majority'
});

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
}, { timestamps: true });

// ShopInventory Schema
const shopInventorySchema = new mongoose.Schema({
    shopId: { type: mongoose.Types.ObjectId, ref: 'Shop', required: true },
    varietyId: { type: mongoose.Types.ObjectId, ref: 'Variety', required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['available', 'out_of_stock'], default: 'available' },
    quantity: { type: Number, required: false },
}, { timestamps: true });

const Variety = mongoose.model('Variety', varietySchema);
const Shop = mongoose.model('Shop', shopSchema);
const ShopInventory = mongoose.model('ShopInventory', shopInventorySchema);

// New varieties to add
const newVarieties = [
    {
        name: 'พันธุ์อ้อย สุโขทัย 1',
        soil_type: 'ดินร่วนเหนียว',
        pest: ['หนอนเจาะลำต้น', 'หนอนกออ้อย'],
        disease: ['โรคใบขาว', 'เหี่ยวเน่าแดง'],
        yield: '16-17',
        age: '11-12',
        sweetness: '10-11',
        variety_image: 'sugarcane-sukhothoi-1.jpg',
        parent_varieties: 'ST 1 (แม่) X K 92-1 (พ่อ)',
        growth_characteristics: [
            'เจริญเติบโตดีในพื้นที่ภาคกลาง',
            'ทนแล้งปานกลาง',
            'แตกกอดี 6-7 ลำต่อกอ',
            'ลำมีสีน้ำตาล'
        ],
        planting_tips: [
            'เหมาะสำหรับพื้นที่สุโขทัยและโดยรอบ',
            'ควรปลูกในฤดูฝน',
            'ให้ปุ๋ยตามคำแนะนำ'
        ],
        suitable_for: [
            'เหมาะสำหรับภาคกลาง',
            'พื้นที่จังหวัดสุโขทัย'
        ]
    },
    {
        name: 'พันธุ์อ้อย ตาก 2',
        soil_type: 'ดินทรายร่วน',
        pest: ['หนอนเจาะลำต้น', 'แมลงวันกระแสอ้อย'],
        disease: ['โรคแส้ดำ', 'โรคกอตะใคร้'],
        yield: '17-19',
        age: '12-13',
        sweetness: '11-12',
        variety_image: 'sugarcane-tak-2.jpg',
        parent_varieties: 'TK 2 (แม่) X LK 92-11 (พ่อ)',
        growth_characteristics: [
            'เจริญเติบโตดีในพื้นที่เหนือ',
            'ทนแล้งดี',
            'แตกกอปานกลาง 5-7 ลำต่อกอ',
            'ลำตรง ไม่ล้มง่าย'
        ],
        planting_tips: [
            'เหมาะสำหรับจังหวัดตาก',
            'ควรปลูกในพื้นที่ที่ระบายน้ำดี',
            'ให้ผลผลิตดีในดินปานกลาง'
        ],
        suitable_for: [
            'เหมาะสำหรับภาคเหนือ',
            'พื้นที่จังหวัดตากและโดยรอบ'
        ]
    },
    {
        name: 'พันธุ์อ้อย แม่ฮ่องสอน 3',
        soil_type: 'ดินร่วนเหนียวชุ่มชื้น',
        pest: ['หนอนเจาะลำต้น', 'หนอนกออ้อย'],
        disease: ['โรคใบขาว', 'โรคแส้ดำ'],
        yield: '15-16',
        age: '11-13',
        sweetness: '10-12',
        variety_image: 'sugarcane-maehongson-3.jpg',
        parent_varieties: 'MHS 3 (แม่) X CP 65-357 (พ่อ)',
        growth_characteristics: [
            'เจริญเติบโตดีในที่ความชื้นสูง',
            'ทนน้ำมากได้',
            'แตกกอดี 6-8 ลำต่อกอ',
            'ลำสีม่วงแดง'
        ],
        planting_tips: [
            'เหมาะสำหรับจังหวัดแม่ฮ่องสอน',
            'สมควรปลูกในพื้นที่ที่มีความชื้นมากพอ',
            'ทนต่อภูมิอากาศของพื้นที่สูง'
        ],
        suitable_for: [
            'เหมาะสำหรับภาคเหนือ',
            'พื้นที่ที่มีความชื้นสูง',
            'พื้นที่จังหวัดแม่ฮ่องสอนและโดยรอบ'
        ]
    }
];

async function seedNewVarietiesAndInventory() {
    try {
        console.log('⏳ กำลังเชื่อมต่อ MongoDB...');
        await new Promise(resolve => {
            mongoose.connection.on('connected', () => {
                console.log('✅ เชื่อมต่อ MongoDB สำเร็จ');
                resolve();
            });
        });

        // Insert new varieties
        console.log('📝 กำลังเพิ่มพันธุ์อ้อยใหม่...');
        const insertedVarieties = await Variety.insertMany(newVarieties);
        console.log(`✅ เพิ่มพันธุ์อ้อยใหม่ ${insertedVarieties.length} พันธุ์ สำเร็จ`);

        // Get all shops
        console.log('🏪 กำลังค้นหาร้านค้า...');
        const shops = await Shop.find();
        if (shops.length === 0) {
            console.log('⚠️ ไม่มีข้อมูลร้านค้า กรุณาสร้างข้อมูลร้านค้าก่อน');
            console.log('\n💡 ลองรัน: node seed-shops.js');
            process.exit(1);
        }
        console.log(`✅ พบร้านค้า ${shops.length} แห่ง`);

        // Create inventory for each shop selling all 3 new varieties
        console.log('📦 กำลังเพิ่มพันธุ์อ้อยใหม่ลงคลังสินค้าของร้านต่าง ๆ...');
        const inventoryData = [];
        
        for (const shop of shops) {
            for (const variety of insertedVarieties) {
                // Generate random price between 2500-3500
                const price = Math.floor(Math.random() * 1000) + 2500;
                // 80% available, 20% out of stock
                const status = Math.random() > 0.2 ? 'available' : 'out_of_stock';
                const quantity = Math.floor(Math.random() * 150) + 50;
                
                inventoryData.push({
                    shopId: shop._id,
                    varietyId: variety._id,
                    price,
                    status,
                    quantity,
                });
            }
        }

        await ShopInventory.insertMany(inventoryData);
        console.log(`✅ เพิ่ม ShopInventory ${inventoryData.length} รายการ สำเร็จ`);

        console.log('\n📊 สรุปข้อมูลที่เพิ่มขึ้น:');
        console.log('\n🌾 พันธุ์อ้อยใหม่:');
        insertedVarieties.forEach((variety, index) => {
            console.log(`   ${index + 1}. ${variety.name}`);
            console.log(`      ผลผลิต: ${variety.yield} ตัน/ไร่ | ความหวาน: ${variety.sweetness} CCS`);
        });

        console.log('\n🏪 ร้านค้าทั้งหมดขายพันธุ์อ้อยใหม่:');
        shops.forEach((shop, index) => {
            console.log(`   ${index + 1}. ${shop.shopName}`);
            console.log(`      ประเทศ: ${shop.province} | เบอร์: ${shop.phone}`);
        });

        console.log('\n✅ เพิ่มข้อมูลสำเร็จ!');
        process.exit(0);
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error.message);
        process.exit(1);
    }
}

seedNewVarietiesAndInventory();
