import QRCode from "qrcode";
import qrModel from "../models/qrModel.js";
import { ClientError } from "../utils/errorHandler.js";

export const createQrService = async (tableId, hotelId) => {
    try {
        // Set the width and height for the QR code to make it larger
        const qrCodeImage = await QRCode.toDataURL(tableId, {
            width: 300, // Increase width (default is 200)
            height: 300, // Increase height (default is 200)
            margin: 3, // Optional: Adjust margin around the QR code
            color: {
                dark: "#000000",  // Dark color for the QR code
                light: "#ffffff"  // Light color for the background
            }
        });

        const qrCode = await qrModel.create({ 
            imageUrl: qrCodeImage, 
            code: tableId, 
            tableId, 
            hotelId 
        });

        return qrCode;
    } catch (error) {
        throw new ClientError(error.message, 400);
    }
};

export const getQrService = async (tableId) => {
    try {
        const qrCode = await qrModel.findOne({ tableId });
        if (!qrCode) {
            throw new ClientError('QR code not found', 404);
        }
        return qrCode;
    } catch (error) {
        throw new ClientError(error.message, 400);
    }
};
