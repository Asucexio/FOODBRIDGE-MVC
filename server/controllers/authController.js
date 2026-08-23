const { createSupabaseClient } = require('../config/supabase');
const { createProfile, getProfileById, updateProfile: updateProfileModel } = require('../models/profileModel');

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

    let profile = null;
    try {
      profile = await getProfileById(supabase, data.user.id);
    } catch (profileErr) {
      // Gracefully ignore profile fetch error if profile is missing
    }

    return res.json({ user: data.user, session: data.session, profile });
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

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid profile fields provided for update.' });
    }

    const profile = await updateProfileModel(req.supabase, req.user.id, updates);
    return res.json({ success: true, profile });
  } catch (error) {
    return next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const { data, error } = await req.supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return res.json({ success: true, message: 'Password updated successfully.', user: data.user });
  } catch (error) {
    return next(error);
  }
};

module.exports = { register, login, me, updateProfile, changePassword };