const TABLE = 'donations';

const createDonation = async (supabase, donation) => {
  const { data, error } = await supabase.from(TABLE).insert(donation).select().single();
  if (error) throw error;
  return data;
};

const getDonationById = async (supabase, id) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*, claims(id, recipient_id, created_at)')
    .eq('id', id)
    .is('deleted_at', null)
    .single();
  if (error) throw error;
  return data;
};

const getAvailableDonations = async (supabase, page = 1, limit = 10, filters = {}) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from(TABLE)
    .select('*, claims(id)', { count: 'exact' })
    .is('claims.id', null)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  if (filters.search) {
    query = query.or(`food_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  return {
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  };
};

const getDonationsByDonor = async (supabase, donorId, page = 1, limit = 10) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from(TABLE)
    .select('*, claims(id, recipient_id, created_at)', { count: 'exact' })
    .eq('donor_id', donorId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  };
};

const updateDonation = async (supabase, id, donorId, updates) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .eq('donor_id', donorId)
    .is('deleted_at', null)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const deleteDonation = async (supabase, id, donorId) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('donor_id', donorId)
    .is('deleted_at', null);
  if (error) throw error;
};

module.exports = { createDonation, getDonationById, getAvailableDonations, getDonationsByDonor, updateDonation, deleteDonation };