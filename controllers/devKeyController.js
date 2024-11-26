//just fo development purpose
import DevKey from '../models/devKeyModel.js';

// Generate a new DevKey
export const generateDevKey = async (req, res) => {
  try {
    // Generate a new unique key (you could use a random string, UUID, etc.)
    const newDevKey = new DevKey({
      key: 'dev-key-' + Math.random().toString(36).substring(2, 15), // Random dev key for testing
      expirationDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // 1 day validity
      isUsed: false,
    });

    await newDevKey.save();
    
    res.status(201).json({
      success: true,
      message: 'Dev key generated successfully',
      devKey: newDevKey.key,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all DevKeys (for testing purposes)
export const getAllDevKeys = async (req, res) => {
  try {
    const devKeys = await DevKey.find();
    res.status(200).json({
      success: true,
      devKeys,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Mark a DevKey as used (for testing purposes)
export const useDevKey = async (req, res) => {
  const { devKey } = req.body;
  
  try {
    const key = await DevKey.findOne({ key: devKey });
    if (!key) {
      return res.status(400).json({ success: false, message: 'Dev key not found' });
    }

    if (key.isUsed) {
      return res.status(400).json({ success: false, message: 'Dev key already used' });
    }

    key.isUsed = true;
    await key.save();
    
    res.status(200).json({
      success: true,
      message: 'Dev key marked as used',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
