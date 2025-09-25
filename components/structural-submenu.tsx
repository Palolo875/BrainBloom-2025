"use client"

import { SoftUICard } from "./soft-ui-card"
import { FileText, Link2, Calendar, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface StructuralSubmenuProps {
  selectedText: string
  onAction: (action: string, params?: any) => void
  onClose: () => void
}

export function StructuralSubmenu({ selectedText, onAction, onClose }: StructuralSubmenuProps) {
  const handleAction = (action: string, params?: any) => {
    onAction(action, params)
    onClose()
  }

  const structuralActions = [
    {
      icon: FileText,
      label: "Extraire la Note",
      action: "extract-note",
      color: "text-accent-peach",
      delay: 0,
      description: "Créer une nouvelle note avec ce contenu",
    },
    {
      icon: Link2,
      label: "Intégrer une Note",
      action: "embed-note",
      color: "text-accent-lavender",
      delay: 30,
      description: "Afficher le contenu d'une autre note ici",
    },
    {
      icon: Calendar,
      label: "Ajouter une Échéance",
      action: "add-deadline",
      color: "text-accent-honey",
      delay: 60,
      description: "Transformer en tâche avec date limite",
    },
    {
      icon: User,
      label: "Assigner",
      action: "assign-task",
      color: "text-accent-green",
      delay: 90,
      description: "Assigner cette tâche à quelqu'un",
    },
  ]

  return (
    <SoftUICard className="p-3 min-w-64">
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground mb-3 font-medium">Actions structurelles</div>
        {structuralActions.map((action, index) => (
          <div
            key={action.action}
            className="animate-in slide-in-from-right-2 fade-in duration-300"
            style={{ animationDelay: `${action.delay}ms` }}
          >
            <button
              onClick={() => handleAction(action.action)}
              className={cn(
                "w-full flex flex-col items-start gap-1 p-3 rounded-lg text-sm transition-all duration-200",
                "hover:bg-muted hover:scale-[1.02] active:scale-[0.98]",
                action.color,
              )}
            >
              <div className="flex items-center gap-3">
                <action.icon className="w-4 h-4" />
                <span className="text-foreground font-medium">{action.label}</span>
              </div>
              <span className="text-xs text-muted-foreground ml-7">{action.description}</span>
            </button>
          </div>
        ))}
      </div>
    </SoftUICard>
  )
}
