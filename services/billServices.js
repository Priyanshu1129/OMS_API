import Bill from "../models/billModel.js"
import Order from "../models/orderModel"; // Import Order model
import Customer from "../models/customerModel"; // Import Customer model
import { Dish } from "../models/dishModel.js";
import { ServerError } from "../utils/errorHandler.js";
export const createBill = async ({ customerName, dishes, hotelId, tableId, session }) => {
    try {
        // Fetch dish details from the database
        const dishIds = dishes.map(d => d.dishId); // Assume dishes is an array of { dishId, quantity }
        const dishDetails = await Dish.find({ _id: { $in: dishIds }, hotelId }).populate('appliedOffer');

        if (!dishDetails.length) {
            throw new ServerError('No valid dishes found for the provided IDs');
        }

        let totalAmount = 0;
        let totalDiscount = 0;
        const orderedItems = [];

        // Calculate total amount, discount, and final amount
        for (const dish of dishDetails) {
            const order = dishes.find(d => d.dishId === dish._id.toString());
            if (!order) continue; // Skip if no matching order found

            const quantity = order.quantity;
            const price = dish.price * quantity;

            // Calculate discount if an offer is applied
            let discount = 0;
            if (dish.appliedOffer) {
                const offer = dish.appliedOffer;
                if (offer.discountType === 'percent') {
                    discount = (price * offer.value) / 100;
                } else if (offer.discountType === 'amount') {
                    discount = offer.value * quantity;
                }
            }

            totalAmount += price;
            totalDiscount += discount;

            // Add dish to orderedItems
            orderedItems.push({
                dishName: dish.name,
                quantity,
                notes: order.notes || '', // Assume notes are provided in the `dishes` input
            });
        }

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

export const updateBillDishes = async ({ billId, newDishes, session }) => {
    try {
        // Fetch the existing bill
        const bill = await Bill.findById(billId);
        if (!bill) {
            throw new ServerError('Bill not found');
        }

        // Fetch details of the new ordered dishes
        const dishIds = newDishes.map(d => d._id);
        const dishDetails = await Dish.find({ _id: { $in: dishIds }, hotelId: bill.hotelId }).populate('appliedOffer');

        if (!dishDetails.length) {
            throw new ServerError('No valid dishes found for the provided IDs');
        }

        let additionalAmount = 0;
        let additionalDiscount = 0;

        // Process each new dish
        for (const dish of dishDetails) {
            const order = newDishes.find(d => d._id === dish._id.toString());
            if (!order) continue; // Skip if no matching order found

            const quantity = order.quantity;
            const price = dish.price * Math.abs(quantity); // Use absolute value to calculate price

            // Calculate discount if an offer is applied
            let discount = 0;
            if (dish.appliedOffer) {
                const offer = dish.appliedOffer;
                if (offer.discountType === 'percent') {
                    discount = (price * offer.value) / 100;
                } else if (offer.discountType === 'amount') {
                    discount = offer.value * Math.abs(quantity);
                }
            }

            // Check if the dish already exists in orderedItems
            const existingItem = bill.orderedItems.find(item => item.dishName === dish.name);

            if (existingItem) {
                // Adjust the quantity
                existingItem.quantity += quantity;

                // Remove the item if the quantity becomes zero or negative
                if (existingItem.quantity <= 0) {
                    bill.orderedItems = bill.orderedItems.filter(item => item.dishName !== dish.name);
                }
            } else if (quantity > 0) {
                // Add the new dish to orderedItems (only if quantity is positive)
                bill.orderedItems.push({
                    dishName: dish.name,
                    quantity,
                    notes: order.notes || '',
                });
            }

            // Update totals
            if (quantity > 0) {
                additionalAmount += price;
                additionalDiscount += discount;
            } else {
                additionalAmount -= price;
                additionalDiscount -= discount;
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
            await Order.deleteMany({ tableId }).session(session); // Delete all orders for the tableId

            // Delete the customer associated with this tableId
            await Customer.deleteOne({ tableId }).session(session); // Delete customer for the tableId
        }

        // Return the updated bill
        return bill;

    } catch (error) {
        console.error("Error while updating bill:", error.message);
        throw new ServerError(error.message); // Handle error
    }
};

