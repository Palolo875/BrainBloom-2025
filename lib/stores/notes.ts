import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { Note } from '@/lib/types/note'

interface NotesStore {
  notes: Note[]
  currentNote: Note | null
  searchQuery: string
  
  // Actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void
  setCurrentNote: (note: Note | null) => void
  setSearchQuery: (query: string) => void
  
  // Computed
  getFilteredNotes: () => Note[]
  getNoteById: (id: string) => Note | undefined
}

export const useNotesStore = create<NotesStore>()(
  persist(
    immer((set, get) => ({
      notes: [],
      currentNote: null,
      searchQuery: '',
      
      addNote: (noteData) => {
        const now = new Date().toISOString()
        const noteId = crypto.randomUUID()
        const note = {
          ...noteData,
          id: noteId,
          createdAt: now,
          updatedAt: now
        }
        
        set((state) => {
          state.notes.push(note)
        })
        
        return noteId
      },
      
      updateNote: (id, updates) => set((state) => {
        const noteIndex = state.notes.findIndex(n => n.id === id)
        if (noteIndex !== -1) {
          state.notes[noteIndex] = {
            ...state.notes[noteIndex],
            ...updates,
            updatedAt: new Date().toISOString()
          }
        }
      }),
      
      deleteNote: (id) => set((state) => {
        state.notes = state.notes.filter(n => n.id !== id)
        if (state.currentNote?.id === id) {
          state.currentNote = null
        }
      }),
      
      setCurrentNote: (note) => set((state) => {
        state.currentNote = note
      }),
      
      setSearchQuery: (query) => set((state) => {
        state.searchQuery = query
      }),
      
      getFilteredNotes: () => {
        const { notes, searchQuery } = get()
        if (!searchQuery) return notes
        
        return notes.filter(note => 
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      },
      
      getNoteById: (id) => {
        return get().notes.find(note => note.id === id)
      }
    })),
    {
      name: 'brainbloom-notes',
      version: 1
    }
  )
)