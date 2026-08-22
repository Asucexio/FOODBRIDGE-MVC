const TABLE = 'profiles';

const createProfile = async (supabase, profile) => {
  const { data, error } = await supabase.from(TABLE).insert(profile).select().single();
  if (error) throw error;
  return data;
};

const getProfileById = async (supabase, id) => {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

const updateProfile = async (supabase, id, updates) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

module.exports = { createProfile, getProfileById, updateProfile };