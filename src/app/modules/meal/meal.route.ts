import express from 'express';
import { MealController } from './meal.controller';
import validateRequest from '../../middleware/validateRequest';
import { MealValidation } from './meal.validation';

const router = express.Router();

// Public route to get meals by category for frontend
router.get(
  '/:category',
  validateRequest(MealValidation.getMealsByCategoryZodSchema),
  MealController.getMealsByCategory
);

// Get single meal
router.get('/:id/detail', MealController.getMealById);

export const MealRouter = router;

export default MealRouter;
