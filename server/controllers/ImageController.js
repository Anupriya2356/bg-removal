import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import userModel from '../models/userModel.js';

const removeBgImage = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.creditBalance <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient credits', 
        creditBalance: user.creditBalance 
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    // Reading the image file
    const imageFile = fs.createReadStream(req.file.path);
    const formdata = new FormData();
    formdata.append('image_file', imageFile);

    // Call the background removal API
    const { data } = await axios.post(
      'https://clipdrop-api.co/remove-background/v1',
      formdata,
      {
        headers: {
          ...formdata.getHeaders(),
          'x-api-key': process.env.CLIPDROP_API,
        },
        responseType: 'arraybuffer',
      }
    );

    // Convert the result to base64
    const base64Image = Buffer.from(data, 'binary').toString('base64');
    const resultImage = `data:${req.file.mimetype};base64,${base64Image}`;

    // Update user's credit balance
    user.creditBalance -= 1;
    await user.save();

    // Clean up the uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    res.json({
      success: true,
      resultImage,
      creditBalance: user.creditBalance,
      message: 'Background removed successfully',
    });
  } catch (error) {
    console.error('Error in removeBgImage:', error);
    
    // Clean up the uploaded file in case of error
    if (req.file?.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file after error:', err);
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.response?.data?.error || 'Failed to process image',
    });
  }
};

export {removeBgImage}