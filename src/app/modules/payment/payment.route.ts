import express from 'express';
import { PaymentController } from './payment.controller';
import { PaymentValidation } from './payment.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

// Webhook endpoint (public - Stripe calls this)
router.post('/webhook', PaymentController.stripeWebhook);

// Top-up / Add Money endpoint
router.post(
  '/top-up',
  auth(USER_ROLES.USER),
  validateRequest(PaymentValidation.createTopUpIntentZodSchema),
  PaymentController.createTopUpIntent
);

// Get user wallet balance
router.get('/wallet', auth(USER_ROLES.USER), PaymentController.getWallet);

// Charge wallet (deduct balance for order)
router.post(
  '/charge-wallet',
  auth(USER_ROLES.USER),
  validateRequest(PaymentValidation.chargeWalletZodSchema),
  PaymentController.chargeWallet
);

// Create order payment intent (for Stripe card/Apple Pay/Google Pay)
router.post(
  '/order-payment-intent',
  auth(USER_ROLES.USER),
  validateRequest(PaymentValidation.createOrderPaymentIntentZodSchema),
  PaymentController.createOrderPaymentIntent
);

// Get wallet transactions
router.get(
  '/transactions',
  auth(USER_ROLES.USER),
  validateRequest(PaymentValidation.getWalletTransactionsZodSchema),
  PaymentController.getWalletTransactions
);

router.get(
  '/status/:paymentIntentId',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  PaymentController.getPaymentStatus
);

export const PaymentRouter = router;

export default PaymentRouter;
