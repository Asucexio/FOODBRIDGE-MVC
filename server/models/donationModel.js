const TABLE = 'donations';

const createDonation = async (supabase, donation) => {
  const { data, error } = await supabase.from(TABLE).insert(donation).select().single();
  if (error) throw error;
  return data;
};

const getDonationById = async (supabase, id) => {
  const { data, error } = await supabase.from(TABLE).select('*, claims(id, recipient_id, created_at)').eq('id', id).single();
  if (error) throw error;
  return data;
};

const getAvailableDonations = async (supabase) => {
  const { data, error } = await supabase.from(TABLE).select('*, claims(id)').is('claims.id', null).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

const getDonationsByDonor = async (supabase, donorId) => {
  const { data, error } = await supabase.from(TABLE).select('*, claims(id, recipient_id, created_at)').eq('donor_id', donorId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

const updateDonation = async (supabase, id, donorId, updates) => {
  const { data, error } = await supabase.from(TABLE).update(updates).eq('id', id).eq('donor_id', donorId).select().single();
  if (error) throw error;
  return data;
};

const deleteDonation = async (supabase, id, donorId) => {
  const { error } = await supabase.from(TABLE).delete().eq('id', id).eq('donor_id', donorId);
  if (error) throw error;
};

module.exports = { createDonation, getDonationById, getAvailableDonations, getDonationsByDonor, updateDonation, deleteDonation };