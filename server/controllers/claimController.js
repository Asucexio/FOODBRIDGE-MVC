const claimService = require('../services/claimService');

const claimDonation = async (req, res, next) => {
  try {
    const claim = await claimService.claimDonation(req.supabase, req.params.donationId, req.user.id);
    return res.status(201).json(claim);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'This donation has already been claimed.' });
    }
    return next(error);
  }
};

module.exports = { claimDonation };