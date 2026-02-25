const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

function getSupabase() {
  if (!supabase) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set");
    }
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

module.exports = { getSupabase };
