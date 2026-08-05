const claimModel = require('../models/claimModel');

const claimDonation = async (supabase, donationId, recipientId) => claimModel.createClaim(supabase, {
  donation_id: donationId,
  recipient_id: recipientId
});

module.exports = { claimDonation };