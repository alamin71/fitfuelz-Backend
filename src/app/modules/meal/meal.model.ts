import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMeal extends Document {
  name: string;
  price: number;
  description?: string;
  meal_image?: string;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const MealSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    meal_image: { type: String },
    category: { type: String, required: true },
  },
  { timestamps: true }
);

export const MealModel: Model<IMeal> =
  mongoose.models.Meal || mongoose.model<IMeal>('Meal', MealSchema);

export default MealModel;
