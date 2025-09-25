"use client"

import { useState, useEffect, useCallback, useMemo } from "react"

export interface Note {
  id: string
  title: string
  content: string
  excerpt: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
  connections: string[]
}

const SAMPLE_NOTES: Note[] = [
  {
    id: "1",
    title: "Morning Reflections",
    content:
      "Today I discovered the beauty in small moments. The way sunlight filters through leaves, creating dancing shadows on the ground. These micro-moments of wonder remind me to stay present and appreciate the simple joys that surround us daily.",
    excerpt: "Today I discovered the beauty in small moments...",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    tags: ["reflection", "mindfulness"],
    connections: ["2", "4"],
  },
  {
    id: "2",
    title: "Project Ideas",
    content:
      "A collection of creative projects that spark joy:\n\n1. Digital garden for knowledge management\n2. Meditation app with nature sounds\n3. Community art installation\n4. Sustainable living blog\n\nEach project should focus on bringing people together and creating positive impact.",
    excerpt: "A collection of creative projects that spark joy...",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    tags: ["projects", "creativity", "ideas"],
    connections: ["1", "3"],
  },
  {
    id: "3",
    title: "Reading Notes: The Art of Living",
    content:
      "Key insights from Epictetus:\n\n- Focus on what you can control\n- Accept what you cannot change\n- Practice gratitude daily\n- Virtue is the only true good\n\n'You have power over your mind - not outside events. Realize this, and you will find strength.'",
    excerpt: "Insights from 'The Art of Living' by Epictetus...",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    tags: ["philosophy", "stoicism", "reading"],
    connections: ["1"],
  },
  {
    id: "4",
    title: "Garden Planning",
    content:
      "Planning the layout for this spring's vegetable garden:\n\n**North Section:**\n- Tomatoes (cherry and beefsteak)\n- Peppers (bell and jalapeño)\n- Basil and oregano\n\n**South Section:**\n- Lettuce and spinach\n- Radishes and carrots\n- Herbs: thyme, rosemary, sage\n\nCompanion planting: tomatoes with basil, carrots with chives.",
    excerpt: "Planning the layout for this spring's vegetable garden...",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    tags: ["gardening", "planning", "nature"],
    connections: ["1"],
  },
]

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setNotes(SAMPLE_NOTES)
  }, [])

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) {
      return notes
    }

    const query = searchQuery.toLowerCase()
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query)),
    )
  }, [notes, searchQuery])

  const createNote = useCallback((title: string, content = "") => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: title || "Untitled Note",
      content,
      excerpt: content.slice(0, 100) + (content.length > 100 ? "..." : ""),
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      connections: [],
    }
    setNotes((prev) => [newNote, ...prev])
    return newNote
  }, [])

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? {
              ...note,
              ...updates,
              updatedAt: new Date(),
              excerpt: updates.content
                ? updates.content.slice(0, 100) + (updates.content.length > 100 ? "..." : "")
                : note.excerpt,
            }
          : note,
      ),
    )
  }, [])

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }, [])

  const getNoteById = useCallback(
    (id: string) => {
      return notes.find((note) => note.id === id)
    },
    [notes],
  )

  const getConnectedNotes = useCallback(
    (noteId: string) => {
      const note = getNoteById(noteId)
      if (!note) return []
      return notes.filter((n) => note.connections.includes(n.id))
    },
    [notes, getNoteById],
  )

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
