import Ably from "ably";
import Bill from "../models/billModel.js";
import Customer from "../models/customerModel.js";
import {Dish} from "../models/dishModel.js";
import Table from "../models/tableModel.js";
import Hotel from "../models/hotelModel.js";
import { ServerError } from "../utils/errorHandler.js";

const initializeAblyRest = () => {
  try {
    return new Ably.Rest({
      key: process.env.ABLY_API_KEY
    });
  } catch (error) {
    console.error("Error initializing Ably REST:", error);
    throw new ServerError("Failed to initialize REST service");
  }
};

export const orderPublishService = async (order) => {
  try {
    const ablyRest = initializeAblyRest();
    const channel = ablyRest.channels.get(`hotel-${order.hotelId}`);

    // Populate and sanitize order data (keeping existing logic)
    const populatedOrder = await populateOrder(order);
    const sanitizedOrder = {
      orderId: order._id,
      bill: populatedOrder.bill,
      customer: populatedOrder.customer,
      dishes: populatedOrder.dishes.map(dish => ({
        _id: dish._id,
        name: dish.name,
        quantity: dish.quantity,
      })),
      table: populatedOrder.table,
      hotel: populatedOrder.hotel,
      status: populatedOrder.status
    };

    await channel.publish({
      name: 'new-order',
      data: sanitizedOrder
    });

  } catch (error) {
    console.error('Error publishing order:', error);
    throw new ServerError(`Failed to publish order via REST: ${error.message}`);
  }
};

export const populateOrder = async (order) => {
  // Populate only necessary fields and use lean() to avoid Mongoose-specific metadata
  const billDetails = await Bill.findById(order.billId).lean();
  const customerDetails = await Customer.findById(order.customerId).lean();
  const dishesDetails = await Dish.find({ _id: { $in: order.dishes.map(dish => dish.dishId) } }).lean();
  const tableDetails = await Table.findById(order.tableId).lean();
  const hotelDetails = await Hotel.findById(order.hotelId).lean();

  // Remove any circular references or avoid deep population that causes loops
  const cleanOrder = {
    ...order,
    bill: {
      _id: billDetails._id,
      amount: billDetails.amount,  // Only include necessary fields
    },
    customer: {
      _id: customerDetails._id,
      name: customerDetails.name,  // Only include necessary fields
    },
    dishes: dishesDetails.map(dish => ({
      _id: dish._id,
      name: dish.name,  // Only include necessary fields
    })),
    table: {
      _id: tableDetails._id,
      number: tableDetails.number,  // Only include necessary fields
    },
    hotel: {
      _id: hotelDetails._id,
      name: hotelDetails.name,  // Only include necessary fields
    },
    status: order.status,  // Status is simple data, no need to populate
  };

  return cleanOrder;
};

export default initializeAblyRest;
