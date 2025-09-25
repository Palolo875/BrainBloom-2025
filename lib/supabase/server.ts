import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

// Default values for development
const defaultUrl = 'https://placeholder-project.supabase.co'
const defaultAnonKey = 'placeholder-anon-key'

// Validation des variables d'environnement
if (!supabaseUrl) {
  console.warn('⚠️  SUPABASE: SUPABASE_URL non configuré, utilisation de valeurs par défaut pour le développement')
}

if (!supabaseAnonKey) {
  console.warn('⚠️  SUPABASE: SUPABASE_ANON_KEY non configuré, utilisation de valeurs par défaut pour le développement')
}

// Client admin (optionnel - seulement si la clé service role est configurée)
export const supabaseAdmin = supabaseServiceRoleKey && !supabaseServiceRoleKey.includes('VOTRE_')
  ? createClient(supabaseUrl || defaultUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Client standard pour les Server Components (utilise la clé anon)
export const supabase = createClient(supabaseUrl || defaultUrl, supabaseAnonKey || defaultAnonKey)
