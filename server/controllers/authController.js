const { createSupabaseClient } = require('../config/supabase');
const { createProfile, updateProfile: updateProfileModel } = require('../models/profileModel');

const register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name || !['donor', 'recipient'].includes(role)) {
      return res.status(400).json({ message: 'name, email, password, and valid role are required.' });
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    const authedClient = data.session?.access_token ? createSupabaseClient(data.session.access_token) : supabase;
    const profile = await createProfile(authedClient, {
      id: data.user.id,
      name,
      email,
      role,
      approved: role === 'donor'
    });

    return res.status(201).json({ user: data.user, session: data.session, profile });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return res.json(data);
  } catch (error) {
    return next(error);
  }
};

const me = (req, res) => res.json({ user: req.user, profile: req.profile });

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;

    const profile = await updateProfileModel(req.supabase, req.user.id, updates);
    return res.json({ success: true, profile });
  } catch (error) {
    return next(error);
  }
};

module.exports = { register, login, me, updateProfile };