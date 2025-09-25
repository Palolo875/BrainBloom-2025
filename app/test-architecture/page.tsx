import { supabase } from '@/lib/supabase/server'
import { createNote } from '@/app/_actions/notes'

export default async function TestArchitecturePage() {
  // Server Component : récupération des notes côté serveur
  const { data: notes, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧠 Test Architecture BrainBloom</h1>
        <p className="text-gray-600">
          Cette page teste l'architecture backend : Server Components + Server Actions + Supabase + IA
        </p>
      </div>

      {/* Formulaire de création de note */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">✍️ Créer une nouvelle note</h2>
        <form action={createNote} className="space-y-4">
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Contenu de la note
            </label>
            <textarea
              id="content"
              name="content" 
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Écrivez votre note ici... (un embedding sera automatiquement généré)"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            🚀 Créer la note (avec IA)
          </button>
        </form>
      </div>

      {/* Liste des notes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">📚 Notes existantes</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Erreur :</strong> {error.message}
          </div>
        )}

        {notes && notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                <div className="mb-2">
                  <span className="text-sm text-gray-500">
                    ID: {note.id} | Créée le : {new Date(note.created_at).toLocaleString('fr-FR')}
                  </span>
                </div>
                <div className="mb-3">
                  <p className="text-gray-800">{note.content}</p>
                </div>
                <div className="text-xs text-gray-400">
                  <details>
                    <summary className="cursor-pointer hover:text-gray-600">
                      🧠 Voir l'embedding IA ({note.embedding?.length || 0} dimensions)
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                      {note.embedding ? JSON.stringify(note.embedding.slice(0, 10), null, 2) + '...' : 'Pas d\'embedding'}
                    </pre>
                  </details>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>📝 Aucune note pour le moment.</p>
            <p className="text-sm mt-2">Créez votre première note ci-dessus pour tester l'architecture !</p>
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            💡 <strong>Architecture testée :</strong> Server Component → Supabase → Server Action → Hugging Face API
          </p>
        </div>
      </div>
    </div>
  )
}
