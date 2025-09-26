'use client'

import { useState, useEffect } from 'react'
import { useNotesStore } from '@/lib/stores/notes'
import { NoteEditor } from '@/components/notes/note-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, FileText, Clock, Tags } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { notes, getFilteredNotes, setSearchQuery, searchQuery, setCurrentNote } = useNotesStore()
  const [showEditor, setShowEditor] = useState(false)
  
  const filteredNotes = getFilteredNotes()
  
  const handleNewNote = () => {
    setCurrentNote(null)
    setShowEditor(true)
  }
  
  if (showEditor) {
    return <NoteEditor />
  }
  
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800">
            🧠 BrainBloom
          </h1>
          <p className="text-slate-600 mt-1">
            Votre jardin digital de connaissances
          </p>
        </div>
        <Button onClick={handleNewNote} className="gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle note
        </Button>
      </div>
      
      {/* Barre de recherche */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Rechercher dans vos notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notes.filter(note => {
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                return new Date(note.createdAt) > weekAgo
              }).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags uniques</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(notes.flatMap(note => note.tags)).size}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Liste des notes */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-700">
          {searchQuery ? `Résultats de recherche (${filteredNotes.length})` : 'Vos notes récentes'}
        </h2>
        
        {filteredNotes.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="space-y-2">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-medium text-slate-500">
                {searchQuery ? 'Aucune note trouvée' : 'Aucune note pour le moment'}
              </h3>
              <p className="text-slate-400 max-w-md mx-auto">
                {searchQuery 
                  ? 'Essayez des mots-clés différents ou créez une nouvelle note'
                  : 'Commencez par créer votre première note pour organiser vos idées'
                }
              </p>
              {!searchQuery && (
                <Button onClick={handleNewNote} className="mt-4">
                  Créer ma première note
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-1">
                    {note.title || 'Note sans titre'}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    {new Date(note.updatedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-3">
                    {note.content || 'Contenu vide...'}
                  </p>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{note.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}