import jwt from 'jsonwebtoken';
import { User, SuperAdmin, HotelOwner } from '../models/userModel.js'; // Import the User model and discriminators
import dotenv from 'dotenv';

dotenv.config();

// Middleware to protect routes by verifying JWT and checking user role
export const protect = async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token using JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Dynamically attach the user model based on the role (SuperAdmin or HotelOwner)
      if (decoded.role === 'superadmin') {
        req.user = await SuperAdmin.findById(decoded.id).select('-password');
      } else if (decoded.role === 'hotelowner') {
        req.user = await HotelOwner.findById(decoded.id).select('-password');
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      // If user is found, move to the next middleware or route handler
      next();
    } catch (error) {
      console.error(error);

      // Check for specific error types (expired token, invalid token)
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token has expired, please log in again' });
      }

      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

// Middleware to check if the logged-in user is a SuperAdmin
export const superAdminOnly = (req, res, next) => {
  // Ensure only SuperAdmins can access this route
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Access denied. SuperAdmin only.' });
  }
  next();
};

// Ownership validation for dynamic resources
export const validateOwnership = async (req, res, next) => {
  const { user } = req;

  // Only HotelOwners need ownership validation
  if (user.role !== 'hotelowner') {
    return next();
  }

  try {
    // Dynamically extract resource name from URL path (tables, bills, etc.)
    const resource = req.baseUrl.split('/')[3]; // Example: /tables/:id or /bills/:id
    const resourceIdKey = Object.keys(req.params).find((key) => key.toLowerCase().includes('id'));
    if (!resourceIdKey) {
      return res.status(400).json({ success: false, message: 'Resource ID not provided' });
    }

    const resourceId = req.params[resourceIdKey];

    // Dynamically load the resource model from Mongoose based on resource name
    const ResourceModel = mongoose.models[resource.charAt(0).toUpperCase() + resource.slice(1)];

    if (!ResourceModel) {
      return res.status(400).json({ success: false, message: `Invalid resource: ${resource}` });
    }

    // Fetch the resource data by ID
    const resourceData = await ResourceModel.findById(resourceId);
    if (!resourceData) {
      return res.status(404).json({ success: false, message: `${resource} not found` });
    }

    // Check if the resource belongs to the same hotel as the hotel owner
    if (!resourceData.hotelId.equals(user.hotelId)) {
      return res.status(403).json({ success: false, message: 'Access denied. This resource does not belong to your hotel.' });
    }

    // Proceed to the next middleware if ownership is validated
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during ownership validation' });
  }
};
