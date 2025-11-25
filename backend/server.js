require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/images', express.static('images'));

// ตั้งค่าการเชื่อมต่อ PostgreSQL (Supabase)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// ทดสอบการเชื่อมต่อฐานข้อมูล
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.log('Database connection error:', err);
        return;
    }
    console.log('Connected to PostgreSQL database (Supabase)');
    console.log('Connection time:', res.rows[0].now);
});

// API: ดึงข้อมูลที่ตรงกับเงื่อนไข
app.post('/search', async (req, res) => {
    const { soil, pest, disease } = req.body;

    const query = `
        SELECT name, soil_type, pest, disease, sweetness, age, yield, variety_image
        FROM sugarcane_varieties2
        WHERE soil_type = $1
        AND pest = $2
        AND disease = $3`;

    try {
        const result = await pool.query(query, [soil, pest, disease]);
        res.json(result.rows);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send('Database query error');
    }
});

// เริ่มเซิร์ฟเวอร์
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
