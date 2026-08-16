const donationModel = require('../models/donationModel');
const { uploadDonationImage } = require('./storageService');

const allowedFields = ['food_name', 'description', 'category', 'quantity', 'pickup_location', 'pickup_deadline', 'image_url'];

const pickDonationFields = (body) => allowedFields.reduce((payload, field) => {
  if (body[field] !== undefined) payload[field] = body[field];
  return payload;
}, {});

const validateFutureDate = (dateString) => {
  if (!dateString) return true;
  const date = new Date(dateString);
  return date > new Date();
};

const createDonation = async (supabase, donorId, body, file) => {
  const payload = pickDonationFields(body);

  if (payload.pickup_deadline && !validateFutureDate(payload.pickup_deadline)) {
    const err = new Error('Pickup deadline must be in the future.');
    err.status = 400;
    throw err;
  }

  const imageUrl = await uploadDonationImage(supabase, file);
  return donationModel.createDonation(supabase, {
    ...payload,
    donor_id: donorId,
    image_url: imageUrl || body.image_url || null
  });
};

const updateDonation = async (supabase, donationId, donorId, body, file) => {
  const payload = pickDonationFields(body);

  if (payload.pickup_deadline && !validateFutureDate(payload.pickup_deadline)) {
    const err = new Error('Pickup deadline must be in the future.');
    err.status = 400;
    throw err;
  }

  const imageUrl = await uploadDonationImage(supabase, file);
  if (imageUrl) payload.image_url = imageUrl;

  return donationModel.updateDonation(supabase, donationId, donorId, payload);
};

module.exports = {
  createDonation,
  updateDonation,
  getAvailableDonations: donationModel.getAvailableDonations,
  getDonationById: donationModel.getDonationById,
  getDonationsByDonor: donationModel.getDonationsByDonor,
  deleteDonation: donationModel.deleteDonation
};