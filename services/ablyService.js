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
    const channel = ablyRest.channels.get(`hotel-${order.hotelId._id || order.hotelId}`);

    const sanitizedOrder = {
      orderId: order._id,
      bill: {
        _id: order.billId._id,
        amount: order.billId.amount,
      },
      customer: {
        _id: order.customerId._id,
        name: order.customerId.name,
      },
      dishes: order.dishes.map(dish => ({
        _id: dish.dishId._id,
        name: dish.dishId.name,
        quantity: dish.quantity,
      })),
      table: {
        _id: order.tableId._id,
        number: order.tableId.number,
      },
      hotel: {
        _id: order.hotelId._id || order.hotelId,
        name: order.hotelId.name || '',
      },
      status: order.status
    };

    await channel.publish({
      name: 'new-order',
      data: sanitizedOrder
    });

  } catch (error) {
    console.error('Error publishing order:', {
      error: error.message,
      orderData: JSON.stringify(order, null, 2)
    });
    throw new ServerError(`Failed to publish order via REST: ${error.message}`);
  }
};

export const populateOrder = async (order) => {
  try {
    // Populate only necessary fields and use lean() to avoid Mongoose-specific metadata
    const billDetails = await Bill.findById(order.billId).lean();
    if (!billDetails) throw new Error(`Bill not found for ID: ${order.billId}`);
    
    const customerDetails = await Customer.findById(order.customerId).lean();
    if (!customerDetails) throw new Error(`Customer not found for ID: ${order.customerId}`);
    
    const dishesDetails = await Dish.find({ _id: { $in: order.dishes.map(dish => dish.dishId) } }).lean();
    if (!dishesDetails || dishesDetails.length === 0) throw new Error('No dishes found');
    
    const tableDetails = await Table.findById(order.tableId).lean();
    if (!tableDetails) throw new Error(`Table not found for ID: ${order.tableId}`);
    
    const hotelDetails = await Hotel.findById(order.hotelId).lean();
    if (!hotelDetails) throw new Error(`Hotel not found for ID: ${order.hotelId}`);

    // Remove any circular references or avoid deep population that causes loops
    const cleanOrder = {
      ...order,
      bill: {
        _id: billDetails._id,
        amount: billDetails.amount,
      },
      customer: {
        _id: customerDetails._id,
        name: customerDetails.name,
      },
      dishes: dishesDetails.map(dish => ({
        _id: dish._id,
        name: dish.name,
      })),
      table: {
        _id: tableDetails._id,
        number: tableDetails.number,
      },
      hotel: {
        _id: hotelDetails._id,
        name: hotelDetails.name,
      },
      status: order.status,
    };

    return cleanOrder;
  } catch (error) {
    console.error('Error in populateOrder:', error);
    throw new ServerError(`Failed to populate order: ${error.message}`);
  }
};

export default initializeAblyRest;
