"use client"

import { useState, useEffect, useRef } from "react"
import { SoftUICard } from "./soft-ui-card"
import { Input } from "@/components/ui/input"
import { Search, FileText } from "lucide-react"
import { useNotes } from "@/hooks/use-notes"
import type { Note } from "@/hooks/use-notes"

interface LinkSearchPopupProps {
  isVisible: boolean
  position: { top: number; left: number }
  onSelectNote: (note: Note) => void
  onClose: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function LinkSearchPopup({
  isVisible,
  position,
  onSelectNote,
  onClose,
  searchQuery,
  onSearchChange,
}: LinkSearchPopupProps) {
  const { allNotes } = useNotes()
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isVisible])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allNotes
        .filter(
          (note) =>
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .slice(0, 5) // Limit to 5 results
      setFilteredNotes(filtered)
    } else {
      setFilteredNotes(allNotes.slice(0, 5))
    }
  }, [searchQuery, allNotes])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "Enter" && filteredNotes.length > 0) {
        onSelectNote(filteredNotes[0])
      }
    }

    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isVisible, filteredNotes, onSelectNote, onClose])

  if (!isVisible) return null

  return (
    <div
      className="fixed z-50"
      style={{
        top: position.top,
        left: position.left,
        transform: "translateX(-50%)",
      }}
    >
      <SoftUICard className="w-80 max-h-64 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-300">
        {/* Search Input */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search notes to link..."
              className="border-none bg-transparent focus:ring-0 focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-48 overflow-y-auto">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note, index) => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note)}
                className="w-full p-3 text-left hover:bg-muted transition-colors duration-200 flex items-start gap-3"
              >
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-foreground truncate">{note.title}</div>
                  <div className="text-xs text-muted-foreground truncate mt-1">{note.excerpt}</div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground text-sm">No notes found</div>
          )}
        </div>
      </SoftUICard>
    </div>
  )
}
