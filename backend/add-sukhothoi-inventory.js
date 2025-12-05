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
        console.log('📦 เพิ่ม inventory สำหรับพันธุ์อ้อย สุโขทัย 1...\n');
        
        // Get Sukhothoi 1 variety
        const sukhothoi = await Variety.findOne({ name: 'พันธุ์อ้อย สุโขทัย 1' });
        const shops = await Shop.find();
        
        if (!sukhothoi) {
            console.error('❌ ไม่พบพันธุ์อ้อย สุโขทัย 1');
            process.exit(1);
        }
        
        console.log(`✓ พบพันธุ์อ้อย: ${sukhothoi.name} (ID: ${sukhothoi._id})`);
        console.log(`✓ พบร้านค้า: ${shops.length} แห่ง\n`);
        
        // Add to all shops
        console.log('📝 เพิ่ม inventory:\n');
        let addedCount = 0;
        
        for (const shop of shops) {
            const exists = await ShopInventory.findOne({
                shopId: shop._id,
                varietyId: sukhothoi._id
            });
            
            if (exists) {
                console.log(`⚠️  ${shop.shopName} - มีอยู่แล้ว`);
            } else {
                const price = Math.floor(Math.random() * 1000) + 2500;
                const status = Math.random() > 0.2 ? 'available' : 'out_of_stock';
                const quantity = Math.floor(Math.random() * 150) + 50;
                
                await ShopInventory.create({
                    shopId: shop._id,
                    varietyId: sukhothoi._id,
                    price,
                    status,
                    quantity
                });
                
                console.log(`✅ ${shop.shopName} - ราคา ${price} บาท (${status})`);
                addedCount++;
            }
        }
        
        console.log(`\n✅ เพิ่ม inventory สำเร็จ ${addedCount} รายการ`);
        process.exit(0);
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error.message);
        process.exit(1);
    }
}, 1000);
