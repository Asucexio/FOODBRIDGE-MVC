const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

const createSupabaseClient = (accessToken) => createClient(env.supabaseUrl, env.supabaseAnonKey, {
  global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
  auth: { persistSession: false, autoRefreshToken: false }
});

const supabaseAdmin = env.supabaseServiceRoleKey
  ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  : null;

module.exports = { createSupabaseClient, supabaseAdmin };