import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middleware/validateRequest';
import { CartValidation } from './cart.validation';
import { CartController } from './cart.controller';

const router = express.Router();

router.get('/', auth(USER_ROLES.USER), CartController.getMyCart);

router.post(
  '/items',
  auth(USER_ROLES.USER),
  validateRequest(CartValidation.addItemZodSchema),
  CartController.addItemToCart
);

router.patch(
  '/items/:mealId',
  auth(USER_ROLES.USER),
  validateRequest(CartValidation.updateItemQuantityZodSchema),
  CartController.updateCartItemQuantity
);

router.delete(
  '/items/:mealId',
  auth(USER_ROLES.USER),
  CartController.removeCartItem
);

router.delete('/clear', auth(USER_ROLES.USER), CartController.clearCart);

router.post(
  '/apply-coupon',
  auth(USER_ROLES.USER),
  validateRequest(CartValidation.applyCouponZodSchema),
  CartController.applyCoupon
);

export const CartRouter = router;

export default CartRouter;
