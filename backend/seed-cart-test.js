// ไฟล์ seed data สำหรับทดสอบรถเข็น
// ใช้สำหรับเพิ่มข้อมูลตัวอย่างลงฐานข้อมูล

const mongoose = require('mongoose');
require('dotenv').config();

// ตั้งค่า Schema
const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    varietyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Variety', required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
}, { collection: 'carts', timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

async function seedCartData() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('✓ Connected to MongoDB');

        // ตัวอย่าง: อ่านค่าจาก argument
        const userId = process.argv[2];      // node seed-cart.js <userId> <shopId> <varietyId> <price>
        const shopId = process.argv[3];
        const varietyId = process.argv[4];
        const price = parseInt(process.argv[5]) || 500;

        if (!userId || !shopId || !varietyId) {
            console.log('Usage: node seed-cart.js <userId> <shopId> <varietyId> [price]');
            console.log('Example: node seed-cart.js 507f1f77bcf86cd799439011 507f1f77bcf86cd799439012 507f1f77bcf86cd799439013 500');
            process.exit(1);
        }

        const newCart = new Cart({
            userId: new mongoose.Types.ObjectId(userId),
            shopId: new mongoose.Types.ObjectId(shopId),
            varietyId: new mongoose.Types.ObjectId(varietyId),
            price: price,
            quantity: 1,
            status: 'pending'
        });

        const saved = await newCart.save();
        console.log('✓ Cart item added:', saved);

        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

seedCartData();
