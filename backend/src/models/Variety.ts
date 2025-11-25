import mongoose, { Schema, Document } from 'mongoose';

export interface IVariety extends Document {
    name: string;
    soil_type: string;
    pest: string[];  // เปลี่ยนเป็น array เพื่อรองรับหลายชนิด
    disease: string[];  // เปลี่ยนเป็น array เพื่อรองรับหลายชนิด
    yield: string;
    age: string;
    sweetness: string;
    variety_image: string;
    parent_varieties?: string;
    growth_characteristics?: string[];
    planting_tips?: string[];
    suitable_for?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const VarietySchema = new Schema<IVariety>({
    name: {
        type: String,
        required: true,
    },
    soil_type: {
        type: String,
        required: true,
    },
    pest: {
        type: [String],  // เปลี่ยนเป็น array
        required: true,
    },
    disease: {
        type: [String],  // เปลี่ยนเป็น array
        required: true,
    },
    yield: {
        type: String,
        required: true,
    },
    age: {
        type: String,
        required: true,
    },
    sweetness: {
        type: String,
        required: true,
    },
    variety_image: {
        type: String,
        required: false,
        default: 'sugarcane-default.jpg'
    },
    parent_varieties: {
        type: String,
        required: false,
    },
    growth_characteristics: {
        type: [String],
        required: false,
    },
    planting_tips: {
        type: [String],
        required: false,
    },
    suitable_for: {
        type: [String],
        required: false,
    },
}, {
    collection: 'varieties',
    timestamps: true,
});

export default mongoose.model<IVariety>('Variety', VarietySchema);
