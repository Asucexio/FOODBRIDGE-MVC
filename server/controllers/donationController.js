const donationService = require('../services/donationService');

const parsePagination = (query) => ({
  page: parseInt(query.page, 10) || 1,
  limit: Math.min(parseInt(query.limit, 10) || 10, 50),
});

const createDonation = async (req, res, next) => {
  try {
    const donation = await donationService.createDonation(req.supabase, req.user.id, req.body, req.file);
    return res.status(201).json({ success: true, data: donation });
  } catch (error) {
    return next(error);
  }
};

const browseDonations = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const filters = {
      category: req.query.category,
      search: req.query.search,
    };
    const result = await donationService.getAvailableDonations(req.supabase, page, limit, filters);
    return res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    return next(error);
  }
};

const getDonationDetails = async (req, res, next) => {
  try {
    const donation = await donationService.getDonationById(req.supabase, req.params.id);
    return res.json({ success: true, data: donation });
  } catch (error) {
    return next(error);
  }
};

const getMyDonations = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const result = await donationService.getDonationsByDonor(req.supabase, req.user.id, page, limit);
    return res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    return next(error);
  }
};

const updateDonation = async (req, res, next) => {
  try {
    const donation = await donationService.updateDonation(req.supabase, req.params.id, req.user.id, req.body, req.file);
    return res.json({ success: true, data: donation });
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