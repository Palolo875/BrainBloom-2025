import { Note } from '@/lib/types/note'

class AIEngine {
  private worker: Worker | null = null
  private isInitialized = false
  
  async initialize() {
    if (this.isInitialized) return
    
    try {
      // Chargement du worker avec type module
      this.worker = new Worker(new URL('../workers/ai-worker.ts', import.meta.url), { type: 'module' })
      
      // Initialisation du modèle
      await this.sendToWorker({ type: 'initialize' })
      this.isInitialized = true
      console.log('✅ AI Engine initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize AI Engine:', error)
      throw error
    }
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.isInitialized) await this.initialize()
    
    const result = await this.sendToWorker({
      type: 'embed',
      payload: { text }
    })
    
    return result.embedding
  }
  
  async semanticSearch(query: string, notes: Note[], updateNote?: (id: string, updates: Partial<Note>) => void): Promise<Note[]> {
    try {
      const queryEmbedding = await this.generateEmbedding(query)
      
      // Calcul similarité avec notes existantes
      const similarities = await Promise.all(
        notes.map(async note => {
          let embedding = note.embedding
          
          if (!embedding) {
            // Générer embedding si pas encore fait, sans muter l'objet original
            embedding = await this.generateEmbedding(note.content)
            
            // Mettre à jour le store si la fonction est fournie
            if (updateNote) {
              updateNote(note.id, { embedding })
            }
          }
          
          const similarity = this.cosineSimilarity(queryEmbedding, embedding)
          return { note, similarity }
        })
      )
      
      return similarities
        .filter(item => item.similarity > 0.3) // Seuil de pertinence
        .sort((a, b) => b.similarity - a.similarity)
        .map(item => item.note)
    } catch (error) {
      console.error('Semantic search error:', error)
      // Fallback vers recherche textuelle simple
      return notes.filter(note => 
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.content.toLowerCase().includes(query.toLowerCase())
      )
    }
  }
  
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0
    
    return dotProduct / (magnitudeA * magnitudeB)
  }
  
  private sendToWorker(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not initialized'))
        return
      }
      
      const id = crypto.randomUUID()
      
      const handleMessage = (event: MessageEvent) => {
        if (event.data.id === id) {
          this.worker!.removeEventListener('message', handleMessage)
          if (event.data.error) {
            reject(new Error(event.data.error))
          } else {
            resolve(event.data.result)
          }
        }
      }
      
      this.worker.addEventListener('message', handleMessage)
      this.worker.postMessage({ ...message, id })
      
      // Timeout de sécurité
      setTimeout(() => {
        this.worker!.removeEventListener('message', handleMessage)
        reject(new Error('AI Worker timeout'))
      }, 30000) // 30 secondes
    })
  }
  
  // Nettoyage
  destroy() {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
      this.isInitialized = false
    }
  }
}

export const aiEngine = new AIEngine()

// Nettoyage automatique au unmount
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    aiEngine.destroy()
  })
}