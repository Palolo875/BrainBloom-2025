"use client"

import { useState, useRef, useEffect } from "react"
import { FloatingToolbar } from "./floating-toolbar"
import { Button } from "@/components/ui/button"
import { Palette, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnhancedFloatingToolbarProps {
  onFormat: (format: "bold" | "italic" | "link" | "heading") => void
  onColorChange: (color: string) => void
  onAIAction?: (action: string, params?: any) => void
  onStructuralAction?: (action: string, params?: any) => void
  selectedText?: string
  cursorPosition?: { top: number; left: number }
  className?: string
  forceOpen?: boolean
  onToggle?: (isOpen: boolean) => void
}

export function EnhancedFloatingToolbar({
  onFormat,
  onColorChange,
  onAIAction,
  onStructuralAction,
  selectedText = "",
  cursorPosition,
  className,
  forceOpen = false,
  onToggle
}: EnhancedFloatingToolbarProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [isFixed, setIsFixed] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Calculer la position optimale pour la toolbar
  const calculatePosition = () => {
    if (!buttonRef.current) return

    const buttonRect = buttonRef.current.getBoundingClientRect()
    const toolbarWidth = 320
    const toolbarHeight = 180

    let top = buttonRect.bottom + 10
    let left = buttonRect.left - toolbarWidth / 2 + buttonRect.width / 2

    // Ajuster si la toolbar dépasse de l'écran
    if (left < 20) left = 20
    if (left + toolbarWidth > window.innerWidth - 20) {
      left = window.innerWidth - toolbarWidth - 20
    }
    if (top + toolbarHeight > window.innerHeight - 20) {
      top = buttonRect.top - toolbarHeight - 10
    }

    setPosition({ top, left })
  }

  // Montrer/cacher la toolbar
  const toggleToolbar = () => {
    const newVisibility = !isVisible
    if (newVisibility) {
      calculatePosition()
      setIsVisible(true)
      setIsFixed(true)
    } else {
      setIsVisible(false)
      setIsFixed(false)
    }
    onToggle?.(newVisibility)
  }

  // Gérer l'ouverture forcée depuis l'extérieur
  useEffect(() => {
    if (forceOpen && !isVisible) {
      calculatePosition()
      setIsVisible(true)
      setIsFixed(true)
      onToggle?.(true)
      
      // Focus sur le premier bouton pour l'accessibilité clavier
      setTimeout(() => {
        const firstButton = document.querySelector('[role="toolbar"] button')
        if (firstButton instanceof HTMLElement) {
          firstButton.focus()
        }
      }, 100)
    } else if (!forceOpen && isVisible && !selectedText) {
      setIsVisible(false)
      setIsFixed(false)
      onToggle?.(false)
    }
  }, [forceOpen, isVisible, selectedText, onToggle])

  // Auto-ouvrir quand du texte est sélectionné
  useEffect(() => {
    if (selectedText && !isVisible && !forceOpen) {
      // Calculer position en fonction de la sélection ou du curseur
      if (cursorPosition) {
        setPosition({
          top: cursorPosition.top + 10,
          left: cursorPosition.left - 160 // Centrer la toolbar (largeur approximative / 2)
        })
      } else {
        calculatePosition()
      }
      setIsVisible(true)
      setIsFixed(false) // Mode contextuel, pas fixe
      onToggle?.(true)
    } else if (!selectedText && isVisible && !forceOpen && !isFixed) {
      // Fermer si plus de sélection et pas en mode fixe
      setTimeout(() => {
        setIsVisible(false)
        onToggle?.(false)
      }, 100) // Petit délai pour éviter les fermetures accidentelles
    }
  }, [selectedText, isVisible, forceOpen, isFixed, cursorPosition, onToggle])

  // Fermer la toolbar quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isVisible && !buttonRef.current?.contains(event.target as Node)) {
        setIsVisible(false)
        setIsFixed(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isVisible])

  return (
    <div className={cn("relative", className)}>
      {/* Bouton d'accès flottant */}
      <Button
        ref={buttonRef}
        onClick={toggleToolbar}
        variant="outline"
        size="sm"
        className={cn(
          "fixed bottom-20 right-6 z-40 w-12 h-12 rounded-full shadow-lg border-2",
          "bg-gradient-to-br from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20",
          "border-primary/30 hover:border-primary/50 transition-all duration-300",
          "hover:scale-110 active:scale-95",
          isVisible && "bg-primary/20 border-primary/60 scale-110 shadow-xl"
        )}
        title={isVisible ? "Fermer l'archipel flottant (Ctrl+K)" : "Ouvrir l'archipel flottant (Ctrl+K)"}
      >
        {isVisible ? (
          <X className="w-5 h-5 text-primary" />
        ) : (
          <Palette className="w-5 h-5 text-primary animate-pulse" />
        )}
      </Button>

      {/* Indicateur de texte sélectionné */}
      {selectedText && !isVisible && (
        <div 
          className="fixed bottom-32 right-6 z-39 px-3 py-1 bg-accent/90 rounded-full text-xs font-medium text-accent-foreground shadow-md animate-in slide-in-from-bottom-2"
          role="status" 
          aria-live="polite"
        >
          Texte sélectionné · Cliquez pour éditer
        </div>
      )}

      {/* Annonce d'ouverture pour lecteurs d'écran */}
      {isVisible && (
        <div className="sr-only" aria-live="polite">
          Archipel flottant ouvert. {selectedText ? `Texte sélectionné: ${selectedText.slice(0, 50)}` : "Mode insertion"}
        </div>
      )}

      {/* Toolbar flottante améliorée */}
      {isVisible && (
        <div
          className={cn(
            "z-50 pointer-events-none",
            selectedText ? "fixed" : "fixed"
          )}
          style={{ 
            top: selectedText ? position.top : position.top, 
            left: selectedText ? position.left : position.left 
          }}
        >
          <div className="animate-in zoom-in-95 fade-in duration-300 pointer-events-auto">
            <FloatingToolbar
              onFormat={onFormat}
              onColorChange={onColorChange}
              onAIAction={onAIAction}
              onStructuralAction={onStructuralAction}
              selectedText={selectedText}
              mode={selectedText ? "selection" : "insertion"}
            />
          </div>
        </div>
      )}
    </div>
  )
}