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
        console.log('📝 กำลังเพิ่ม description...');
        
        // Update descriptions for new varieties
        const descriptions = {
            'พันธุ์อ้อย สุโขทัย 1': 'พันธุ์อ้อยที่เหมาะสำหรับการปลูกในภาคกลางและจังหวัดสุโขทัย มีความเจริญเติบโตดี ให้ผลผลิตสูง และมีความทนทานต่อสภาพอากาศ สายพันธุ์นี้ให้ผลผลิด 16-17 ตัน/ไร่ และมีความหวาน 10-11 CCS เหมาะสำหรับการค้นหาเมล็ดพันธุ์คุณภาพดี',
            'พันธุ์อ้อย ตาก 2': 'พันธุ์อ้อยที่พัฒนาขึ้นมาเพื่อเหมาะกับภาคเหนือโดยเฉพาะจังหวัดตาก มีความทนแล้งดีและให้ผลผลิตสูง 17-19 ตัน/ไร่ ความหวาน 11-12 CCS เหมาะสำหรับพื้นที่ที่มีความชื้นปานกลางและดินร่วนทรายที่ระบายน้ำดี',
            'พันธุ์อ้อย แม่ฮ่องสอน 3': 'พันธุ์อ้อยที่เชื่อว่าเหมาะสำหรับพื้นที่ภาคเหนือ โดยเฉพาะจังหวัดแม่ฮ่องสอนที่มีความชื้นสูง ทนต่อน้ำมากได้ และให้ผลผลิต 15-16 ตัน/ไร่ ความหวาน 10-12 CCS สายพันธุ์นี้มีความแข็งแรงและเหมาะสำหรับการปลูกในพื้นที่สูงและมีภูมิอากาศที่แตกต่าง'
        };
        
        let updatedCount = 0;
        for (const [name, desc] of Object.entries(descriptions)) {
            const result = await Variety.updateMany(
                { name: name },
                { description: desc }
            );
            updatedCount += result.modifiedCount;
        }
        console.log(`✅ เพิ่ม description สำเร็จ ${updatedCount} รายการ`);
        
        // Get Tak 2 variety ID and all shops
        console.log('\n🔍 ค้นหาพันธุ์อ้อย ตาก 2 และร้านค้า...');
        const takVariety = await Variety.findOne({ name: 'พันธุ์อ้อย ตาก 2' });
        const shops = await Shop.find();
        
        if (!takVariety) {
            console.error('❌ ไม่พบพันธุ์อ้อย ตาก 2');
            process.exit(1);
        }
        
        console.log(`✓ พบพันธุ์อ้อย ตาก 2: ${takVariety._id}`);
        console.log(`✓ พบร้านค้า ${shops.length} แห่ง`);
        
        // Add Tak 2 to all shops that don't have it yet
        console.log('\n📦 เพิ่มพันธุ์อ้อย ตาก 2 ให้ร้านค้าที่ยังไม่มี...');
        let addedCount = 0;
        
        for (const shop of shops) {
            const exists = await ShopInventory.findOne({
                shopId: shop._id,
                varietyId: takVariety._id
            });
            
            if (!exists) {
                const price = Math.floor(Math.random() * 1000) + 2500;
                const status = Math.random() > 0.2 ? 'available' : 'out_of_stock';
                const quantity = Math.floor(Math.random() * 150) + 50;
                
                await ShopInventory.create({
                    shopId: shop._id,
                    varietyId: takVariety._id,
                    price,
                    status,
                    quantity
                });
                
                console.log(`  ✓ เพิ่ม ${shop.shopName} - ราคา ${price} บาท (${status})`);
                addedCount++;
            }
        }
        
        console.log(`\n✅ เพิ่ม inventory สำเร็จ ${addedCount} รายการ`);
        
        console.log('\n📊 สรุป:');
        console.log(`✅ เพิ่ม description ให้พันธุ์อ้อยใหม่ 3 พันธุ์`);
        console.log(`✅ เพิ่มพันธุ์อ้อย ตาก 2 ให้ร้านค้าทั้งหมด`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error.message);
        process.exit(1);
    }
}, 1000);
