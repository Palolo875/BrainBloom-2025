import Dexie, { Table } from 'dexie'

export interface Note {
  id?: number
  uuid: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  embedding?: number[]
}

export interface SearchCache {
  id?: number
  query: string
  results: string[] // UUIDs of notes
  timestamp: Date
}

export class BrainBloomDB extends Dexie {
  notes!: Table<Note>
  searchCache!: Table<SearchCache>

  constructor() {
    super('BrainBloomDB')
    
    this.version(1).stores({
      notes: '++id, uuid, title, createdAt, updatedAt, *tags',
      searchCache: '++id, query, timestamp'
    })
    
    // Hooks
    this.notes.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date()
      obj.updatedAt = new Date()
      if (!obj.uuid) {
        obj.uuid = crypto.randomUUID()
      }
    })
    
    this.notes.hook('updating', (modifications) => {
      (modifications as any).updatedAt = new Date()
    })
  }
  
  // Méthodes utilitaires
  async addNote(note: Omit<Note, 'id' | 'uuid' | 'createdAt' | 'updatedAt'>) {
    return await this.notes.add({
      ...note,
      uuid: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }
  
  async updateNote(uuid: string, updates: Partial<Note>) {
    return await this.notes.where('uuid').equals(uuid).modify(updates)
  }
  
  async deleteNote(uuid: string) {
    return await this.notes.where('uuid').equals(uuid).delete()
  }
  
  async getNoteByUuid(uuid: string) {
    return await this.notes.where('uuid').equals(uuid).first()
  }
  
  async searchNotes(query: string) {
    return await this.notes
      .filter(note => 
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.content.toLowerCase().includes(query.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
      .toArray()
  }
  
  async clearOldSearchCache() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    return await this.searchCache.where('timestamp').below(oneHourAgo).delete()
  }
}

export const db = new BrainBloomDB()