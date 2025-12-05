import mongoose, { Schema, Document } from 'mongoose';

export interface IShopInventory extends Document {
    shopId: mongoose.Types.ObjectId;
    varietyId: mongoose.Types.ObjectId;
    price: number;
    status: 'available' | 'out_of_stock';
    quantity?: number;
    createdAt: Date;
    updatedAt: Date;
}

const ShopInventorySchema = new Schema<IShopInventory>({
    shopId: {
        type: Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
    },
    varietyId: {
        type: Schema.Types.ObjectId,
        ref: 'Variety',
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['available', 'out_of_stock'],
        default: 'available',
        required: true,
    },
    quantity: {
        type: Number,
        required: false,
    },
}, { timestamps: true });

// Index ป้องกัน duplicate entries
ShopInventorySchema.index({ shopId: 1, varietyId: 1 }, { unique: true });

const ShopInventory = mongoose.model('ShopInventory', ShopInventorySchema);

export default ShopInventory;
