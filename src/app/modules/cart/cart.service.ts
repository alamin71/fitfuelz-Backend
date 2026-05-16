import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import MealModel from '../meal/meal.model';
import CartModel from './cart.model';

const round2 = (value: number) => Math.round(value * 100) / 100;

const recalculateCartTotals = (cart: any) => {
  const subtotal = cart.items.reduce(
    (acc: number, item: any) => acc + item.lineTotal,
    0
  );

  let discountAmount = 0;
  if (cart.couponCode === 'FIT10') {
    discountAmount = round2(subtotal * 0.1);
  }

  cart.subtotal = round2(subtotal);
  cart.discountAmount = round2(discountAmount);
  cart.total = round2(subtotal - discountAmount);
};

export const CartService = {
  getOrCreateCart: async (userId: string) => {
    let cart = await CartModel.findOne({ userId });
    if (!cart) {
      cart = await CartModel.create({
        userId,
        items: [],
        subtotal: 0,
        discountAmount: 0,
        total: 0,
      });
    }
    return cart;
  },

  getMyCartFromDB: async (userId: string) => {
    const cart = await CartService.getOrCreateCart(userId);
    return cart;
  },

  addItemToCartInDB: async (
    userId: string,
    mealId: string,
    quantity: number
  ) => {
    const meal = await MealModel.findById(mealId);
    if (!meal) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Meal not found');
    }

    const cart = await CartService.getOrCreateCart(userId);
    const existingItem = cart.items.find((item) => item.mealId === mealId);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.lineTotal = round2(
        existingItem.quantity * existingItem.unitPrice
      );
    } else {
      cart.items.push({
        mealId,
        mealName: meal.name,
        mealImage: meal.meal_image,
        unitPrice: meal.price,
        quantity,
        lineTotal: round2(meal.price * quantity),
      } as any);
    }

    recalculateCartTotals(cart);
    await cart.save();
    return cart;
  },

  updateCartItemQuantityInDB: async (
    userId: string,
    mealId: string,
    quantity: number
  ) => {
    const cart = await CartService.getOrCreateCart(userId);
    const item = cart.items.find((cartItem) => cartItem.mealId === mealId);

    if (!item) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Cart item not found');
    }

    item.quantity = quantity;
    item.lineTotal = round2(item.unitPrice * quantity);

    recalculateCartTotals(cart);
    await cart.save();
    return cart;
  },

  removeCartItemFromDB: async (userId: string, mealId: string) => {
    const cart = await CartService.getOrCreateCart(userId);

    cart.items = cart.items.filter((item) => item.mealId !== mealId) as any;

    recalculateCartTotals(cart);
    await cart.save();
    return cart;
  },

  clearCartFromDB: async (userId: string) => {
    const cart = await CartService.getOrCreateCart(userId);

    cart.items = [] as any;
    cart.couponCode = undefined;
    cart.subtotal = 0;
    cart.discountAmount = 0;
    cart.total = 0;

    await cart.save();
    return cart;
  },

  applyCouponToCartInDB: async (userId: string, couponCode: string) => {
    const cart = await CartService.getOrCreateCart(userId);

    const normalizedCode = couponCode.trim().toUpperCase();
    if (normalizedCode !== 'FIT10') {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid coupon code');
    }

    cart.couponCode = normalizedCode;
    recalculateCartTotals(cart);
    await cart.save();
    return cart;
  },
};

export default CartService;
