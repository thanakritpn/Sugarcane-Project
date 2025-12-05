require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL, {
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    retryWrites: true,
    w: 'majority'
});

const varietySchema = new mongoose.Schema({
    name: String,
    description: String,
    soil_type: String,
    pest: [String],
    disease: [String],
    yield: String,
    age: String,
    sweetness: String,
    variety_image: String,
    parent_varieties: String,
    growth_characteristics: [String],
    planting_tips: [String],
    suitable_for: [String]
}, { timestamps: true });

const shopInventorySchema = new mongoose.Schema({
    shopId: { type: mongoose.Types.ObjectId, ref: 'Shop', required: true },
    varietyId: { type: mongoose.Types.ObjectId, ref: 'Variety', required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['available', 'out_of_stock'], default: 'available' },
    quantity: { type: Number, required: false },
}, { timestamps: true });

const Variety = mongoose.model('Variety', varietySchema);
const ShopInventory = mongoose.model('ShopInventory', shopInventorySchema);

setTimeout(async () => {
    try {
        console.log('🔍 ตรวจสอบพันธุ์อ้อย สุโขทัย 1...\n');
        
        const variety = await Variety.findOne({ name: 'พันธุ์อ้อย สุโขทัย 1' });
        
        if (!variety) {
            console.log('❌ ไม่พบพันธุ์อ้อย สุโขทัย 1 ในฐานข้อมูล');
            process.exit(1);
        }
        
        console.log(`✓ พบพันธุ์อ้อย: ${variety.name}`);
        console.log(`  ID: ${variety._id}`);
        console.log(`  Description: ${variety.description ? 'มี' : 'ไม่มี'}\n`);
        
        // Check inventory
        const inventories = await ShopInventory.find({ varietyId: variety._id })
            .populate('shopId', 'shopName phone address district province');
        
        console.log(`📊 Inventory ของพันธุ์นี้:`);
        console.log(`   พบ ${inventories.length} รายการ\n`);
        
        if (inventories.length === 0) {
            console.log('❌ ไม่มีร้านค้าจำหน่ายพันธุ์นี้!');
            console.log('\n⚠️  จำเป็นต้องเพิ่ม inventory ให้กับร้านค้า');
        } else {
            inventories.forEach((inv, idx) => {
                console.log(`${idx + 1}. ${inv.shopId.shopName}`);
                console.log(`   ราคา: ${inv.price} บาท`);
                console.log(`   สถานะ: ${inv.status}`);
                console.log(`   จำนวน: ${inv.quantity || 'ไม่ระบุ'}`);
                console.log('');
            });
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error.message);
        process.exit(1);
    }
}, 1000);
