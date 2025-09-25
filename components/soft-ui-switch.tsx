"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface SoftUISwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
  disabled?: boolean
}

export function SoftUISwitch({ checked, onChange, className, disabled = false }: SoftUISwitchProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = () => {
    if (disabled) return
    setIsPressed(true)
    onChange(!checked)
    setTimeout(() => {
      setIsPressed(false)
    }, 150)
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "relative w-12 h-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        checked ? "bg-accent-green" : "bg-muted",
        isPressed && "scale-95",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <div
        className={cn(
          "absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200 soft-shadow",
          checked ? "left-6 bg-white" : "left-0.5 bg-card",
          isPressed && "scale-90",
        )}
      />
    </button>
  )
}
