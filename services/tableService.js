import Table from '../models/tableModel.js';
import { ClientError, ServerError } from '../utils/errorHandler.js';
import { ROLES } from '../utils/constant.js';
import Order from "../models/orderModel.js";
import { Dish } from "../models/dishModel.js";
import Bill from '../models/billModel.js';
import Customer from "../models/customerModel.js";

const calculateDiscount = (dish, quantity) => {
    let discount = 0;
    const offer = dish.offer;
    if (offer?.discountType === 'percent') {
        let cost = dish.price * quantity;
        discount = (cost * offer.value) / 100;
    } else if (offer?.discountType === 'amount') {
        discount = offer.value * quantity;
    }
    return discount;
}

export const getTableByIdService = async (tableId) => {
    try {

        const table = await Table.findById(tableId).populate('hotelId', 'name');
        if (!table) {
            throw new ClientError('Table not found', 404);
        }

        //not needed as already handled by middleware
        // if (user.role === ROLES.TABLE_OWNER && table.ownerId.toString() !== user.id) {
        // throw new ClientError('Access denied. You can only view your own table.', 403);
        // }
        table.populate('hotelId', 'name');
        return table;
    } catch (error) {
        if (error instanceof ClientError) throw error;
        else throw new ServerError('Error while fetching table details');
    }
}

export const getTablesService = async (user) => {
    try {
        // const tables = user.role === ROLES.TABLE_OWNER ? await Table.find({ ownerId: user.id }) : await Table.find();
        console.log(user);
        const tables = await Table.find({ hotelId: user.hotelId }).populate('hotelId', 'name');

        return tables;
    } catch (error) {
        if (error instanceof ClientError) { throw new ClientError(error.message, error.statusCode); }
        else throw new ServerError('Error while fetching tables');
    }
}

export const createTableService = async (user, tableData) => {
    try {
        const table = new Table({ ...tableData, hotelId: user.hotelId });
        await table.save();
        return table;
    } catch (error) {
        throw new ServerError('Error while creating table');
    }
}

export const updateTableService = async (user, tableId, tableData) => {
    try {
        const table = await getTableByIdService(user, tableId);
        Object.assign(table, tableData);
        await table.save();
        return table;
    } catch (error) {
        if (error instanceof ClientError) { throw error; }
        else throw new ServerError('Error while updating table');
    }
}

export const deleteTableService = async (user, tableId) => {
    try {
        const table = await getTableByIdService(user, tableId);
        await table.remove();
    } catch (error) {
        if (error instanceof ClientError) { throw error; }
        else
            throw new ServerError('Error while deleting table');
    }
}

export const occupyTableService = async (user, tableId) => {
    try {
        const table = await getTableByIdService(user, tableId);
        if (table.status === 'occupied') {
            throw new ClientError('Table is already occupied', 400);
        }
        table.status = 'occupied';
        await table.save();
    } catch (error) {
        if (error instanceof ClientError) { throw error; }
        else
            throw new ServerError('Error while occupying table');
    }
}

export const freeTableService = async (user, tableId) => {
    try {
        const table = await getTableByIdService(user, tableId);
        if (table.status === 'free') {
            throw new ClientError('Table is already free', 400);
        }
        table.status = 'free';
        await table.save();
    } catch (error) {
        if (error instanceof ClientError) { throw error; }
        else
            throw new ServerError('Error while freeing table');
    }
}

// export const getAllTablesOfHotelService = async (user) => {
//     try {
//         const tables = await Table.find({ hotelId: user.hotelId });
//         return tables;
//     } catch (error) {
//         throw new ServerError('Error while fetching tables');
//     }
// }

export const getOrdersByTableService = async (tableId) => {
    // Step 1: Query the orders based on tableId
    const orders = await Order.find({ tableId }).populate({
        "path": "dishes.dishId",
        "select": "-createdAt -updatedAt -quantity -hotelId "
    }); // Optionally populate dishes with dish details
    if (!orders || orders.length === 0) {
        throw new ClientError("No orders available for this table.");
    }

    // Step 2: Return the list of orders
    return orders;
};


export const generateTableBillService = async (tableId, session) => {
    // Start Transaction
    const orders = await Order.find({ tableId }).session(session);
    console.log("tableOrders : ", orders, tableId);
    if (!orders || orders.length === 0) {
        throw new ClientError('No orders are available to generate bill for the table');
    }

    const customerId = orders[0].customerId;
    const customer = await Customer.findById(customerId).session(session);
    console.log("customer : ", customer)
    let bill = await Bill.create(
        [
          {
            tableId,
            hotelId: customer.hotelId,
            customerName: customer.name,
            totalAmount: 0,
            totalDiscount: 0,
            finalAmount: 0,
            orderedItems: [],
          },
        ],
        { session }
      );
      console.log("bill : ", bill)
      bill = bill[0];

    let allOrderedDishes = [];
    let allOrderedDishesIds = [];

    orders.forEach((order) => {
        order.dishes.forEach((dish) => {
            if (!allOrderedDishesIds.includes(dish.dishId)) {
                allOrderedDishesIds.push(dish.dishId);
            }
            let existingDish = allOrderedDishes.find((d) => d.dishId === dish.dishId);
            if (!existingDish) {
                allOrderedDishes.push({ dishId: dish.dishId, quantity: dish.quantity });
            } else {
                existingDish.quantity += dish.quantity;
            }
        });
    });

    bill.orderedItems = allOrderedDishes;
    const dishesInfo = await Dish.find({ _id: { $in: allOrderedDishesIds } })
        .populate('offer')
        .session(session);

    if (!dishesInfo || dishesInfo.length === 0) {
        throw new ServerError("Dishes not found while generating bill!");
    }

    allOrderedDishes.forEach((item) => {
        const dish = dishesInfo.find((d) => String(d._id) === String(item.dishId));
        if (dish) {
            bill.totalAmount += dish.price * item.quantity;
            bill.totalDiscount += calculateDiscount(dish, item.quantity);
        }
    });

    bill.finalAmount = bill.totalAmount - bill.totalDiscount;

    if (bill.orderedItems.length === 0) {
        throw new ServerError('Unable to generate bill!');
    }

    await bill.save({ session });
    const populateBill = await Bill.findById(bill._id)
        .populate("orderedItems.dishId") // Populate Dish references with specific fields
        .populate("hotelId", "name address") // Populate Hotel references with specific fields
        .populate("tableId", "number sequence")
        .session(session)

    // Delete Customer and Orders
    await Customer.findByIdAndDelete(customerId).session(session);
    await Order.deleteMany({ tableId }).session(session);

    return populateBill;
};
