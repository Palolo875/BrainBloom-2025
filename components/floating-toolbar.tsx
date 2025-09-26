"use client"

import { useState, useRef, useEffect } from "react"
import { SoftUICard } from "./soft-ui-card"
import { Bold, Italic, Link, Type, Sparkles, Layers, CheckSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { AISubmenu } from "./ai-submenu"
import { StructuralSubmenu } from "./structural-submenu"

interface FloatingToolbarProps {
  onFormat: (format: "bold" | "italic" | "link" | "heading") => void
  onColorChange: (color: string) => void
  onAIAction?: (action: string, params?: any) => void
  onStructuralAction?: (action: string, params?: any) => void
  selectedText?: string
  mode?: "selection" | "insertion"
  position?: { top: number; left: number }
}

export function FloatingToolbar({ 
  onFormat, 
  onColorChange, 
  onAIAction, 
  onStructuralAction, 
  selectedText = "",
  mode = "selection",
  position
}: FloatingToolbarProps) {
  const [activeSubmenu, setActiveSubmenu] = useState<"ai" | "structural" | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [savedSelection, setSavedSelection] = useState<Range | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
    // Save the current selection when toolbar mounts
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      setSavedSelection(selection.getRangeAt(0).cloneRange())
    }
  }, [])

  const toolbarButtons = [
    { icon: Bold, action: "bold" as const, color: "text-accent-peach", delay: 0, tooltip: "Gras" },
    { icon: Italic, action: "italic" as const, color: "text-accent-lavender", delay: 20, tooltip: "Italique" },
    { icon: Type, action: "heading" as const, color: "text-accent-honey", delay: 40, tooltip: "Titre" },
    { icon: Link, action: "link" as const, color: "text-accent-green", delay: 60, tooltip: "Lien" },
    { icon: CheckSquare, action: "task" as const, color: "text-accent-peach", delay: 80, tooltip: "Tâche" },
    { icon: Sparkles, action: "ai" as const, color: "text-accent-lavender", delay: 100, tooltip: "IA" },
    { icon: Layers, action: "structural" as const, color: "text-accent-honey", delay: 120, tooltip: "Structure" },
  ]

  const restoreSelection = () => {
    if (savedSelection) {
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(savedSelection)
      }
    }
  }

  const handleButtonClick = (action: string, e?: React.MouseEvent) => {
    // Prevent event propagation to avoid triggering backdrop click
    e?.stopPropagation()
    e?.preventDefault()

    // Restore selection before performing action
    restoreSelection()

    if (action === "ai") {
      setActiveSubmenu(activeSubmenu === "ai" ? null : "ai")
    } else if (action === "structural") {
      setActiveSubmenu(activeSubmenu === "structural" ? null : "structural")
    } else if (action === "task") {
      const textToUse = selectedText || savedSelection?.toString() || ""
      onStructuralAction?.("create-task", { text: textToUse })
    } else {
      if (mode === "insertion" && !selectedText) {
        // En mode insertion, on peut ajouter du formatage au curseur
        onFormat(action as any)
      } else {
        onFormat(action as any)
      }
    }
  }

  return (
    <div
      ref={toolbarRef}
      className={cn(
        "relative pointer-events-auto transition-all duration-300",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
        mode === "insertion" && "animate-in zoom-in-95 fade-in duration-300"
      )}
      style={{ 
        zIndex: 50000,
        ...(position && { position: 'fixed', top: position.top, left: position.left })
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col items-center gap-3">
        <div 
          className="relative"
          role="toolbar"
          aria-label="Outils de formatage de texte"
        >
          <SoftUICard className={cn(
            "flex items-center gap-1 sm:gap-2 p-2 shadow-2xl border backdrop-blur-sm max-w-full overflow-x-auto",
            mode === "selection" ? "border-primary/40 bg-primary/5" : "border-accent/30 bg-background/95",
            "ring-2 ring-primary/10"
          )}>
          {toolbarButtons.map((button, index) => (
            <div
              key={button.action}
              className={cn("animate-in scale-in-75 fade-in duration-200", isVisible && "animate-none")}
              style={{ animationDelay: `${button.delay}ms` }}
            >
              <button
                onClick={(e) => handleButtonClick(button.action, e)}
                onMouseDown={(e) => e.preventDefault()}
                className={cn(
                  "w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-150",
                  "hover:scale-110 hover:bg-muted/60 hover:shadow-lg active:scale-95",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20",
                  button.color,
                  activeSubmenu === button.action && "bg-muted scale-110 shadow-lg ring-2 ring-primary/20",
                )}
                title={button.tooltip}
              >
                <button.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          ))}
          </SoftUICard>
        </div>

        {activeSubmenu === "ai" && (
          <div className="animate-in slide-in-from-top-3 fade-in duration-200 ease-out">
            <AISubmenu
              selectedText={window.getSelection()?.toString() || ""}
              onAction={(action, params) => onAIAction?.(action, params)}
              onClose={() => setActiveSubmenu(null)}
            />
          </div>
        )}

        {activeSubmenu === "structural" && (
          <div className="animate-in slide-in-from-top-3 fade-in duration-200 ease-out">
            <StructuralSubmenu
              selectedText={window.getSelection()?.toString() || ""}
              onAction={(action, params) => onStructuralAction?.(action, params)}
              onClose={() => setActiveSubmenu(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
