"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"
import { SoftUICard } from "./soft-ui-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Brain, RotateCcw, CheckCircle, XCircle, Eye, BookOpen, Zap } from "lucide-react"
import { format, addDays, differenceInDays } from "date-fns"
import { fr } from "date-fns/locale"

interface Flashcard {
  id: string
  question: string
  answer: string
  noteId?: string
  noteName?: string
  source?: string
  createdAt: Date
  lastReviewed?: Date
  nextReview: Date
  interval: number // days
  easeFactor: number
  reviewCount: number
  correctCount: number
}

interface LearningSystemProps {
  onBack: () => void
}

export function LearningSystem({ onBack }: LearningSystemProps) {
  const [currentView, setCurrentView] = useState<"overview" | "review" | "create" | "library">("overview")
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: "1",
      question: "Qu'est-ce que la répétition espacée ?",
      answer:
        "Une technique d'apprentissage qui consiste à réviser l'information à des intervalles de temps croissants pour optimiser la mémorisation à long terme.",
      noteId: "note1",
      noteName: "Techniques d'apprentissage",
      source: "https://example.com/spaced-repetition",
      createdAt: new Date(2024, 11, 15),
      lastReviewed: new Date(2024, 11, 20),
      nextReview: new Date(2024, 11, 23),
      interval: 3,
      easeFactor: 2.5,
      reviewCount: 2,
      correctCount: 2,
    },
    {
      id: "2",
      question: "Quels sont les principes du design thinking ?",
      answer:
        "Empathie, Définition, Idéation, Prototypage, Test - un processus centré sur l'utilisateur pour résoudre des problèmes complexes.",
      noteId: "note2",
      noteName: "Design & Innovation",
      createdAt: new Date(2024, 11, 18),
      nextReview: new Date(2024, 11, 22),
      interval: 1,
      easeFactor: 2.5,
      reviewCount: 0,
      correctCount: 0,
    },
    {
      id: "3",
      question: "Comment fonctionne la neuroplasticité ?",
      answer:
        "La capacité du cerveau à se réorganiser et former de nouvelles connexions neuronales tout au long de la vie, permettant l'apprentissage et l'adaptation.",
      noteId: "note3",
      noteName: "Neurosciences",
      createdAt: new Date(2024, 11, 19),
      nextReview: new Date(2024, 11, 21),
      interval: 1,
      easeFactor: 2.5,
      reviewCount: 0,
      correctCount: 0,
    },
  ])

  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [newCard, setNewCard] = useState({ question: "", answer: "", source: "" })

  const today = new Date()
  const dueCards = flashcards.filter((card) => card.nextReview <= today)
  const totalCards = flashcards.length
  const masteredCards = flashcards.filter((card) => card.easeFactor >= 2.8 && card.reviewCount >= 3).length

  const calculateNextReview = (card: Flashcard, difficulty: "easy" | "medium" | "hard") => {
    let newInterval = card.interval
    let newEaseFactor = card.easeFactor

    switch (difficulty) {
      case "easy":
        newInterval = Math.round(card.interval * card.easeFactor * 1.3)
        newEaseFactor = Math.min(card.easeFactor + 0.15, 3.0)
        break
      case "medium":
        newInterval = Math.round(card.interval * card.easeFactor)
        break
      case "hard":
        newInterval = Math.max(1, Math.round(card.interval * 0.6))
        newEaseFactor = Math.max(card.easeFactor - 0.2, 1.3)
        break
    }

    return {
      interval: newInterval,
      easeFactor: newEaseFactor,
      nextReview: addDays(today, newInterval),
      lastReviewed: today,
      reviewCount: card.reviewCount + 1,
      correctCount: difficulty !== "hard" ? card.correctCount + 1 : card.correctCount,
    }
  }

  const reviewCard = (difficulty: "easy" | "medium" | "hard") => {
    const currentCard = dueCards[currentReviewIndex]
    if (!currentCard) return

    const updates = calculateNextReview(currentCard, difficulty)

    setFlashcards((prev) => prev.map((card) => (card.id === currentCard.id ? { ...card, ...updates } : card)))

    setShowAnswer(false)
    if (currentReviewIndex < dueCards.length - 1) {
      setCurrentReviewIndex((prev) => prev + 1)
    } else {
      setCurrentView("overview")
      setCurrentReviewIndex(0)
    }
  }

  const createFlashcard = () => {
    if (!newCard.question.trim() || !newCard.answer.trim()) return

    const flashcard: Flashcard = {
      id: Date.now().toString(),
      question: newCard.question,
      answer: newCard.answer,
      source: newCard.source,
      createdAt: today,
      nextReview: addDays(today, 1),
      interval: 1,
      easeFactor: 2.5,
      reviewCount: 0,
      correctCount: 0,
    }

    setFlashcards((prev) => [...prev, flashcard])
    setNewCard({ question: "", answer: "", source: "" })
    setCurrentView("overview")
  }

  const generateAIQuestions = (text: string) => {
    // Simulate AI question generation
    const questions = [
      {
        question: "Quel est le concept principal abordé dans ce texte ?",
        answer: "Réponse générée automatiquement basée sur l'analyse du contenu.",
      },
      {
        question: "Quelles sont les implications pratiques de cette information ?",
        answer: "Applications concrètes dérivées du contenu analysé.",
      },
    ]
    return questions
  }

  const getStreakDays = () => {
    const sortedReviews = flashcards
      .filter((card) => card.lastReviewed)
      .map((card) => card.lastReviewed!)
      .sort((a, b) => b.getTime() - a.getTime())

    let streak = 0
    let currentDate = today

    for (const reviewDate of sortedReviews) {
      const daysDiff = differenceInDays(currentDate, reviewDate)
      if (daysDiff <= 1) {
        streak++
        currentDate = reviewDate
      } else {
        break
      }
    }

    return streak
  }

  if (currentView === "overview") {
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
                <h1 className="text-2xl md:text-3xl font-serif text-foreground font-bold mb-2">La Distillerie</h1>
                <p className="text-muted-foreground text-pretty">
                  Transformez l'information brute en connaissance durable.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={currentView === "overview" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("overview")}
                >
                  Vue d'ensemble
                </Button>
                <Button
                  variant={currentView === "library" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("library")}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Bibliothèque
                </Button>
                <Button
                  variant={currentView === "create" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("create")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SoftUICard className="p-6 text-center">
              <div className="text-3xl font-bold text-accent-peach mb-2">{dueCards.length}</div>
              <div className="text-sm text-muted-foreground">Cartes à réviser</div>
            </SoftUICard>

            <SoftUICard className="p-6 text-center">
              <div className="text-3xl font-bold text-accent-green mb-2">{masteredCards}</div>
              <div className="text-sm text-muted-foreground">Cartes maîtrisées</div>
            </SoftUICard>

            <SoftUICard className="p-6 text-center">
              <div className="text-3xl font-bold text-accent-lavender mb-2">{totalCards}</div>
              <div className="text-sm text-muted-foreground">Total des cartes</div>
            </SoftUICard>

            <SoftUICard className="p-6 text-center">
              <div className="text-3xl font-bold text-accent-honey mb-2">{getStreakDays()}</div>
              <div className="text-sm text-muted-foreground">Jours consécutifs</div>
            </SoftUICard>
          </div>

          {/* Review Section */}
          {dueCards.length > 0 ? (
            <SoftUICard className="p-6 mb-8 bg-gradient-to-r from-accent-peach/10 to-accent-lavender/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif font-semibold text-foreground mb-2">Session de révision</h2>
                  <p className="text-muted-foreground">
                    {dueCards.length} carte{dueCards.length > 1 ? "s" : ""} à réviser aujourd'hui
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setCurrentView("review")
                    setCurrentReviewIndex(0)
                    setShowAnswer(false)
                  }}
                  className="bg-accent-peach hover:bg-accent-peach/90 text-white"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Commencer la révision
                </Button>
              </div>
            </SoftUICard>
          ) : (
            <SoftUICard className="p-6 mb-8 text-center">
              <CheckCircle className="w-12 h-12 text-accent-green mx-auto mb-4" />
              <h2 className="text-xl font-serif font-semibold text-foreground mb-2">
                Toutes les révisions terminées !
              </h2>
              <p className="text-muted-foreground">Revenez demain pour de nouvelles cartes à réviser.</p>
            </SoftUICard>
          )}

          {/* Recent Activity */}
          <SoftUICard className="p-6">
            <h3 className="text-lg font-serif font-semibold text-foreground mb-4">Activité récente</h3>
            <div className="space-y-3">
              {flashcards
                .filter((card) => card.lastReviewed)
                .sort((a, b) => (b.lastReviewed?.getTime() || 0) - (a.lastReviewed?.getTime() || 0))
                .slice(0, 5)
                .map((card) => (
                  <div key={card.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <div className="font-medium text-foreground">{card.question}</div>
                      <div className="text-sm text-muted-foreground">
                        {card.noteName && `📝 ${card.noteName} • `}
                        Révisé le {format(card.lastReviewed!, "dd/MM/yyyy", { locale: fr })}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {card.correctCount}/{card.reviewCount} correct
                    </Badge>
                  </div>
                ))}
            </div>
          </SoftUICard>
        </div>
      </div>
    )
  }

  if (currentView === "review" && dueCards.length > 0) {
    const currentCard = dueCards[currentReviewIndex]

    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              onClick={() => setCurrentView("overview")}
              variant="ghost"
              className="mb-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>

            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-serif text-foreground font-bold">Session de révision</h1>
              <Badge variant="outline">
                {currentReviewIndex + 1} / {dueCards.length}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-8">
            <div
              className="bg-accent-peach h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentReviewIndex + 1) / dueCards.length) * 100}%` }}
            />
          </div>

          {/* Flashcard */}
          <SoftUICard className="p-8 mb-6 min-h-[300px] flex flex-col justify-center">
            <div className="text-center space-y-6">
              {/* Question */}
              <div>
                <h2 className="text-xl md:text-2xl font-serif font-semibold text-foreground mb-4">
                  {currentCard.question}
                </h2>

                {currentCard.noteName && (
                  <Badge variant="outline" className="text-xs">
                    📝 {currentCard.noteName}
                  </Badge>
                )}
              </div>

              {/* Answer */}
              {showAnswer ? (
                <div className="animate-in fade-in duration-300">
                  <div className="border-t border-muted pt-6">
                    <p className="text-muted-foreground text-lg leading-relaxed">{currentCard.answer}</p>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setShowAnswer(true)} variant="outline" className="mt-8">
                  <Eye className="w-4 h-4 mr-2" />
                  Révéler la réponse
                </Button>
              )}
            </div>
          </SoftUICard>

          {/* Review Buttons */}
          {showAnswer && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <Button
                onClick={() => reviewCard("hard")}
                variant="outline"
                className="p-6 h-auto flex flex-col gap-2 border-red-200 hover:bg-red-50"
              >
                <XCircle className="w-6 h-6 text-red-500" />
                <span className="font-medium">Difficile</span>
                <span className="text-xs text-muted-foreground">Revoir bientôt</span>
              </Button>

              <Button
                onClick={() => reviewCard("medium")}
                variant="outline"
                className="p-6 h-auto flex flex-col gap-2 border-yellow-200 hover:bg-yellow-50"
              >
                <RotateCcw className="w-6 h-6 text-yellow-500" />
                <span className="font-medium">Moyen</span>
                <span className="text-xs text-muted-foreground">Intervalle normal</span>
              </Button>

              <Button
                onClick={() => reviewCard("easy")}
                variant="outline"
                className="p-6 h-auto flex flex-col gap-2 border-green-200 hover:bg-green-50"
              >
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="font-medium">Facile</span>
                <span className="text-xs text-muted-foreground">Intervalle long</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (currentView === "create") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              onClick={() => setCurrentView("overview")}
              variant="ghost"
              className="mb-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>

            <h1 className="text-2xl md:text-3xl font-serif text-foreground font-bold mb-2">Créer une flashcard</h1>
            <p className="text-muted-foreground text-pretty">
              Transformez vos notes en questions pour une mémorisation optimale.
            </p>
          </div>

          {/* Create Form */}
          <SoftUICard className="p-6 mb-6">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Question</label>
                <Textarea
                  placeholder="Quelle question voulez-vous vous poser ?"
                  value={newCard.question}
                  onChange={(e) => setNewCard((prev) => ({ ...prev, question: e.target.value }))}
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Réponse</label>
                <Textarea
                  placeholder="Quelle est la réponse à cette question ?"
                  value={newCard.answer}
                  onChange={(e) => setNewCard((prev) => ({ ...prev, answer: e.target.value }))}
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Source (optionnel)</label>
                <Input
                  placeholder="URL, livre, note d'origine..."
                  value={newCard.source}
                  onChange={(e) => setNewCard((prev) => ({ ...prev, source: e.target.value }))}
                />
              </div>

              <Button onClick={createFlashcard} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Créer la flashcard
              </Button>
            </div>
          </SoftUICard>

          {/* AI Generation */}
          <SoftUICard className="p-6 bg-gradient-to-r from-accent-lavender/10 to-accent-peach/10">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-accent-sage mt-1" />
              <div>
                <h3 className="font-medium text-foreground mb-2">Génération IA de questions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Collez un texte ci-dessous et l'IA générera automatiquement des questions pertinentes.
                </p>
                <Textarea
                  placeholder="Collez votre texte ici pour générer des questions automatiquement..."
                  className="min-h-[100px] resize-none mb-4"
                />
                <Button variant="outline" size="sm">
                  <Zap className="w-4 h-4 mr-2" />
                  Générer des questions
                </Button>
              </div>
            </div>
          </SoftUICard>
        </div>
      </div>
    )
  }

  if (currentView === "library") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              onClick={() => setCurrentView("overview")}
              variant="ghost"
              className="mb-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-serif text-foreground font-bold mb-2">Bibliothèque</h1>
                <p className="text-muted-foreground text-pretty">
                  Toutes vos flashcards organisées et prêtes à être révisées.
                </p>
              </div>

              <Button onClick={() => setCurrentView("create")}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle carte
              </Button>
            </div>
          </div>

          {/* Flashcards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcards.map((card, index) => (
              <SoftUICard
                key={card.id}
                className="p-6 space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div>
                  <h3 className="font-medium text-foreground mb-2 line-clamp-2">{card.question}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">{card.answer}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {card.noteName && (
                    <Badge variant="outline" className="text-xs">
                      📝 {card.noteName}
                    </Badge>
                  )}

                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      card.nextReview <= today ? "border-red-300 text-red-600" : "border-green-300 text-green-600",
                    )}
                  >
                    {card.nextReview <= today ? "À réviser" : `Prochaine: ${format(card.nextReview, "dd/MM")}`}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {card.correctCount}/{card.reviewCount} correct
                  </span>
                  <span>Facilité: {card.easeFactor.toFixed(1)}</span>
                </div>
              </SoftUICard>
            ))}
          </div>

          {flashcards.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Aucune flashcard</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par créer votre première flashcard pour débuter votre apprentissage.
              </p>
              <Button onClick={() => setCurrentView("create")}>
                <Plus className="w-4 h-4 mr-2" />
                Créer ma première carte
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
