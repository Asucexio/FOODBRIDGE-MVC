const claimModel = require('../models/claimModel');

const claimDonation = async (supabase, donationId, recipientId) => claimModel.createClaim(supabase, {
  donation_id: donationId,
  recipient_id: recipientId,
});

const getMyClaims = async (supabase, recipientId, page = 1, limit = 10) =>
  claimModel.getClaimsByRecipient(supabase, recipientId, page, limit);

const cancelClaim = async (supabase, claimId, recipientId) =>
  claimModel.deleteClaim(supabase, claimId, recipientId);

module.exports = { claimDonation, getMyClaims, cancelClaim };