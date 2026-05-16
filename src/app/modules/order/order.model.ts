import mongoose, { Document, Model, Schema } from 'mongoose';

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'WALLET' | 'STRIPE' | 'COD';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface IOrderItem {
  mealId: string;
  mealName: string;
  mealImage?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface IOrder extends Document {
  userId: string;
  items: IOrderItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  couponCode?: string;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  deliveryAddress?: string;
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    mealId: { type: String, required: true },
    mealName: { type: String, required: true },
    mealImage: { type: String },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    couponCode: { type: String },
    orderStatus: {
      type: String,
      enum: [
        'pending_payment',
        'confirmed',
        'preparing',
        'out_for_delivery',
        'delivered',
        'cancelled',
      ],
      default: 'pending_payment',
    },
    paymentMethod: {
      type: String,
      enum: ['WALLET', 'STRIPE', 'COD'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentIntentId: { type: String },
    deliveryAddress: { type: String },
    note: { type: String },
  },
  { timestamps: true }
);

export const OrderModel: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default OrderModel;
