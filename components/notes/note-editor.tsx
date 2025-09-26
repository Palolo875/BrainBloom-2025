'use client'

import { useState, useEffect } from 'react'
import { useNotesStore } from '@/lib/stores/notes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Save, Sparkles } from 'lucide-react'
import { aiEngine } from '@/lib/ai'

interface NoteEditorProps {
  noteId?: string
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const { notes, addNote, updateNote, getNoteById } = useNotesStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [createdNoteId, setCreatedNoteId] = useState<string | null>(null)
  
  const existingNote = noteId ? getNoteById(noteId) : (createdNoteId ? getNoteById(createdNoteId) : null)
  const workingNoteId = noteId || createdNoteId
  
  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title)
      setContent(existingNote.content)
      setTags(existingNote.tags)
    }
  }, [existingNote])
  
  // Auto-save avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (title || content) {
        await handleSave(false) // Silent save
      }
    }, 2000)
    
    return () => clearTimeout(timeoutId)
  }, [title, content, tags])
  
  // Suggestions IA en temps réel
  useEffect(() => {
    if (content.length > 100) {
      generateSuggestions()
    }
  }, [content])
  
  const generateSuggestions = async () => {
    try {
      // Recherche de notes similaires avec callback pour mise à jour des embeddings
      const similarNotes = await aiEngine.semanticSearch(content, notes, updateNote)
      const suggestions = similarNotes
        .slice(0, 3)
        .map(note => note.title)
      
      setSuggestions(suggestions)
    } catch (error) {
      console.error('Error generating suggestions:', error)
    }
  }
  
  const handleSave = async (showFeedback = true) => {
    if (!title && !content) return
    
    setIsSaving(true)
    
    try {
      const noteData = {
        title: title || 'Note sans titre',
        content,
        tags
      }
      
      let noteIdToUpdate: string
      
      if (workingNoteId) {
        // Note existante ou déjà créée - mise à jour
        updateNote(workingNoteId, noteData)
        noteIdToUpdate = workingNoteId
      } else {
        // Nouvelle note - création
        noteIdToUpdate = addNote(noteData)
        setCreatedNoteId(noteIdToUpdate) // Mémoriser l'ID créé
      }
      
      // Générer embedding en arrière-plan et le persister
      setTimeout(async () => {
        try {
          const embedding = await aiEngine.generateEmbedding(content)
          updateNote(noteIdToUpdate, { embedding })
        } catch (error) {
          console.error('Error generating embedding:', error)
        }
      }, 100)
      
      if (showFeedback) {
        // Toast de succès
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold text-slate-800">
          {workingNoteId ? 'Éditer la note' : 'Nouvelle note'}
        </h1>
        <Button 
          onClick={() => handleSave(true)}
          disabled={isSaving}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>
      
      {/* Titre */}
      <Input
        placeholder="Titre de votre note..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-xl font-semibold border-none bg-transparent px-0 focus:ring-0"
      />
      
      {/* Contenu */}
      <Textarea
        placeholder="Commencez à écrire votre idée..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[400px] border-none bg-transparent px-0 resize-none focus:ring-0"
      />
      
      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
      
      {/* Suggestions IA */}
      {suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl p-4 border border-orange-100">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-700">
              Notes similaires
            </span>
          </div>
          <div className="space-y-1">
            {suggestions.map(suggestion => (
              <div key={suggestion} className="text-sm text-orange-600">
                → {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}