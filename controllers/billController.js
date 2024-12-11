import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { ClientError } from "../utils/errorHandler.js";
import { updateBillService } from "../services/billServices.js"
import Bill from "../models/billModel.js";

export const getBill = catchAsyncError(async (req, res, next) => {
    const { billId } = req.params;
    if (!billId) {
        throw new ClientError("Please provide bill id to get bill");
    }

    const billDetails = await Bill.findById(billId);
    if (!billDetails) throw new ClientError("Bill not available");

    res.status(201).json({
        success: true,
        message: "Bill fetched successfully",
        data: { billDetails }
    })
})

export const updateBill = catchAsyncError(async (req, res, next, session) => {
    const { tableId, billId } = req.params;
    const { customerName, status, totalAmount, totalDiscount, finalAmount } = req.body;
    if (!billId || (!customerName && !status && !totalAmount && !totalDiscount && !finalAmount)) {
        throw new ClientError("Please provide sufficient data to update bill");
    }

    const updatedBill = await updateBillService({ billId, ...req.body }, session);

    res.status(201).json({
        success: true,
        message: "Bill updated successfully",
        data: { updatedBill }
    })
}, true)