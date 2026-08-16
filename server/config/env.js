require('dotenv').config();

const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.warn(`Missing required env vars: ${missing.join(', ')}. Supabase calls will fail until configured.`);
}

const env = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'donation-images',
};

if (env.nodeEnv === 'production') {
  if (!env.supabaseServiceRoleKey) {
    console.warn('Warning: SUPABASE_SERVICE_ROLE_KEY not set in production.');
  }
  if (env.corsOrigin === '*') {
    console.warn('Warning: CORS_ORIGIN is set to wildcard in production.');
  }
}

module.exports = env;