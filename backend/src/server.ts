import 'dotenv/config';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Variety from './models/Variety';
import multer from 'multer'
import * as fs from 'fs'
import * as path from 'path'

const app = express();

app.use(cors());
app.use(express.json());
app.use('/images', express.static('images'));

// Ensure images/variety directory exists and configure multer storage
const imagesVarietyDir = path.join(process.cwd(), 'images', 'variety');
if (!fs.existsSync(imagesVarietyDir)) {
    fs.mkdirSync(imagesVarietyDir, { recursive: true });
}

const storage = multer.diskStorage({
    // use multer/express types now that @types/multer is installed
    destination: (_req: Request, _file: Express.Multer.File, cb: (err: Error | null, destination: string) => void) => cb(null, imagesVarietyDir),
    filename: (_req: Request, file: Express.Multer.File, cb: (err: Error | null, filename: string) => void) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
        cb(null, unique);
    }
});

const upload = multer({ storage });

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL!)
    .then(() => console.log('✓ Connected to MongoDB Atlas'))
    .catch((err) => console.error('MongoDB connection error:', err));

// ==================== READ APIs ====================

// API: Get all varieties
app.get('/api/varieties', async (_req: Request, res: Response) => {
    try {
        const varieties = await Variety.find()
            .sort({ createdAt: -1 })
            .lean();
        res.json(varieties);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'Database query error' });
    }
});

// API: Search varieties with filters (MUST be before /:id route)
app.get('/api/varieties/search', async (req: Request, res: Response) => {
    try {
        const { soil_type, pest, disease } = req.query;
        
        console.log('🔍 Backend received query params:', { soil_type, pest, disease });

        // Build filter dynamically
        const filter: any = {};
        if (soil_type) filter.soil_type = soil_type;
        // ใช้ $in เพื่อค้นหาใน array
        if (pest) filter.pest = { $in: [pest] };
        if (disease) filter.disease = { $in: [disease] };

        console.log('🎯 MongoDB filter:', JSON.stringify(filter, null, 2));

        const varieties = await Variety.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        console.log('✅ Found varieties:', varieties.length);

        res.json(varieties);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'Database query error' });
    }
});

// API: Get variety by ID (MUST be after /search route)
app.get('/api/varieties/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const variety = await Variety.findById(req.params.id).lean();
        
        if (!variety) {
            res.status(404).json({ error: 'Variety not found' });
            return;
        }
        
        res.json(variety);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'Database query error' });
    }
});

// ==================== CREATE API ====================

// API: Create new variety
// Support multipart/form-data (optional file) for create
app.post('/api/varieties', upload.single('variety_image'), async (req: Request, res: Response) => {
    try {
        // req.body will contain string values when multipart/form-data is used
        const body: any = req.body || {}
        const file = (req as any).file

        const parseArray = (val: any) => {
            if (!val) return []
            if (Array.isArray(val)) return val
            try { return JSON.parse(val) } catch { return String(val).split(',').map((s:string) => s.trim()).filter(Boolean) }
        }

        const newVarietyData: any = {
            name: body.name,
            description: body.description,
            soil_type: body.soil_type,
            pest: parseArray(body.pest),
            disease: parseArray(body.disease),
            yield: body.yield,
            age: body.age,
            sweetness: body.sweetness,
            variety_image: file ? file.filename : (body.variety_image || undefined),
            parent_varieties: body.parent_varieties,
            growth_characteristics: parseArray(body.growth_characteristics),
            planting_tips: parseArray(body.planting_tips),
            suitable_for: parseArray(body.suitable_for),
        }

        const newVariety = new Variety(newVarietyData);
        const savedVariety = await newVariety.save();

        res.status(201).json({
            message: 'Variety created successfully',
            data: savedVariety
        });
    } catch (err: any) {
        console.error('Database create error:', err);
        res.status(400).json({ 
            error: 'Failed to create variety',
            details: err.message 
        });
    }
});

// ==================== UPDATE API ====================

// API: Update variety by ID
// Support multipart/form-data (optional file) for update
app.put('/api/varieties/:id', upload.single('variety_image'), async (req: Request, res: Response): Promise<void> => {
    try {
        const body: any = req.body || {}
        const file = (req as any).file

        const parseArray = (val: any) => {
            if (!val) return undefined
            if (Array.isArray(val)) return val
            try { return JSON.parse(val) } catch { return String(val).split(',').map((s:string) => s.trim()).filter(Boolean) }
        }

        const updateData: any = {
            ...(body.name !== undefined && { name: body.name }),
            ...(body.description !== undefined && { description: body.description }),
            ...(body.soil_type !== undefined && { soil_type: body.soil_type }),
            ...(body.pest !== undefined && { pest: parseArray(body.pest) }),
            ...(body.disease !== undefined && { disease: parseArray(body.disease) }),
            ...(body.yield !== undefined && { yield: body.yield }),
            ...(body.age !== undefined && { age: body.age }),
            ...(body.sweetness !== undefined && { sweetness: body.sweetness }),
            ...(body.parent_varieties !== undefined && { parent_varieties: body.parent_varieties }),
            ...(body.growth_characteristics !== undefined && { growth_characteristics: parseArray(body.growth_characteristics) }),
            ...(body.planting_tips !== undefined && { planting_tips: parseArray(body.planting_tips) }),
            ...(body.suitable_for !== undefined && { suitable_for: parseArray(body.suitable_for) }),
        }

        if (file) {
            updateData.variety_image = file.filename
        }

        const updatedVariety = await Variety.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedVariety) {
            res.status(404).json({ error: 'Variety not found' });
            return;
        }

        res.json({
            message: 'Variety updated successfully',
            data: updatedVariety
        });
    } catch (err: any) {
        console.error('Database update error:', err);
        res.status(400).json({ 
            error: 'Failed to update variety',
            details: err.message 
        });
    }
});

// ==================== DELETE API ====================

// API: Delete variety by ID
app.delete('/api/varieties/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedVariety = await Variety.findByIdAndDelete(req.params.id);

        if (!deletedVariety) {
            res.status(404).json({ error: 'Variety not found' });
            return;
        }

        res.json({
            message: 'Variety deleted successfully',
            data: deletedVariety
        });
    } catch (err: any) {
        console.error('Database delete error:', err);
        res.status(500).json({ 
            error: 'Failed to delete variety',
            details: err.message 
        });
    }
});

// ==================== SEED DATA API (for testing) ====================

// API: Seed initial data
app.post('/api/seed', async (_req: Request, res: Response) => {
    try {
        // Clear existing data
        await Variety.deleteMany({});

        // Insert seed data
        const seedData = [
            {
                name: 'พันธุ์อ้อย เค 88-92',
                soil_type: 'ดินร่วนเหนียว',
                pest: 'หนอนเจาะลำต้น',
                disease: 'โรคใบขาว',
                yield: '15-16',
                age: '11-12',
                sweetness: '10-12',
                variety_image: 'sugarcane1.jpg',
                parent_varieties: 'F143 (แม่) X ROC1 (พ่อ)',
                growth_characteristics: [
                    'เจริญเติบโตเร็วในระยะแรก',
                    'ทนแล้งปานกลาง',
                    'แตกกอปานกลาง 5-6 ลำต่อกอ',
                    'เส้นผ่านศูนย์กลางลำ 2.6-2.8 ซม.'
                ],
                planting_tips: [
                    'เหมาะสำหรับพื้นที่ดินดีถึงปานกลาง',
                    'ควรใส่ปุ๋ยตามคำแนะนำ',
                    'ระบายน้ำให้ดี'
                ],
                suitable_for: [
                    'เหมาะกับการปลูกในพื้นที่ภาคกลาง',
                    'ให้ผลผลิตดีในดินที่มีความอุดมสมบูรณ์'
                ]
            },
            {
                name: 'พันธุ์อ้อย LK 92-11',
                soil_type: 'ดินร่วน',
                pest: 'หนอนกออ้อย',
                disease: 'เหี่ยวเน่าแดง',
                yield: '18-20',
                age: '12-14',
                sweetness: '11-13',
                variety_image: 'sugarcane2.jpg',
                parent_varieties: 'LCP 85-384 (แม่) X K 84-200 (พ่อ)',
                growth_characteristics: [
                    'เจริญเติบโตดีตลอดฤดู',
                    'ทนแล้งดี',
                    'แตกกอดี 7-9 ลำต่อกอ',
                    'ลำใหญ่ เส้นผ่านศูนย์กลาง 3.0-3.2 ซม.'
                ],
                planting_tips: [
                    'เหมาะสำหรับพื้นที่ดินดีและดินปานกลาง',
                    'ควรปลูกในพื้นที่ที่มีน้ำพอเพียง',
                    'ให้ผลผลิตสูง'
                ],
                suitable_for: [
                    'เหมาะสำหรับภาคตะวันออกเฉียงเหนือ',
                    'ให้ผลผลิตสูงและคุณภาพดี'
                ]
            },
            {
                name: 'พันธุ์อ้อย ขอนแก่น 3',
                soil_type: 'ดินร่วนทราย',
                pest: 'หวี่ขาว',
                disease: 'โรคแส้ดำ',
                yield: '14-15',
                age: '10-11',
                sweetness: '12-14',
                variety_image: 'sugarcane3.jpg',
                parent_varieties: 'CP 70-1133 (แม่) X Coimbatore (พ่อ)',
                growth_characteristics: [
                    'เจริญเติบโตเร็ว สามารถเก็บเกี่ยวได้เร็ว',
                    'ทนแล้งดีเยี่ยม',
                    'แตกกอปานกลาง 4-6 ลำต่อกอ',
                    'ความหวานสูง'
                ],
                planting_tips: [
                    'เหมาะสำหรับพื้นที่แล้ง',
                    'สามารถเก็บเกี่ยวได้เร็ว ประหยัดต้นทุน',
                    'เหมาะกับพื้นที่ที่มีน้ำจำกัด'
                ],
                suitable_for: [
                    'เหมาะสำหรับภาคอีสาน',
                    'พื้นที่ที่มีฝนน้อย'
                ]
            },
            {
                name: 'พันธุ์อ้อย อุตรดิตถ์ 1',
                soil_type: 'ดินร่วนเหนียว',
                pest: 'หนอนเจาะลำต้น',
                disease: 'โรคกอตะใคร้',
                yield: '16-18',
                age: '11-13',
                sweetness: '10-11',
                variety_image: 'sugarcane4.jpg',
                parent_varieties: 'UT 8 (แม่) X K 88-92 (พ่อ)',
                growth_characteristics: [
                    'เจริญเติบโตดีในพื้นที่เหนือ',
                    'ทนความเย็นได้ดี',
                    'แตกกอดี 6-8 ลำต่อกอ',
                    'ลำแข็งแรง ไม่ล้มง่าย'
                ],
                planting_tips: [
                    'เหมาะสำหรับภาคเหนือ',
                    'ทนต่ออุณหภูมิต่ำได้ดี',
                    'เหมาะกับพื้นที่ที่มีหมอกมาก'
                ],
                suitable_for: [
                    'เหมาะสำหรับภาคเหนือ',
                    'พื้นที่ที่มีอุณหภูมิต่ำในช่วงฤดูหนาว'
                ]
            },
            {
                name: 'พันธุ์อ้อย เชียงราย 60',
                soil_type: 'ดินร่วน',
                pest: 'หวี่ขาว',
                disease: 'โรคจุดใบเหลือง',
                yield: '17-19',
                age: '12-13',
                sweetness: '13-15',
                variety_image: 'sugarcane5.jpg',
                parent_varieties: 'K 84-200 (แม่) X CR 74-250 (พ่อ)',
                growth_characteristics: [
                    'เจริญเติบโตดีมาก',
                    'ทนแล้งและทนน้ำท่วม',
                    'แตกกอดีมาก 8-10 ลำต่อกอ',
                    'ความหวานสูงมาก'
                ],
                planting_tips: [
                    'เหมาะสำหรับพื้นที่ภาคเหนือตอนบน',
                    'ให้ผลผลิตสูงและคุณภาพดีเยี่ยม',
                    'เหมาะกับการทำน้ำตาล'
                ],
                suitable_for: [
                    'เหมาะสำหรับภาคเหนือ โดยเฉพาะเชียงราย',
                    'พื้นที่ที่ต้องการผลผลิตสูงและความหวานสูง'
                ]
            },
            {
                name: 'พันธุ์อ้อย สุพรรณบุรี 90',
                soil_type: 'ดินร่วน',
                pest: 'หนอนกออ้อย',
                disease: 'โรคแส้ดำ',
                yield: '19-21',
                age: '12-14',
                sweetness: '11-12',
                variety_image: 'sugarcane6.jpg',
                parent_varieties: 'Q 117 (แม่) X SP 70-1143 (พ่อ)',
                growth_characteristics: [
                    'เจริญเติบโตแข็งแรง',
                    'ทนแล้งปานกลาง',
                    'แตกกอดีมาก 9-11 ลำต่อกอ',
                    'ลำใหญ่มาก เส้นผ่านศูนย์กลาง 3.2-3.5 ซม.'
                ],
                planting_tips: [
                    'เหมาะสำหรับพื้นที่ภาคกลาง',
                    'ให้ผลผลิตสูงที่สุดในกลุ่ม',
                    'ต้องการน้ำและปุ๋ยเพียงพอ'
                ],
                suitable_for: [
                    'เหมาะสำหรับภาคกลาง โดยเฉพาะสุพรรณบุรี',
                    'พื้นที่ที่ต้องการผลผลิตสูงสุด'
                ]
            }
        ];

        const inserted = await Variety.insertMany(seedData);

        res.json({
            message: 'Seed data inserted successfully',
            count: inserted.length,
            data: inserted
        });
    } catch (err: any) {
        console.error('Seed error:', err);
        res.status(500).json({ 
            error: 'Failed to seed data',
            details: err.message 
        });
    }
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API Endpoints:`);
    console.log(`   GET    /api/varieties          - Get all varieties`);
    console.log(`   GET    /api/varieties/:id      - Get variety by ID`);
    console.log(`   GET    /api/varieties/search   - Search varieties`);
    console.log(`   POST   /api/varieties          - Create new variety`);
    console.log(`   PUT    /api/varieties/:id      - Update variety`);
    console.log(`   DELETE /api/varieties/:id      - Delete variety`);
    console.log(`   POST   /api/seed               - Seed initial data`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
    process.exit(0);
});
