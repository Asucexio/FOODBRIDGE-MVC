const path = require('path');
const env = require('../config/env');

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

const uploadDonationImage = async (supabase, file) => {
  if (!file) return null;

  const extension = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    const err = new Error(`Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).slice(2);
  const filePath = `donations/${timestamp}-${randomStr}${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(env.storageBucket)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
      cacheControl: '3600',
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    const err = new Error('Failed to upload image. Please try again.');
    err.status = 502;
    throw err;
  }

  const { data } = supabase.storage.from(env.storageBucket).getPublicUrl(filePath);
  return data.publicUrl;
};

module.exports = { uploadDonationImage };