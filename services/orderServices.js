import Order from "../models/orderModel.js";
import Customer from "../models/customerModel.js";
import { Category, Dish } from "../models/dishModel.js";
import Table from "../models/tableModel.js"
import { ClientError, ServerError } from "../utils/errorHandler.js";

export const onQRScanService = async ({ tableId, hotelId }) => {

    const table = await Table.findById(tableId).select('sequence status')

    if (!table) {
        throw new ClientError('Table not found!');
    }

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
        customerName: customer?.name || null,
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
        const { customerName, tableId, hotelId, dishes, note, status } = orderData;

        let customer = await Customer.findOne({ tableId }).session(session);

        if (!customer) {
            customer = new Customer({
                hotelId,
                tableId,
                name: customerName,
            });
            await customer.save({ session });
        }

        const newOrder = new Order({
            customerId: customer._id,
            dishes: dishes.map(dish => ({
                dishId: dish._id,
                quantity: dish.quantity,
                notes: dish.notes
            })),
            status: status || 'draft',
            tableId,
            hotelId,
            note: note || '',
        });

        await newOrder.save({ session });
        return newOrder;

    } catch (error) {
        console.error('Error in addNewOrderService:', error);
        throw new ServerError(error.message);
    }
};

// only for hotel owner
export const updateOrderService = async (orderData, session) => {
    try {
        const { orderId, status, note } = orderData;
        let dishes = orderData.dishes;

        const order = await Order.findById(orderId).session(session);

        if (!order) {
            throw new ClientError("Order not found");
        }

        dishes = dishes?.filter((item) => item.quantity >= 0);
        if (dishes && dishes.length > 0) {
            dishes.forEach(newDish => {
                const existingDish = order.dishes.find(dish => dish.dishId.toString() === newDish._id.toString());

                if (existingDish) {
                    // If the dish exists, update the quantity
                    existingDish.quantity = Number(newDish.quantity);

                    // Ensure quantity does not go below zero
                    if (existingDish.quantity <= 0) {
                        order.dishes = order.dishes.filter(dish => dish.dishId.toString() !== newDish._id.toString());
                    }
                } else if (Number(newDish.quantity) > 0) {
                    // If the dish doesn't exist, add it only if quantity is positive
                    order.dishes.push({
                        dishId: newDish._id,
                        quantity: Number(newDish.quantity),
                        note: newDish.note || ''
                    });
                }
            });
        }

        // Update status if provided
        if (status) {
            order.status = status;
        }

        // Update note if provided
        if (note) {
            order.note = note;
        }

        // Save the updated order
        await order.save({ session });

        return order;
    } catch (error) {
        console.log('error occurred while updating order!')
        throw error; // Replace with your error handling logic
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
            throw new ClientError('Order not found');
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


