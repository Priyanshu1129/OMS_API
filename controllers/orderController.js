import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import {
  addNewOrderService,
  updateOrderService,
  deleteOrderService,
  getOrderDetailsService,
  getAllOrderService,
  getTableOrdersService,
} from "../services/orderServices.js";
import { ClientError, ServerError } from "../utils/errorHandler.js";
import { onQRScanService } from "../services/orderServices.js";
import Order from "../models/orderModel.js";
import { orderPublishService } from "../services/ablyService.js";

export const onQRScan = catchAsyncError(async (req, res, next) => {
  const { hotelId, tableId } = req.params;

  if (!tableId || !hotelId) {
    throw new ClientError("Please provide table Id and hotel Id");
  }

  const data = await onQRScanService({ hotelId, tableId });

  res.status(200).json({
    success: true,
    message: "Details fetched successfully",
    data,
  });
});

export const getAllOrders = catchAsyncError(async (req, res, next) => {
  const orders = await getAllOrderService();
  res.status(200).json({
    status: "success",
    message: "Orders fetched successfully",
    data: { orders },
  });
});

export const getOrderById = catchAsyncError(async (req, res, next) => {
  const { orderId } = req.params;
  if (!orderId) {
    throw new ClientError("Please provide order id to get order");
  }
  const orderDetails = await Order.findById(orderId);

  //populate order details
  await orderDetails.populate("customerId tableId hotelId");

  //populate dishes array details
  await orderDetails.populate("dishes.dishId");

  if (!orderDetails) throw new ClientError("Order not available");

  res.status(201).json({
    success: true,
    message: "Order fetched successfully",
    data: { orderDetails },
  });
});

export const createOrder = catchAsyncError(async (req, res, next, session) => {
  const { tableId, hotelId } = req.params;
  const { customerName, dishes, status, note } = req.body;

  if (!hotelId || !tableId || !dishes || dishes.length <= 0) {
    throw new ClientError("Please provide sufficient data to create order");
  }

  console.log("hotel Id in createorder controller ", hotelId)
  const newOrder = await addNewOrderService(
    { ...req.body, tableId, hotelId },
    session
  );

  const populatedOrder = await Order.findById(newOrder._id)
    .populate("customerId", "_id name")
    .populate("dishes.dishId")
    .populate("tableId", "_id sequence")
    .populate("hotelId", "_id name")
    .session(session);

  console.log("populated Order", populatedOrder)

  return res.status(201).json({
    status: "success",
    message: "New order created successfully",
    data: { order: populatedOrder },
  });
}, true);

export const updateOrderByOwner = catchAsyncError(
  async (req, res, next, session) => {
    const { orderId } = req.params;
    const { dishes } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { dishes: dishes },
      { new: true }
    )
      .populate("customerId", "_id name")
      .populate("dishes.dishId")
      .populate("tableId", "_id sequence")
      .populate("hotelId", "_id name")
      .session(session);

    return res.status(201).json({
      status: "success",
      message: "Order updated Successfully",
      data: { order: updatedOrder },
    });
  }
);

export const updateOrder = catchAsyncError(async (req, res, next, session) => {
  const { orderId } = req.params;
  const { dishes, status, note } = req.body;
  if (!orderId || (!dishes && !status && !note)) {
    throw new ClientError("Please provide sufficient data to update order");
  }

  const updatedOrder = await updateOrderService(
    { orderId, ...req.body },
    session
  );

  res.status(201).json({
    success: true,
    message: "Order updated successfully",
    data: { updatedOrder },
  });
}, true);

export const updateStatus = catchAsyncError(async (req, res, next, session) => {
  const { orderId, status } = req.params;
  if (!orderId || !status) {
    throw new ClientError(
      "Please provide sufficient data (orderID and status) to update order status"
    );
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { status: status },
    { new: true }
  )
    .populate("customerId", "_id name")
    .populate("dishes.dishId", "_id name price")
    .populate("tableId", "_id number sequence")
    .populate("hotelId", "_id name");

  res.status(201).json({
    status: "success",
    message: "Order status updated successfully",
    data: { order: updatedOrder },
  });
}, true);

export const deleteOrder = catchAsyncError(async (req, res, next, session) => {
  const { orderId } = req.params;
  if (!orderId) {
    throw new ClientError("Please provide sufficient data to delete order");
  }

  const deletedOrder = await deleteOrderService(orderId, session);

  res.status(201).json({
    success: true,
    message: "Order deleted successfully",
    data: { deletedOrder },
  });
}, true);

export const getOrderDetails = catchAsyncError(async (req, res) => {
  const { orderId } = req.params;

  if (!orderId) {
    throw new ClientError("Please provide order ID");
  }

  const orderDetails = await getOrderDetailsService(orderId);

  res.status(200).json({
    success: true,
    message: "Order details fetched successfully",
    data: { order: orderDetails },
  });
});

export const getTableOrders = catchAsyncError(async (req, res) => {
  const { tableId } = req.params;

  if (!tableId) {
    throw new ClientError("Please provide order ID");
  }

  const orderDetails = await getTableOrdersService(tableId);

  res.status(200).json({
    status: "success",
    message: "Table Order details fetched successfully",
    data: { orders: orderDetails },
  });
});

export const publishOrder = catchAsyncError(async (req, res) => {
  const { orderId } = req.params;
  console.log("orderId", orderId);
  console.log("inside publishOrder");
  if (!orderId) {
    throw new ClientError("Please provide order ID");
  }

  const order = await Order.findById(orderId)
    .populate("dishes.dishId", "_id name price")
    .populate("tableId", "_id number")
    .populate("hotelId", "_id name");

  if (!order) {
    throw new ClientError("Order not found");
  }

  try {
    await orderPublishService(order);
    order.status = "pending";
    await order.save();
    res.status(200).json({
      status: "success",
      message: "Order Confirmed successfully",
      data: {
        order,
      },
    });
  } catch (error) {
    console.error("Error publishing order:", error);
    throw new ServerError(`Failed to publish order: ${error.message}`);
  }
});
