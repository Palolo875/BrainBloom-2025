"use client"

import { useState } from "react"
import { SoftUICard } from "./soft-ui-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Route, ArrowRight } from "lucide-react"
import type { Note } from "@/hooks/use-notes"

interface PathFinderProps {
  notes: Note[]
  onPathFound: (path: Note[]) => void
  selectedNote?: Note
}

export function PathFinder({ notes, onPathFound, selectedNote }: PathFinderProps) {
  const [sourceNoteId, setSourceNoteId] = useState(selectedNote?.id || "")
  const [targetNoteId, setTargetNoteId] = useState("")
  const [foundPath, setFoundPath] = useState<Note[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const findShortestPath = async () => {
    if (!sourceNoteId || !targetNoteId || sourceNoteId === targetNoteId) return

    setIsSearching(true)

    // Simulate pathfinding algorithm (simplified BFS)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Build adjacency map
    const adjacencyMap = new Map<string, string[]>()
    notes.forEach((note) => {
      adjacencyMap.set(note.id, note.connections)
    })

    // BFS to find shortest path
    const queue: Array<{ nodeId: string; path: string[] }> = [{ nodeId: sourceNoteId, path: [sourceNoteId] }]
    const visited = new Set<string>()
    let shortestPath: string[] = []

    while (queue.length > 0 && shortestPath.length === 0) {
      const { nodeId, path } = queue.shift()!

      if (visited.has(nodeId)) continue
      visited.add(nodeId)

      if (nodeId === targetNoteId) {
        shortestPath = path
        break
      }

      const connections = adjacencyMap.get(nodeId) || []
      connections.forEach((connectionId) => {
        if (!visited.has(connectionId)) {
          queue.push({ nodeId: connectionId, path: [...path, connectionId] })
        }
      })
    }

    // Convert path IDs to Note objects
    const pathNotes = shortestPath.map((id) => notes.find((note) => note.id === id)).filter(Boolean) as Note[]

    setFoundPath(pathNotes)
    onPathFound(pathNotes)
    setIsSearching(false)
  }

  return (
    <SoftUICard className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Route className="w-4 h-4 text-accent-peach" />
        <h3 className="text-sm font-medium text-foreground">Chemins entre les Notes</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Note de départ</label>
          <Select value={sourceNoteId} onValueChange={setSourceNoteId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une note..." />
            </SelectTrigger>
            <SelectContent>
              {notes.map((note) => (
                <SelectItem key={note.id} value={note.id}>
                  {note.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Note d'arrivée</label>
          <Select value={targetNoteId} onValueChange={setTargetNoteId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une note..." />
            </SelectTrigger>
            <SelectContent>
              {notes
                .filter((note) => note.id !== sourceNoteId)
                .map((note) => (
                  <SelectItem key={note.id} value={note.id}>
                    {note.title}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={findShortestPath}
          disabled={!sourceNoteId || !targetNoteId || isSearching}
          className="w-full rounded-2xl"
        >
          {isSearching ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
              Recherche...
            </div>
          ) : (
            "Trouver le Chemin"
          )}
        </Button>
      </div>

      {foundPath.length > 0 && (
        <div className="animate-in slide-in-from-bottom-2 fade-in duration-500">
          <div className="text-xs text-muted-foreground mb-2">Chemin trouvé ({foundPath.length} étapes):</div>
          <div className="space-y-2">
            {foundPath.map((note, index) => (
              <div key={note.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <SoftUICard className="p-2">
                    <div className="text-sm font-medium text-foreground">{note.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{note.excerpt}</div>
                  </SoftUICard>
                </div>
                {index < foundPath.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </SoftUICard>
  )
}
