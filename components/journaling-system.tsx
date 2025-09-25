"use client"

import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { SoftUICard } from "./soft-ui-card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Calendar, TrendingUp, Activity, Heart, Book, Moon, Coffee, Dumbbell, Brain } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths } from "date-fns"
import { fr } from "date-fns/locale"

interface JournalEntry {
  id: string
  date: Date
  content: string
  mood: 1 | 2 | 3 | 4 | 5 // 1=terrible, 5=excellent
  energy: 1 | 2 | 3 | 4 | 5
  activities: string[]
  gratitude?: string
  learned?: string
}

interface JournalingSystemProps {
  onBack: () => void
}

export function JournalingSystem({ onBack }: JournalingSystemProps) {
  const [currentView, setCurrentView] = useState<"today" | "calendar" | "stats">("today")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: "1",
      date: new Date(2024, 11, 20),
      content: "Journée productive au travail. J'ai terminé le projet important et me sens satisfait du résultat.",
      mood: 4,
      energy: 4,
      activities: ["travail", "sport", "lecture"],
      gratitude: "Reconnaissant pour l'équipe formidable avec laquelle je travaille",
      learned: "L'importance de prendre des pauses régulières pour maintenir la concentration",
    },
    {
      id: "2",
      date: new Date(2024, 11, 19),
      content: "Journée plus difficile. Beaucoup de stress au bureau mais la méditation du soir m'a aidé.",
      mood: 2,
      energy: 2,
      activities: ["travail", "méditation"],
      gratitude: "Heureux d'avoir découvert la méditation",
      learned: "Le stress peut être géré avec les bonnes techniques",
    },
    {
      id: "3",
      date: new Date(2024, 11, 18),
      content: "Excellente journée ! Sortie en nature avec des amis, beaucoup de rires et de bons moments.",
      mood: 5,
      energy: 5,
      activities: ["nature", "amis", "sport"],
      gratitude: "Mes amis merveilleux et la beauté de la nature",
      learned: "Passer du temps dehors booste vraiment mon moral",
    },
  ])

  const [todayEntry, setTodayEntry] = useState<Partial<JournalEntry>>({
    content: "",
    mood: 3,
    energy: 3,
    activities: [],
    gratitude: "",
    learned: "",
  })

  const today = new Date()
  const existingTodayEntry = entries.find((entry) => isSameDay(entry.date, today))

  useEffect(() => {
    if (existingTodayEntry) {
      setTodayEntry(existingTodayEntry)
    }
  }, [existingTodayEntry])

  const availableActivities = [
    { id: "sport", label: "Sport", icon: Dumbbell, color: "bg-red-100 text-red-700" },
    { id: "méditation", label: "Méditation", icon: Brain, color: "bg-purple-100 text-purple-700" },
    { id: "lecture", label: "Lecture", icon: Book, color: "bg-blue-100 text-blue-700" },
    { id: "travail", label: "Travail", icon: Coffee, color: "bg-orange-100 text-orange-700" },
    { id: "amis", label: "Amis", icon: Heart, color: "bg-pink-100 text-pink-700" },
    { id: "nature", label: "Nature", icon: Activity, color: "bg-green-100 text-green-700" },
    { id: "sommeil", label: "Mauvais sommeil", icon: Moon, color: "bg-gray-100 text-gray-700" },
  ]

  const moodEmojis = [
    { value: 1, emoji: "😢", label: "Terrible", color: "text-red-500" },
    { value: 2, emoji: "😕", label: "Difficile", color: "text-orange-500" },
    { value: 3, emoji: "😐", label: "Neutre", color: "text-yellow-500" },
    { value: 4, emoji: "😊", label: "Bien", color: "text-green-500" },
    { value: 5, emoji: "😄", label: "Excellent", color: "text-emerald-500" },
  ]

  const saveEntry = () => {
    if (!todayEntry.content?.trim()) return

    const newEntry: JournalEntry = {
      id: existingTodayEntry?.id || Date.now().toString(),
      date: today,
      content: todayEntry.content || "",
      mood: todayEntry.mood || 3,
      energy: todayEntry.energy || 3,
      activities: todayEntry.activities || [],
      gratitude: todayEntry.gratitude,
      learned: todayEntry.learned,
    }

    if (existingTodayEntry) {
      setEntries((prev) => prev.map((entry) => (entry.id === newEntry.id ? newEntry : entry)))
    } else {
      setEntries((prev) => [...prev, newEntry])
    }
  }

  const toggleActivity = (activityId: string) => {
    setTodayEntry((prev) => ({
      ...prev,
      activities: prev.activities?.includes(activityId)
        ? prev.activities.filter((id) => id !== activityId)
        : [...(prev.activities || []), activityId],
    }))
  }

  const getMonthDays = () => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }

  const getEntryForDate = (date: Date) => {
    return entries.find((entry) => isSameDay(entry.date, date))
  }

  const getMoodColor = (mood: number) => {
    const colors = {
      1: "bg-red-200",
      2: "bg-orange-200",
      3: "bg-yellow-200",
      4: "bg-green-200",
      5: "bg-emerald-200",
    }
    return colors[mood as keyof typeof colors] || "bg-gray-100"
  }

  const getCorrelations = () => {
    if (entries.length < 3) return []

    const correlations = []

    // Sport correlation
    const sportDays = entries.filter((e) => e.activities.includes("sport"))
    const avgMoodWithSport = sportDays.reduce((sum, e) => sum + e.mood, 0) / sportDays.length
    const avgMoodWithoutSport =
      entries.filter((e) => !e.activities.includes("sport")).reduce((sum, e) => sum + e.mood, 0) /
      (entries.length - sportDays.length)

    if (sportDays.length > 0 && avgMoodWithSport > avgMoodWithoutSport + 0.5) {
      correlations.push({
        activity: "Sport",
        impact: `+${Math.round((avgMoodWithSport - avgMoodWithoutSport) * 20)}% d'humeur`,
        description: "Les jours où vous faites du sport, votre humeur est significativement meilleure.",
      })
    }

    // Nature correlation
    const natureDays = entries.filter((e) => e.activities.includes("nature"))
    const avgEnergyWithNature = natureDays.reduce((sum, e) => sum + e.energy, 0) / natureDays.length
    const avgEnergyWithoutNature =
      entries.filter((e) => !e.activities.includes("nature")).reduce((sum, e) => sum + e.energy, 0) /
      (entries.length - natureDays.length)

    if (natureDays.length > 0 && avgEnergyWithNature > avgEnergyWithoutNature + 0.5) {
      correlations.push({
        activity: "Nature",
        impact: `+${Math.round((avgEnergyWithNature - avgEnergyWithoutNature) * 20)}% d'énergie`,
        description: "Passer du temps dans la nature booste considérablement votre niveau d'énergie.",
      })
    }

    return correlations
  }

  const getMoodTrend = () => {
    if (entries.length < 2) return 0
    const recent = entries.slice(-7) // Last 7 entries
    const older = entries.slice(-14, -7) // Previous 7 entries

    const recentAvg = recent.reduce((sum, e) => sum + e.mood, 0) / recent.length
    const olderAvg = older.length > 0 ? older.reduce((sum, e) => sum + e.mood, 0) / older.length : recentAvg

    return recentAvg - olderAvg
  }

  if (currentView === "today") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button onClick={onBack} variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-serif text-foreground font-bold mb-2">Le Sismographe</h1>
                <p className="text-muted-foreground text-pretty">
                  Cartographiez votre paysage intérieur et découvrez vos patterns.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={currentView === "today" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("today")}
                >
                  Aujourd'hui
                </Button>
                <Button
                  variant={currentView === "calendar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("calendar")}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendrier
                </Button>
                <Button
                  variant={currentView === "stats" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("stats")}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Statistiques
                </Button>
              </div>
            </div>
          </div>

          {/* Today's Entry */}
          <div className="space-y-6">
            <SoftUICard className="p-6">
              <h2 className="text-xl font-serif font-semibold text-foreground mb-4">
                {format(today, "EEEE d MMMM yyyy", { locale: fr })}
              </h2>

              {/* Mood Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">Comment vous sentez-vous ?</h3>
                <div className="flex gap-2 flex-wrap">
                  {moodEmojis.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setTodayEntry((prev) => ({ ...prev, mood: mood.value }))}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1",
                        todayEntry.mood === mood.value
                          ? "border-accent-sage bg-accent-sage/10"
                          : "border-muted hover:border-accent-sage/50",
                      )}
                    >
                      <span className="text-2xl">{mood.emoji}</span>
                      <span className="text-xs text-muted-foreground">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Level */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">Niveau d'énergie</h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setTodayEntry((prev) => ({ ...prev, energy: level }))}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all duration-200",
                        (todayEntry.energy || 0) >= level
                          ? "border-accent-peach bg-accent-peach"
                          : "border-muted hover:border-accent-peach/50",
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Activities */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">Activités d'aujourd'hui</h3>
                <div className="flex gap-2 flex-wrap">
                  {availableActivities.map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => toggleActivity(activity.id)}
                      className={cn(
                        "px-3 py-2 rounded-xl border-2 transition-all duration-200 flex items-center gap-2",
                        todayEntry.activities?.includes(activity.id)
                          ? "border-accent-sage bg-accent-sage/10"
                          : "border-muted hover:border-accent-sage/50",
                      )}
                    >
                      <activity.icon className="w-4 h-4" />
                      <span className="text-sm">{activity.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Journal Content */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">Comment s'est passée votre journée ?</h3>
                <Textarea
                  placeholder="Décrivez votre journée, vos pensées, vos ressentis..."
                  value={todayEntry.content || ""}
                  onChange={(e) => setTodayEntry((prev) => ({ ...prev, content: e.target.value }))}
                  className="min-h-[120px] resize-none"
                />
              </div>

              {/* Gratitude */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">Gratitude</h3>
                <Textarea
                  placeholder="Pour quoi êtes-vous reconnaissant(e) aujourd'hui ?"
                  value={todayEntry.gratitude || ""}
                  onChange={(e) => setTodayEntry((prev) => ({ ...prev, gratitude: e.target.value }))}
                  className="min-h-[80px] resize-none"
                />
              </div>

              {/* Learning */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">Ce que j'ai appris</h3>
                <Textarea
                  placeholder="Qu'avez-vous appris ou découvert aujourd'hui ?"
                  value={todayEntry.learned || ""}
                  onChange={(e) => setTodayEntry((prev) => ({ ...prev, learned: e.target.value }))}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <Button onClick={saveEntry} className="w-full">
                {existingTodayEntry ? "Mettre à jour" : "Sauvegarder"} l'entrée
              </Button>
            </SoftUICard>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === "calendar") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button onClick={onBack} variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-serif text-foreground font-bold mb-2">
                  Calendrier des Humeurs
                </h1>
                <p className="text-muted-foreground text-pretty">
                  Visualisez vos patterns émotionnels au fil du temps.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={currentView === "today" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("today")}
                >
                  Aujourd'hui
                </Button>
                <Button
                  variant={currentView === "calendar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("calendar")}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendrier
                </Button>
                <Button
                  variant={currentView === "stats" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("stats")}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Statistiques
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}>
              ←
            </Button>
            <h2 className="text-xl font-serif font-semibold">{format(currentMonth, "MMMM yyyy", { locale: fr })}</h2>
            <Button variant="outline" onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}>
              →
            </Button>
          </div>

          {/* Calendar Grid */}
          <SoftUICard className="p-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {getMonthDays().map((date) => {
                const entry = getEntryForDate(date)
                const isToday = isSameDay(date, today)

                return (
                  <div
                    key={date.toISOString()}
                    className={cn(
                      "aspect-square p-2 rounded-lg border-2 transition-all duration-200 cursor-pointer",
                      entry ? getMoodColor(entry.mood) : "bg-gray-50",
                      isToday && "border-accent-sage",
                      !entry && "border-muted hover:border-accent-sage/50",
                    )}
                  >
                    <div className="text-sm font-medium text-foreground">{format(date, "d")}</div>
                    {entry && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {moodEmojis.find((m) => m.value === entry.mood)?.emoji}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-6 text-xs">
              <span className="text-muted-foreground">Humeur:</span>
              {moodEmojis.map((mood) => (
                <div key={mood.value} className="flex items-center gap-1">
                  <div className={cn("w-3 h-3 rounded", getMoodColor(mood.value))} />
                  <span className="text-muted-foreground">{mood.label}</span>
                </div>
              ))}
            </div>
          </SoftUICard>
        </div>
      </div>
    )
  }

  if (currentView === "stats") {
    const correlations = getCorrelations()
    const moodTrend = getMoodTrend()
    const avgMood = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length
    const avgEnergy = entries.reduce((sum, e) => sum + e.energy, 0) / entries.length

    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button onClick={onBack} variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-serif text-foreground font-bold mb-2">
                  Découvertes & Corrélations
                </h1>
                <p className="text-muted-foreground text-pretty">
                  L'IA analyse vos patterns pour révéler des insights personnalisés.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={currentView === "today" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("today")}
                >
                  Aujourd'hui
                </Button>
                <Button
                  variant={currentView === "calendar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("calendar")}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendrier
                </Button>
                <Button
                  variant={currentView === "stats" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("stats")}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Statistiques
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Overall Stats */}
            <SoftUICard className="p-6">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Vue d'ensemble</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Humeur moyenne</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{avgMood.toFixed(1)}/5</span>
                    <span className="text-lg">{moodEmojis.find((m) => m.value === Math.round(avgMood))?.emoji}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Énergie moyenne</span>
                  <span className="font-medium">{avgEnergy.toFixed(1)}/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tendance récente</span>
                  <div className="flex items-center gap-1">
                    {moodTrend > 0.2 ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-green-500">En hausse</span>
                      </>
                    ) : moodTrend < -0.2 ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                        <span className="text-red-500">En baisse</span>
                      </>
                    ) : (
                      <>
                        <span className="text-muted-foreground">Stable</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </SoftUICard>

            {/* Correlations */}
            {correlations.map((correlation, index) => (
              <SoftUICard key={index} className="p-6 bg-gradient-to-br from-accent-lavender/10 to-accent-peach/10">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-accent-sage mt-1" />
                  <div>
                    <h3 className="font-medium text-foreground mb-1">
                      {correlation.activity} → {correlation.impact}
                    </h3>
                    <p className="text-sm text-muted-foreground">{correlation.description}</p>
                  </div>
                </div>
              </SoftUICard>
            ))}

            {correlations.length === 0 && (
              <SoftUICard className="p-6 col-span-full">
                <div className="text-center">
                  <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Pas encore assez de données</h3>
                  <p className="text-muted-foreground">
                    Continuez à tenir votre journal pendant quelques jours pour découvrir vos patterns personnels.
                  </p>
                </div>
              </SoftUICard>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
