import Order from "../models/orderModel.js";
import Customer from "../models/customerModel.js";
import { Category, Dish } from "../models/dishModel.js";
import Table from "../models/tableModel.js"
import { ClientError, ServerError } from "../utils/errorHandler.js";
import mongoose from "mongoose";

export const onQRScanService = async ({ tableId }) => {

    const table = await Table.findById(tableId)

    if (!table) {
        throw new ClientError('Table not found!');
    }

    const hotelId = table.hotelId;

    const customer = await Customer.findOne({ tableId, hotelId });

    const orders = await Order.find({ tableId, hotelId })
    if ((orders.length > 0 && !customer) || (orders.length > 0 && orders[0].customerId != customer._id.toString())) {
        throw new ServerError("Orders are available while customer is not");
    }

    // for creating menu 
    const dishes = await Dish.find({ hotelId });
    const categories = await Category.find({ hotelId });

    const data = {
        table: table,
        customerName: customer,
        existingOrders: orders,
        menu: {
            categories,
            dishes
        }
    };

    return data;
}

export const addNewOrderService = async (orderData, session) => {
    try {
        console.log("Order data----------", orderData)
        const { customerName, tableId, dishes, note, status } = orderData;
        const table = await Table.findById(tableId)
        if (!table) {
            throw new ClientError("Table not found!")
        }
        const hotelId = table.hotelId;

        let customer = await Customer.findOne({ tableId, hotelId }).session(session);

        if (!customer) {
            customer = new Customer({
                hotelId,
                tableId,
                name: customerName,
            });
            await customer.save({ session });
            await Table.findByIdAndUpdate(
                tableId,
                { status: "occupied" },
                { new: true, session }
            );
        }
        console.log("Dishes in new order ", dishes)
        const newOrder = new Order({
            customerId: customer._id,
            dishes: dishes.map(dish => ({
                dishId: new mongoose.Types.ObjectId(dish._id),
                quantity: dish.quantity,
                notes: dish.notes
            })),
            status: status || 'draft',
            tableId,
            hotelId,
            note: note || '',
        });

        console.log("new order ", newOrder)
        await newOrder.save({ session });
        return newOrder;

    } catch (error) {
        console.error('Error in addNewOrderService:', error);
        throw new ServerError(error.message);
    }
};

// only for hotel owner
export const deleteOrderService = async (orderId, session) => {
    try {

        // Step 1: Find the order by ID
        const order = await Order.findById(orderId).session(session);

        if (!order) {
            throw new ClientError("Order not found");
        }

        // Step 3: Delete the order
        await Order.findByIdAndDelete(orderId, { session });

        return order;

    } catch (error) {
        throw new ServerError(error.message); // Replace with your error handling logic
    }
};

export const getOrderDetailsService = async (orderId) => {
    try {
        const order = await Order.findById(orderId)
            .populate('customerId', '_id name')
            .populate('dishes.dishId')
            .populate('tableId', '_id number')
            .populate('hotelId', '_id name');

        if (!order) {
            throw new ClientError('Order not found!');
        }

        return order;
    } catch (error) {
        console.error('Error in getOrderDetailsService:', error);
        throw new ServerError(error.message);
    }
};


export const getAllOrderService = async () => {
    try {
        const orders = await Order.find({})
            .populate('customerId', '_id name')
            .populate('dishes.dishId')
            .populate('tableId', '_id sequence')
            .populate('hotelId', '_id name');

        if (!orders) {
            throw new ClientError('Order not found');
        }

        return orders;
    } catch (error) {
        console.error('Error in getOrderDetailsService:', error);
        throw new ServerError(error.message);
    }
};
