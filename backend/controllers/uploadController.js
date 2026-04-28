import { v2 as cloudinary } from 'cloudinary';
import { getSupabase } from '../utils/supabaseHelper.js';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadProfilePhoto = async (req, res) => {
  const file = req.files?.photo?.[0];

  if (!file) {
    return res.status(400).json({ error: 'No image file provided.' });
  }

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'CV_Genie_profiles',
      resource_type: 'image',
    });

    // Clean up the temp file only after a successful upload
    fs.unlinkSync(file.path);

    const photoUrl = result.secure_url;

    // Persist URL to the user's profile row
    const supabase = getSupabase();
    const { error: dbError } = await supabase
      .from('profiles')
      .update({ photo_url: photoUrl })
      .eq('id', req.user.id);

    if (dbError) throw dbError;

    return res.status(200).json({ photo_url: photoUrl });
  } catch (err) {
    // Best-effort cleanup if temp file still exists after a failed upload
    if (file?.path) {
      try { fs.unlinkSync(file.path); } catch (_) { /* already gone */ }
    }
    console.error('[uploadProfilePhoto]', err);
    return res.status(500).json({ error: 'Server error during upload.' });
  }
};
