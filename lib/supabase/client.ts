import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validation des variables d'environnement côté client
if (!supabaseUrl) {
  console.warn('⚠️  SUPABASE: NEXT_PUBLIC_SUPABASE_URL non configuré, utilisation de valeurs par défaut pour le développement')
}

if (!supabaseAnonKey) {
  console.warn('⚠️  SUPABASE: NEXT_PUBLIC_SUPABASE_ANON_KEY non configuré, utilisation de valeurs par défaut pour le développement')
}

// Use default values for development if not configured
const defaultUrl = 'https://placeholder-project.supabase.co'
const defaultKey = 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl || defaultUrl, supabaseAnonKey || defaultKey)
