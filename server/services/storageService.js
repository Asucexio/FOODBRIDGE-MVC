const path = require('path');
const env = require('../config/env');

const uploadDonationImage = async (supabase, file) => {
  if (!file) return null;

  const extension = path.extname(file.originalname) || '.jpg';
  const filePath = `donations/${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`;
  const { error } = await supabase.storage.from(env.storageBucket).upload(filePath, file.buffer, {
    contentType: file.mimetype,
    upsert: false
  });
  if (error) throw error;

  const { data } = supabase.storage.from(env.storageBucket).getPublicUrl(filePath);
  return data.publicUrl;
};

module.exports = { uploadDonationImage };