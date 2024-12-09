import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDb from '../connectDb.js'; // Assuming you have a database connection utility
import { error } from '../middlewares/errorMiddleware.js'; // Global error handling middleware
import userRouter from '../routes/userRouter.js'; // Import userRouter
import devKeyRouter from '../routes/devKeyRouter.js';
import hotelRouter from "../routes/hotelRouter.js";
import authRouter from "../routes/authRouter.js"
import tableRouter from "../routes/tableRouter.js"
import qrRouter from "../routes/qrRouter.js"
import puppeteer from 'puppeteer';
import fs from 'fs';
import { launchBrowser } from '../utils/puppeteerHelper.js';

const app = express();

// CORS configuration
const corsOptions = {
  origin: ["https://orm-frontend-eight.vercel.app", "http://localhost:3000"], // Update with your frontend URLs
  // origin: "*", 
  methods: ["POST", "GET", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
dotenv.config();

// Middleware setup
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Database connection
const DB_URL = process.env.DATABASE_URL;
connectDb(DB_URL);

// Routes setup
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Hotel Order Management System' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/devkeys', devKeyRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/hotels',hotelRouter);
app.use('/api/v1/tables',tableRouter);
app.use('/api/v1/qrs',qrRouter);

app.use(error); // This will catch any errors from previous routes and middleware

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
