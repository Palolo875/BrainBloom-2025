"use client"

import { useState } from "react"
import { ImprovedRichTextEditor } from "@/components/improved-rich-text-editor"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"

// Mock Note interface pour la démo
interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function EnhancedEditorPage() {
  const [currentNote, setCurrentNote] = useState<Note>({
    id: "demo-note",
    title: "Ma nouvelle note",
    content: "Bienvenue dans l'éditeur BrainBloom amélioré !\n\nCette version inclut :\n- Un bouton d'accès flottant en bas à droite (icône palette)\n- Une toolbar plus visible et accessible\n- Raccourcis clavier (Ctrl+K pour la toolbar, Ctrl+S pour sauvegarder)\n- Mode insertion et sélection\n- Interface repensée pour une meilleure UX\n\nEssayez de sélectionner du texte ou cliquez sur le bouton flottant !",
    tags: ["démo", "amélioration"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })

  const handleSave = (title: string, content: string) => {
    setCurrentNote(prev => ({
      ...prev,
      title,
      content,
      updatedAt: new Date().toISOString()
    }))
    console.log("Note sauvegardée:", { title, content })
  }

  const handleCreateNote = (title: string, content: string): Note => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    console.log("Nouvelle note créée:", newNote)
    return newNote
  }

  const handleClose = () => {
    window.history.back()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-secondary/10">
      {/* En-tête de navigation */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h1 className="text-lg font-serif font-semibold">
                  Éditeur BrainBloom Amélioré
                </h1>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Démo de l'archipel flottant amélioré
            </div>
          </div>
        </div>
      </div>

      {/* Zone d'informations */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl border border-primary/20 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-semibold mb-2">
                🏝️ Archipel Flottant Amélioré
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Cette version améliore considérablement l'accessibilité de votre toolbar de formatage. 
                Plus besoin de faire une sélection compliquée qui interfère avec le menu contextuel !
              </p>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">✨ Nouvelles fonctionnalités :</h3>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• <strong>Bouton d'accès fixe</strong> en bas à droite</li>
                    <li>• <strong>Mode insertion</strong> sans sélection requise</li>
                    <li>• <strong>Meilleure visibilité</strong> avec design amélioré</li>
                    <li>• <strong>Indicateur de texte sélectionné</strong></li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">⌨️ Raccourcis clavier :</h3>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+K</kbd> Ouvrir la toolbar</li>
                    <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+S</kbd> Sauvegarder</li>
                    <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">[[</kbd> Créer des liens</li>
                    <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> Fermer les popups</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Éditeur amélioré */}
      <ImprovedRichTextEditor
        note={currentNote}
        onSave={handleSave}
        onClose={handleClose}
        onCreateNote={handleCreateNote}
      />
    </div>
  )
}