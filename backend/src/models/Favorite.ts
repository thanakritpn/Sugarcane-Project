import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
    userId: string;
    varietyId: string;
    createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
    {
        userId: {
            type: String,
            required: true,
            trim: true
        },
        varietyId: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// Create compound unique index to prevent duplicates
FavoriteSchema.index({ userId: 1, varietyId: 1 }, { unique: true });

const Favorite = mongoose.model<IFavorite>('Favorite', FavoriteSchema);

export default Favorite;
