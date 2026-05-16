import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import CartService from './cart.service';

const getMyCart = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.id as string;
  const result = await CartService.getMyCartFromDB(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cart retrieved successfully',
    data: result,
  });
});

const addItemToCart = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.id as string;
  const { mealId, quantity } = req.body;

  const result = await CartService.addItemToCartInDB(
    userId,
    mealId,
    Number(quantity)
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Item added to cart successfully',
    data: result,
  });
});

const updateCartItemQuantity = catchAsync(
  async (req: Request, res: Response) => {
    const userId = (req.user as any)?.id as string;
    const { mealId } = req.params as { mealId: string };
    const { quantity } = req.body;

    const result = await CartService.updateCartItemQuantityInDB(
      userId,
      mealId,
      Number(quantity)
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Cart item updated successfully',
      data: result,
    });
  }
);

const removeCartItem = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.id as string;
  const { mealId } = req.params as { mealId: string };

  const result = await CartService.removeCartItemFromDB(userId, mealId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cart item removed successfully',
    data: result,
  });
});

const clearCart = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.id as string;
  const result = await CartService.clearCartFromDB(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cart cleared successfully',
    data: result,
  });
});

const applyCoupon = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.id as string;
  const { couponCode } = req.body;

  const result = await CartService.applyCouponToCartInDB(userId, couponCode);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Coupon applied successfully',
    data: result,
  });
});

export const CartController = {
  getMyCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  applyCoupon,
};

export default CartController;
