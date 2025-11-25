# ไฟล์สำหรับสร้าง database schema
CREATE DATABASE IF NOT EXISTS sugarcane_db;
USE sugarcane_db;

-- ตัวอย่างตาราง (ปรับแต่งตามความต้องการ)
CREATE TABLE IF NOT EXISTS varieties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    soil_type VARCHAR(255),
    pest_resistance VARCHAR(255),
    disease_resistance VARCHAR(255),
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
