import { z } from 'zod';

const allowedCategories = [
  'Breakfast & Grab-and-go Favourites',
  'Eight meal box',
  'Sixteen meal box',
  'Fifteen meal box',
];

export const MealValidation = {
  createMealZodSchema: z.object({
    body: z.object({
      name: z.string().nonempty({ message: 'Meal name is required' }),
      price: z.preprocess(
        (val) => Number(val),
        z.number().nonnegative({ message: 'Price is required' })
      ),
      description: z.string().optional(),
      category: z
        .string()
        .nonempty({ message: 'Category is required' })
        .refine((v) => allowedCategories.includes(v), {
          message: 'Invalid category',
        }),
    }),
  }),

  updateMealZodSchema: z.object({
    body: z.object({
      name: z.string().optional(),
      price: z.number().optional(),
      description: z.string().optional(),
      category: z
        .string()
        .optional()
        .refine((v) => (v ? allowedCategories.includes(v) : true), {
          message: 'Invalid category',
        }),
    }),
  }),

  getMealsByCategoryZodSchema: z.object({
    params: z.object({
      category: z
        .string()
        .nonempty({ message: 'Category is required' })
        .refine((v) => allowedCategories.includes(v), {
          message: 'Invalid category',
        }),
    }),
  }),
};

export const MealCategories = allowedCategories;

export default MealValidation;
