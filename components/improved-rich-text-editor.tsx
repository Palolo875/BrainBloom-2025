"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { SoftUICard } from "./soft-ui-card"
import { EnhancedFloatingToolbar } from "./enhanced-floating-toolbar"
import { LinkSearchPopup } from "./link-search-popup"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Save, X, Sparkles } from "lucide-react"
import type { Note } from "@/hooks/use-notes"
import { cn } from "@/lib/utils"

interface ImprovedRichTextEditorProps {
  note: Note
  onSave: (title: string, content: string) => void
  onClose: () => void
  onCreateNote?: (title: string, content: string) => Note
}

export function ImprovedRichTextEditor({ note, onSave, onClose, onCreateNote }: ImprovedRichTextEditorProps) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [showLinkPopup, setShowLinkPopup] = useState(false)
  const [linkPopupPosition, setLinkPopupPosition] = useState({ top: 0, left: 0 })
  const [linkSearchQuery, setLinkSearchQuery] = useState("")
  const [currentLinkRange, setCurrentLinkRange] = useState<Range | null>(null)
  const [selectedText, setSelectedText] = useState("")
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 })
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [toolbarForceOpen, setToolbarForceOpen] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const isMobile = useMemo(() => typeof window !== "undefined" && window.innerWidth < 640, [])

  // Auto-save avec debounce
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        setIsAutoSaving(true)
        onSave(title, content)
        setTimeout(() => setIsAutoSaving(false), 1000)
      }
    }, 1000)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [title, content, note.title, note.content, onSave])

  // Gestion de la sélection de texte avec debounce
  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection()
    
    if (!selection || selection.toString().trim() === "") {
      // Délai avant de fermer pour éviter les fermetures accidentelles
      setTimeout(() => {
        const currentSelection = window.getSelection()
        if (!currentSelection || currentSelection.toString().trim() === "") {
          setSelectedText("")
        }
      }, 150)
      return
    }

    // Vérifier si la sélection démarre dans notre éditeur (plus permissif)
    const anchorInEditor = contentRef.current?.contains(selection.anchorNode)
    const focusInEditor = contentRef.current?.contains(selection.focusNode)
    
    if (!anchorInEditor && !focusInEditor) {
      setSelectedText("")
      return
    }

    const text = selection.toString()
    setSelectedText(text)
    
    // Calculer la position de la sélection pour la toolbar contextuelle
    if (text && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setCursorPosition({
        top: rect.bottom,
        left: rect.left + rect.width / 2
      })
    }
  }, [])

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange)
    return () => document.removeEventListener("selectionchange", handleSelectionChange)
  }, [handleSelectionChange])

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K pour toggle la toolbar
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault()
        setToolbarForceOpen(prev => !prev)
      }
      
      // Ctrl+S pour sauvegarder
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        onSave(title, content)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [title, content, onSave])

  // Gestion du formatage de texte
  const handleFormat = useCallback((format: "bold" | "italic" | "link" | "heading") => {
    const selection = window.getSelection()
    if (!selection || !contentRef.current) return

    const selectedText = selection.toString()
    let formattedText = selectedText

    switch (format) {
      case "bold":
        formattedText = selectedText ? `**${selectedText}**` : "****"
        break
      case "italic":
        formattedText = selectedText ? `*${selectedText}*` : "**"
        break
      case "heading":
        formattedText = selectedText ? `## ${selectedText}` : "## "
        break
      case "link":
        formattedText = selectedText ? `[${selectedText}]()` : "[]()"
        break
    }

    if (selectedText) {
      // Remplacer le texte sélectionné
      const range = selection.getRangeAt(0)
      range.deleteContents()
      range.insertNode(document.createTextNode(formattedText))
    } else {
      // Insérer au curseur
      const range = selection.getRangeAt(0)
      range.insertNode(document.createTextNode(formattedText))
    }

    // Mettre à jour le contenu
    requestAnimationFrame(() => {
      if (contentRef.current) {
        setContent(contentRef.current.textContent || "")
      }
    })
  }, [])

  // Gestion des actions IA
  const handleAIAction = useCallback(async (action: string, params?: any) => {
    if (!selectedText) return

    let processedText = selectedText

    // Simulation des actions IA
    switch (action) {
      case "improve":
        processedText = `${selectedText.charAt(0).toUpperCase()}${selectedText.slice(1).replace(/\s+/g, " ").trim()}.`
        break
      case "summarize":
        processedText = `📝 Résumé: ${selectedText.split(" ").slice(0, 10).join(" ")}...`
        break
      case "translate":
        processedText = `🌍 [EN] ${selectedText}`
        break
      case "tone":
        processedText = `${selectedText.replace(/\./g, ", ce qui mérite attention.")}`
        break
      case "extract-tasks":
        const tasks = selectedText.match(/(?:je dois|il faut|à faire|rappeler|appeler|envoyer|écrire)/gi)
        processedText = tasks ? `📋 Tâches: ${tasks.join(", ")}` : selectedText
        break
    }

    // Remplacer le texte sélectionné
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      range.insertNode(document.createTextNode(processedText))
      
      requestAnimationFrame(() => {
        if (contentRef.current) {
          setContent(contentRef.current.textContent || "")
        }
      })
    }
  }, [selectedText])

  // Gestion des actions structurelles
  const handleStructuralAction = useCallback((action: string, params?: any) => {
    if (!selectedText) return

    switch (action) {
      case "extract-note":
        if (onCreateNote) {
          onCreateNote(`Note extraite: ${selectedText.slice(0, 30)}...`, selectedText)
        }
        break
      case "create-task":
        // Convertir le texte en tâche
        const taskText = `- [ ] ${selectedText}`
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          range.deleteContents()
          range.insertNode(document.createTextNode(taskText))
          
          requestAnimationFrame(() => {
            if (contentRef.current) {
              setContent(contentRef.current.textContent || "")
            }
          })
        }
        break
    }
  }, [selectedText, onCreateNote])

  const handleInput = useCallback(() => {
    if (!contentRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const textContent = contentRef.current.textContent || ""
    setContent(textContent)

    // Détecter [[ pour les liens
    const range = selection.getRangeAt(0)
    const cursorPosition = range.startOffset
    const beforeCursor = textContent.slice(Math.max(0, cursorPosition - 2), cursorPosition)
    
    if (beforeCursor === "[[") {
      const rect = range.getBoundingClientRect()
      setLinkPopupPosition({
        top: rect.bottom + 10,
        left: rect.left,
      })
      setCurrentLinkRange(range.cloneRange())
      setShowLinkPopup(true)
      setLinkSearchQuery("")
    }
  }, [])

  const handleSelectNote = useCallback(
    (selectedNote: Note) => {
      if (!currentLinkRange || !contentRef.current) return

      const linkText = `[[${selectedNote.title}]]`
      const textContent = contentRef.current.textContent || ""
      const linkStartIndex = textContent.lastIndexOf("[[")

      if (linkStartIndex !== -1) {
        const beforeLink = textContent.slice(0, linkStartIndex)
        const afterLink = textContent.slice(linkStartIndex + 2)
        const newContent = beforeLink + linkText + afterLink

        setContent(newContent)
        if (contentRef.current) {
          contentRef.current.textContent = newContent
        }
      }

      setShowLinkPopup(false)
      setCurrentLinkRange(null)
      setLinkSearchQuery("")
    },
    [currentLinkRange],
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header avec actions */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-serif font-semibold text-foreground">
              ✨ Éditeur BrainBloom
            </h1>
            {isAutoSaving && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 animate-pulse" />
                Sauvegarde automatique...
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => onSave(title, content)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </Button>
            <Button 
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Fermer
            </Button>
          </div>
        </div>
      </div>

      {/* Zone d'édition */}
      <div className="max-w-4xl mx-auto p-6 pb-32">
        <SoftUICard className="p-8 min-h-[600px] space-y-6">
          {/* Titre */}
          <Input
            ref={titleRef}
            placeholder="✏️ Titre de votre note..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-serif font-bold border-none bg-transparent px-0 focus:ring-0 placeholder:text-muted-foreground/60"
          />
          
          {/* Séparateur visuel */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          
          {/* Zone de contenu */}
          <div
            ref={contentRef}
            contentEditable
            onInput={handleInput}
            className={cn(
              "min-h-[400px] text-base leading-relaxed outline-none",
              "prose prose-sm max-w-none",
              "focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-lg p-4 transition-all",
              !content && "text-muted-foreground"
            )}
            suppressContentEditableWarning={true}
            style={{ whiteSpace: "pre-wrap" }}
          >
            {content || "🌱 Commencez à écrire vos idées ici...\n\nUtilisez Ctrl+K pour accéder aux outils de formatage\nTapez [[ pour créer des liens vers d'autres notes"}
          </div>
        </SoftUICard>
      </div>

      {/* Toolbar flottante améliorée */}
      <EnhancedFloatingToolbar
        onFormat={handleFormat}
        onColorChange={(color) => {}}
        onAIAction={handleAIAction}
        onStructuralAction={handleStructuralAction}
        selectedText={selectedText}
        cursorPosition={cursorPosition}
        forceOpen={toolbarForceOpen}
        onToggle={setToolbarForceOpen}
      />

      {/* Popup de recherche de liens */}
      {showLinkPopup && (
        <LinkSearchPopup
          isVisible={showLinkPopup}
          position={linkPopupPosition}
          searchQuery={linkSearchQuery}
          onSearchChange={setLinkSearchQuery}
          onSelectNote={handleSelectNote}
          onClose={() => setShowLinkPopup(false)}
        />
      )}
    </div>
  )
}