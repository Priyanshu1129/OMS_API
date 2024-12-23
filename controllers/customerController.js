import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Dish } from "../models/dishModel.js";
import offerModel from "../models/offerModel.js";
import orderModel from "../models/orderModel.js";
import tableModel from "../models/tableModel.js";
import { getAllCategoriesService } from "../services/categoryServices.js";

export const getHotelDishes = catchAsyncError(async (req, res) => {
  const hotelId = req.params.hotelId;
  const dishes = await Dish.find({ hotelId: hotelId }).populate(
    "ingredients category offer"
  );
  return res.send({
    status: "success",
    message: "Customer dishes fetched successfully",
    data: { dishes: dishes },
  });
});

export const getHotelCategories = catchAsyncError(async (req, res) => {
  const hotelId = req.params.hotelId;
  const categories = await getAllCategoriesService(hotelId);
  return res.send({
    status: "success",
    message: "Customer categories fetched successfully",
    data: { categories: categories },
  });
});

export const getHotelTable = catchAsyncError(async (req, res) => {
  const tableId = req.params.tableId;
  const table = await tableModel.findById(tableId).populate("customer");
  return res.send({
    status: "success",
    message: "Customer Table fetched successfully",
    data: { table: table },
  });
});

export const getHotelOffers = catchAsyncError(async (req, res) => {
  const hotelId = req.params.hotelId;
  const offers = await offerModel
    .find({ hotelId: hotelId })
    .populate("appliedOn");

  res.status(201).json({
    status: "success",
    message: "All customer Offers fetched successfully",
    data: { offers },
  });
});

export const getTableOrders = catchAsyncError(async (req, res) => {
  const tableId = req.params.tableId;
  let orders = await orderModel
    .find({ tableId: tableId })
    .populate("customerId", "_id name")
    .populate("dishes.dishId")
    .populate("tableId", "_id sequence")
    .populate("hotelId", "_id name");
  if (!orders) {
    orders = [];
  }
  res.status(201).json({
    status: "success",
    message: "All customer Orders fetched successfully",
    data: { orders },
  });

  return orders;
});
