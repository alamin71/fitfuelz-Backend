import { z } from 'zod';

export const OrderValidation = {
  placeOrderZodSchema: z.object({
    body: z.object({
      paymentMethod: z.enum(['WALLET', 'STRIPE', 'COD']),
      deliveryAddress: z.string().optional(),
      note: z.string().optional(),
    }),
  }),

  updateOrderStatusZodSchema: z.object({
    params: z.object({
      id: z.string().nonempty({ message: 'Order id is required' }),
    }),
    body: z.object({
      orderStatus: z.enum([
        'confirmed',
        'preparing',
        'out_for_delivery',
        'delivered',
        'cancelled',
      ]),
    }),
  }),
};

export default OrderValidation;
