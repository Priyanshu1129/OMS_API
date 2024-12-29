import Order from "../models/orderModel.js";
import Customer from "../models/customerModel.js";
import { Category, Dish } from "../models/dishModel.js";
import Table from "../models/tableModel.js"
import { ClientError, ServerError } from "../utils/errorHandler.js";
import mongoose from "mongoose";
import Bill from "../models/billModel.js";


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
        console.log("customer")
        let newCustomer = null;
        let updatedTable = null;
        let isFirstOrder = false;
        if (!customer) {
            console.log("customer not available")
            customer = new Customer({
                hotelId,
                tableId,
                name: customerName,
            });
            newCustomer = customer;
            await customer.save({ session });
            updatedTable = await Table.findByIdAndUpdate(
                tableId,
                { status: "occupied", customer: customer._id },
                { new: true, session }
            );
            isFirstOrder = true;
        }
        console.log("Dishes in new order ", dishes)
        const newOrder = new Order({
            customerId: customer._id,
            dishes: dishes.map(dish => ({
                dishId: new mongoose.Types.ObjectId(dish.dishId),
                quantity: dish.quantity,
                notes: dish.notes
            })),
            status: status || 'draft',
            tableId,
            hotelId,
            note: note || '',
            isFirstOrder : isFirstOrder
        });

        console.log("new order ", newOrder)
        await newOrder.save({ session });
        return { newOrder, newCustomer, table: updatedTable };

    } catch (error) {
        console.error('Error in addNewOrderService:', error);
        throw new ServerError(error.message);
    }
};

// only for hotel owner
export const deleteOrderService = async (orderId, session) => {
    try {
        const order = await Order.findById(orderId).session(session);

        if (!order) {
            throw new ClientError("Order not found");
        }

        const tableId = order.tableId;
        await Order.findByIdAndDelete(orderId, { session });

        const remainingOrders = await Order.find({ tableId }).session(session);

        let updatedTable = null;
        if (!remainingOrders || remainingOrders.length === 0) {
            updatedTable = await Table.findByIdAndUpdate(
                tableId,
                { status: "free", customer: null },
                { new: true, session }
            );
            const customer = await Customer.findOne({ tableId }).session(session);
            if (customer) {
                await customer.deleteOne({ session });
                const bill = await Bill.findOne({ tableId, customerId: customer._id }).session(session);
                if (bill) await bill.deleteOne({ session });
            }
        }

        return { order, table: updatedTable };
    } catch (error) {
        throw new ServerError(error.message || "An error occurred while deleting the order");
    }
};


export const getOrderDetailsService = async (orderId) => {
    try {
        const order = await Order.findById(orderId)
            .populate('customerId', '_id name')
            .populate('dishes.dishId')
            .populate('tableId', '_id sequence capacity position')
            .populate('hotelId', '_id name');

        console.log("order", order)
        if (!order) {
            throw new ClientError('Order not found!');
        }

        return order;
    } catch (error) {
        console.error('Error in getOrderDetailsService:', error);
        throw new ServerError(error.message);
    }
};

export const getAllOrderService = async (hotelId) => {
    try {
        const orders = await Order.find({ hotelId: hotelId })
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
