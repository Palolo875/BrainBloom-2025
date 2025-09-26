import { pipeline } from '@xenova/transformers'

let embedder: any = null

// Initialisation du modèle d'embeddings
async function initializeEmbedder() {
  if (embedder) return embedder
  
  try {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      revision: 'main'
    })
    return embedder
  } catch (error) {
    console.error('Failed to initialize embedder:', error)
    throw error
  }
}

// Générer un embedding pour un texte
async function generateEmbedding(text: string): Promise<number[]> {
  if (!embedder) {
    await initializeEmbedder()
  }
  
  if (!embedder) {
    throw new Error('Embedder not initialized')
  }
  
  try {
    const result = await embedder(text, { pooling: 'mean', normalize: true })
    return Array.from(result.data as Float32Array)
  } catch (error) {
    console.error('Failed to generate embedding:', error)
    throw error
  }
}

// Écouter les messages du thread principal
self.onmessage = async (event) => {
  const { type, payload, id } = event.data
  
  try {
    switch (type) {
      case 'initialize':
        await initializeEmbedder()
        self.postMessage({ id, result: { success: true } })
        break
        
      case 'embed':
        const embedding = await generateEmbedding(payload.text)
        self.postMessage({ id, result: { embedding } })
        break
        
      default:
        throw new Error(`Unknown message type: ${type}`)
    }
  } catch (error) {
    self.postMessage({ 
      id, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}