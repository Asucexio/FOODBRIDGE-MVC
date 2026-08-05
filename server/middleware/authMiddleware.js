const { createSupabaseClient } = require('../config/supabase');
const { getProfileById } = require('../models/profileModel');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authentication token is required.' });

    const supabase = createSupabaseClient(token);
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ message: 'Invalid or expired token.' });

    req.supabase = supabase;
    req.user = data.user;
    req.profile = await getProfileById(supabase, data.user.id);
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Unable to authenticate user.', details: error.message });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.profile || !roles.includes(req.profile.role)) {
    return res.status(403).json({ message: `Requires role: ${roles.join(' or ')}.` });
  }
  return next();
};

module.exports = { authenticate, requireRole };