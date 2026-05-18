import { z } from 'zod';

const allowedCategories = [
  'Breakfast & Grab-and-go Favourites',
  'Eight meal box',
  '8 Meal Box',
  'Twelve meal box',
  '12 Meal Box',
  '12- Meal Box',
  'Fifteen meal box',
  '15 Meal Box',
];

const normalizeCategory = (value: string) =>
  value.trim().toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ');

const allowedNormalizedCategories = allowedCategories.map(normalizeCategory);

const isValidCategory = (value: string) =>
  allowedNormalizedCategories.includes(normalizeCategory(value));

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
        .refine((v) => isValidCategory(v), {
          message: 'Invalid category',
        }),
    }),
  }),

  updateMealZodSchema: z.object({
    body: z.object({
      name: z.string().optional(),
      price: z.preprocess((val) => {
        if (val === undefined || val === null || val === '') return undefined;
        return Number(val);
      }, z.number().optional()),
      description: z.string().optional(),
      category: z
        .string()
        .optional()
        .refine((v) => (v ? isValidCategory(v) : true), {
          message: 'Invalid category',
        }),
    }),
  }),

  getMealsByCategoryZodSchema: z.object({
    query: z.object({
      category: z
        .string()
        .nonempty({ message: 'Category is required' })
        .refine((v) => isValidCategory(v), {
          message: 'Invalid category',
        }),
    }),
  }),
};

export const MealCategories = allowedCategories;

export default MealValidation;
