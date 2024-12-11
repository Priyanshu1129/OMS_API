import Bill from "../models/billModel.js"
import Order from "../models/orderModel.js"; // Import Order model
import Customer from "../models/customerModel.js"; // Import Customer model
import { Dish } from "../models/dishModel.js";
import { ClientError, ServerError } from "../utils/errorHandler.js";

const calculateDiscount = (dish, quantity) => {
    let discount = 0;
    const offer = dish.appliedOffer;
    if (offer?.discountType === 'percent') {
        let cost = dish.price * quantity;
        discount = (cost * offer.value) / 100;
    } else if (offer?.discountType === 'amount') {
        discount = offer.value * quantity;
    }
    return discount;
}

export const createBill = async ({ customerName, dishes, hotelId, tableId, session }) => {
    try {
        if (!customerName) throw new ClientError("Customer name is required!");
        // Fetch dish details from the database
        const dishIds = dishes.map(d => d._id); // Assume dishes is an array of { dishId, quantity }
        const dishDetails = await Dish.find({ _id: { $in: dishIds }, hotelId });

        if (!dishDetails.length) {
            throw new ServerError('No valid dishes found for the provided IDs');
        }

        let totalAmount = 0;
        let totalDiscount = 0;
        const orderedItems = [];

        // Calculate total amount, discount, and final amount
        for (const dish of dishDetails) {
            const order = dishes.find(d => d._id === dish._id.toString());

            if (!order) continue; // Skip if no matching order found

            const quantity = Number(order.quantity) || 0;
            if (quantity == 0) continue;
            const cost = dish.price * quantity;

            // Calculate discount if an offer is applied
            let discount = 0;
            if (dish.appliedOffer) {
                discount = calculateDiscount(dish, quantity);
            }

            totalAmount += cost;
            totalDiscount += discount;

            // Add dish to orderedItems
            orderedItems.push({
                dishId: dish._id,
                quantity
            });
        }

        console.log("orderedItems", orderedItems);
        console.log("totalAmount", totalAmount);
        console.log("totalDiscount", totalDiscount)

        const finalAmount = totalAmount - totalDiscount;

        // Create the bill
        const bill = new Bill({
            customerName,
            orderedItems,
            totalAmount,
            totalDiscount,
            finalAmount,
            hotelId,
            tableId,
        });

        await bill.save({ session });

        return bill; // Return the created bill
    } catch (error) {
        console.error('Error creating bill:', error.message);
        throw error; // Re-throw the error for the calling function to handle
    }
};

export const updateBillDishes = async ({ billId, oldOrder, newDishes, session }) => {
    try {
        // Fetch the existing bill
        const bill = await Bill.findById(billId);
        if (!bill) {
            throw new ServerError('Something went wrong, bill not found!');
        }

        // Fetch details of the new ordered dishes
        const dishIds = newDishes.map(d => d._id);
        const dishDetails = await Dish.find({ _id: { $in: dishIds }, hotelId: bill.hotelId });


        if (!dishDetails.length) {
            throw new ServerError('No valid dishes found for the provided IDs');
        }

        let additionalAmount = 0;
        let additionalDiscount = 0;

        // Process each new dish
        for (const dish of dishDetails) {
            const order = newDishes.find(d => d._id.toString() === dish._id.toString());
            console.log("order----->", order)
            if (!order) continue; // Skip if no matching order found

            const quantity = Number(order.quantity);
            const cost = dish.price * quantity;

            console.log('new quantity', quantity);
            console.log("new cost", cost);

            // Calculate discount if an offer is applied
            let discount = 0;
            if (dish.appliedOffer) {
                discount = calculateDiscount(dish, quantity);
            }

            // Check if the dish already exists in orderedItems
            const existingItem = bill.orderedItems.find(item => item?.dishId?.toString() == dish._id?.toString());
            console.log('existing-item-in-bill:', existingItem);
            if (existingItem) {
                // Adjust the quantity
                if (!oldOrder) {
                    existingItem.quantity += quantity
                    additionalAmount += cost;
                    additionalDiscount += discount;
                } else {
                    const oldQuantity = oldOrder.dishes.find((d) => d.dishId.toString() == dish._id.toString()).quantity;
                    const changeInQuantity = quantity - oldQuantity;
                    existingItem.quantity += changeInQuantity;
                    const changeInCost = cost - (oldQuantity * dish.price);
                    additionalAmount += changeInCost;
                    const changeInDiscount = discount - calculateDiscount(dish.price, oldQuantity);
                    additionalDiscount += changeInDiscount;
                    console.log('it is old order', changeInQuantity, changeInCost, changeInDiscount);
                }
                // Remove the item if the quantity becomes zero or negative
                if (existingItem.quantity <= 0) {
                    bill.orderedItems = bill.orderedItems.filter(item => item.dishId.toString() != dish._id.toString());
                }
            } else if (quantity > 0) {
                // Add the new dish to orderedItems (only if quantity is positive)
                bill.orderedItems.push({
                    dishId: dish._id,
                    quantity
                });
                additionalAmount += cost;
                additionalDiscount += discount;
            }
        }

        // Update the bill totals
        bill.totalAmount += additionalAmount;
        bill.totalDiscount += additionalDiscount;
        bill.finalAmount = bill.totalAmount - bill.totalDiscount;

        // Save the updated bill
        await bill.save({ session });

        return bill; // Return the updated bill
    } catch (error) {
        console.error('Error updating bill:', error.message);
        throw error; // Re-throw the error for the calling function to handle
    }
};


export const updateBillService = async (billData, session) => {
    try {
        const { billId, tableId, customerName, status, totalAmount, totalDiscount, finalAmount } = billData;

        // Step 1: Find the existing bill by billId
        const bill = await Bill.findById(billId).session(session); // Use session for transactions
        if (!bill) {
            throw new ServerError("Bill not found.");
        }

        // Step 2: Update the fields in the bill (except orderedItems)
        if (customerName) {
            bill.customerName = customerName; // Update customer name
        }
        if (totalAmount !== undefined) {
            bill.totalAmount = totalAmount; // Update totalAmount
        }
        if (totalDiscount !== undefined) {
            bill.totalDiscount = totalDiscount; // Update totalDiscount
        }
        if (finalAmount !== undefined) {
            bill.finalAmount = finalAmount; // Update finalAmount
        }

        if (status) {
            bill.status = status; // Update status to 'paid' or 'payLater' or other valid values
        }

        // Save the updated bill
        await bill.save({ session });

        // Step 3: If the status is 'paid' or 'payLater', delete associated orders and customers
        if (status === 'paid' || status === 'payLater') {
            // Delete all orders related to this tableId
            await Order.deleteMany({ billId }).session(session); // Delete all orders for the tableId

            // Delete the customer associated with this tableId
            await Customer.deleteOne({ billId }).session(session); // Delete customer for the tableId
        }

        // Return the updated bill
        return bill;

    } catch (error) {
        console.error("Error while updating bill:", error.message);
        throw new ServerError(error.message); // Handle error
    }
};

