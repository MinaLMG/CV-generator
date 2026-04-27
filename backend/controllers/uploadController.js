import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { getSupabase } from '../utils/supabaseHelper.js';
import fs from 'fs';

// Configure Cloudinary using env variables. Assumes CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET are set.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadProfilePhoto = async (req, res) => {
  try {
    console.log("req.files", req.files);
    if (!req.files) {
      return res.status(400).json({ error: 'No image file provided.' });
    }
    const useCloudinary = process.env.USE_CLOUDINARY === 'true';
    const fileKey = 'photo';
    const uploadResults = {};
    console.log("useCloudinary", useCloudinary);
    const uploadToCloudinary = async (filePath) => {
      return await cloudinary.uploader.upload(filePath, {
        folder: 'CV_Genie_profiles',
        resource_type: 'image'
      });
    };
    console.log("fileKey", fileKey);
    const file = req.files[fileKey][0];
    const result = await uploadToCloudinary(file.path);
    uploadResults[fileKey] = result.secure_url;
    fs.unlinkSync(file.path);
    console.log("uploadResults", uploadResults);

    const photoUrl = uploadResults[fileKey];

    // Save URL to database
    const supabase = getSupabase();
    await supabase
      .from('profiles')
      .update({ photo_url: photoUrl })
      .eq('id', req.user.id);

    return res.status(200).json({ message: 'Profile photo uploaded successfully.', uploadResults, photo_url: photoUrl });

  } catch (err) {
    console.error("error in upload", err);
    res.status(500).json({ error: 'Server error during upload.' });
  }
};
