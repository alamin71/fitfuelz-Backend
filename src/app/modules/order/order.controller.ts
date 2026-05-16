import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import OrderService from './order.service';

const placeOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.id as string;
  const { paymentMethod, deliveryAddress, note } = req.body;

  const result = await OrderService.placeOrderFromCartToDB({
    userId,
    paymentMethod,
    deliveryAddress,
    note,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order created successfully',
    data: result,
  });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.id as string;
  const result = await OrderService.getMyOrdersFromDB(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Orders retrieved successfully',
    data: result,
  });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.id as string;
  const role = (req.user as any)?.role as string;
  const { id } = req.params as { id: string };

  const result = await OrderService.getOrderByIdFromDB(userId, id, role);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order retrieved successfully',
    data: result,
  });
});

const cancelMyOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.id as string;
  const { id } = req.params as { id: string };

  const result = await OrderService.cancelMyOrderInDB(userId, id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order cancelled successfully',
    data: result,
  });
});

const getAllOrders = catchAsync(async (_req: Request, res: Response) => {
  const result = await OrderService.getAllOrdersFromDB();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'All orders retrieved successfully',
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { orderStatus } = req.body;

  const result = await OrderService.updateOrderStatusInDB(id, orderStatus);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order status updated successfully',
    data: result,
  });
});

export const OrderController = {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelMyOrder,
  getAllOrders,
  updateOrderStatus,
};

export default OrderController;
