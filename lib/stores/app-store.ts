import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { Note } from '@/lib/types/note'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export interface AppState {
  // Core State
  notes: Note[]
  currentNoteId: string | null
  searchQuery: string
  
  // UI State  
  ui: {
    theme: 'light' | 'dark' | 'system'
    sidebarOpen: boolean
    currentView: 'home' | 'notes' | 'editor' | 'graph' | 'modules' | 'settings' | 'tasks' | 'journal' | 'learning'
    modals: Record<string, boolean>
    toasts: Toast[]
    isOffline: boolean
    loading: boolean
  }
  
  // AI State
  ai: {
    status: 'loading' | 'ready' | 'error' | 'disabled'
    models: Record<string, boolean>
    cache: Map<string, any>
    fallbackMode: boolean
    config: {
      model: string
      batchSize: number
      workerCount: number
    }
  }
  
  // Performance State
  performance: {
    lastSyncTime: number
    pendingOperations: string[]
    backgroundTasks: Set<string>
    metrics: Map<string, number[]>
  }
}

interface AppActions {
  // Notes Actions
  addNote: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateNote: (id: string, updates: Partial<Note>) => void
  updateNotes: (updates: Record<string, Partial<Note>>) => void
  deleteNote: (id: string) => void
  setCurrentNote: (noteId: string | null) => void
  
  // Search Actions
  setSearchQuery: (query: string) => void
  
  // UI Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setCurrentView: (view: AppState['ui']['currentView']) => void
  toggleSidebar: () => void
  showModal: (modalId: string) => void
  hideModal: (modalId: string) => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (toastId: string) => void
  setOffline: (offline: boolean) => void
  setLoading: (loading: boolean) => void
  
  // AI Actions
  setAIStatus: (status: AppState['ai']['status']) => void
  setAIConfig: (config: Partial<AppState['ai']['config']>) => void
  setAIFallbackMode: (fallbackMode: boolean) => void
  
  // Performance Actions
  recordMetric: (name: string, value: number) => void
  addBackgroundTask: (taskId: string) => void
  removeBackgroundTask: (taskId: string) => void
  updateLastSyncTime: () => void
  
  // Computed
  getFilteredNotes: () => Note[]
  getNoteById: (id: string) => Note | undefined
  getCurrentNote: () => Note | undefined
}

// SSR-safe storage adapter with fallback chain
function createFallbackStorage() {
  return {
    getItem: async (name: string): Promise<string | null> => {
      // SSR guard
      if (typeof window === 'undefined') return null
      
      // Fallback chain: IndexedDB → localStorage → memory
      try {
        const idbValue = await getFromIndexedDB(name)
        if (idbValue !== null) return idbValue
      } catch (error) {
        console.warn('IndexedDB get failed, trying localStorage:', error)
      }
      
      try {
        return localStorage.getItem(name)
      } catch (error) {
        console.warn('localStorage get failed, using memory only:', error)
        return null
      }
    },
    
    setItem: async (name: string, value: string): Promise<void> => {
      // SSR guard
      if (typeof window === 'undefined') return
      
      // Parallel saves with error handling
      const savePromises = []
      
      try {
        savePromises.push(saveToIndexedDB(name, value))
      } catch (error) {
        console.warn('IndexedDB not available:', error)
      }
      
      try {
        savePromises.push(Promise.resolve(localStorage.setItem(name, value)))
      } catch (error) {
        console.warn('localStorage not available:', error)
      }
      
      if (savePromises.length === 0) {
        console.warn('No storage methods available')
        return
      }
      
      const results = await Promise.allSettled(savePromises)
      const failedCount = results.filter(r => r.status === 'rejected').length
      
      if (failedCount === results.length) {
        console.warn('All storage methods failed')
      }
    },
    
    removeItem: async (name: string): Promise<void> => {
      // SSR guard
      if (typeof window === 'undefined') return
      
      await Promise.allSettled([
        removeFromIndexedDB(name).catch(() => {}),
        Promise.resolve().then(() => localStorage.removeItem(name)).catch(() => {})
      ])
    }
  }
}

// IndexedDB utilities
async function getFromIndexedDB(name: string): Promise<string | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    throw new Error('IndexedDB not available')
  }
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('zustand-storage')
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('zustand')) {
        reject(new Error('Store not found'))
        return
      }
      const transaction = db.transaction(['zustand'], 'readonly')
      const store = transaction.objectStore('zustand')
      const getRequest = store.get(name)
      getRequest.onerror = () => reject(getRequest.error)
      getRequest.onsuccess = () => resolve(getRequest.result?.value || null)
    }
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('zustand')) {
        db.createObjectStore('zustand', { keyPath: 'key' })
      }
    }
  })
}

async function saveToIndexedDB(name: string, value: string): Promise<void> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    throw new Error('IndexedDB not available')
  }
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('zustand-storage')
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['zustand'], 'readwrite')
      const store = transaction.objectStore('zustand')
      const putRequest = store.put({ key: name, value })
      putRequest.onerror = () => reject(putRequest.error)
      putRequest.onsuccess = () => resolve()
    }
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('zustand')) {
        db.createObjectStore('zustand', { keyPath: 'key' })
      }
    }
  })
}

async function removeFromIndexedDB(name: string): Promise<void> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    throw new Error('IndexedDB not available')
  }
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('zustand-storage')
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('zustand')) {
        resolve()
        return
      }
      const transaction = db.transaction(['zustand'], 'readwrite')
      const store = transaction.objectStore('zustand')
      const deleteRequest = store.delete(name)
      deleteRequest.onerror = () => reject(deleteRequest.error)
      deleteRequest.onsuccess = () => resolve()
    }
  })
}

export const useAppStore = create<AppState & AppActions>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // Initial state
        notes: [],
        currentNoteId: null,
        searchQuery: '',
        ui: {
          theme: 'system',
          sidebarOpen: true,
          currentView: 'home',
          modals: {},
          toasts: [],
          isOffline: false,
          loading: false
        },
        ai: {
          status: 'loading',
          models: {},
          cache: new Map(),
          fallbackMode: false,
          config: {
            model: 'all-MiniLM-L6-v2',
            batchSize: 16,
            workerCount: 1
          }
        },
        performance: {
          lastSyncTime: Date.now(),
          pendingOperations: [],
          backgroundTasks: new Set(),
          metrics: new Map()
        },
        
        // Notes Actions
        addNote: (noteData) => {
          const noteId = crypto.randomUUID()
          const now = new Date().toISOString()
          const note: Note = {
            ...noteData,
            id: noteId,
            createdAt: now,
            updatedAt: now
          }
          
          set((state) => {
            // Optimistic update
            state.notes.unshift(note)
            state.currentNoteId = noteId
            
            // Background processing
            state.performance.backgroundTasks.add(`process-note-${noteId}`)
          })
          
          return noteId
        },
        
        updateNote: (id, updates) => set((state) => {
          const noteIndex = state.notes.findIndex(n => n.id === id)
          if (noteIndex !== -1) {
            state.notes[noteIndex] = {
              ...state.notes[noteIndex],
              ...updates,
              updatedAt: new Date().toISOString()
            }
          }
        }),
        
        updateNotes: (updates) => set((state) => {
          Object.entries(updates).forEach(([id, update]) => {
            const index = state.notes.findIndex(n => n.id === id)
            if (index !== -1) {
              state.notes[index] = {
                ...state.notes[index],
                ...update,
                updatedAt: new Date().toISOString()
              }
            }
          })
        }),
        
        deleteNote: (id) => set((state) => {
          state.notes = state.notes.filter(n => n.id !== id)
          if (state.currentNoteId === id) {
            state.currentNoteId = null
          }
        }),
        
        setCurrentNote: (noteId) => set((state) => {
          state.currentNoteId = noteId
        }),
        
        // Search Actions
        setSearchQuery: (query) => set((state) => {
          state.searchQuery = query
          // Trigger search après debounce
          state.performance.backgroundTasks.add('search')
        }),
        
        // UI Actions
        setTheme: (theme) => set((state) => {
          state.ui.theme = theme
        }),
        
        setCurrentView: (view) => set((state) => {
          state.ui.currentView = view
        }),
        
        toggleSidebar: () => set((state) => {
          state.ui.sidebarOpen = !state.ui.sidebarOpen
        }),
        
        showModal: (modalId) => set((state) => {
          state.ui.modals[modalId] = true
        }),
        
        hideModal: (modalId) => set((state) => {
          state.ui.modals[modalId] = false
        }),
        
        addToast: (toast) => set((state) => {
          const newToast: Toast = {
            ...toast,
            id: crypto.randomUUID()
          }
          state.ui.toasts.push(newToast)
          
          // Auto-remove after duration
          setTimeout(() => {
            set((state) => {
              state.ui.toasts = state.ui.toasts.filter(t => t.id !== newToast.id)
            })
          }, toast.duration || 5000)
        }),
        
        removeToast: (toastId) => set((state) => {
          state.ui.toasts = state.ui.toasts.filter(t => t.id !== toastId)
        }),
        
        setOffline: (offline) => set((state) => {
          state.ui.isOffline = offline
        }),
        
        setLoading: (loading) => set((state) => {
          state.ui.loading = loading
        }),
        
        // AI Actions
        setAIStatus: (status) => set((state) => {
          state.ai.status = status
          if (status === 'error') {
            state.ai.fallbackMode = true
          }
        }),
        
        setAIConfig: (config) => set((state) => {
          state.ai.config = { ...state.ai.config, ...config }
        }),
        
        setAIFallbackMode: (fallbackMode) => set((state) => {
          state.ai.fallbackMode = fallbackMode
        }),
        
        // Performance Actions
        recordMetric: (name, value) => set((state) => {
          if (!state.performance.metrics.has(name)) {
            state.performance.metrics.set(name, [])
          }
          const metrics = state.performance.metrics.get(name)!
          metrics.push(value)
          
          // Keep only last 100 metrics for memory efficiency
          if (metrics.length > 100) {
            metrics.shift()
          }
        }),
        
        addBackgroundTask: (taskId) => set((state) => {
          state.performance.backgroundTasks.add(taskId)
        }),
        
        removeBackgroundTask: (taskId) => set((state) => {
          state.performance.backgroundTasks.delete(taskId)
        }),
        
        updateLastSyncTime: () => set((state) => {
          state.performance.lastSyncTime = Date.now()
        }),
        
        // Computed
        getFilteredNotes: () => {
          const { notes, searchQuery } = get()
          if (!searchQuery) return notes
          
          return notes.filter(note => 
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        },
        
        getNoteById: (id) => {
          return get().notes.find(note => note.id === id)
        },
        
        getCurrentNote: () => {
          const { currentNoteId, notes } = get()
          return currentNoteId ? notes.find(note => note.id === currentNoteId) : undefined
        }
      })),
      {
        name: 'brainbloom-store',
        storage: createJSONStorage(() => createFallbackStorage()),
        partialize: (state) => ({
          // Ne persister que l'essentiel - exclure les structures non-sérialisables
          notes: state.notes,
          currentNoteId: state.currentNoteId,
          searchQuery: state.searchQuery,
          ui: { 
            theme: state.ui.theme, 
            sidebarOpen: state.ui.sidebarOpen,
            currentView: state.ui.currentView
            // Exclure : modals, toasts, isOffline, loading (runtime only)
          },
          ai: {
            status: state.ai.status,
            fallbackMode: state.ai.fallbackMode,
            config: state.ai.config
            // Exclure : models, cache (Map - non-sérialisable)
          }
          // Exclure entièrement : performance (contient Map et Set non-sérialisables)
        }),
        version: 2
      }
    )
  )
)

// Utility hooks
export const useNotes = () => {
  const notes = useAppStore(state => state.getFilteredNotes())
  const currentNote = useAppStore(state => state.getCurrentNote())
  const addNote = useAppStore(state => state.addNote)
  const updateNote = useAppStore(state => state.updateNote)
  const deleteNote = useAppStore(state => state.deleteNote)
  const setCurrentNote = useAppStore(state => state.setCurrentNote)
  const searchQuery = useAppStore(state => state.searchQuery)
  const setSearchQuery = useAppStore(state => state.setSearchQuery)
  
  return {
    notes,
    currentNote,
    addNote,
    updateNote,
    deleteNote,
    setCurrentNote,
    searchQuery,
    setSearchQuery
  }
}

export const useUI = () => {
  const ui = useAppStore(state => state.ui)
  const setTheme = useAppStore(state => state.setTheme)
  const setCurrentView = useAppStore(state => state.setCurrentView)
  const toggleSidebar = useAppStore(state => state.toggleSidebar)
  const showModal = useAppStore(state => state.showModal)
  const hideModal = useAppStore(state => state.hideModal)
  const addToast = useAppStore(state => state.addToast)
  const removeToast = useAppStore(state => state.removeToast)
  
  return {
    ...ui,
    setTheme,
    setCurrentView,
    toggleSidebar,
    showModal,
    hideModal,
    addToast,
    removeToast
  }
}

export const useAI = () => {
  const ai = useAppStore(state => state.ai)
  const setAIStatus = useAppStore(state => state.setAIStatus)
  const setAIConfig = useAppStore(state => state.setAIConfig)
  const setAIFallbackMode = useAppStore(state => state.setAIFallbackMode)
  
  return {
    ...ai,
    setAIStatus,
    setAIConfig,
    setAIFallbackMode
  }
}