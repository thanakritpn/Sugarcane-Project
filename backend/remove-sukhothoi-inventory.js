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
}, { timestamps: true });

const shopSchema = new mongoose.Schema({
    shopName: String,
}, { timestamps: true });

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

setTimeout(async () => {
    try {
        console.log('🗑️ ลบ inventory สำหรับพันธุ์อ้อย สุโขทัย 1...\n');
        
        // Get Sukhothoi 1 variety
        const sukhothoi = await Variety.findOne({ name: 'พันธุ์อ้อย สุโขทัย 1' });
        
        if (!sukhothoi) {
            console.error('❌ ไม่พบพันธุ์อ้อย สุโขทัย 1');
            process.exit(1);
        }
        
        // Get shops to delete (keep only Chiangmai)
        const chiangmai = await Shop.findOne({ shopName: 'ร้านอ้อยเชียงใหม่' });
        const khonkaen = await Shop.findOne({ shopName: 'ร้านอ้อยขอนแก่น' });
        const nakhon = await Shop.findOne({ shopName: 'ร้านอ้อยนครราชสีมา' });
        
        console.log('📝 ลบ inventory:\n');
        
        // Delete from Khonkaen
        const deleted1 = await ShopInventory.deleteOne({
            shopId: khonkaen._id,
            varietyId: sukhothoi._id
        });
        
        if (deleted1.deletedCount > 0) {
            console.log(`✅ ลบออกจาก ร้านอ้อยขอนแก่น`);
        }
        
        // Delete from Nakhon
        const deleted2 = await ShopInventory.deleteOne({
            shopId: nakhon._id,
            varietyId: sukhothoi._id
        });
        
        if (deleted2.deletedCount > 0) {
            console.log(`✅ ลบออกจาก ร้านอ้อยนครราชสีมา`);
        }
        
        console.log(`\n✅ เหลือแค่ ร้านอ้อยเชียงใหม่ ขายพันธุ์นี้`);
        process.exit(0);
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error.message);
        process.exit(1);
    }
}, 1000);
