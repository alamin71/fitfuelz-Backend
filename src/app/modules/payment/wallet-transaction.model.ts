import mongoose, { Schema, Document, Model } from 'mongoose';

export type TransactionType = 'topup' | 'charge' | 'refund';
export type PaymentProvider = 'stripe' | 'wallet';

export interface IWalletTransaction extends Document {
  userId: string;
  walletId: string;
  amount: number;
  type: TransactionType;
  provider: PaymentProvider;
  providerRef?: string; // Stripe payment intent ID, etc
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  orderId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const WalletTransactionSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['topup', 'charge', 'refund'], required: true },
    provider: { type: String, enum: ['stripe', 'wallet'], required: true },
    providerRef: { type: String }, // Stripe payment intent ID, transaction ID, etc
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    description: { type: String },
    orderId: { type: String }, // reference to order if applicable
  },
  { timestamps: true }
);

export const WalletTransactionModel: Model<IWalletTransaction> =
  mongoose.models.WalletTransaction ||
  mongoose.model<IWalletTransaction>(
    'WalletTransaction',
    WalletTransactionSchema
  );

export default WalletTransactionModel;
