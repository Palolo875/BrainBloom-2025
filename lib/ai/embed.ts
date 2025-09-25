import 'server-only'

/**
 * Helper pour générer des embeddings via Hugging Face
 * Utilisé côté serveur uniquement (Server Actions et Route Handlers)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const hfToken = process.env.HF_TOKEN
  if (!hfToken) {
    throw new Error('Hugging Face token not configured')
  }

  if (!text || typeof text !== 'string') {
    throw new Error('Text parameter is required and must be a string')
  }

  try {
    // Appel à l'API Hugging Face pour le modèle sentence-transformers
    const response = await fetch(
      'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          options: { wait_for_model: true }
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`)
    }

    // Récupérer l'embedding depuis la réponse
    const rawEmbedding = await response.json()
    
    // Normaliser la forme de l'embedding (peut être imbriqué)
    let embedding: number[]
    if (Array.isArray(rawEmbedding) && Array.isArray(rawEmbedding[0])) {
      // Si c'est un array 2D, prendre le premier élément
      embedding = rawEmbedding[0]
    } else if (Array.isArray(rawEmbedding)) {
      // Si c'est déjà un array 1D
      embedding = rawEmbedding
    } else {
      throw new Error('Invalid embedding format received from Hugging Face')
    }

    // Vérifier que l'embedding a la bonne dimension (384 pour all-MiniLM-L6-v2)
    if (!Array.isArray(embedding) || embedding.length !== 384) {
      throw new Error(`Invalid embedding dimensions: expected 384, got ${embedding?.length}`)
    }

    return embedding

  } catch (error) {
    console.error('Embedding generation error:', error)
    throw error
  }
}
