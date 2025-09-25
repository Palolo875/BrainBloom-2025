"use client"

import { useState } from "react"
import { SoftUICard } from "./soft-ui-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Palette, Network, X } from "lucide-react"

interface FilterRule {
  id: string
  type: "tag" | "date" | "content" | "connections"
  operator: "contains" | "equals" | "after" | "before" | "greater" | "less"
  value: string
}

interface AdvancedGraphFiltersProps {
  onFiltersChange: (filters: FilterRule[]) => void
  onColorModeChange: (mode: "default" | "tags" | "age" | "connections") => void
  onSaveView: (name: string, filters: FilterRule[]) => void
  savedViews: Array<{ name: string; filters: FilterRule[] }>
  onLoadView: (filters: FilterRule[]) => void
}

export function AdvancedGraphFilters({
  onFiltersChange,
  onColorModeChange,
  onSaveView,
  savedViews,
  onLoadView,
}: AdvancedGraphFiltersProps) {
  const [filters, setFilters] = useState<FilterRule[]>([])
  const [newViewName, setNewViewName] = useState("")
  const [showSaveView, setShowSaveView] = useState(false)

  const addFilter = () => {
    const newFilter: FilterRule = {
      id: Date.now().toString(),
      type: "tag",
      operator: "contains",
      value: "",
    }
    const updatedFilters = [...filters, newFilter]
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const updateFilter = (id: string, updates: Partial<FilterRule>) => {
    const updatedFilters = filters.map((filter) => (filter.id === id ? { ...filter, ...updates } : filter))
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const removeFilter = (id: string) => {
    const updatedFilters = filters.filter((filter) => filter.id !== id)
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const saveCurrentView = () => {
    if (newViewName.trim()) {
      onSaveView(newViewName.trim(), filters)
      setNewViewName("")
      setShowSaveView(false)
    }
  }

  return (
    <SoftUICard className="p-6 space-y-6">
      {/* Color Mode Selection */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Coloration Dynamique
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => onColorModeChange("tags")} className="rounded-full">
            Par Tags
          </Button>
          <Button variant="outline" size="sm" onClick={() => onColorModeChange("age")} className="rounded-full">
            Par Ancienneté
          </Button>
          <Button variant="outline" size="sm" onClick={() => onColorModeChange("connections")} className="rounded-full">
            Par Connexions
          </Button>
          <Button variant="outline" size="sm" onClick={() => onColorModeChange("default")} className="rounded-full">
            Défaut
          </Button>
        </div>
      </div>

      {/* Multi-Criteria Filters */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Network className="w-4 h-4" />
            Filtrage Multi-Critères
          </h3>
          <Button onClick={addFilter} size="sm" variant="outline" className="rounded-full bg-transparent">
            + Ajouter
          </Button>
        </div>

        <div className="space-y-3">
          {filters.map((filter, index) => (
            <div
              key={filter.id}
              className="animate-in slide-in-from-top-2 fade-in duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <SoftUICard pressed className="p-3">
                <div className="flex items-center gap-2">
                  <Select
                    value={filter.type}
                    onValueChange={(value) => updateFilter(filter.id, { type: value as any })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tag">Tag</SelectItem>
                      <SelectItem value="content">Contenu</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="connections">Connexions</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filter.operator}
                    onValueChange={(value) => updateFilter(filter.id, { operator: value as any })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contains">Contient</SelectItem>
                      <SelectItem value="equals">Égale</SelectItem>
                      <SelectItem value="after">Après</SelectItem>
                      <SelectItem value="before">Avant</SelectItem>
                      <SelectItem value="greater">Plus de</SelectItem>
                      <SelectItem value="less">Moins de</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                    placeholder="Valeur..."
                    className="flex-1"
                  />

                  <Button
                    onClick={() => removeFilter(filter.id)}
                    size="sm"
                    variant="ghost"
                    className="rounded-full p-1 h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </SoftUICard>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Views */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">Vues Personnalisées</h3>
          <Button onClick={() => setShowSaveView(!showSaveView)} size="sm" variant="outline" className="rounded-full">
            Sauvegarder
          </Button>
        </div>

        {showSaveView && (
          <div className="animate-in slide-in-from-top-2 fade-in duration-300 mb-3">
            <SoftUICard pressed className="p-3">
              <div className="flex items-center gap-2">
                <Input
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  placeholder="Nom de la vue..."
                  className="flex-1"
                />
                <Button onClick={saveCurrentView} size="sm" className="rounded-full">
                  Sauver
                </Button>
              </div>
            </SoftUICard>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {savedViews.map((view, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer hover:bg-muted transition-colors duration-200"
              onClick={() => {
                setFilters(view.filters)
                onLoadView(view.filters)
              }}
            >
              {view.name}
            </Badge>
          ))}
        </div>
      </div>
    </SoftUICard>
  )
}
