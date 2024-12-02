import { catchAsyncError } from '../middlewares/catchAsyncError.js';
import {
  getUserProfileService,
  approveHotelOwnerService,
  getAllHotelOwnersService,
  getUnApprovedOwnersService,
  getApprovedOwnersService,
  membershipExtenderService
} from '../services/userServices.js';

export const getUserProfile = catchAsyncError(async (req, res) => {
  const userId = req.user?.id;
  const user = await getUserProfileService(userId);
  res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    data: { user },
  });
});

export const approveHotelOwner = catchAsyncError(async (req, res,next,session) => {
  const { ownerId } = req.params;
  const updatedHotelOwner = await approveHotelOwnerService(ownerId, session);

  res.status(200).json({
    success: true,
    message: 'Hotel owner approved successfully',
    data: { hotelOwner: updatedHotelOwner}
  });
}, true);

export const getAllHotelOwners = catchAsyncError(async (req, res) => {

  const hotelOwners = await getAllHotelOwnersService();

  res.status(200).json({
    success: true,
    message: "All hotel owners fetched successfully",
    data: { hotelOwners }
  });
});

export const getUnApprovedOwners = catchAsyncError(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  // Call the service to get the pending hotels with pagination data
  const { unApprovedOwners, pagination } = await getUnApprovedOwnersService({ page, limit });

  res.status(200).json({
    success: true,
    message: "Unapproved owners fetched successfully",
    data: {
      unApprovedOwners,
      pagination,
    },
  });
});

export const getApprovedOwners = catchAsyncError(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  // Call the service to get the approved hotel owners with pagination data
  const { approvedOwners, pagination } = await getApprovedOwnersService({ page, limit });

  res.status(200).json({
    success: true,
    message: "Approved owners fetched successfully",
    data: {
      approvedOwners,
      pagination,
    },
  });
});

export const membershipExtender = catchAsyncError(async (req, res) => {
  // Logic to extend membership
  const hotelOwnerId = req.params.hotelOwnerId;
  // console.log(hotelOwnerId);
  // console.log(req.body);
  
  const {days} = req.body;
  // console.log(days);

  const updatedHotelOwner = await membershipExtenderService(hotelOwnerId, days);

  res.status(200).json({
    success: true,
    message: "Membership extended successfully",
    data: { updatedHotelOwner }
  });
});