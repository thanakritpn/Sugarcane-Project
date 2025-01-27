const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/images', express.static('images'));

// ตั้งค่าการเชื่อมต่อ MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234', // เปลี่ยนเป็นรหัสผ่าน MySQL ของคุณ
    database: 'sugarcane_db'
});

// เชื่อมต่อฐานข้อมูล
db.connect((err) => {
    if (err) {
        console.log('Database connection error:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// API: ดึงข้อมูลที่ตรงกับเงื่อนไข
app.post('/search', (req, res) => {
    const { soil, pest, disease } = req.body;

    const query = `
        SELECT name, soil_type, pest, disease, sweetness, age, yield, variety_image
        FROM sugarcane_varieties2
        WHERE soil_type = ?
        AND pest = ?
        AND disease = ?`;

    db.query(query, [soil, pest, disease], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database query error');
            return;
        }
        res.json(results);
    });
});

// เริ่มเซิร์ฟเวอร์
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
