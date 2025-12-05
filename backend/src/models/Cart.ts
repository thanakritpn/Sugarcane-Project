import mongoose, { Schema, Document } from 'mongoose';

export interface ICart extends Document {
    userId: mongoose.Types.ObjectId;
    shopId: mongoose.Types.ObjectId;
    varietyId: mongoose.Types.ObjectId;
    price: number;
    quantity: number;
    status: 'pending' | 'paid' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

const CartSchema = new Schema<ICart>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
    },
    varietyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variety',
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled'],
        default: 'pending',
    },
}, {
    collection: 'carts',
    timestamps: true,
});

export default mongoose.model<ICart>('Cart', CartSchema);
