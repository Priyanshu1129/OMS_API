import Order from "../models/orderModel.js";
import Customer from "../models/customerModel.js";
import { Category, Dish } from "../models/dishModel.js";
import Table from "../models/tableModel.js"
import Bill from "../models/billModel.js"
import { createBill, updateBillDishes } from "./billServices.js";
import { ClientError, ServerError } from "../utils/errorHandler.js";


export const onQRScanService = async ({ tableId, hotelId }) => {

    const table = await Table.find({ tableId }).select('sequence status')

    const customer = await Customer.findOne({ tableId, hotelId });

    if ((orders.length > 0 && !customer) || (orders.length > 0 && orders[0].customerId != customer._id)) {
        throw new ServerError("Orders are available while customer is not");
    }

    const orders = await Order.find({ tableId, hotelId })
    const dishes = await Dish.find({ hotelId });
    const categories = await Category.find({ hotelId });
    const bill = await Bill.findOne({ tableId, hotelId }).select('totalAmount totalDiscount finalAmount status')

    const data = {
        table: table,
        customerName: customer?.name,
        existingOrders: orders,
        menu: {
            dishes,
            categories
        },
        bill
    };

    return data;
}

export const addNewOrderService = async (orderData, session) => {
    try {
        const { customerName, tableId, hotelId, dishes, status, note } = orderData;

        // Step 1: Check if customer exists for the given tableId
        let customer = await Customer.findOne({ tableId }).session(session);

        // Step 2: Create or Update the bill (before creating the order)
        let bill;
        if (!customer) {
            // If customer doesn't exist, create a new bill and customer
            bill = await createBill({ customerName, hotelId, dishes, session });
            customer = new Customer({
                hotelId,
                tableId,
                name: customerName,
                billId: bill._id,
            });
            await customer.save({ session });  // Save the customer after creating the bill
        } else {
            // If customer exists, update the existing bill
            bill = await updateBillDishes({ billId: customer.billId, newDishes: dishes, session });
        }

        // Step 3: Create a new order after the bill is created or updated
        const newOrder = new Order({
            customerId: customer._id,  // Linking the new order to the existing customer
            billId: bill._id,
            dishes: dishes.map(dish => ({
                dishId: dish._id,
                quantity: dish.quantity,
                notes: dish.notes
            })),
            status: status || 'pending', // Default status to 'pending'
            tableId,
            hotelId,
            note: note || '',  // Default to empty string if no note is provided
        });

        // Save the new order
        await newOrder.save({ session });

        return newOrder;
        // updated bill can be sent here in response

    } catch (error) {
        throw new ServerError(error.message); // Handle error properly
    }
};

// only for hotel owner
export const updateOrderService = async (orderData, session) => {
    try {
        const { orderId, dishes, status, note } = orderData;

        // Step 1: Find the existing order by ID
        const order = await Order.findById(orderId).session(session);

        if (!order) {
            throw new ClientError("Order not found");
        }

        // Step 2: Update the order details
        if (dishes) {
            // Update the dishes
            dishes.forEach(newDish => {
                const existingDish = order.dishes.find(dish => dish.dishId.toString() === newDish._id);

                if (existingDish) {
                    // If the dish exists, update the quantity
                    existingDish.quantity += newDish.quantity;

                    // Ensure quantity does not go below zero
                    if (existingDish.quantity <= 0) {
                        order.dishes = order.dishes.filter(dish => dish.dishId.toString() !== newDish._id);
                    }
                } else if (newDish.quantity > 0) {
                    // If the dish doesn't exist, add it only if quantity is positive
                    order.dishes.push({
                        dishId: newDish._id,
                        quantity: newDish.quantity,
                        notes: newDish.notes || ''
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

        // Step 3: Update the associated bill
        const billId = order.billId // Assuming a function exists to get the billId
        if (billId) {
            await updateBillDishes({ billId, newDishes: dishes, session });
        }

        return order;
    } catch (error) {
        throw new ServerError(error.message); // Replace with your error handling logic
    }
};

// only for hotel owner
export const deleteOrderService = async (orderData, session) => {
    try {
        const { orderId } = orderData;

        // Step 1: Find the order by ID
        const order = await Order.findById(orderId).session(session);

        if (!order) {
            throw new ClientError("Order not found");
        }

        // Step 2: Extract billId and dishes from the order
        const { billId, dishes } = order;

        if (!billId) {
            throw new ServerError("Bill ID not found in the order");
        }

        // Step 3: Delete the order
        await Order.findByIdAndDelete(orderId, { session });

        // Step 4: Update the associated bill
        const updateDishes = dishes.map(dish => ({
            _id: dish.dishId,
            quantity: -dish.quantity, // Negative to remove items from the bill
        }));

        const bill = await updateBillDishes({ billId, newDishes: updateDishes, session });

        return { updatedBill: bill };

    } catch (error) {
        throw new ServerError(error.message); // Replace with your error handling logic
    }
};

export const getOrdersByTableService = async (tableId) => {
    try {
        // Step 1: Query the orders based on tableId
        const orders = await Order.find({ tableId }).populate('dishes.dishId'); // Optionally populate dishes with dish details
        
        if (!orders || orders.length === 0) {
            throw new ServerError("No orders found for this table.");
        }

        // Step 2: Return the list of orders
        return orders;
    } catch (error) {
        console.log("Error while fetching orders by table ID:", error);
        throw new ServerError("Error while fetching orders");
    }
};
