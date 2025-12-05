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
        console.log('🔍 กำลังหา ID ที่ duplicate...');
        
        // Find all duplicate varieties
        const duplicates = await Variety.find({ 
            name: { $regex: 'สุโขทัย|ตาก|แม่ฮ่องสอน' } 
        });
        
        // Group by name
        const grouped = {};
        duplicates.forEach(v => {
            if (!grouped[v.name]) grouped[v.name] = [];
            grouped[v.name].push(v._id.toString());
        });
        
        console.log('\n📊 พบ Duplicate:');
        let oldIds = [];
        for (const [name, ids] of Object.entries(grouped)) {
            if (ids.length > 1) {
                console.log(`\n${name}:`);
                ids.forEach((id, i) => {
                    console.log(`  ${i === 0 ? '✓ ใหม่' : '✗ เก่า'}: ${id}`);
                    if (i > 0) oldIds.push(id);
                });
            }
        }
        
        if (oldIds.length === 0) {
            console.log('\n✅ ไม่มี duplicate ที่ต้องลบ');
            process.exit(0);
        }
        
        console.log(`\n⚠️ จะลบ ${oldIds.length} รายการเก่า...`);
        
        // Delete old inventory entries
        const deletedInventory = await ShopInventory.deleteMany({
            varietyId: { $in: oldIds }
        });
        console.log(`✓ ลบ inventory: ${deletedInventory.deletedCount} รายการ`);
        
        // Delete old varieties
        const deletedVarieties = await Variety.deleteMany({
            _id: { $in: oldIds }
        });
        console.log(`✓ ลบพันธุ์อ้อย: ${deletedVarieties.deletedCount} รายการ`);
        
        console.log('\n✅ ทำความสะอาดเสร็จ! ตัวอักษรใหม่ได้รับการรักษา');
        process.exit(0);
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error.message);
        process.exit(1);
    }
}, 1000);
