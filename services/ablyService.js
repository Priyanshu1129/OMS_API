import Ably from "ably";
import Bill from "../models/billModel.js";
import Customer from "../models/customerModel.js";
import {Dish} from "../models/dishModel.js";
import Table from "../models/tableModel.js";
import Hotel from "../models/hotelModel.js";
import { ServerError } from "../utils/errorHandler.js";

const connectAbly = async (ABLY_API_KEY) => {
    try {
        const ably = new Ably.Realtime({
            key: ABLY_API_KEY,
            clientId: `server-${Date.now()}`
        });

        // Add connection state monitoring
        ably.connection.on("connected", () => {
            console.log("Connected to Ably successfully");
        });

        ably.connection.on("failed", (error) => {
            console.error("Failed to connect to Ably:", error);
            throw new ServerError("Failed to connect to Ably");
        });

        ably.connection.on("disconnected", () => {
            console.warn("Disconnected from Ably - attempting to reconnect...");
        });

        ably.connection.on("closed", () => {
            console.log("Ably connection closed");
        });

        return ably;
    } catch (error) {
        console.error("Error initializing Ably:", error);
        throw new ServerError("Failed to initialize real-time service");
    }
};

export default connectAbly;

export const orderPublishService = async (order) => {
    try {
        if (!global.ably || !global.ably.connection.state === 'connected') {
            throw new Error('Ably connection not established');
        }

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

        const channel = global.ably.channels.get(`hotel-${order.hotelId}`);
        await channel.publish({
            name: 'new-order',
            data: sanitizedOrder,
            timestamp: Date.now()
        });

    } catch (error) {
        console.error('Error publishing order:', error);
        throw new ServerError('Failed to publish order to real-time service');
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
