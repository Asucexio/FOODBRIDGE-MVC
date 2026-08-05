const TABLE = 'claims';

const createClaim = async (supabase, claim) => {
  const { data, error } = await supabase.from(TABLE).insert(claim).select().single();
  if (error) throw error;
  return data;
};

module.exports = { createClaim };