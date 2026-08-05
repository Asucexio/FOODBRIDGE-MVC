const donationModel = require('../models/donationModel');
const { uploadDonationImage } = require('./storageService');

const allowedFields = ['food_name', 'description', 'category', 'quantity', 'pickup_location', 'pickup_deadline', 'image_url'];

const pickDonationFields = (body) => allowedFields.reduce((payload, field) => {
  if (body[field] !== undefined) payload[field] = body[field];
  return payload;
}, {});

const createDonation = async (supabase, donorId, body, file) => {
  const imageUrl = await uploadDonationImage(supabase, file);
  return donationModel.createDonation(supabase, {
    ...pickDonationFields(body),
    donor_id: donorId,
    image_url: imageUrl || body.image_url || null
  });
};

const updateDonation = async (supabase, donationId, donorId, body, file) => {
  const imageUrl = await uploadDonationImage(supabase, file);
  const updates = pickDonationFields(body);
  if (imageUrl) updates.image_url = imageUrl;
  return donationModel.updateDonation(supabase, donationId, donorId, updates);
};

module.exports = {
  createDonation,
  updateDonation,
  getAvailableDonations: donationModel.getAvailableDonations,
  getDonationById: donationModel.getDonationById,
  getDonationsByDonor: donationModel.getDonationsByDonor,
  deleteDonation: donationModel.deleteDonation
};