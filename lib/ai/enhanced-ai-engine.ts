import { useAppStore } from '@/lib/stores/app-store'

export interface AIConfig {
  model: string
  batchSize: number
  workerCount: number
}

export interface SearchResult {
  id: string
  title: string
  content: string
  score: number
  source: 'semantic' | 'text' | 'hybrid'
}

export interface Suggestion {
  id: string
  text: string
  type: 'completion' | 'connection' | 'insight'
  confidence: number
}

// Fallback fuzzy search implementation
class FuzzySearch {
  search(query: string, notes: any[]): SearchResult[] {
    const queryLower = query.toLowerCase()
    
    return notes
      .map(note => {
        let score = 0
        const titleLower = note.title.toLowerCase()
        const contentLower = note.content.toLowerCase()
        
        // Exact match in title
        if (titleLower.includes(queryLower)) {
          score += 100
        }
        
        // Partial matches
        const titleWords = titleLower.split(' ')
        const contentWords = contentLower.split(' ').slice(0, 100) // Limit for performance
        const queryWords = queryLower.split(' ')
        
        queryWords.forEach(word => {
          titleWords.forEach((titleWord: string) => {
            if (titleWord.includes(word)) score += 50
          })
          contentWords.forEach((contentWord: string) => {
            if (contentWord.includes(word)) score += 10
          })
        })
        
        return {
          id: note.id,
          title: note.title,
          content: note.content.substring(0, 200),
          score,
          source: 'text' as const
        }
      })
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  }
}

export class EnhancedAIEngine {
  private models = new Map<string, any>()
  private fallbackSearch = new FuzzySearch()
  private workerPool: Worker[] = []
  private retryQueue = new Set<string>()
  private isInitialized = false
  
  // Configuration adaptive selon l'appareil
  static getOptimalConfig(): AIConfig {
    const memory = (navigator as any).deviceMemory || 4
    const cores = navigator.hardwareConcurrency || 4
    const connection = (navigator as any).connection?.effectiveType || '4g'
    
    console.info(`🧠 Device specs: ${memory}GB RAM, ${cores} cores, ${connection} connection`)
    
    if (memory >= 8 && cores >= 4 && connection === '4g') {
      return {
        model: 'all-mpnet-base-v2', // Meilleur modèle
        batchSize: 32,
        workerCount: 2
      }
    } else if (memory >= 4) {
      return {
        model: 'all-MiniLM-L6-v2', // Modèle équilibré
        batchSize: 16,
        workerCount: 1
      }
    } else {
      return {
        model: 'fallback', // Pas d'IA, juste recherche textuelle
        batchSize: 8,
        workerCount: 0
      }
    }
  }
  
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true
    
    const config = EnhancedAIEngine.getOptimalConfig()
    useAppStore.getState().setAIConfig(config)
    
    try {
      // Fallback si pas de support IA
      if (config.model === 'fallback') {
        console.info('🧠 AI disabled, using fallback search')
        useAppStore.getState().setAIStatus('disabled')
        this.isInitialized = true
        return true // Success avec fallback
      }
      
      // Chargement progressif avec timeout
      const loadPromise = this.loadModel(config.model)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI load timeout')), 30000)
      )
      
      await Promise.race([loadPromise, timeoutPromise])
      
      // Test du modèle
      await this.generateEmbedding('test')
      
      useAppStore.getState().setAIStatus('ready')
      console.info('🧠 AI Engine ready')
      this.isInitialized = true
      return true
      
    } catch (error) {
      console.warn('🧠 AI initialization failed, using fallback:', error)
      useAppStore.getState().setAIStatus('error')
      useAppStore.getState().setAIFallbackMode(true)
      this.isInitialized = true
      return true // Toujours réussir avec fallback
    }
  }
  
  private async loadModel(modelName: string): Promise<void> {
    try {
      // Simuler le chargement du modèle
      // En réalité, ici on chargerait le modèle avec @xenova/transformers
      console.info(`🧠 Loading model: ${modelName}`)
      
      // Mock implementation - en production, utiliser:
      // const { pipeline } = await import('@xenova/transformers')
      // this.models.set(modelName, await pipeline('feature-extraction', modelName))
      
      this.models.set(modelName, { name: modelName, loaded: true })
    } catch (error) {
      console.error('Failed to load AI model:', error)
      throw error
    }
  }
  
  // Recherche hybride intelligente
  async search(query: string, notes: any[]): Promise<SearchResult[]> {
    const startTime = performance.now()
    const store = useAppStore.getState()
    
    try {
      // Recherche parallèle : IA + textuelle
      const [semanticResults, textResults] = await Promise.allSettled([
        store.ai.status === 'ready' ? this.semanticSearch(query, notes) : Promise.resolve([]),
        this.fallbackSearch.search(query, notes)
      ])
      
      // Fusion des résultats
      const aiResults = semanticResults.status === 'fulfilled' 
        ? semanticResults.value 
        : []
        
      const fallbackResults = textResults.status === 'fulfilled'
        ? textResults.value
        : []
      
      // Algorithme de fusion intelligent
      const merged = this.mergeResults(aiResults, fallbackResults, {
        aiWeight: aiResults.length > 0 ? 0.7 : 0,
        textWeight: 0.3
      })
      
      const duration = performance.now() - startTime
      store.recordMetric('search.duration', duration)
      console.info(`🔍 Search completed in ${duration.toFixed(2)}ms`)
      return merged
      
    } catch (error) {
      console.warn('Search error, using fallback:', error)
      const duration = performance.now() - startTime
      store.recordMetric('search.error', 1)
      return this.fallbackSearch.search(query, notes)
    }
  }
  
  private async semanticSearch(query: string, notes: any[]): Promise<SearchResult[]> {
    try {
      const queryEmbedding = await this.generateEmbedding(query)
      
      const results = await Promise.all(
        notes.map(async (note) => {
          const noteEmbedding = await this.generateEmbedding(note.content)
          const similarity = this.cosineSimilarity(queryEmbedding, noteEmbedding)
          
          return {
            id: note.id,
            title: note.title,
            content: note.content.substring(0, 200),
            score: similarity * 100,
            source: 'semantic' as const
          }
        })
      )
      
      return results
        .filter(result => result.score > 20)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        
    } catch (error) {
      console.warn('Semantic search failed:', error)
      return []
    }
  }
  
  private mergeResults(
    aiResults: SearchResult[], 
    textResults: SearchResult[], 
    weights: { aiWeight: number; textWeight: number }
  ): SearchResult[] {
    const merged = new Map<string, SearchResult>()
    
    // Ajouter les résultats IA avec pondération
    aiResults.forEach(result => {
      merged.set(result.id, {
        ...result,
        score: result.score * weights.aiWeight,
        source: 'hybrid'
      })
    })
    
    // Fusionner avec les résultats textuels
    textResults.forEach(result => {
      const existing = merged.get(result.id)
      if (existing) {
        existing.score += result.score * weights.textWeight
      } else {
        merged.set(result.id, {
          ...result,
          score: result.score * weights.textWeight,
          source: result.source
        })
      }
    })
    
    return Array.from(merged.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  }
  
  // Cache intelligent avec compression
  private cache = new Map<string, {
    data: any
    timestamp: number
    hits: number
    compressed?: boolean
  }>()
  
  async generateEmbedding(text: string): Promise<number[]> {
    const cacheKey = `emb:${this.hashString(text)}`
    const cached = this.cache.get(cacheKey)
    
    // Cache hit avec stats
    if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      cached.hits++
      return cached.data
    }
    
    try {
      const store = useAppStore.getState()
      
      if (store.ai.status !== 'ready') {
        // Fallback : embedding basé sur mots-clés
        return this.generateKeywordEmbedding(text)
      }
      
      const result = await this.callWorker('embed', { text })
      
      // Cache avec compression si gros
      const shouldCompress = JSON.stringify(result).length > 1000
      
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        hits: 1,
        compressed: shouldCompress
      })
      
      // LRU cleanup
      if (this.cache.size > 500) {
        this.cleanupCache()
      }
      
      return result
      
    } catch (error) {
      console.warn('Embedding generation failed:', error)
      // Fallback : embedding basé sur mots-clés
      return this.generateKeywordEmbedding(text)
    }
  }
  
  private async callWorker(action: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // Mock worker implementation
      // En production, utiliser les Web Workers
      setTimeout(() => {
        if (action === 'embed') {
          // Générer un embedding mock
          const mockEmbedding = Array.from({ length: 384 }, () => Math.random() - 0.5)
          resolve(mockEmbedding)
        } else {
          resolve(null)
        }
      }, 50 + Math.random() * 100)
    })
  }
  
  private generateKeywordEmbedding(text: string): number[] {
    // Fallback simple basé sur les mots-clés
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2)
    const embedding = new Array(384).fill(0)
    
    words.forEach((word, index) => {
      const hash = this.hashString(word)
      embedding[hash % 384] += 1
    })
    
    // Normaliser
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0)
  }
  
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0
    let magnitudeA = 0
    let magnitudeB = 0
    
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      dotProduct += a[i] * b[i]
      magnitudeA += a[i] * a[i]
      magnitudeB += b[i] * b[i]
    }
    
    magnitudeA = Math.sqrt(magnitudeA)
    magnitudeB = Math.sqrt(magnitudeB)
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0
    return dotProduct / (magnitudeA * magnitudeB)
  }
  
  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
  
  private cleanupCache(): void {
    // LRU cleanup - supprimer les entrées les moins utilisées
    const entries = Array.from(this.cache.entries())
    entries.sort((a, b) => a[1].hits - b[1].hits)
    
    const toDelete = entries.slice(0, 100)
    toDelete.forEach(([key]) => this.cache.delete(key))
    
    console.info(`🧹 Cleaned up ${toDelete.length} cache entries`)
  }
  
  async generateSuggestions(text: string): Promise<Suggestion[]> {
    try {
      if (useAppStore.getState().ai.status === 'ready') {
        // IA suggestions (mock)
        return [
          {
            id: crypto.randomUUID(),
            text: "Peut-être ajouter un lien vers...",
            type: 'connection',
            confidence: 0.8
          }
        ]
      } else {
        // Fallback suggestions
        return this.generateBasicSuggestions(text)
      }
    } catch (error) {
      console.warn('Suggestions generation failed:', error)
      return []
    }
  }
  
  private generateBasicSuggestions(text: string): Suggestion[] {
    const suggestions: Suggestion[] = []
    
    // Suggestions basiques basées sur des patterns
    if (text.length > 100 && !text.includes('\n\n')) {
      suggestions.push({
        id: crypto.randomUUID(),
        text: "Considérez diviser ce paragraphe en sections",
        type: 'completion',
        confidence: 0.6
      })
    }
    
    return suggestions
  }
}

// Instance globale
export const aiEngine = new EnhancedAIEngine()