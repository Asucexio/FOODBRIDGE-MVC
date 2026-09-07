const claimService = require('../services/claimService');
const donationService = require('../services/donationService');
const notificationService = require('../services/notificationService');

const parsePagination = (query) => ({
  page: parseInt(query.page, 10) || 1,
  limit: Math.min(parseInt(query.limit, 10) || 10, 50),
});

const claimDonation = async (req, res, next) => {
  try {
    const claim = await claimService.claimDonation(req.supabase, req.params.donationId, req.user.id);
    
    // Asynchronously create notifications for donor and recipient
    (async () => {
      try {
        const donation = await donationService.getDonationById(req.supabase, req.params.donationId);
        if (donation) {
          if (donation.donor_id) {
            await notificationService.createNotification(req.supabase, {
              user_id: donation.donor_id,
              title: 'Donation Claimed! 🎉',
              message: `Your donation "${donation.food_name}" was claimed. Prepare for pickup!`,
              type: 'claim',
              link: '/donor-dashboard',
              metadata: { donationId: donation.id, claimId: claim.id },
            });
          }
          await notificationService.createNotification(req.supabase, {
            user_id: req.user.id,
            title: 'Claim Confirmed ✅',
            message: `You successfully claimed "${donation.food_name}". View your pickup pass.`,
            type: 'claim',
            link: '/claims/my-claims',
            metadata: { donationId: donation.id, claimId: claim.id },
          });
        }
      } catch (err) {
        console.warn('Failed to send claim notification:', err.message);
      }
    })();

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