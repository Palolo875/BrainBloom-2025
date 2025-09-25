'use server'

import { supabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateEmbedding } from '@/lib/ai/embed'

export async function createNote(formData: FormData): Promise<void> {
  const content = formData.get('content') as string
  
  if (!content || content.trim() === '') {
    throw new Error('Le contenu de la note est requis')
  }
  try {
    // 1. Générer l'embedding directement en appelant la fonction helper
    const embedding = await generateEmbedding(content)

    // 2. Insérer la nouvelle note dans Supabase avec son embedding
    // Les timestamps created_at/updated_at sont gérés par la base de données
    const { data, error } = await supabase
      .from('notes')
      .insert({ content, embedding })
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    // 3. Rafraîchir les chemins qui affichent les notes
    revalidatePath('/test-architecture')
    revalidatePath('/')

    console.log('✅ Note créée avec succès:', data)

  } catch (error) {
    console.error('❌ Erreur lors de la création de la note:', error)
    throw error // Laisser Next.js gérer l'erreur
  }
}
