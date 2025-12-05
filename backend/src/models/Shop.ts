import mongoose, { Schema, Document } from 'mongoose';

export interface IShop extends Document {
    username: string;
    email: string;
    password: string; // hashed
    shopName: string;
    phone: string;
    address: string;
    district: string;
    province: string;
    shop_image?: string; // shop image filename
    createdAt: Date;
    updatedAt: Date;
}

const ShopSchema = new Schema<IShop>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    shopName: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    province: {
        type: String,
        required: true,
    },
    shop_image: {
        type: String,
        default: '',
    },
}, { timestamps: true });

const Shop = mongoose.model('Shop', ShopSchema);

export default Shop;
