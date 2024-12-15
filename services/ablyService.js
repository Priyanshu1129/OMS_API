import Ably from "ably";
import Bill from "../models/billModel.js";
import Customer from "../models/customerModel.js";
import {Dish} from "../models/dishModel.js";
import Table from "../models/tableModel.js";
import Hotel from "../models/hotelModel.js";

const ably = new Ably.Realtime(process.env.ABLY_API_KEY);

// Add error handling for publish
// export const orderPublishService = async (order, hotelId) => {
//   try {
//     ably.connection.on("connected", () => {
//       console.log("Connected to Ably");
//     });         
    
//     const channelName = `hotel-${hotelId}`;
//     const channel = ably.channels.get(channelName);

//     const populatedOrder = await populateOrder(order);

//     await channel.publish("new-order", populatedOrder);
//   } catch (error) {
//     console.error("Error publishing order:", error);
//     throw error;
//   }
// };

export const orderPublishService = async (order) => {
    try {
        // Step 1: Populate order data
        const populatedOrder = await populateOrder(order);
        
        // Step 2: Remove circular MongoClient references by serializing only relevant data
        const sanitizedOrder = {
            orderId : order._id,
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

        // Step 3: Publish sanitized order to Ably
        const channel = ably.channels.get(`hotel-${order.hotelId}`);  // Specify the channel name
        await channel.publish('new-order', sanitizedOrder);

    } catch (error) {
        console.error('Error publishing order:', error);
        throw error;
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



// Add subscription service
export const subscribeToOrders = (hotelId, callback) => {
  const channelName = `hotel-${hotelId}`;
  const channel = ably.channels.get(channelName);
  channel.subscribe("new-order", (message) => {
    callback(message.data);
  });
  return () => channel.unsubscribe(); // Return cleanup function
};

// Add connection state monitoring
ably.connection.on("connected", () => {
  console.log("Connected to Ably");
});

ably.connection.on("failed", () => {
  console.error("Failed to connect to Ably");
});

export default ably;
