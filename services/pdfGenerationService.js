import puppeteer from "puppeteer";
import { launchBrowser } from "../utils/puppeteerHelper.js";

export const generatePdfService = async (qrCode, tableId,tableNumber, hotelName) => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const htmlContent = generateHtmlContent(qrCode, tableId,tableNumber, hotelName);

        // Set the content of the page
        await page.setContent(htmlContent, { waitUntil: "load" });

        // Generate PDF buffer with dimensions matching QR code standards
        const pdfBuffer = await page.pdf({
            format: "A5", // A5 format
            // width: "210mm", // Set width equivalent to standard size
            // height: "297mm", // Set height equivalent to standard size
            printBackground: true,
        });

        await browser.close();
        return pdfBuffer;
    } catch (error) {
        console.error('Failed to generate PDF:', error);
        throw new Error('Failed to generate PDF');
    }
};

const generateHtmlContent = (qrCode, tableId, tableNumber, hotelName) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                /* Global styles */
                body {
                    font-family: 'Roboto', sans-serif;
                    margin: 0;
                    padding: 0;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: linear-gradient(135deg, rgb(255, 204, 128), rgb(255, 87, 34));
                    background-attachment: fixed;
                    background-size: cover;
                    color: #333;
                }

                .container {
                    width: 100%; 
                    max-width: 550px;
                    background-color: #fff;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
                    text-align: center;
                }

                .header {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2c3e50; 
                    margin-bottom: 10px;
                }

                .hotel-name {
                    font-size: 20px;
                    font-weight: bold;
                    color: rgb(255, 87, 34);
                    margin-bottom: 20px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .qr-container {
                    margin: 20px 0;
                }

                .qr-container img {
                    width: 250px; 
                    height: auto;
                    margin-bottom: 10px;
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }

                .table-info {
                    font-size: 18px;
                    color: #555;
                    margin-top: 10px;
                    font-weight: bold;
                }

                .footer {
                    font-size: 12px;
                    margin-top: 20px;
                    color: #7f8c8d;
                    font-style: italic;
                }
            </style>
            <title>QR Code - Table Details</title>
        </head>
        <body>
            <div class="container">
                <div class="header">Experience Fine Dining</div>
                <div class="hotel-name">${hotelName}</div>
                <div class="qr-container">
                    <img src="${qrCode}" alt="QR Code">
                    <p class="table-info">Table No.: ${tableNumber}</p>
                    <p>Scan the QR code to view your table details and place your order!</p>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} ${hotelName}. All rights reserved.
                </div>
            </div>
        </body>
        </html>
    `;
};



