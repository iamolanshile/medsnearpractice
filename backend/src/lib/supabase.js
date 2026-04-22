const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
// Prefer service role key (full access), fall back to publishable key
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY && process.env.SUPABASE_SERVICE_KEY !== 'your_supabase_service_role_key')
  ? process.env.SUPABASE_SERVICE_KEY
  : process.env.SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment')
}

console.log(`[Supabase] Using ${supabaseKey.startsWith('sb_publishable') ? 'publishable (limited)' : 'service role'} key`)

// Server-side admin client (uses service role key for full DB access)
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

module.exports = supabase
