// Migration script to add shop_image field to existing shops
// Run this script to add shop_image field to all existing shops without the field

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DATABASE_URL);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};

const addShopImageField = async () => {
    try {
        await connectDB();
        
        const db = mongoose.connection.db;
        const shops = db.collection('shops');
        
        // Update all shops that don't have shop_image field
        const result = await shops.updateMany(
            { shop_image: { $exists: false } },
            { $set: { shop_image: '' } }
        );
        
        console.log(`Updated ${result.modifiedCount} shops with shop_image field`);
        
        // Also ensure the field exists but is null/undefined
        const result2 = await shops.updateMany(
            { $or: [{ shop_image: null }, { shop_image: undefined }] },
            { $set: { shop_image: '' } }
        );
        
        console.log(`Updated ${result2.modifiedCount} shops with null shop_image field`);
        
        mongoose.connection.close();
        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        mongoose.connection.close();
        process.exit(1);
    }
};

// Run migration
addShopImageField();