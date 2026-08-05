const donationService = require('../services/donationService');

const createDonation = async (req, res, next) => {
  try {
    const donation = await donationService.createDonation(req.supabase, req.user.id, req.body, req.file);
    return res.status(201).json(donation);
  } catch (error) {
    return next(error);
  }
};

const browseDonations = async (req, res, next) => {
  try {
    return res.json(await donationService.getAvailableDonations(req.supabase));
  } catch (error) {
    return next(error);
  }
};

const getDonationDetails = async (req, res, next) => {
  try {
    return res.json(await donationService.getDonationById(req.supabase, req.params.id));
  } catch (error) {
    return next(error);
  }
};

const getMyDonations = async (req, res, next) => {
  try {
    return res.json(await donationService.getDonationsByDonor(req.supabase, req.user.id));
  } catch (error) {
    return next(error);
  }
};

const updateDonation = async (req, res, next) => {
  try {
    return res.json(await donationService.updateDonation(req.supabase, req.params.id, req.user.id, req.body, req.file));
  } catch (error) {
    return next(error);
  }
};

const deleteDonation = async (req, res, next) => {
  try {
    await donationService.deleteDonation(req.supabase, req.params.id, req.user.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

module.exports = { createDonation, browseDonations, getDonationDetails, getMyDonations, updateDonation, deleteDonation };