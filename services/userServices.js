import { ClientError,ServerError } from '../utils/index.js';
import { HotelOwner, SuperAdmin } from '../models/userModel.js';
import Hotel from '../models/hotelModel.js';

export const getUserProfileService = async (userId) => {
    try {
        if (!userId) {
            throw new ClientError('ValidationError', 'User ID is required');
        }

        const hotelOwner = await HotelOwner.findById(userId).select('-password');
        const superAdmin = await SuperAdmin.findById(userId).select('-password');

        if (!hotelOwner && !superAdmin) {
            throw new ClientError('NotFoundError', 'User not found');
        }

        return hotelOwner || superAdmin;
    } catch (error) {
        throw new ServerError('Error while fetching user profile');
    }
};

export const approveHotelOwnerService = async (ownerId, session) => {
    if (!ownerId) {
      throw new ClientError('ValidationError', 'Owner ID is required');
    }
  
    const hotelOwner = await HotelOwner.findById(ownerId).session(session);
    if (!hotelOwner) {
      throw new ClientError("NotFoundError", "Hotel owner not found");
    }
  
    if (hotelOwner.isApproved) {
      throw new ClientError("ConflictError", "Hotel owner is already approved");
    }
  
    hotelOwner.isApproved = true;
  
    const hotel = new Hotel({
      name: `${hotelOwner.name}'s Hotel`,
      location: "Default Location",
      ownerId: hotelOwner._id,
    });
  
    await hotel.save({ session });
    hotelOwner.hotelId = hotel._id;
  
    await hotelOwner.save({ session });
  
    return await HotelOwner.findById(ownerId).populate('hotelId').session(session);
  };
  

export const getAllHotelOwnersService = async () => {
    try {
        const hotelOwners = await HotelOwner.find().select('-password');

        if (!hotelOwners || hotelOwners.length === 0) {
            throw new ClientError("NotFoundError", "No hotel owners found");
        }

        return hotelOwners;
    } catch (error) {
        throw new ServerError('Error while fetching all hotels owners');
    }
};


export const getUnApprovedOwnersService = async ({ page = 1, limit = 10 }) => {
    try {
        const skip = (page - 1) * limit;

        // Find pending hotels and return data
        const unApprovedOwners = await HotelOwner.find({ isApproved: false })
            .select('-password')
            .skip(skip)
            .limit(Number(limit)); // Ensure limit is a number

        // Get the total number of pending hotels
        const totalUnApprovedOwners = await HotelOwner.countDocuments({ isApproved: false });

        return {
            unApprovedOwners,
            pagination: {
                total: totalUnApprovedOwners,
                page: Number(page),
                totalPages: Math.ceil(totalUnApprovedOwners / limit),
                limit: Number(limit),
            },
        };
    } catch (error) {
        throw new ServerError('Error while fetching unapproved hotel owners');
    }
};

export const getApprovedOwnersService = async ({ page = 1, limit = 10 }) => {
    try {
        const skip = (page - 1) * limit;

        // Find approved hotel owners and return data
        const approvedOwners = await HotelOwner.find({ isApproved: true })
            .select('-password')
            .skip(skip)
            .limit(Number(limit)); // Ensure limit is a number

        // Get the total number of approved hotel owners
        const totalApprovedOwners = await HotelOwner.countDocuments({ isApproved: true });

        return {
            approvedOwners,
            pagination: {
                total: totalApprovedOwners,
                page: Number(page),
                totalPages: Math.ceil(totalApprovedOwners / limit),
                limit: Number(limit),
            },
        };
    } catch (error) {
        throw new ServerError('Error while fetching approved hotel owners');
    }
};
export const membershipExtenderService = async (hotelOwnerId, days) => {
    try {
        if (!hotelOwnerId) {
            throw new ClientError('ValidationError', 'Owner ID is required');
        }
        const hotelOwner = await HotelOwner.findById(hotelOwnerId);

        if (!hotelOwner) {
            throw new ClientError('NotFoundError', 'Hotel owner not found');
        }

        const now = new Date();
        const currentExpiry = hotelOwner.membershipExpires ? new Date(hotelOwner.membershipExpires) : null;

        const effectiveExpiry = currentExpiry && currentExpiry > now ? currentExpiry : now;
        effectiveExpiry.setDate(effectiveExpiry.getDate() + days);

        hotelOwner.membershipExpires = effectiveExpiry;

        await hotelOwner.save();

        return hotelOwner; // Return the updated hotel owner
    } catch (error) {
        if (error instanceof ClientError) {
            throw new ClientError(error.type, error.message, error.statusCode);
        } else {
            throw new ServerError('Error while extending membership', error);
        }
    }
};


