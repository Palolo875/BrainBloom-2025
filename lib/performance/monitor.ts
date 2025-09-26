import { useAppStore } from '@/lib/stores/app-store'
import { aiEngine } from '@/lib/ai/enhanced-ai-engine'

export interface PerformanceMetrics {
  LCP: number[]  // Largest Contentful Paint
  FID: number[]  // First Input Delay
  CLS: number[]  // Cumulative Layout Shift
  TTFB: number[] // Time to First Byte
  'ai.embedding': number[]
  'ai.search': number[]
  'ai.error': number[]
  'search.duration': number[]
  'error.boundary': number[]
}

export class PerformanceMonitor {
  private isInitialized = false
  private observers: PerformanceObserver[] = []
  
  initialize() {
    if (this.isInitialized || typeof window === 'undefined') return
    
    this.measureCoreWebVitals()
    this.monitorAI()
    this.setupAutoOptimization()
    
    this.isInitialized = true
    console.info('📊 Performance Monitor initialized')
  }
  
  // Métriques Core Web Vitals
  private measureCoreWebVitals() {
    // LCP (Largest Contentful Paint)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lcp = entries[entries.length - 1] as PerformanceEntry
        
        this.recordMetric('LCP', lcp.startTime)
        
        if (lcp.startTime > 2500) {
          this.alert('LCP', `Slow loading detected: ${lcp.startTime.toFixed(2)}ms`)
        }
      })
      
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
      this.observers.push(lcpObserver)
    } catch (error) {
      console.warn('LCP monitoring not supported:', error)
    }
    
    // FID (First Input Delay)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          const fid = entry.processingStart - entry.startTime
          this.recordMetric('FID', fid)
          
          if (fid > 100) {
            this.alert('FID', `Slow interaction detected: ${fid.toFixed(2)}ms`)
          }
        })
      })
      
      fidObserver.observe({ type: 'first-input', buffered: true })
      this.observers.push(fidObserver)
    } catch (error) {
      console.warn('FID monitoring not supported:', error)
    }
    
    // CLS (Cumulative Layout Shift)
    try {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        
        if (clsValue > 0) {
          this.recordMetric('CLS', clsValue)
          
          if (clsValue > 0.1) {
            this.alert('CLS', `Layout shift detected: ${clsValue.toFixed(3)}`)
          }
        }
      })
      
      clsObserver.observe({ type: 'layout-shift', buffered: true })
      this.observers.push(clsObserver)
    } catch (error) {
      console.warn('CLS monitoring not supported:', error)
    }
  }
  
  // Monitoring IA spécifique
  private monitorAI() {
    // Wrapper pour generateEmbedding
    const originalGenerateEmbedding = aiEngine.generateEmbedding.bind(aiEngine)
    aiEngine.generateEmbedding = async (text: string) => {
      const start = performance.now()
      try {
        const result = await originalGenerateEmbedding(text)
        const duration = performance.now() - start
        
        this.recordMetric('ai.embedding', duration)
        
        if (duration > 5000) {
          this.alert('ai.slow', `Slow embedding generation: ${duration.toFixed(2)}ms`)
        }
        
        return result
      } catch (error) {
        this.recordMetric('ai.error', 1)
        throw error
      }
    }
    
    // Wrapper pour search
    const originalSearch = aiEngine.search.bind(aiEngine)
    aiEngine.search = async (query: string, notes: any[]) => {
      const start = performance.now()
      try {
        const result = await originalSearch(query, notes)
        const duration = performance.now() - start
        
        this.recordMetric('ai.search', duration)
        
        return result
      } catch (error) {
        this.recordMetric('ai.error', 1)
        throw error
      }
    }
  }
  
  // Auto-optimization basée sur les métriques
  private setupAutoOptimization() {
    // Vérifier les métriques toutes les 30 secondes
    setInterval(() => {
      this.optimizeBasedOnMetrics()
    }, 30000)
  }
  
  private optimizeBasedOnMetrics() {
    const store = useAppStore.getState()
    
    // Optimisation IA
    const avgEmbeddingTime = this.getAverageMetric('ai.embedding')
    if (avgEmbeddingTime > 3000) {
      console.warn('🐌 AI performance degraded, considering lighter model')
      store.addToast({
        message: 'Switching to faster AI mode for better performance',
        type: 'info',
        duration: 3000
      })
      
      // Réduire la taille des batches
      store.setAIConfig({
        batchSize: Math.max(4, store.ai.config.batchSize / 2)
      })
    }
    
    // Gestion des erreurs IA
    const errorRate = this.getErrorRate('ai.error')
    if (errorRate > 0.2) {
      console.warn('❌ High AI error rate, enabling fallback mode')
      store.setAIFallbackMode(true)
      store.addToast({
        message: 'AI features temporarily limited due to issues',
        type: 'warning',
        duration: 5000
      })
    }
    
    // Optimisation UI
    const avgLCP = this.getAverageMetric('LCP')
    if (avgLCP > 2500) {
      console.warn('🐌 Slow page loads detected')
      store.addToast({
        message: 'Optimizing for better performance...',
        type: 'info',
        duration: 3000
      })
    }
  }
  
  private recordMetric(name: keyof PerformanceMetrics, value: number) {
    const store = useAppStore.getState()
    store.recordMetric(name, value)
  }
  
  private getAverageMetric(name: keyof PerformanceMetrics): number {
    const store = useAppStore.getState()
    const metrics = store.performance.metrics.get(name)
    
    if (!metrics || metrics.length === 0) return 0
    
    const sum = metrics.reduce((acc, val) => acc + val, 0)
    return sum / metrics.length
  }
  
  private getErrorRate(name: keyof PerformanceMetrics): number {
    const store = useAppStore.getState()
    const errors = store.performance.metrics.get(name)
    const total = store.performance.metrics.get('ai.search') || []
    
    if (!errors || !total || total.length === 0) return 0
    
    return errors.length / Math.max(total.length, 1)
  }
  
  private alert(type: string, message: string) {
    console.warn(`🚨 Performance Alert [${type}]: ${message}`)
    
    const store = useAppStore.getState()
    store.addToast({
      message: `Performance issue detected: ${message}`,
      type: 'warning',
      duration: 3000
    })
  }
  
  // Méthodes utilitaires
  getMetrics(): Partial<PerformanceMetrics> {
    const store = useAppStore.getState()
    const metrics: Partial<PerformanceMetrics> = {}
    
    store.performance.metrics.forEach((values, key) => {
      metrics[key as keyof PerformanceMetrics] = [...values]
    })
    
    return metrics
  }
  
  getPerformanceReport(): {
    averages: Record<string, number>
    totals: Record<string, number>
    health: 'good' | 'warning' | 'critical'
  } {
    const store = useAppStore.getState()
    const averages: Record<string, number> = {}
    const totals: Record<string, number> = {}
    
    store.performance.metrics.forEach((values, key) => {
      if (values.length > 0) {
        averages[key] = values.reduce((sum, val) => sum + val, 0) / values.length
        totals[key] = values.reduce((sum, val) => sum + val, 0)
      }
    })
    
    // Déterminer la santé globale
    let health: 'good' | 'warning' | 'critical' = 'good'
    
    if (averages.LCP > 4000 || averages.FID > 300 || averages['ai.embedding'] > 5000) {
      health = 'critical'
    } else if (averages.LCP > 2500 || averages.FID > 100 || averages['ai.embedding'] > 3000) {
      health = 'warning'
    }
    
    return { averages, totals, health }
  }
  
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.isInitialized = false
  }
}

// Instance globale
export const performanceMonitor = new PerformanceMonitor()

// Hook pour utiliser les métriques de performance
export function usePerformanceMetrics() {
  const metrics = useAppStore(state => state.performance.metrics)
  
  return {
    metrics,
    getReport: () => performanceMonitor.getPerformanceReport(),
    getMetrics: () => performanceMonitor.getMetrics()
  }
}