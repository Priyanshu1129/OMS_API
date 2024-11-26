import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, SuperAdmin, HotelOwner } from '../models/userModel.js';
import DevKey from '../models/devKeyModel.js';
import dotenv from 'dotenv';

dotenv.config();

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Helper function to validate DevKey
const validateDevKey = async (devKey) => {
  const key = await DevKey.findOne({ key: devKey });

  if (!key) throw new Error('Invalid dev key');
  if (key.isUsed) throw new Error('Dev key already used');
  if (key.expirationDate < new Date()) throw new Error('Dev key has expired');

  return key; // Return key if valid
};

// User SignUp
export const signUp = async (req, res) => {
  const { email, password, role, devKey, name, hotelId } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // If role is 'superadmin', validate devKey
    if (role === 'superadmin') {
      try {
        const key = await validateDevKey(devKey);
        // Mark the dev key as used
        await DevKey.updateOne({ key: devKey }, { $set: { isUsed: true } });
      } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
    }

    // Determine the appropriate model based on the role
    const Model = role === 'superadmin' ? SuperAdmin : HotelOwner;

    const newUser = new Model({
      name,
      email,
      password,
      role,
      hotelId,
      isApproved: role === 'superadmin', // SuperAdmin is auto-approved
    });

    await newUser.save();

    const token = generateToken(newUser._id, newUser.role);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.role === 'hotelowner' && !user.isApproved) {
      return res.status(400).json({ success: false, message: 'Account not approved by Super Admin' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getUserProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const approveHotelOwner = async (req, res) => {
  const { ownerId } = req.params;

  try {
    const hotelOwner = await HotelOwner.findById(ownerId);
    if (!hotelOwner) {
      return res.status(400).json({ success: false, message: 'Invalid hotel owner' });
    }

    hotelOwner.isApproved = true;
    await hotelOwner.save();

    res.status(200).json({
      success: true,
      message: 'Hotel owner approved successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllHotels = async (req, res) => {
  try {
    const hotels = await HotelOwner.find().select('-password');
    res.status(200).json({
      success: true,
      hotels,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPendingHotels = async (req, res) => {
  try {
    const pendingHotels = await HotelOwner.find({ isApproved: false }).select('-password');
    res.status(200).json({
      success: true,
      pendingHotels,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getApprovedHotels = async (req, res) => {
  try {
    const approvedHotels = await HotelOwner.find({ isApproved: true }).select('-password');
    res.status(200).json({
      success: true,
      approvedHotels,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
