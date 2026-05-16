import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWallet extends Document {
  userId: string;
  balance: number;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const WalletSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    balance: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: 'USD' },
  },
  { timestamps: true }
);

export const WalletModel: Model<IWallet> =
  mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', WalletSchema);

export default WalletModel;
