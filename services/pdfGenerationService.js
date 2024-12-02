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
            format: "A4", // A4 format
            width: "210mm", // Set width equivalent to standard size
            height: "297mm", // Set height equivalent to standard size
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
                    background-color: #f0f4f8; /* Light background color */
                    color: #333;
                    line-height: 1.6;
                }

                .container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    text-align: center;
                    padding: 0 20px;
                }

                .content {
                    background-color: #fff;
                    color: #333;
                    padding: 50px;
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    width: 100%;
                    max-width: 650px;
                }

                .header {
                    font-size: 42px;
                    font-weight: bold;
                    color: #2d3436; /* Dark color for the header */
                    margin-bottom: 15px;
                }

                .hotel-name {
                    font-size: 28px;
                    font-weight: bold;
                    color: #d35400; /* Vibrant orange for the hotel name */
                    margin: 20px 0;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
                }

                .qr-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    border: 3px solid #f39c12; /* Orange border */
                    padding: 40px;
                    margin: 30px 0;
                    border-radius: 15px;
                    background-color: #fefefe;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                    width: 80%;
                }

                .qr-container img {
                    width: 300px;  /* Increase the size */
                    height: auto;  /* Maintain aspect ratio */
                    margin-bottom: 20px;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }

                .table-info {
                    font-size: 20px;
                    font-weight: bold;
                    color: #555;
                    margin-top: 10px;
                    letter-spacing: 1px;
                }

                .footer {
                    font-size: 14px;
                    margin-top: 30px;
                    color: #7f8c8d;
                    font-style: italic;
                }

                /* Responsive design for smaller screens */
                @media (max-width: 768px) {
                    .content {
                        padding: 25px;
                    }
                    .header {
                        font-size: 36px;
                    }
                    .hotel-name {
                        font-size: 24px;
                    }
                    .qr-container {
                        padding: 20px;
                    }
                }

                /* Fancy button */
                .cta-button {
                    display: inline-block;
                    background-color: #d35400;
                    color: #fff;
                    padding: 12px 30px;
                    margin-top: 20px;
                    border-radius: 30px;
                    text-decoration: none;
                    font-weight: bold;
                    font-size: 18px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                    transition: background-color 0.3s, transform 0.2s;
                }

                .cta-button:hover {
                    background-color: #e67e22;
                    transform: translateY(-3px);
                }
            </style>
            <title>QR Code - Table Details</title>
        </head>
        <body>
            <div class="container">
                <div class="content">
                    <div class="header">Welcome to an Exceptional Dining Experience</div>
                    <div class="hotel-name">${hotelName}</div>
                    <div class="qr-container">
                        <h3>Table No.: ${tableNumber}</h3>
                        <img src="${qrCode}" alt="QR Code">
                        <p>Scan the QR code to view your table details and order directly!</p>
                        <a href="#" class="cta-button">Order Now</a>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} ${hotelName}. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};



