import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middleware/validateRequest';
import { OrderValidation } from './order.validation';
import { OrderController } from './order.controller';

const router = express.Router();

router.post(
  '/place',
  auth(USER_ROLES.USER),
  validateRequest(OrderValidation.placeOrderZodSchema),
  OrderController.placeOrder
);

router.get('/my', auth(USER_ROLES.USER), OrderController.getMyOrders);

router.get(
  '/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  OrderController.getOrderById
);

router.patch(
  '/my/:id/cancel',
  auth(USER_ROLES.USER),
  OrderController.cancelMyOrder
);

router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  OrderController.getAllOrders
);

router.patch(
  '/:id/status',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(OrderValidation.updateOrderStatusZodSchema),
  OrderController.updateOrderStatus
);

export const OrderRouter = router;

export default OrderRouter;
