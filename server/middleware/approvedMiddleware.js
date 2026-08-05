const requireApprovedRecipient = (req, res, next) => {
  if (req.profile?.role !== 'recipient') {
    return res.status(403).json({ message: 'Only recipients can access this resource.' });
  }

  if (!req.profile.approved) {
    return res.status(403).json({ message: 'Recipient account is pending admin approval.' });
  }

  return next();
};

module.exports = { requireApprovedRecipient };