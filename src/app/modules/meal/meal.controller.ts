import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { MealService } from './meal.service';
import { uploadToS3 } from '../../../helpers/s3Helper';
import AppError from '../../../errors/AppError';

const createMeal = catchAsync(async (req: Request, res: Response) => {
  const payload = { ...req.body } as any;

  const files = req.files as
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  let imageFile: Express.Multer.File | undefined;

  if (Array.isArray(files) && files.length > 0) {
    imageFile = files.find((file) => file.fieldname === 'meal_image');
  } else if (
    files &&
    'meal_image' in files &&
    Array.isArray(files.meal_image)
  ) {
    [imageFile] = files.meal_image;
  }

  if (imageFile) {
    const s3Url = await uploadToS3(imageFile, 'meals');
    payload.meal_image = s3Url;
  }

  const result = await MealService.createMealToDB(payload);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Meal created successfully',
    data: result,
  });
});

const updateMeal = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id) throw new AppError(StatusCodes.BAD_REQUEST, 'Meal id is required');

  const payload = { ...req.body } as any;

  const files = req.files as
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  let imageFile: Express.Multer.File | undefined;

  if (Array.isArray(files) && files.length > 0) {
    imageFile = files.find((file) => file.fieldname === 'meal_image');
  } else if (
    files &&
    'meal_image' in files &&
    Array.isArray(files.meal_image)
  ) {
    [imageFile] = files.meal_image;
  }

  if (imageFile) {
    const s3Url = await uploadToS3(imageFile, 'meals');
    payload.meal_image = s3Url;
  }

  const result = await MealService.updateMealInDB(id, payload);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Meal updated successfully',
    data: result,
  });
});

const deleteMeal = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id) throw new AppError(StatusCodes.BAD_REQUEST, 'Meal id is required');

  const result = await MealService.deleteMealFromDB(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Meal deleted successfully',
    data: result,
  });
});

const getMealsByCategory = catchAsync(async (req: Request, res: Response) => {
  const { category } = req.query as { category: string };
  if (!category)
    throw new AppError(StatusCodes.BAD_REQUEST, 'Category is required');

  const result = await MealService.getMealsByCategoryFromDB(category);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Meals retrieved successfully',
    data: result,
  });
});

const getMealById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await MealService.getMealByIdFromDB(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Meal retrieved successfully',
    data: result,
  });
});

export const MealController = {
  createMeal,
  updateMeal,
  deleteMeal,
  getMealsByCategory,
  getMealById,
};

export default MealController;
