import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bnnabuwcojrctjhnwcmj.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJubmFidXdjb2pyY3RqaG53Y21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4OTQ5NjUsImV4cCI6MjA3MDQ3MDk2NX0.3tXkx5K1HLgl5sUif1_cUuXay7t-UwtU9_Z-NN4N8EA'

if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
if (!supabaseAnonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Para uso del servidor con service role
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJubmFidXdjb2pyY3RqaG53Y21qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg5NDk2NSwiZXhwIjoyMDcwNDcwOTY1fQ._DGIeYfpAgye77M7G3wJt45NorCMSGFwd7UEX9iGmZw'

export const supabaseAdmin = typeof window === 'undefined' ? createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) : supabase
