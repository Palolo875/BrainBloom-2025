export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string // ISO string pour la sérialisation
  updatedAt: string // ISO string pour la sérialisation
  embedding?: number[]
}