const TABLE = 'claims';

const createClaim = async (supabase, claim) => {
  const { data, error } = await supabase.from(TABLE).insert(claim).select().single();
  if (error) throw error;
  return data;
};

const getClaimsByRecipient = async (supabase, recipientId, page = 1, limit = 10) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from(TABLE)
    .select('*, donations(*)', { count: 'exact' })
    .eq('recipient_id', recipientId)
    .is('donations.deleted_at', null)
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

const deleteClaim = async (supabase, claimId, recipientId) => {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', claimId)
    .eq('recipient_id', recipientId);

  if (error) throw error;
};

module.exports = { createClaim, getClaimsByRecipient, deleteClaim };