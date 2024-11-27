import Hotel from '../models/hotelModel.js';

// Get hotel by ID (HotelOwner can only access their own hotel, SuperAdmin can access any hotel)
export const getHotelById = async (req, res) => {
  const hotelId = req.user.role === 'hotelowner' ? req.user.hotelId : req.params.hotelId;

  try {
    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // HotelOwner can only access their own hotel
    if (req.user.role === 'hotelowner' && hotel.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only view your own hotel.' });
    }

    res.status(200).json({
      success: true,
      hotel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update hotel (SuperAdmin can update any hotel, HotelOwner can update only their own)
export const updateHotel = async (req, res) => {
  const hotelId = req.user.role === 'hotelowner' ? req.user.hotelId : req.params.hotelId;
  const { name, location, logo, description } = req.body;

  try {
    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // SuperAdmin can update any hotel, HotelOwner can only update their own hotel
    if (req.user.role === 'hotelowner' && hotel.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only update your own hotel.' });
    }

    hotel.name = name || hotel.name;
    hotel.location = location || hotel.location;
    hotel.logo = logo || hotel.logo;
    hotel.description = description || hotel.description;

    await hotel.save();

    res.status(200).json({
      success: true,
      message: 'Hotel updated successfully',
      hotel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete hotel (SuperAdmin can delete any hotel, HotelOwner can delete only their own)
export const deleteHotel = async (req, res) => {
  const hotelId = req.user.role === 'hotelowner' ? req.user.hotelId : req.params.hotelId;

  try {
    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // SuperAdmin can delete any hotel, HotelOwner can delete only their own hotel
    if (req.user.role === 'hotelowner' && hotel.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only delete your own hotel.' });
    }

    await hotel.remove();

    res.status(200).json({
      success: true,
      message: 'Hotel deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all hotels (SuperAdmin only)
export const getAllHotels = async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Access denied. Only SuperAdmins can view all hotels.' });
  }

  try {
    const hotels = await Hotel.find().populate('ownerId', 'name');

    res.status(200).json({
      success: true,
      hotels,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
