import { z } from 'zod';

export const PaymentValidation = {
  createTopUpIntentZodSchema: z.object({
    body: z.object({
      amount: z
        .number()
        .positive({ message: 'Amount must be greater than 0' })
        .refine((val) => val >= 1, {
          message: 'Minimum top-up amount is 1 USD',
        }),
    }),
  }),

  chargeWalletZodSchema: z.object({
    body: z.object({
      amount: z.number().positive({ message: 'Amount must be greater than 0' }),
      orderId: z.string().optional(),
    }),
  }),

  createOrderPaymentIntentZodSchema: z.object({
    body: z.object({
      orderId: z.string().nonempty({ message: 'Order ID is required' }),
      amount: z.number().positive({ message: 'Amount must be greater than 0' }),
    }),
  }),

  getWalletTransactionsZodSchema: z.object({
    query: z.object({
      limit: z.string().optional(),
      skip: z.string().optional(),
    }),
  }),
};

export default PaymentValidation;
