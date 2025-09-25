"use client"

import { SoftUICard } from "./soft-ui-card"
import type { Note } from "@/hooks/use-notes"
import { formatDistanceToNow } from "date-fns"
import { Network } from "lucide-react"

interface NoteCardProps extends React.HTMLAttributes<HTMLDivElement> {
  note: Note
  onClick: () => void
  className?: string
}

export function NoteCard({ note, onClick, className, ...rest }: NoteCardProps) {
  return (
    <SoftUICard
      className={`p-4 sm:p-6 space-y-3 animate-in slide-in-from-bottom-4 fade-in duration-500 ${className}`}
      onClick={onClick}
      {...rest}
    >
      <h3 className="font-serif text-base sm:text-lg font-semibold text-foreground text-balance">{note.title}</h3>

      <p className="text-muted-foreground text-sm leading-relaxed text-pretty">{note.excerpt}</p>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {note.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-1 text-xs rounded-full bg-accent/20 text-accent-foreground">
              {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
              +{note.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{formatDistanceToNow(note.updatedAt, { addSuffix: true })}</span>
        {note.connections.length > 0 && (
          <>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Network className="w-3 h-3" />
              <span>
                {note.connections.length} connection{note.connections.length !== 1 ? "s" : ""}
              </span>
            </div>
          </>
        )}
      </div>
    </SoftUICard>
  )
}
