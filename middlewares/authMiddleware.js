import jwt from 'jsonwebtoken';
import { User, SuperAdmin, HotelOwner } from '../models/userModel.js'; // Import the User model and discriminators
import dotenv from 'dotenv';

dotenv.config();

export const protect = async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token using JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request object based on the discriminator
      // Check if the user is a SuperAdmin or HotelOwner and use the appropriate model
      if (decoded.role === 'superadmin') {
        req.user = await SuperAdmin.findById(decoded.id).select('-password');
      } else if (decoded.role === 'hotelowner') {
        req.user = await HotelOwner.findById(decoded.id).select('-password');
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      // If everything is fine, pass control to the next middleware or route handler
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

export const superAdminOnly = (req, res, next) => {
  // Ensure only SuperAdmins can access this route
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Access denied. SuperAdmin only.' });
  }
  next();
};
