import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICartItem {
  mealId: string;
  mealName: string;
  mealImage?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface ICart extends Document {
  userId: string;
  items: ICartItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  couponCode?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    mealId: { type: String, required: true },
    mealName: { type: String, required: true },
    mealImage: { type: String },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    items: { type: [CartItemSchema], default: [] },
    subtotal: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    couponCode: { type: String },
  },
  { timestamps: true }
);

export const CartModel: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

export default CartModel;
