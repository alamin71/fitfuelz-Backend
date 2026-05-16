import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import PaymentService from './payment.service';
import AppError from '../../../errors/AppError';

// Create top-up payment intent
const createTopUpIntent = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?._id || (req.user as any)?.id;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Valid amount is required');
  }

  const result = await PaymentService.createTopUpIntent(userId, amount);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment intent created successfully',
    data: result,
  });
});

// Get user wallet
const getWallet = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?._id || (req.user as any)?.id;
  const wallet = await PaymentService.getWallet(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Wallet retrieved successfully',
    data: wallet,
  });
});

// Charge wallet (deduct balance)
const chargeWallet = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?._id || (req.user as any)?.id;
  const { amount, orderId } = req.body;

  if (!amount || amount <= 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Valid amount is required');
  }

  const result = await PaymentService.chargeWallet(userId, amount, orderId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Wallet charged successfully',
    data: result,
  });
});

// Create order payment intent (for Stripe card/Apple Pay/Google Pay)
const createOrderPaymentIntent = catchAsync(
  async (req: Request, res: Response) => {
    const userId = (req.user as any)?._id || (req.user as any)?.id;
    const { orderId, amount } = req.body;

    if (!orderId || !amount || amount <= 0) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Valid orderId and amount are required'
      );
    }

    const result = await PaymentService.createOrderPaymentIntent(
      userId,
      orderId,
      amount
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Order payment intent created successfully',
      data: result,
    });
  }
);

// Get wallet transactions
const getWalletTransactions = catchAsync(
  async (req: Request, res: Response) => {
    const userId = (req.user as any)?._id || (req.user as any)?.id;
    const { limit = 50, skip = 0 } = req.query;

    const result = await PaymentService.getWalletTransactions(
      userId,
      Number(limit),
      Number(skip)
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Transactions retrieved successfully',
      data: result,
    });
  }
);

// Webhook handler for Stripe events (public endpoint)
const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Missing stripe signature');
  }

  const event = PaymentService.verifyWebhookSignature(
    req.body as Buffer,
    signature
  );

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as any;
    await PaymentService.handlePaymentIntentSucceeded(paymentIntent.id);
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Webhook processed successfully',
    data: {},
  });
});

const getPaymentStatus = catchAsync(async (req: Request, res: Response) => {
  const { paymentIntentId } = req.params as { paymentIntentId: string };
  const result = await PaymentService.getPaymentIntentStatus(paymentIntentId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment status retrieved successfully',
    data: result,
  });
});

export const PaymentController = {
  createTopUpIntent,
  getWallet,
  chargeWallet,
  createOrderPaymentIntent,
  getWalletTransactions,
  stripeWebhook,
  getPaymentStatus,
};

export default PaymentController;
