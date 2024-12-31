import Bill from "../models/billModel.js";
import Order from "../models/orderModel.js"; // Import Order model
import Customer from "../models/customerModel.js"; // Import Customer model
import Table from "../models/tableModel.js";
import { ClientError, ServerError } from "../utils/errorHandler.js";
import sendEmail from "../utils/sendEmail.js";

export const updateBillService = async (billData, session) => {
  try {
    const { billId, customerName, customDiscount } = billData;
    // Step 1: Find the existing bill by billId
    const bill = await Bill.findById(billId)
      .populate("orderedItems.dishId")
      .populate("hotelId", "name address")
      .populate("tableId", "number sequence")
      .session(session);
    if (!bill) {
      throw new ServerError("Bill not found.");
    }
    // Step 2: Update the fields in the bill (except orderedItems)
    if (customerName) {
      bill.customerName = customerName.trim(); // Update customer name
    }
    if (customDiscount !== undefined) {
      if (
        typeof customDiscount !== "number" &&
        typeof customDiscount !== "string"
      ) {
        throw new Error(
          "Invalid input: customDiscount must be a number or a numeric string."
        );
      }
      const parsedDiscount =
        typeof customDiscount === "string"
          ? Number(customDiscount)
          : customDiscount;

      if (isNaN(parsedDiscount)) {
        throw new Error(
          "Invalid input: customDiscount must be a valid number."
        );
      }

      bill.customDiscount = parsedDiscount; // Update customDiscount
      bill.finalAmount = bill.totalAmount - bill.totalDiscount - parsedDiscount;
    }

    await bill.save({ session });

    return bill;
  } catch (error) {
    console.error("Error while updating bill:", error.message);
    throw error; // Handle error
  }
};

export const billPayService = async (billId, session) => {
  try {
    // Step 1: Find the existing bill by billId
    const bill = await Bill.findById(billId)
      .populate("orderedItems.dishId")
      .populate("hotelId", "name address")
      .populate("tableId", "number sequence")
      .session(session);

    if (!bill) {
      throw new ServerError("Bill not found.");
    }
    const tableId = bill.tableId;
    bill.status = "paid";
    bill.customerId = null;
    await bill.save({ session });

    // Delete all orders related to this tableId
    const updatedTable = await Table.findByIdAndUpdate(
      tableId,
      { status: "free", customer: null },
      { new: true, session }
    );
    const orders = await Order.find({ tableId }).session(session);

    const orderIds = orders.map((order) => order._id);

    await Order.deleteMany({ tableId }).session(session); // Delete all orders for the tableId
    // console.log("orderIds : ", orderIds);

    await Customer.deleteOne({ tableId }).session(session); // Delete customer for the tableId
    return { bill, table: updatedTable, orders: orderIds };
  } catch (error) {
    throw error;
  }
};

export const sendBillToMailService = async (billId, mailId) =>{
  try {
    
    const bill = await Bill.findById(billId);
    if (!bill) {
      throw new ServerError("Bill not found.");
    }
    
    const billHTML = `
      <h1>Bill Details</h1>
      <h2>Hotel: ${bill.hotelId.name}</h2>
      <h3>Address: ${bill.hotelId.address}</h3>
      <h3>Table Number: ${bill.tableId.number}</h3>
      <h3>Table Sequence: ${bill.tableId.sequence}</h3>
      <h3>Customer Name: ${bill.customerName}</h3>
      <h3>Bill Amount: ${bill.totalAmount}</h3>
      <h3>Discount: ${bill.totalDiscount}</h3>
      <h3>Custom Discount: ${bill.customDiscount}</h3>
      <h3>Final Amount: ${bill.finalAmount}</h3>
    `;
    await sendEmail(mailId, "Bill Details", billHTML);
    return "Bill sent to mail successfully."; 
  }
  catch (error) {
    throw error;
  }
}
