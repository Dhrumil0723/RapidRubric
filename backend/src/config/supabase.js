const { createClient } = require("@supabase/supabase-js");

// Server-side clients must be stateless: never persist or auto-refresh a
// session, otherwise concurrent/sequential auth calls clobber each other.
const serverOpts = { auth: { persistSession: false, autoRefreshToken: false } };

// Service-role client: full DB access, bypasses RLS. Used for all data
// operations, JWT verification (getUser), and admin auth operations.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  serverOpts,
);

// Anon-key client: used ONLY to exchange credentials for a user session
// (password sign-in). Kept separate and stateless so each sign-in is
// independent and never mutates the service client's state.
const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
  serverOpts,
);

module.exports = { supabase, supabaseAuth };
