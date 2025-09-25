"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"
import { SoftUICard } from "./soft-ui-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Plus,
  Calendar,
  CheckSquare,
  Square,
  Brain,
  Filter,
  LayoutGrid,
  List,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import { format } from "date-fns"

interface Task {
  id: string
  title: string
  completed: boolean
  dueDate?: Date
  tags: string[]
  reminder?: Date
  priority: "low" | "medium" | "high"
  noteId?: string
  noteName?: string
  subtasks: Task[]
  column: string
}

interface TaskManagementProps {
  onBack: () => void
}

export function TaskManagement({ onBack }: TaskManagementProps) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Finir le rapport de projet",
      completed: false,
      dueDate: new Date(2024, 11, 25),
      tags: ["urgent", "travail"],
      priority: "high",
      noteId: "note1",
      noteName: "Projet Q4",
      subtasks: [],
      column: "todo",
    },
    {
      id: "2",
      title: "Réviser les notes de cours",
      completed: false,
      tags: ["étude"],
      priority: "medium",
      noteId: "note2",
      noteName: "Cours de Design",
      subtasks: [
        {
          id: "2a",
          title: "Chapitre 1: Principes de base",
          completed: true,
          tags: [],
          priority: "low",
          subtasks: [],
          column: "done",
        },
        {
          id: "2b",
          title: "Chapitre 2: Couleurs et typographie",
          completed: false,
          tags: [],
          priority: "low",
          subtasks: [],
          column: "todo",
        },
      ],
      column: "in-progress",
    },
    {
      id: "3",
      title: "Planifier les vacances",
      completed: true,
      tags: ["perso"],
      priority: "low",
      noteId: "note3",
      noteName: "Idées Vacances",
      subtasks: [],
      column: "done",
    },
  ])

  const [viewMode, setViewMode] = useState<"list" | "kanban">("list")
  const [filter, setFilter] = useState<"all" | "today" | "week" | "overdue">("all")
  const [selectedTag, setSelectedTag] = useState<string>("")
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [showNewTask, setShowNewTask] = useState(false)

  const columns = [
    { id: "ideas", title: "Boîte à idées", color: "bg-accent-lavender/20" },
    { id: "todo", title: "À Faire", color: "bg-accent-honey/20" },
    { id: "in-progress", title: "En Cours", color: "bg-accent-peach/20" },
    { id: "done", title: "Terminé", color: "bg-accent-green/20" },
  ]

  const allTags = Array.from(new Set(tasks.flatMap((task) => task.tags)))

  const filteredTasks = tasks.filter((task) => {
    if (selectedTag && !task.tags.includes(selectedTag)) return false

    switch (filter) {
      case "today":
        return task.dueDate && task.dueDate.toDateString() === new Date().toDateString()
      case "week":
        const weekFromNow = new Date()
        weekFromNow.setDate(weekFromNow.getDate() + 7)
        return task.dueDate && task.dueDate <= weekFromNow
      case "overdue":
        return task.dueDate && task.dueDate < new Date() && !task.completed
      default:
        return true
    }
  })

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed, column: !task.completed ? "done" : "todo" } : task,
      ),
    )
  }

  const addTask = () => {
    if (!newTaskTitle.trim()) return

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      tags: [],
      priority: "medium",
      subtasks: [],
      column: "todo",
    }

    setTasks((prev) => [...prev, newTask])
    setNewTaskTitle("")
    setShowNewTask(false)
  }

  const moveTask = (taskId: string, newColumn: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, column: newColumn, completed: newColumn === "done" } : task)),
    )
  }

  const getAISuggestion = () => {
    const incompleteTasks = tasks.filter((t) => !t.completed)
    if (incompleteTasks.length === 0) return "Toutes vos tâches sont terminées ! 🎉"

    const urgentTasks = incompleteTasks.filter((t) => t.priority === "high")
    const todayTasks = incompleteTasks.filter(
      (t) => t.dueDate && t.dueDate.toDateString() === new Date().toDateString(),
    )

    if (urgentTasks.length > 0) {
      return `Je recommande de commencer par "${urgentTasks[0].title}" - c'est marqué comme urgent.`
    }

    if (todayTasks.length > 0) {
      return `"${todayTasks[0].title}" est prévue pour aujourd'hui, c'est un bon moment pour s'y attaquer.`
    }

    return `Que diriez-vous de commencer par "${incompleteTasks[0].title}" ? C'est la plus ancienne de votre liste.`
  }

  const TaskCard = ({ task, showSubtasks = true }: { task: Task; showSubtasks?: boolean }) => {
    const [expanded, setExpanded] = useState(false)

    return (
      <SoftUICard className="p-4 space-y-3 hover:shadow-lg transition-all duration-300">
        <div className="flex items-start gap-3">
          <button
            onClick={() => toggleTask(task.id)}
            className="mt-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            {task.completed ? <CheckSquare className="w-5 h-5 text-accent-green" /> : <Square className="w-5 h-5" />}
          </button>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <h3 className={cn("font-medium text-foreground", task.completed && "line-through text-muted-foreground")}>
                {task.title}
              </h3>

              {task.subtasks.length > 0 && showSubtasks && (
                <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
                  {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {task.dueDate && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {format(task.dueDate, "dd/MM")}
                </Badge>
              )}

              {task.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}

              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  task.priority === "high" && "border-red-300 text-red-600",
                  task.priority === "medium" && "border-yellow-300 text-yellow-600",
                  task.priority === "low" && "border-green-300 text-green-600",
                )}
              >
                {task.priority}
              </Badge>

              {task.noteName && (
                <Badge variant="outline" className="text-xs text-accent-sage">
                  📝 {task.noteName}
                </Badge>
              )}
            </div>

            {expanded && task.subtasks.length > 0 && showSubtasks && (
              <div className="ml-4 space-y-2 border-l-2 border-muted pl-4">
                {task.subtasks.map((subtask) => (
                  <TaskCard key={subtask.id} task={subtask} showSubtasks={false} />
                ))}
              </div>
            )}
          </div>
        </div>
      </SoftUICard>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button onClick={onBack} variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-foreground font-bold mb-2">Le Compas</h1>
              <p className="text-muted-foreground text-pretty">
                Transformez vos idées en direction, et vos pensées en actions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4 mr-2" />
                Liste
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("kanban")}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Kanban
              </Button>
            </div>
          </div>
        </div>

        {/* AI Suggestion */}
        <SoftUICard className="p-4 mb-6 bg-gradient-to-r from-accent-lavender/10 to-accent-peach/10">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-accent-sage mt-1" />
            <div>
              <h3 className="font-medium text-foreground mb-1">Prochaine Action Suggérée</h3>
              <p className="text-sm text-muted-foreground">{getAISuggestion()}</p>
            </div>
          </div>
        </SoftUICard>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtres:</span>
          </div>

          {["all", "today", "week", "overdue"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f as any)}
            >
              {f === "all" && "Toutes"}
              {f === "today" && "Aujourd'hui"}
              {f === "week" && "Cette semaine"}
              {f === "overdue" && "En retard"}
            </Button>
          ))}

          {allTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
            >
              #{tag}
            </Button>
          ))}
        </div>

        {/* Add Task */}
        <div className="mb-6">
          {showNewTask ? (
            <SoftUICard className="p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nouvelle tâche..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTask()}
                  className="flex-1"
                />
                <Button onClick={addTask}>Ajouter</Button>
                <Button variant="outline" onClick={() => setShowNewTask(false)}>
                  Annuler
                </Button>
              </div>
            </SoftUICard>
          ) : (
            <Button onClick={() => setShowNewTask(true)} className="w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle tâche
            </Button>
          )}
        </div>

        {/* Tasks Display */}
        {viewMode === "list" ? (
          <div className="space-y-4">
            {filteredTasks.map((task, index) => (
              <div
                key={task.id}
                className="animate-in slide-in-from-bottom-4 fade-in duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <TaskCard task={task} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map((column) => (
              <div key={column.id} className="space-y-4">
                <div className={cn("p-3 rounded-xl", column.color)}>
                  <h3 className="font-medium text-foreground text-center">{column.title}</h3>
                  <div className="text-xs text-center text-muted-foreground mt-1">
                    {filteredTasks.filter((t) => t.column === column.id).length} tâches
                  </div>
                </div>

                <div className="space-y-3 min-h-[200px]">
                  {filteredTasks
                    .filter((task) => task.column === column.id)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="cursor-move"
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("taskId", task.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          const draggedTaskId = e.dataTransfer.getData("taskId")
                          if (draggedTaskId !== task.id) {
                            moveTask(draggedTaskId, column.id)
                          }
                        }}
                      >
                        <TaskCard task={task} />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Aucune tâche trouvée</h3>
            <p className="text-muted-foreground">
              {filter === "all" ? "Commencez par ajouter une nouvelle tâche." : "Essayez de changer les filtres."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
