# 🏗️ Architecture Backend BrainBloom - Guide de Configuration

## 📋 Configuration Requise

Pour utiliser l'architecture backend complète, vous devez configurer les variables d'environnement dans `.env.local` :

### 🔧 Variables Supabase
\`\`\`env
# Supabase Configuration (Server-side)
SUPABASE_URL="https://votre-projet.supabase.co"
SUPABASE_ANON_KEY="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."

# Supabase Configuration (Client-side - public)
NEXT_PUBLIC_SUPABASE_URL="https://votre-projet.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
\`\`\`

### 🤖 Hugging Face AI
\`\`\`env
HF_TOKEN="hf_votre_token_hugging_face"
\`\`\`

### 📊 Structure de Base de Données

Créez une table `notes` dans Supabase :

\`\`\`sql
CREATE TABLE notes (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(384), -- pour les embeddings all-MiniLM-L6-v2
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche vectorielle
CREATE INDEX ON notes USING ivfflat (embedding vector_cosine_ops);
\`\`\`

## 🎯 Architecture Implémentée

### Phase 1: Configuration
- ✅ Clients Supabase (server.ts, client.ts)
- ✅ Variables d'environnement sécurisées
- ✅ Validation des configurations

### Phase 2: Backend
- ✅ Helper AI (`lib/ai/embed.ts`) pour génération d'embeddings
- ✅ Route Handler (`/api/embed`) pour API externe  
- ✅ Server Actions (`app/_actions/notes.ts`) pour mutations
- ✅ Gestion d'erreurs robuste

### Phase 3: Test
- ✅ Page de test (`/test-architecture`)
- ✅ Server Component avec récupération de données
- ✅ Formulaire avec Server Action
- ✅ Affichage des embeddings IA

## 🚀 Utilisation

1. **Configurer les variables** dans `.env.local`
2. **Créer la table** dans Supabase 
3. **Visiter** `/test-architecture` pour tester
4. **Intégrer** les composants dans votre app

## 🔒 Sécurité

- Secrets server-only (HF_TOKEN, SERVICE_ROLE_KEY)
- Validation des inputs
- Gestion gracieuse des erreurs
- RLS recommandé sur Supabase
