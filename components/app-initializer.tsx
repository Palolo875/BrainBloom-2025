'use client'

import { useEffect } from 'react'
import { performanceMonitor } from '@/lib/performance/monitor'
import { aiEngine } from '@/lib/ai/enhanced-ai-engine'

export function AppInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize performance monitoring
    performanceMonitor.initialize()
    
    // Initialize AI engine
    aiEngine.initialize().catch(error => {
      console.warn('AI initialization failed:', error)
    })
    
    return () => {
      performanceMonitor.cleanup()
    }
  }, [])
  
  return <>{children}</>
}