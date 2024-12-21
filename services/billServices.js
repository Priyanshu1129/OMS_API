import Bill from "../models/billModel.js"
import Order from "../models/orderModel.js"; // Import Order model
import Customer from "../models/customerModel.js"; // Import Customer model
import Table from "../models/tableModel.js"
import { ClientError, ServerError } from "../utils/errorHandler.js";


export const updateBillService = async (billData, session) => {
    try {
        const { billId, customerName, status, totalAmount, totalDiscount, finalAmount } = billData;


        // Step 1: Find the existing bill by billId
        const bill = await Bill.findById(billId).session(session); // Use session for transactions
        if (!bill) {
            throw new ServerError("Bill not found.");
        }
        const tableId = bill.tableId

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
            await Table.findByIdAndUpdate(tableId, { status: "free" })
            await Order.deleteMany({ tableId: bill.tableId }).session(session); // Delete all orders for the tableId

            // Delete the customer associated with this tableId
            await Customer.deleteOne({ tableId: bill.tableId }).session(session); // Delete customer for the tableId
        }

        // Return the updated bill
        return bill;

    } catch (error) {
        console.error("Error while updating bill:", error.message);
        throw error; // Handle error
    }
};

