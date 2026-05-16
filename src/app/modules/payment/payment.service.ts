import Stripe from 'stripe';
import config from '../../../config';
import WalletModel from './wallet.model';
import WalletTransactionModel from './wallet-transaction.model';
import AppError from '../../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import OrderService from '../order/order.service';

const stripe = new Stripe(config.stripe.stripe_secret_key as string);

export const PaymentService = {
  // Create payment intent for top-up (Add Money)
  createTopUpIntent: async (userId: string, amount: number) => {
    try {
      // Find or create wallet for user
      let wallet = await WalletModel.findOne({ userId });
      if (!wallet) {
        wallet = await WalletModel.create({
          userId,
          balance: 0,
          currency: 'USD',
        });
      }

      // Create Stripe PaymentIntent (amount in cents)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // convert to cents
        currency: 'usd',
        metadata: {
          userId,
          walletId: (wallet._id as any).toString(),
          type: 'topup',
        },
        description: `Wallet Top-up for user ${userId}`,
      });

      // Create pending wallet transaction
      const transaction = await WalletTransactionModel.create({
        userId,
        walletId: wallet._id,
        amount,
        type: 'topup',
        provider: 'stripe',
        providerRef: paymentIntent.id,
        status: 'pending',
        description: `Stripe top-up - ${paymentIntent.id}`,
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        transactionId: transaction._id,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to create payment intent: ${(error as any).message}`
      );
    }
  },

  // Handle Stripe webhook - payment success
  handlePaymentIntentSucceeded: async (paymentIntentId: string) => {
    try {
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);
      const { userId, type, walletId } = paymentIntent.metadata as {
        userId: string;
        type: string;
        walletId: string;
      };

      if (!userId || !walletId) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid payment metadata');
      }

      if (type === 'topup') {
        // Credit wallet with top-up amount
        const amount = paymentIntent.amount / 100; // convert from cents

        const wallet = await WalletModel.findByIdAndUpdate(
          walletId,
          { $inc: { balance: amount } },
          { new: true }
        );

        // Update transaction to completed
        await WalletTransactionModel.findOneAndUpdate(
          { providerRef: paymentIntentId },
          { status: 'completed' },
          { new: true }
        );

        return { success: true, wallet };
      }

      if (type === 'order') {
        await WalletTransactionModel.findOneAndUpdate(
          { providerRef: paymentIntentId },
          { status: 'completed' },
          { new: true }
        );

        const order =
          await OrderService.markOrderPaidByPaymentIntent(paymentIntentId);

        return { success: true, order };
      }

      return { success: true };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to handle payment success: ${(error as any).message}`
      );
    }
  },

  // Get user wallet
  getWallet: async (userId: string) => {
    let wallet = await WalletModel.findOne({ userId });
    if (!wallet) {
      wallet = await WalletModel.create({
        userId,
        balance: 0,
        currency: 'USD',
      });
    }
    return wallet;
  },

  // Charge wallet (deduct balance for order)
  chargeWallet: async (userId: string, amount: number, orderId?: string) => {
    try {
      const wallet = await WalletModel.findOne({ userId });
      if (!wallet) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Wallet not found');
      }

      if (wallet.balance < amount) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          'Insufficient wallet balance'
        );
      }

      // Deduct balance
      const updatedWallet = await WalletModel.findByIdAndUpdate(
        wallet._id,
        { $inc: { balance: -amount } },
        { new: true }
      );

      // Create transaction record
      const transaction = await WalletTransactionModel.create({
        userId,
        walletId: wallet._id,
        amount,
        type: 'charge',
        provider: 'wallet',
        status: 'completed',
        description: `Wallet charge for order ${orderId || 'N/A'}`,
        orderId,
      });

      return { wallet: updatedWallet, transaction };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to charge wallet: ${(error as any).message}`
      );
    }
  },

  // Create payment intent for order (partial or full amount)
  createOrderPaymentIntent: async (
    userId: string,
    orderId: string,
    amount: number
  ) => {
    try {
      const wallet = await WalletModel.findOne({ userId });
      if (!wallet) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Wallet not found');
      }

      // Create Stripe PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        metadata: {
          userId,
          orderId,
          type: 'order',
          walletId: (wallet._id as any).toString(),
        },
        description: `Order payment for order ${orderId}`,
      });

      // Create pending transaction
      const transaction = await WalletTransactionModel.create({
        userId,
        walletId: wallet._id,
        amount,
        type: 'charge',
        provider: 'stripe',
        providerRef: paymentIntent.id,
        status: 'pending',
        description: `Order payment - ${paymentIntent.id}`,
        orderId,
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        transactionId: transaction._id,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to create order payment intent: ${(error as any).message}`
      );
    }
  },

  // Get wallet transactions
  getWalletTransactions: async (
    userId: string,
    limit: number = 50,
    skip: number = 0
  ) => {
    const transactions = await WalletTransactionModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await WalletTransactionModel.countDocuments({ userId });

    return { transactions, total };
  },

  getPaymentIntentStatus: async (paymentIntentId: string) => {
    try {
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        id: intent.id,
        status: intent.status,
        amount: intent.amount / 100,
        currency: intent.currency,
        metadata: intent.metadata,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to retrieve payment status: ${(error as any).message}`
      );
    }
  },

  // Verify Stripe webhook signature
  verifyWebhookSignature: (body: Buffer, signature: string) => {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        config.stripe.stripe_webhook_secret as string
      );
      return event;
    } catch (error) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        `Webhook signature verification failed: ${(error as any).message}`
      );
    }
  },
};

export default PaymentService;
