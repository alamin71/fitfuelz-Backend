import { FilterQuery } from 'mongoose';
import MealModel, { IMeal } from './meal.model';

export const MealService = {
  createMealToDB: async (payload: Partial<IMeal>) => {
    const meal = await MealModel.create(payload);
    return meal;
  },

  updateMealInDB: async (id: string, payload: Partial<IMeal>) => {
    const meal = await MealModel.findByIdAndUpdate(id, payload, {
      new: true,
    });
    return meal;
  },

  deleteMealFromDB: async (id: string) => {
    const meal = await MealModel.findByIdAndDelete(id);
    return meal;
  },

  getMealsByCategoryFromDB: async (category: string) => {
    const meals = await MealModel.find({ category }).sort({ createdAt: -1 });
    return meals;
  },

  getMealByIdFromDB: async (id: string) => {
    const meal = await MealModel.findById(id);
    return meal;
  },
};

export default MealService;
