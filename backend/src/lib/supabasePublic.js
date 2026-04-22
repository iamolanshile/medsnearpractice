const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY in environment')
}

// Public client — uses publishable key, safe for auth flows
const supabasePublic = createClient(supabaseUrl, supabasePublishableKey)

module.exports = supabasePublic
