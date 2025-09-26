"use client"

import { useEffect, useCallback } from "react"
import { useAppStore } from "@/lib/stores/app-store"

// Sample notes pour migration
const SAMPLE_NOTES = [
  {
    title: "Morning Reflections",
    content: "Today I discovered the beauty in small moments. The way sunlight filters through leaves, creating dancing shadows on the ground. These micro-moments of wonder remind me to stay present and appreciate the simple joys that surround us daily.",
    tags: ["reflection", "mindfulness"],
    connections: []
  },
  {
    title: "Project Ideas", 
    content: "A collection of creative projects that spark joy:\n\n1. Digital garden for knowledge management\n2. Meditation app with nature sounds\n3. Community art installation\n4. Sustainable living blog\n\nEach project should focus on bringing people together and creating positive impact.",
    tags: ["projects", "creativity", "ideas"],
    connections: []
  },
  {
    title: "Reading Notes: The Art of Living",
    content: "Key insights from Epictetus:\n\n- Focus on what you can control\n- Accept what you cannot change\n- Practice gratitude daily\n- Virtue is the only true good\n\n'You have power over your mind - not outside events. Realize this, and you will find strength.'",
    tags: ["philosophy", "stoicism", "reading"],
    connections: []
  },
  {
    title: "Garden Planning",
    content: "Planning the layout for this spring's vegetable garden:\n\n**North Section:**\n- Tomatoes (cherry and beefsteak)\n- Peppers (bell and jalapeño)\n- Basil and oregano\n\n**South Section:**\n- Lettuce and spinach\n- Radishes and carrots\n- Herbs: thyme, rosemary, sage\n\nCompanion planting: tomatoes with basil, carrots with chives.",
    tags: ["gardening", "planning", "nature"],
    connections: []
  }
]

// Hook compatible avec l'ancienne interface pour faciliter la migration
export function useNotes() {
  const notes = useAppStore(state => state.notes)
  const addNote = useAppStore(state => state.addNote)
  const updateNote = useAppStore(state => state.updateNote)
  const deleteNote = useAppStore(state => state.deleteNote)
  const searchQuery = useAppStore(state => state.searchQuery)
  const setSearchQuery = useAppStore(state => state.setSearchQuery)
  const getFilteredNotes = useAppStore(state => state.getFilteredNotes)
  
  // Migration des données d'exemple si le store est vide
  useEffect(() => {
    if (notes.length === 0) {
      SAMPLE_NOTES.forEach(note => {
        addNote(note)
      })
    }
  }, [notes.length, addNote])

  const createNote = useCallback((title: string, content = "") => {
    const noteId = addNote({
      title: title || "Untitled Note",
      content,
      tags: []
    })
    const newNote = notes.find(n => n.id === noteId)
    return newNote || { id: noteId, title, content, tags: [], createdAt: '', updatedAt: '' }
  }, [addNote, notes])

  const getNoteById = useCallback((id: string) => {
    return notes.find(note => note.id === id)
  }, [notes])

  const getConnectedNotes = useCallback((noteId: string) => {
    // Mock implementation for now - could be extended with actual connections
    return []
  }, [getNoteById])

  // Utiliser les notes filtrées du store
  const filteredNotes = getFilteredNotes()

  return {
    notes: filteredNotes,
    allNotes: notes,
    searchQuery,
    setSearchQuery,
    createNote,
    updateNote,
    deleteNote,
    getNoteById,
    getConnectedNotes,
  }
}
