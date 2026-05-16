import { z } from 'zod';

export const CartValidation = {
  addItemZodSchema: z.object({
    body: z.object({
      mealId: z.string().nonempty({ message: 'Meal id is required' }),
      quantity: z.preprocess(
        (val) => Number(val),
        z
          .number()
          .int()
          .positive({ message: 'Quantity must be greater than 0' })
      ),
    }),
  }),

  updateItemQuantityZodSchema: z.object({
    body: z.object({
      quantity: z.preprocess(
        (val) => Number(val),
        z
          .number()
          .int()
          .positive({ message: 'Quantity must be greater than 0' })
      ),
    }),
    params: z.object({
      mealId: z.string().nonempty({ message: 'Meal id is required' }),
    }),
  }),

  applyCouponZodSchema: z.object({
    body: z.object({
      couponCode: z.string().nonempty({ message: 'Coupon code is required' }),
    }),
  }),
};

export default CartValidation;
