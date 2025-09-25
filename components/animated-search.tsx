"use client"

import { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import { SoftUICard } from "./soft-ui-card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AnimatedSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function AnimatedSearch({
  value,
  onChange,
  placeholder = "Search your garden of ideas...",
  className,
}: AnimatedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleToggle = () => {
    if (!isExpanded) {
      setIsExpanded(true)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 400) // Wait for animation to complete
    } else if (!value && !isFocused) {
      setIsExpanded(false)
    }
  }

  const handleClear = () => {
    onChange("")
    if (!isFocused) {
      setIsExpanded(false)
    }
  }

  // Keep expanded if there's a value or input is focused
  useEffect(() => {
    if (value || isFocused) {
      setIsExpanded(true)
    } else {
      setIsExpanded(false)
    }
  }, [value, isFocused])

  return (
    <div className={cn("relative", className)}>
      <SoftUICard
        pressed={isExpanded}
        className={cn(
          "transition-all duration-400 ease-out cursor-pointer overflow-hidden",
          isExpanded ? "w-full sm:w-80 max-w-md" : "w-16 h-16",
        )}
        onClick={!isExpanded ? handleToggle : undefined}
      >
        <div className="flex items-center h-16 px-4">
          {/* Search Icon */}
          <div className={cn("flex-shrink-0 transition-all duration-300", isExpanded ? "mr-3" : "mx-auto")}>
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>

          {/* Input Field */}
          <div
            className={cn(
              "flex-1 transition-all duration-400 overflow-hidden",
              isExpanded ? "opacity-100 w-full" : "opacity-0 w-0",
            )}
          >
            <Input
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className="border-none bg-transparent focus:ring-0 focus:outline-none placeholder:text-muted-foreground h-8"
            />
          </div>

          {/* Clear Button */}
          {isExpanded && value && (
            <button
              onClick={handleClear}
              className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-muted transition-colors duration-200"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </SoftUICard>
    </div>
  )
}
