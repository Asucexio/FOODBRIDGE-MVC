const claimService = require('../services/claimService');

const parsePagination = (query) => ({
  page: parseInt(query.page, 10) || 1,
  limit: Math.min(parseInt(query.limit, 10) || 10, 50),
});

const claimDonation = async (req, res, next) => {
  try {
    const claim = await claimService.claimDonation(req.supabase, req.params.donationId, req.user.id);
    return res.status(201).json({ success: true, data: claim });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'This donation has already been claimed.' });
    }
    return next(error);
  }
};

const getMyClaims = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const result = await claimService.getMyClaims(req.supabase, req.user.id, page, limit);
    return res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    return next(error);
  }
};

const cancelClaim = async (req, res, next) => {
  try {
    await claimService.cancelClaim(req.supabase, req.params.id, req.user.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

module.exports = { claimDonation, getMyClaims, cancelClaim };