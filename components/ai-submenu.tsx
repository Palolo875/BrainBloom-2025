"use client"

import { useState } from "react"
import { SoftUICard } from "./soft-ui-card"
import { Sparkles, Languages, Wand2, Target, CheckSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface AISubmenuProps {
  selectedText: string
  onAction: (action: string, params?: any) => void
  onClose: () => void
}

export function AISubmenu({ selectedText, onAction, onClose }: AISubmenuProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAIAction = async (action: string, params?: any) => {
    setIsProcessing(true)
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1500))
    onAction(action, params)
    setIsProcessing(false)
    onClose()
  }

  const aiActions = [
    {
      icon: Wand2,
      label: "Améliorer l'écriture",
      action: "improve",
      color: "text-accent-peach",
      delay: 0,
    },
    {
      icon: Target,
      label: "Résumer",
      action: "summarize",
      color: "text-accent-lavender",
      delay: 30,
    },
    {
      icon: Languages,
      label: "Traduire",
      action: "translate",
      color: "text-accent-honey",
      delay: 60,
    },
    {
      icon: Sparkles,
      label: "Changer le ton",
      action: "tone",
      color: "text-accent-green",
      delay: 90,
    },
    {
      icon: CheckSquare,
      label: "Trouver des actions",
      action: "extract-tasks",
      color: "text-accent-peach",
      delay: 120,
    },
  ]

  return (
    <SoftUICard className="p-3 min-w-48">
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground mb-3 font-medium">Actions IA sur le texte sélectionné</div>
        {aiActions.map((action, index) => (
          <div
            key={action.action}
            className="animate-in slide-in-from-left-2 fade-in duration-300"
            style={{ animationDelay: `${action.delay}ms` }}
          >
            <button
              onClick={() => handleAIAction(action.action)}
              disabled={isProcessing}
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-all duration-200",
                "hover:bg-muted hover:scale-[1.02] active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                action.color,
              )}
            >
              <action.icon className="w-4 h-4" />
              <span className="text-foreground">{action.label}</span>
              {isProcessing && (
                <div className="ml-auto w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              )}
            </button>
          </div>
        ))}
      </div>
    </SoftUICard>
  )
}
