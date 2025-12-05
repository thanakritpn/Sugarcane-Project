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

const Variety = mongoose.model('Variety', varietySchema);

setTimeout(async () => {
    try {
        const varieties = await Variety.find({ 
            name: { $regex: 'สุโขทัย|ตาก|แม่ฮ่องสอน' } 
        });
        
        console.log('\n📊 พบพันธุ์อ้อย:');
        varieties.forEach(v => {
            console.log(`  - ${v.name}`);
            console.log(`    ID: ${v._id}`);
            console.log('');
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error.message);
        process.exit(1);
    }
}, 1000);
