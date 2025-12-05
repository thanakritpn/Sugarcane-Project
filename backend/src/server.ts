import 'dotenv/config';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Variety from './models/Variety';
import User from './models/User';
import Favorite from './models/Favorite';
import Shop from './models/Shop';
import ShopInventory from './models/ShopInventory';
import Cart from './models/Cart';
import bcrypt from 'bcryptjs';
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

// Ensure images/users directory exists
const imagesUsersDir = path.join(process.cwd(), 'images', 'users');
if (!fs.existsSync(imagesUsersDir)) {
    fs.mkdirSync(imagesUsersDir, { recursive: true });
}

// Ensure images/shops directory exists
const imagesShopsDir = path.join(process.cwd(), 'images', 'shops');
if (!fs.existsSync(imagesShopsDir)) {
    fs.mkdirSync(imagesShopsDir, { recursive: true });
}

const storage = multer.diskStorage({
    // use multer/express types now that @types/multer is installed
    destination: (_req: Request, _file: Express.Multer.File, cb: (err: Error | null, destination: string) => void) => cb(null, imagesVarietyDir),
    filename: (_req: Request, file: Express.Multer.File, cb: (err: Error | null, filename: string) => void) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
        cb(null, unique);
    }
});

// User profile image storage
const userStorage = multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb: (err: Error | null, destination: string) => void) => cb(null, imagesUsersDir),
    filename: (_req: Request, file: Express.Multer.File, cb: (err: Error | null, filename: string) => void) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
        cb(null, unique);
    }
});

// Shop image storage
const shopStorage = multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb: (err: Error | null, destination: string) => void) => cb(null, imagesShopsDir),
    filename: (_req: Request, file: Express.Multer.File, cb: (err: Error | null, filename: string) => void) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
        cb(null, unique);
    }
});

const upload = multer({ storage });
const userUpload = multer({ storage: userStorage });
const shopUpload = multer({ storage: shopStorage });

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL!)
    .then(async () => {
        console.log('✓ Connected to MongoDB Atlas');
        
        // Ensure admin user exists on startup
        try {
            const adminExists = await User.findOne({ role: 'Admin' });
            if (!adminExists) {
                console.log('➕ Creating default admin user...');
                const salt = await bcrypt.genSalt(12);
                const hashedPassword = await bcrypt.hash('admin_12345678', salt);
                
                const newAdmin = new User({
                    username: 'admin',
                    email: 'admin@gmail.com',
                    password: hashedPassword,
                    role: 'Admin',
                    profile_image: ''
                });
                
                await newAdmin.save();
                console.log('✅ Default admin user created');
                console.log('   Username: admin');
                console.log('   Password: admin_12345678');
            } else {
                console.log('✅ Admin user already exists');
            }
        } catch (error) {
            console.error('❌ Error checking/creating admin:', error);
        }
    })
    .catch((err) => console.error('MongoDB connection error:', err));

// ==================== READ APIs ====================

// API: Get all users
app.get('/api/users', async (_req: Request, res: Response) => {
    try {
        const users = await User.find()
            .select('username email role profile_image createdAt')
            .sort({ createdAt: -1 })
            .lean();
        res.json(users);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'Database query error' });
    }
});

// API: Get user by ID
app.get('/api/users/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id)
            .select('username email role createdAt')
            .lean();
        
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        
        res.json(user);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'Database query error' });
    }
});

// API: Check if username exists
app.post('/api/users/check-username', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, excludeId } = req.body;
        
        if (!username) {
            res.status(400).json({ error: 'Username is required' });
            return;
        }
        
        // Build query to exclude current user if editing
        const query: any = { username };
        if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
            query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
        }
        
        const existingUser = await User.findOne(query);
        
        res.json({ exists: !!existingUser });
    } catch (err) {
        console.error('Error checking username:', err);
        res.status(500).json({ error: 'Failed to check username' });
    }
});

// API: Check if email exists
app.post('/api/users/check-email', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, excludeId } = req.body;
        
        if (!email) {
            res.status(400).json({ error: 'Email is required' });
            return;
        }
        
        // Build query to exclude current user if editing
        const query: any = { email };
        if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
            query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
        }
        
        const existingUser = await User.findOne(query);
        
        res.json({ exists: !!existingUser });
    } catch (err) {
        console.error('Error checking email:', err);
        res.status(500).json({ error: 'Failed to check email' });
    }
});

// API: Admin login authentication
app.post('/api/auth/admin-login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
            return;
        }
        
        // Find user by username or email (accept both)
        const user = await User.findOne({
            $or: [
                { username: username },
                { email: username }  // Allow email as input too
            ]
        }).select('+password');
        
        if (!user) {
            res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
            return;
        }
        
        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
            return;
        }
        
        // Check if user has Admin role
        if (user.role !== 'Admin') {
            res.status(403).json({ error: 'คุณไม่มีสิทธิ์เข้าถึงระบบจัดการ Admin เท่านั้น' });
            return;
        }
        
        // Successful login
        res.json({
            message: 'เข้าสู่ระบบสำเร็จ',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profile_image: user.profile_image
            }
        });
        
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
    }
});

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
        const { soil_type, pest, disease, name } = req.query;
        
        console.log('🔍 Backend received query params:', { soil_type, pest, disease, name });

        // Build filter dynamically
        const filter: any = {};
        if (soil_type) filter.soil_type = soil_type;
        // ใช้ $in เพื่อค้นหาใน array
        if (pest) filter.pest = { $in: [pest] };
        if (disease) filter.disease = { $in: [disease] };
        // Add name/text search using regex for case-insensitive matching
        if (name) filter.name = { $regex: name, $options: 'i' };

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

// API: Create new user
app.post('/api/users', userUpload.single('profile_image'), async (req: Request, res: Response) => {
    try {
        const body: any = req.body || {};
        const file = (req as any).file;

        console.log('Creating new user with data:', { username: body.username, email: body.email, role: body.role, hasFile: !!file });

        // Check if username or email already exists
        const existingUser = await User.findOne({
            $or: [{ username: body.username }, { email: body.email }]
        });

        if (existingUser) {
            console.error('User already exists:', { username: body.username, email: body.email });
            res.status(400).json({ error: 'Username or email already exists' });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(body.password, salt);

        const newUserData: any = {
            username: body.username,
            email: body.email,
            password: hashedPassword,
            role: body.role || 'User',
            profile_image: file ? file.filename : '',
        };

        const newUser = new User(newUserData);
        const savedUser = await newUser.save();
        console.log('User saved to database:', savedUser._id, { username: savedUser.username, email: savedUser.email });

        res.status(201).json({
            message: 'User created successfully',
            data: {
                _id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                role: savedUser.role,
                profile_image: savedUser.profile_image,
                createdAt: savedUser.createdAt,
            }
        });
    } catch (err: any) {
        console.error('Error creating user:', err);
        res.status(500).json({
            error: 'Failed to create user',
            details: err.message
        });
    }
});

// API: Update user
app.put('/api/users/:id', userUpload.single('profile_image'), async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const body: any = req.body || {};
        const file = (req as any).file;

        console.log('Updating user with ID:', userId);
        console.log('Request body:', body);

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error('Invalid user ID format:', userId);
            res.status(400).json({ error: 'Invalid user ID format' });
            return;
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            console.error('User not found with ID:', userId);
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Update basic fields
        if (body.username) user.username = body.username;
        if (body.email) user.email = body.email;
        if (body.role) user.role = body.role;

        // Update password if provided
        if (body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(body.password, salt);
        }

        // Update profile image if provided
        if (file) {
            user.profile_image = file.filename;
        }

        const updatedUser = await user.save();
        console.log('User updated successfully:', updatedUser._id);

        res.status(200).json({
            message: 'User updated successfully',
            data: {
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                profile_image: updatedUser.profile_image,
                createdAt: updatedUser.createdAt,
            }
        });
    } catch (err: any) {
        console.error('Error updating user:', err);
        res.status(500).json({
            error: 'Failed to update user',
            details: err.message
        });
    }
});

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

// API: Delete user
app.delete('/api/users/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.id;
        console.log('Deleting user with ID:', userId);

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error('Invalid user ID format:', userId);
            res.status(400).json({ error: 'Invalid user ID format' });
            return;
        }

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            console.error('User not found with ID:', userId);
            res.status(404).json({ error: 'User not found' });
            return;
        }

        console.log('User deleted successfully:', userId);
        res.json({
            message: 'User deleted successfully',
            data: deletedUser
        });
    } catch (err: any) {
        console.error('Database delete error:', err);
        res.status(500).json({ 
            error: 'Failed to delete user',
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

// ==================== USER AUTH ====================

// Ensure initial users exist (create on startup if not present)
async function ensureInitialUser() {
    try {
        const users = [
            { email: 'aofza1508@gmail.com', username: 'aofza', name: 'aofza', password: '111111' },
            { email: 'jeeranan.prak@gmail.com', username: 'jeerananmail', name: 'jeeranan', password: '111111' }
        ];

        for (const userData of users) {
            const existing = await User.findOne({ $or: [{ email: userData.email }, { username: userData.username }] });
            if (!existing) {
                const hashed = await bcrypt.hash(userData.password, 10);
                const u = new User({ 
                  email: userData.email, 
                  username: userData.username,
                  name: userData.name,
                  password: hashed 
                });
                await u.save();
                console.log(`✓ Seeded user: ${userData.email} (${userData.username})`);
            } else {
                console.log(`User already exists: ${userData.email}`);
            }
        }
    } catch (err) {
        console.error('Error ensuring initial users:', err);
    }
}

ensureInitialUser();

// Ensure user indexes are correct (without dropping data)
async function ensureUserIndexes() {
    try {
        // IMPORTANT: Do NOT drop the User collection as it will destroy all data including admin user!
        // Just ensure the indexes exist
        
        // Create indexes without dropping collection
        // If index already exists, this will be a no-op
        try {
            await User.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
        } catch (err: any) {
            // Index may already exist, ignore conflict error
            if (err.code !== 86) { // 86 = IndexKeySpecsConflict
                throw err;
            }
        }
        
        try {
            await User.collection.createIndex({ username: 1 }, { unique: true, sparse: true });
        } catch (err: any) {
            // Index may already exist, ignore conflict error
            if (err.code !== 86) { // 86 = IndexKeySpecsConflict
                throw err;
            }
        }
        
        console.log('✓ Ensured User indexes (email, username)');
    } catch (err) {
        console.error('Error ensuring user indexes:', err);
    }
}

ensureUserIndexes();

// Ensure favorite indexes are correct (compound unique on userId + varietyId).
async function ensureFavoriteIndexes() {
    try {
        // list existing indexes on favorites collection
        const indexes = await Favorite.collection.indexes();
        for (const idx of indexes) {
            if (!idx.key) continue;
            const keyNames = Object.keys(idx.key);

            // skip the default _id_ index
            if (keyNames.length === 1 && keyNames[0] === '_id') continue;

            // If an index uses old/wrong field names like 'user' or 'variety', drop it.
            if (keyNames.includes('user') || keyNames.includes('variety')) {
                if (!idx.name) continue;
                try {
                    await Favorite.collection.dropIndex(idx.name as string);
                    console.log(`✓ Dropped old/bad index on favorites: ${idx.name} (keys: ${keyNames.join(',')})`);
                } catch (dropErr) {
                    console.warn('Could not drop index', idx.name, dropErr);
                }
                continue;
            }

            // If there's a unique index on only userId (or any unexpected unique index), drop it to avoid blocking inserts
            if (idx.unique && !(keyNames.length === 2 && keyNames.includes('userId') && keyNames.includes('varietyId'))) {
                if (!idx.name) continue;
                try {
                    await Favorite.collection.dropIndex(idx.name as string);
                    console.log(`✓ Dropped unexpected unique index on favorites: ${idx.name} (keys: ${keyNames.join(',')})`);
                } catch (dropErr) {
                    console.warn('Could not drop index', idx.name, dropErr);
                }
            }
        }

        // create compound unique index on the correct fields
        await Favorite.collection.createIndex({ userId: 1, varietyId: 1 }, { unique: true });
        console.log('✓ Ensured compound unique index on favorites (userId + varietyId)');
    } catch (err) {
        console.error('Error ensuring favorite indexes:', err);
    }
}

ensureFavoriteIndexes();

// API: POST /api/auth/login
app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            res.status(400).json({ error: 'Missing email or password' });
            return;
        }

        const user = await User.findOne({ email: String(email).toLowerCase().trim() });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const match = await bcrypt.compare(String(password), user.password);
        if (!match) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // For simplicity return basic user info (no token). Frontend will store user in localStorage.
        // Include the user's _id so frontend can use it as userId for favorites
        res.json({ email: user.email, id: user._id });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// API: POST /api/auth/register
app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
        const { email, username, name, password, confirmPassword } = req.body || {};

        // Validation
        if (!email || !username || !password || !confirmPassword) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        if (password !== confirmPassword) {
            res.status(400).json({ error: 'Passwords do not match' });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters' });
            return;
        }

        // Check if user already exists
        const existing = await User.findOne({ 
            $or: [
                { email: String(email).toLowerCase().trim() },
                { username: String(username).trim() }
            ]
        });

        if (existing) {
            if (existing.email === String(email).toLowerCase().trim()) {
                res.status(400).json({ error: 'Email already registered' });
            } else {
                res.status(400).json({ error: 'Username already taken' });
            }
            return;
        }

        // Hash password and create user
        const hashed = await bcrypt.hash(String(password), 10);
        const newUser = new User({
            email: String(email).toLowerCase().trim(),
            username: String(username).trim(),
            name: String(name || '').trim(),
            password: hashed
        });

        const savedUser = await newUser.save();

        // Return user info
        res.status(201).json({
            message: 'User registered successfully',
            email: savedUser.email,
            id: savedUser._id
        });
    } catch (err: any) {
        console.error('Register error:', err);
        res.status(500).json({ 
            error: 'Failed to register',
            details: err.message 
        });
    }
});

// ==================== FAVORITE APIs ====================

// API: Get user's favorites
app.get('/api/favorites/:userId', async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            res.status(400).json({ error: 'userId is required' });
            return;
        }

        // Find favorite records for the user, then return the full variety objects
        const favorites = await Favorite.find({ userId }).lean();
        const varietyIds = favorites.map(fav => fav.varietyId).filter(Boolean);

        // If there are no favorites, return empty array
        if (varietyIds.length === 0) {
            res.json({ message: 'Favorites retrieved successfully', data: [] });
            return;
        }

        // Fetch variety documents for these ids
        const varieties = await Variety.find({ _id: { $in: varietyIds } }).lean();

        res.json({
            message: 'Favorites retrieved successfully',
            data: varieties
        });
    } catch (err: any) {
        console.error('Get favorites error:', err);
        res.status(500).json({ 
            error: 'Failed to get favorites',
            details: err.message 
        });
    }
});

// API: Add favorite
app.post('/api/favorites', async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, varietyId } = req.body || {};

        if (!userId || !varietyId) {
            res.status(400).json({ error: 'userId and varietyId are required' });
            return;
        }

        // Check if variety exists
        const variety = await Variety.findById(varietyId);
        if (!variety) {
            res.status(404).json({ error: 'Variety not found' });
            return;
        }

        console.log('POST /api/favorites body:', { userId, varietyId });

        // Use upsert to avoid duplicate key errors and make the operation idempotent.
        const result = await Favorite.findOneAndUpdate(
            { userId, varietyId },
            { $setOnInsert: { userId, varietyId } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).lean();

        res.status(200).json({
            message: 'Favorite added (or already exists)',
            data: result
        });
    } catch (err: any) {
        console.error('Add favorite error:', err);
        // provide detailed error info for debugging
        const code = err?.code || null;
        const message = err?.message || String(err);
        res.status(500).json({
            error: 'Failed to add favorite',
            details: { code, message }
        });
    }
});

// API: Remove favorite
app.delete('/api/favorites/:userId/:varietyId', async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, varietyId } = req.params;

        if (!userId || !varietyId) {
            res.status(400).json({ error: 'userId and varietyId are required' });
            return;
        }

        const result = await Favorite.findOneAndDelete({ userId, varietyId });

        if (!result) {
            res.status(404).json({ error: 'Favorite not found' });
            return;
        }

        res.json({
            message: 'Favorite removed successfully',
            data: result
        });
    } catch (err: any) {
        console.error('Remove favorite error:', err);
        res.status(500).json({ 
            error: 'Failed to remove favorite',
            details: err.message 
        });
    }
});

// ==================== SHOP APIs ====================

// API: Register new shop
// ==================== SHOP APIs ====================

// API: Create shop (for admin panel)
app.post('/api/shops', userUpload.single('shop_image'), async (req: Request, res: Response) => {
    try {
        const { username, email, password, shopName, phone, address, district, province } = req.body;
        const file = (req as any).file;

        if (!username || !email || !password || !shopName || !phone || !address || !district || !province) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        // Check if shop already exists
        const existingShop = await Shop.findOne({ $or: [{ email }, { username }] });
        if (existingShop) {
            res.status(409).json({ error: 'Shop already exists' });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newShopData: any = {
            username,
            email,
            password: hashedPassword,
            shopName,
            phone,
            address,
            district,
            province,
        };

        if (file) {
            newShopData.shop_image = file.filename;
        }

        const newShop = new Shop(newShopData);
        const savedShop = await newShop.save();

        res.status(201).json({
            message: 'Shop created successfully',
            data: {
                _id: savedShop._id,
                username: savedShop.username,
                email: savedShop.email,
                shopName: savedShop.shopName,
                phone: savedShop.phone,
                address: savedShop.address,
                district: savedShop.district,
                province: savedShop.province,
                shop_image: savedShop.shop_image,
            }
        });
    } catch (err: any) {
        console.error('Create shop error:', err);
        res.status(500).json({ 
            error: 'Failed to create shop',
            details: err.message 
        });
    }
});

// API: Register new shop
app.post('/api/shops/register', shopUpload.single('shop_image'), async (req: Request, res: Response) => {
    try {
        const { username, email, password, shopName, phone, address, district, province } = req.body;
        const file = (req as any).file;

        if (!username || !email || !password || !shopName || !phone || !address || !district || !province) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        // Check if shop already exists
        const existingShop = await Shop.findOne({ $or: [{ email }, { username }] });
        if (existingShop) {
            res.status(409).json({ error: 'Shop already exists' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new shop
        const newShop = new Shop({
            username,
            email,
            password: hashedPassword,
            shopName,
            phone,
            address,
            district,
            province,
            shop_image: file ? file.filename : ''
        });

        await newShop.save();

        // Return the complete shop data (without password)
        const shopData = {
            _id: newShop._id,
            username: newShop.username,
            email: newShop.email,
            shopName: newShop.shopName,
            phone: newShop.phone,
            address: newShop.address,
            district: newShop.district,
            province: newShop.province,
            shop_image: newShop.shop_image,
            createdAt: newShop.createdAt,
            updatedAt: newShop.updatedAt,
        };

        res.status(201).json({
            message: 'Shop registered successfully',
            data: shopData
        });
    } catch (err: any) {
        console.error('Register shop error:', err);
        res.status(500).json({ 
            error: 'Failed to register shop',
            details: err.message 
        });
    }
});

// API: Login shop
app.post('/api/shops/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const shop = await Shop.findOne({ email });
        if (!shop) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, shop.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        res.json({
            message: 'Login successful',
            data: {
                _id: shop._id,
                username: shop.username,
                email: shop.email,
                shopName: shop.shopName,
                phone: shop.phone,
                address: shop.address,
                district: shop.district,
                province: shop.province,
            }
        });
    } catch (err: any) {
        console.error('Login shop error:', err);
        res.status(500).json({ 
            error: 'Failed to login',
            details: err.message 
        });
    }
});

// API: Get all shops
app.get('/api/shops', async (_req: Request, res: Response) => {
    try {
        const shops = await Shop.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .lean();
        res.json(shops);
    } catch (err: any) {
        console.error('Get shops error:', err);
        res.status(500).json({ 
            error: 'Failed to fetch shops',
            details: err.message 
        });
    }
});

// API: Get shop by ID
app.get('/api/shops/:id', async (req: Request, res: Response) => {
    try {
        const shop = await Shop.findById(req.params.id).select('-password').lean();
        if (!shop) {
            res.status(404).json({ error: 'Shop not found' });
            return;
        }
        res.json(shop);
    } catch (err: any) {
        console.error('Get shop error:', err);
        res.status(500).json({ 
            error: 'Failed to fetch shop',
            details: err.message 
        });
    }
});

// API: Update shop info
app.put('/api/shops/:id', shopUpload.single('shop_image'), async (req: Request, res: Response) => {
    try {
        const { shopName, phone, address, district, province } = req.body;
        const file = (req as any).file;
        
        const updateData: any = { shopName, phone, address, district, province };
        if (file) {
            updateData.shop_image = file.filename;
        }

        const updatedShop = await Shop.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-password');

        if (!updatedShop) {
            res.status(404).json({ error: 'Shop not found' });
            return;
        }

        res.json({
            message: 'Shop updated successfully',
            data: updatedShop
        });
    } catch (err: any) {
        console.error('Update shop error:', err);
        res.status(500).json({ 
            error: 'Failed to update shop',
            details: err.message 
        });
    }
});

// API: Delete shop
app.delete('/api/shops/:id', async (req: Request, res: Response) => {
    try {
        const shopId = req.params.id;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(shopId)) {
            res.status(400).json({ error: 'Invalid shop ID format' });
            return;
        }

        const deletedShop = await Shop.findByIdAndDelete(shopId);
        
        if (!deletedShop) {
            res.status(404).json({ error: 'Shop not found' });
            return;
        }

        // Also delete related shop inventory
        await ShopInventory.deleteMany({ shopId });

        res.json({
            message: 'Shop deleted successfully',
            data: { _id: deletedShop._id, shopName: deletedShop.shopName }
        });
    } catch (err: any) {
        console.error('Delete shop error:', err);
        res.status(500).json({ 
            error: 'Failed to delete shop',
            details: err.message 
        });
    }
});

// ==================== SHOP INVENTORY APIs ====================

// API: Add variety to shop inventory
app.post('/api/shop-inventory', async (req: Request, res: Response) => {
    try {
        const { shopId, varietyId, price, status, quantity } = req.body;

        if (!shopId || !varietyId || price === undefined) {
            res.status(400).json({ error: 'shopId, varietyId, and price are required' });
            return;
        }

        // Check if variety already in shop inventory
        const existingInventory = await ShopInventory.findOne({ shopId, varietyId });
        if (existingInventory) {
            res.status(409).json({ error: 'Variety already in shop inventory' });
            return;
        }

        const newInventory = new ShopInventory({
            shopId,
            varietyId,
            price,
            status: status || 'available',
            quantity,
        });

        await newInventory.save();

        res.status(201).json({
            message: 'Variety added to inventory successfully',
            data: newInventory
        });
    } catch (err: any) {
        console.error('Add inventory error:', err);
        res.status(500).json({ 
            error: 'Failed to add inventory',
            details: err.message 
        });
    }
});

// API: Get shop inventory (with variety details)
app.get('/api/shops/:shopId/inventory', async (req: Request, res: Response) => {
    try {
        const inventory = await ShopInventory.find({ shopId: req.params.shopId })
            .populate('varietyId')
            .sort({ createdAt: -1 })
            .lean();
        
        res.json(inventory);
    } catch (err: any) {
        console.error('Get inventory error:', err);
        res.status(500).json({ 
            error: 'Failed to fetch inventory',
            details: err.message 
        });
    }
});

// API: Update inventory (price/status/quantity)
app.put('/api/shop-inventory/:id', async (req: Request, res: Response) => {
    try {
        const { price, status, quantity } = req.body;

        const updatedInventory = await ShopInventory.findByIdAndUpdate(
            req.params.id,
            { price, status, quantity },
            { new: true }
        ).populate('varietyId');

        if (!updatedInventory) {
            res.status(404).json({ error: 'Inventory item not found' });
            return;
        }

        res.json({
            message: 'Inventory updated successfully',
            data: updatedInventory
        });
    } catch (err: any) {
        console.error('Update inventory error:', err);
        res.status(500).json({ 
            error: 'Failed to update inventory',
            details: err.message 
        });
    }
});

// API: Remove variety from shop inventory
app.delete('/api/shop-inventory/:id', async (req: Request, res: Response) => {
    try {
        const result = await ShopInventory.findByIdAndDelete(req.params.id);

        if (!result) {
            res.status(404).json({ error: 'Inventory item not found' });
            return;
        }

        res.json({
            message: 'Inventory item removed successfully',
            data: result
        });
    } catch (err: any) {
        console.error('Delete inventory error:', err);
        res.status(500).json({ 
            error: 'Failed to delete inventory',
            details: err.message 
        });
    }
});

// API: Get all shop inventories (for searching by variety)
app.get('/api/shop-inventory/variety/:varietyId', async (req: Request, res: Response) => {
    try {
        const inventories = await ShopInventory.find({ varietyId: req.params.varietyId })
            .populate('shopId', '-password')
            .sort({ price: 1 })
            .lean();
        
        res.json(inventories);
    } catch (err: any) {
        console.error('Get variety inventories error:', err);
        res.status(500).json({ 
            error: 'Failed to fetch inventories',
            details: err.message 
        });
    }
});

// ==================== CART APIs ====================

// API: Add item to cart
app.post('/api/cart', async (req: Request, res: Response) => {
    try {
        const { userId, shopId, varietyId, price, quantity } = req.body;

        if (!userId || !shopId || !varietyId || !price || !quantity) {
            res.status(400).json({ error: 'userId, shopId, varietyId, price, and quantity are required' });
            return;
        }

        // Check if item already in cart for this user, shop, and variety
        const existingCart = await Cart.findOne({ userId, shopId, varietyId });
        
        if (existingCart) {
            // Update quantity if already exists
            existingCart.quantity += Number(quantity);
            await existingCart.save();
            res.json({
                message: 'Item quantity updated in cart',
                data: existingCart
            });
            return;
        }

        // Create new cart item
        const newCart = new Cart({
            userId,
            shopId,
            varietyId,
            price: Number(price),
            quantity: Number(quantity),
            status: 'pending'
        });

        await newCart.save();

        res.status(201).json({
            message: 'Item added to cart successfully',
            data: newCart
        });
    } catch (err: any) {
        console.error('Add to cart error:', err);
        res.status(500).json({ 
            error: 'Failed to add item to cart',
            details: err.message 
        });
    }
});

// API: Get user's cart
app.get('/api/cart/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            res.status(400).json({ error: 'userId is required' });
            return;
        }

        const cartItems = await Cart.find({ userId })
            .populate('varietyId')
            .populate('shopId', '-password')
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            message: 'Cart items retrieved successfully',
            data: cartItems
        });
    } catch (err: any) {
        console.error('Get cart error:', err);
        res.status(500).json({ 
            error: 'Failed to fetch cart',
            details: err.message 
        });
    }
});

// API: Update cart item
app.put('/api/cart/:cartId', async (req: Request, res: Response) => {
    try {
        const { quantity, status } = req.body;

        const updateData: any = {};
        if (quantity !== undefined) updateData.quantity = Number(quantity);
        if (status !== undefined) updateData.status = status;

        const updatedCart = await Cart.findByIdAndUpdate(
            req.params.cartId,
            updateData,
            { new: true }
        ).populate('varietyId').populate('shopId', '-password');

        if (!updatedCart) {
            res.status(404).json({ error: 'Cart item not found' });
            return;
        }

        res.json({
            message: 'Cart item updated successfully',
            data: updatedCart
        });
    } catch (err: any) {
        console.error('Update cart error:', err);
        res.status(500).json({ 
            error: 'Failed to update cart',
            details: err.message 
        });
    }
});

// API: Remove item from cart
app.delete('/api/cart/:cartId', async (req: Request, res: Response) => {
    try {
        const result = await Cart.findByIdAndDelete(req.params.cartId);

        if (!result) {
            res.status(404).json({ error: 'Cart item not found' });
            return;
        }

        res.json({
            message: 'Item removed from cart successfully',
            data: result
        });
    } catch (err: any) {
        console.error('Delete from cart error:', err);
        res.status(500).json({ 
            error: 'Failed to remove item from cart',
            details: err.message 
        });
    }
});

// API: Clear user's entire cart
app.delete('/api/cart-clear/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            res.status(400).json({ error: 'userId is required' });
            return;
        }

        const result = await Cart.deleteMany({ userId });

        res.json({
            message: 'Cart cleared successfully',
            deletedCount: result.deletedCount
        });
    } catch (err: any) {
        console.error('Clear cart error:', err);
        res.status(500).json({ 
            error: 'Failed to clear cart',
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
    console.log(`   GET    /api/favorites/:userId  - Get user favorites`);
    console.log(`   POST   /api/favorites          - Add favorite`);
    console.log(`   DELETE /api/favorites/:userId/:varietyId - Remove favorite`);
    console.log(`   POST   /api/shops/register     - Register new shop`);
    console.log(`   POST   /api/shops/login        - Shop login`);
    console.log(`   GET    /api/shops              - Get all shops`);
    console.log(`   GET    /api/shops/:id          - Get shop by ID`);
    console.log(`   PUT    /api/shops/:id          - Update shop info`);
    console.log(`   POST   /api/shop-inventory    - Add variety to inventory`);
    console.log(`   GET    /api/shops/:shopId/inventory - Get shop inventory`);
    console.log(`   PUT    /api/shop-inventory/:id - Update inventory (price/status)`);
    console.log(`   DELETE /api/shop-inventory/:id - Remove item from inventory`);
    console.log(`   GET    /api/shop-inventory/variety/:varietyId - Find shops selling variety`);
    console.log(`   POST   /api/cart               - Add item to cart`);
    console.log(`   GET    /api/cart/:userId       - Get user's cart`);
    console.log(`   PUT    /api/cart/:cartId       - Update cart item`);
    console.log(`   DELETE /api/cart/:cartId       - Remove item from cart`);
    console.log(`   DELETE /api/cart-clear/:userId - Clear user's cart`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
    process.exit(0);
});
