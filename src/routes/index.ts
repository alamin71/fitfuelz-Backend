import express from 'express';
import { UserRouter } from '../app/modules/user/user.route';
import { AuthRouter } from '../app/modules/auth/auth.route';
import { AdminRoutes } from '../app/modules/admin/admin.route';
import { MealRouter } from '../app/modules/meal/meal.route';
import { PaymentRouter } from '../app/modules/payment/payment.route';
import { CartRouter } from '../app/modules/cart/cart.route';
import { OrderRouter } from '../app/modules/order/order.route';

const router = express.Router();
const routes = [
  {
    path: '/auth',
    route: AuthRouter,
  },
  {
    path: '/users',
    route: UserRouter,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
  {
    path: '/meals',
    route: MealRouter,
  },
  {
    path: '/payments',
    route: PaymentRouter,
  },
  {
    path: '/cart',
    route: CartRouter,
  },
  {
    path: '/orders',
    route: OrderRouter,
  },
];

routes.forEach((element) => {
  if (element?.path && element?.route) {
    router.use(element?.path, element?.route);
  }
});

export default router;
