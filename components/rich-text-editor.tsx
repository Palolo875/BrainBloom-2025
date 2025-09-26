"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { SoftUICard } from "./soft-ui-card"
import { FloatingToolbar } from "./floating-toolbar"
import { LinkSearchPopup } from "./link-search-popup"
import { Input } from "@/components/ui/input"
import type { Note } from "@/hooks/use-notes"

interface RichTextEditorProps {
  note: Note
  onSave: (title: string, content: string) => void
  onClose: () => void
  onCreateNote?: (title: string, content: string) => Note
}

export function RichTextEditor({ note, onSave, onClose, onCreateNote }: RichTextEditorProps) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [showLinkPopup, setShowLinkPopup] = useState(false)
  const [linkPopupPosition, setLinkPopupPosition] = useState({ top: 0, left: 0 })
  const [linkSearchQuery, setLinkSearchQuery] = useState("")
  const [currentLinkRange, setCurrentLinkRange] = useState<Range | null>(null)
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })
  const [isAutoSaving, setIsAutoSaving] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const toolbarRef = useRef<HTMLDivElement>(null)

  const isMobile = useMemo(() => typeof window !== "undefined" && window.innerWidth < 640, [])

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

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection()

    if (!selection || selection.toString().trim() === "") {
      setShowFloatingToolbar(false)
      return
    }

    // Check if selection is within our editor
    if (!contentRef.current?.contains(selection.anchorNode)) {
      setShowFloatingToolbar(false)
      return
    }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    const toolbarWidth = isMobile ? Math.min(280, window.innerWidth - 40) : 320
    const toolbarHeight = isMobile ? 70 : 60

    let top = rect.top - toolbarHeight - 15
    let left = rect.left + rect.width / 2 - toolbarWidth / 2

    // Ensure toolbar stays within viewport with better margins
    if (top < 20) top = rect.bottom + 15
    if (left < 20) left = 20
    if (left + toolbarWidth > window.innerWidth - 20) {
      left = window.innerWidth - toolbarWidth - 20
    }

    // On mobile, always position at bottom for better accessibility
    if (isMobile) {
      top = window.innerHeight - toolbarHeight - 30
      left = 20
    }

    setToolbarPosition({ top, left })
    setShowFloatingToolbar(true)
  }, [isMobile])

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange)
    document.addEventListener("mouseup", handleSelectionChange)
    document.addEventListener("touchend", handleSelectionChange)

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange)
      document.removeEventListener("mouseup", handleSelectionChange)
      document.removeEventListener("touchend", handleSelectionChange)
    }
  }, [handleSelectionChange])

  const handleInput = useCallback(() => {
    if (!contentRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const textContent = contentRef.current.textContent || ""
    const cursorPosition = range.startOffset

    // Check if we just typed [[
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

  useEffect(() => {
    const contentElement = contentRef.current
    if (contentElement) {
      contentElement.addEventListener("input", handleInput)
      return () => contentElement.removeEventListener("input", handleInput)
    }
  }, [handleInput])

  const handleFormat = useCallback((format: "bold" | "italic" | "link" | "heading") => {
    const selection = window.getSelection()
    if (!selection || selection.toString().trim() === "") return

    const selectedText = selection.toString()
    let formattedText = selectedText

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`
        break
      case "italic":
        formattedText = `*${selectedText}*`
        break
      case "heading":
        formattedText = `## ${selectedText}`
        break
      case "link":
        formattedText = `[${selectedText}]()`
        break
    }

    // Replace selected text with formatted version
    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(document.createTextNode(formattedText))

    // Update content state
    requestAnimationFrame(() => {
      if (contentRef.current) {
        setContent(contentRef.current.textContent || "")
      }
    })

    setShowFloatingToolbar(false)
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

  const handleAIAction = useCallback(async (action: string, params?: any) => {
    const selection = window.getSelection()
    if (!selection || selection.toString().trim() === "") return

    const selectedText = selection.toString()
    let processedText = selectedText

    // Simulate AI processing with realistic responses
    switch (action) {
      case "improve":
        processedText = `${selectedText.charAt(0).toUpperCase()}${selectedText.slice(1).replace(/\s+/g, " ").trim()}.`
        break
      case "summarize":
        processedText = `Résumé: ${selectedText.split(" ").slice(0, 10).join(" ")}...`
        break
      case "translate":
        processedText = `[EN] ${selectedText}`
        break
      case "tone":
        processedText = `${selectedText.replace(/\./g, ", ce qui est important à noter.")}`
        break
      case "extract-tasks":
        const tasks = selectedText.match(/(?:je dois|il faut|à faire|rappeler|appeler|envoyer|écrire)/gi)
        if (tasks) {
          processedText = `${selectedText}\n\n**Tâches identifiées:**\n- [ ] ${selectedText.split(".")[0]}`
        }
        break
    }

    // Replace selected text with processed version
    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(document.createTextNode(processedText))

    requestAnimationFrame(() => {
      if (contentRef.current) {
        setContent(contentRef.current.textContent || "")
      }
    })

    setShowFloatingToolbar(false)
  }, [])

  const handleStructuralAction = useCallback(
    (action: string, params?: any) => {
      const selection = window.getSelection()
      if (!selection || selection.toString().trim() === "") return

      const selectedText = selection.toString()
      const range = selection.getRangeAt(0)

      switch (action) {
        case "extract-note":
          if (onCreateNote) {
            const newNote = onCreateNote(`Extracted: ${selectedText.slice(0, 30)}...`, selectedText)
            range.deleteContents()
            range.insertNode(document.createTextNode(`[[${newNote.title}]]`))
          }
          break

        case "embed-note":
          range.deleteContents()
          range.insertNode(document.createTextNode(`{{embed: Select a note to embed}}`))
          break

        case "create-task":
          range.deleteContents()
          range.insertNode(document.createTextNode(`- [ ] ${selectedText}`))
          break

        case "add-deadline":
          range.deleteContents()
          const today = new Date().toISOString().split("T")[0]
          range.insertNode(document.createTextNode(`- [ ] ${selectedText} 📅 ${today}`))
          break

        case "assign-task":
          range.deleteContents()
          range.insertNode(document.createTextNode(`- [ ] ${selectedText} @assignee`))
          break
      }

      requestAnimationFrame(() => {
        if (contentRef.current) {
          setContent(contentRef.current.textContent || "")
        }
      })

      setShowFloatingToolbar(false)
    },
    [onCreateNote],
  )

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    // Check if the click target is within the toolbar
    if (toolbarRef.current && toolbarRef.current.contains(e.target as Node)) {
      return // Don't close if clicking on the toolbar
    }
    setShowFloatingToolbar(false)
  }, [])

  const handleContentInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || ""
    setContent(newContent)
  }, [])

  // Focus title on mount for new notes
  useEffect(() => {
    if (note.title === "New Note" && titleRef.current) {
      titleRef.current.focus()
      titleRef.current.select()
    }
  }, [note.title])

  useEffect(() => {
    if (contentRef.current && contentRef.current.textContent !== content) {
      contentRef.current.textContent = content
    }
  }, [content])

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200 mb-3 sm:mb-4 text-sm sm:text-base"
          >
            ← Back to Notes
          </button>

          {/* Title Input */}
          <SoftUICard pressed className="p-3 sm:p-4 mb-4 sm:mb-6">
            <Input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="border-none bg-transparent focus:ring-0 focus:outline-none text-xl sm:text-2xl font-serif font-bold placeholder:text-muted-foreground"
            />
          </SoftUICard>
        </div>

        {/* Content Editor */}
        <SoftUICard pressed className="p-4 sm:p-8 min-h-80 sm:min-h-96">
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleContentInput}
            className="min-h-64 sm:min-h-80 focus:outline-none text-foreground leading-relaxed text-base sm:text-lg"
            style={{ whiteSpace: "pre-wrap" }}
            data-placeholder="Start writing your thoughts..."
          />
        </SoftUICard>

        {showFloatingToolbar && (
          <>
            {/* Invisible backdrop to detect clicks outside */}
            <div className="fixed inset-0 z-[9999]" onClick={handleBackdropClick} />
            <div
              ref={toolbarRef}
              style={{
                position: "fixed",
                top: toolbarPosition.top,
                left: toolbarPosition.left,
                zIndex: 50000, // Much higher z-index
                pointerEvents: "auto",
                width: isMobile ? `${Math.min(280, window.innerWidth - 40)}px` : "auto",
              }}
              className="animate-in fade-in-0 zoom-in-95 duration-150 drop-shadow-2xl"
            >
              <FloatingToolbar
                onFormat={handleFormat}
                onColorChange={(color) => console.log("Color change:", color)}
                onAIAction={handleAIAction}
                onStructuralAction={handleStructuralAction}
              />
            </div>
          </>
        )}

        {/* Link Search Popup */}
        <LinkSearchPopup
          isVisible={showLinkPopup}
          position={linkPopupPosition}
          onSelectNote={handleSelectNote}
          onClose={() => {
            setShowLinkPopup(false)
            setCurrentLinkRange(null)
            setLinkSearchQuery("")
          }}
          searchQuery={linkSearchQuery}
          onSearchChange={setLinkSearchQuery}
        />

        {isAutoSaving && (
          <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 bg-card border border-border text-foreground px-3 py-2 rounded-full text-xs shadow-lg z-40">
            💾 Saving...
          </div>
        )}
      </div>
    </div>
  )
}
