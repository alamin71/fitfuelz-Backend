import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import CartModel from '../cart/cart.model';
import OrderModel from './order.model';
import PaymentService from '../payment/payment.service';

export const OrderService = {
  placeOrderFromCartToDB: async (payload: {
    userId: string;
    paymentMethod: 'WALLET' | 'STRIPE' | 'COD';
    deliveryAddress?: string;
    note?: string;
  }) => {
    const { userId, paymentMethod, deliveryAddress, note } = payload;

    const cart = await CartModel.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Cart is empty');
    }

    const order = await OrderModel.create({
      userId,
      items: cart.items,
      subtotal: cart.subtotal,
      discountAmount: cart.discountAmount,
      total: cart.total,
      couponCode: cart.couponCode,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'pending' : 'pending',
      orderStatus: paymentMethod === 'COD' ? 'confirmed' : 'pending_payment',
      deliveryAddress,
      note,
    });

    if (paymentMethod === 'COD') {
      // clear cart immediately for COD
      cart.items = [] as any;
      cart.subtotal = 0;
      cart.discountAmount = 0;
      cart.total = 0;
      cart.couponCode = undefined;
      await cart.save();

      return {
        order,
        payment: null,
      };
    }

    if (paymentMethod === 'WALLET') {
      const chargeResult = await PaymentService.chargeWallet(
        userId,
        order.total,
        (order._id as any).toString()
      );

      order.paymentStatus = 'paid';
      order.orderStatus = 'confirmed';
      await order.save();

      cart.items = [] as any;
      cart.subtotal = 0;
      cart.discountAmount = 0;
      cart.total = 0;
      cart.couponCode = undefined;
      await cart.save();

      return {
        order,
        payment: {
          type: 'wallet',
          wallet: chargeResult.wallet,
          transaction: chargeResult.transaction,
        },
      };
    }

    // STRIPE flow: create payment intent, keep order pending_payment
    const intent = await PaymentService.createOrderPaymentIntent(
      userId,
      (order._id as any).toString(),
      order.total
    );

    order.paymentIntentId = intent.paymentIntentId;
    await order.save();

    return {
      order,
      payment: {
        type: 'stripe',
        ...intent,
      },
    };
  },

  getMyOrdersFromDB: async (userId: string) => {
    return OrderModel.find({ userId }).sort({ createdAt: -1 });
  },

  getOrderByIdFromDB: async (userId: string, id: string, role: string) => {
    const query = role === 'USER' ? { _id: id, userId } : { _id: id };
    const order = await OrderModel.findOne(query);

    if (!order) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Order not found');
    }

    return order;
  },

  cancelMyOrderInDB: async (userId: string, id: string) => {
    const order = await OrderModel.findOne({ _id: id, userId });
    if (!order) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Order not found');
    }

    if (order.orderStatus === 'delivered') {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Delivered order cannot be cancelled'
      );
    }

    order.orderStatus = 'cancelled';
    await order.save();

    return order;
  },

  getAllOrdersFromDB: async () => {
    return OrderModel.find().sort({ createdAt: -1 });
  },

  updateOrderStatusInDB: async (id: string, orderStatus: string) => {
    const order = await OrderModel.findById(id);
    if (!order) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Order not found');
    }

    order.orderStatus = orderStatus as any;
    await order.save();

    return order;
  },

  markOrderPaidByPaymentIntent: async (paymentIntentId: string) => {
    const order = await OrderModel.findOne({ paymentIntentId });
    if (!order) return null;

    order.paymentStatus = 'paid';
    order.orderStatus = 'confirmed';
    await order.save();

    const cart = await CartModel.findOne({ userId: order.userId });
    if (cart) {
      cart.items = [] as any;
      cart.subtotal = 0;
      cart.discountAmount = 0;
      cart.total = 0;
      cart.couponCode = undefined;
      await cart.save();
    }

    return order;
  },
};

export default OrderService;
