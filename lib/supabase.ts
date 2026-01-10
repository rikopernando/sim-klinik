/**
 * Supabase Client Configuration
 * Used for file storage and other Supabase services
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

if (!supabaseUrl) {
  console.warn("⚠️  SUPABASE_URL is not set. File upload features will not work.")
}

if (!supabaseServiceKey) {
  console.warn("⚠️  SUPABASE_SERVICE_ROLE_KEY is not set. File upload features will not work.")
}

/**
 * Supabase client instance
 * Used for server-side operations (file uploads, admin operations)
 */
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseServiceKey)
}

/**
 * Storage bucket name for lab attachments
 */
export const LAB_ATTACHMENTS_BUCKET = "lab-attachments"
