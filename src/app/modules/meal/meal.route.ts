import express from 'express';
import { MealController } from './meal.controller';
import validateRequest from '../../middleware/validateRequest';
import { MealValidation } from './meal.validation';

const router = express.Router();

// Get single meal
router.get('/detail/:id', MealController.getMealById);

// Public route to get meals by category for frontend (query parameter)
router.get(
  '/',
  validateRequest(MealValidation.getMealsByCategoryZodSchema),
  MealController.getMealsByCategory
);

export const MealRouter = router;

export default MealRouter;
