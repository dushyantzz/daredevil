/**
 * Pinecone Client Configuration
 * Manages vector database connection for RAG system
 */

import { Pinecone } from '@pinecone-database/pinecone'

// Singleton instance
let pineconeClientInstance: Pinecone | null = null

export const getPineconeClient = () => {
  if (!pineconeClientInstance) {
    try {
      // Get credentials from environment variables
      const apiKey = process.env.PINECONE_API_KEY

      if (!apiKey) {
        throw new Error('Pinecone API key not found in environment variables')
      }

      pineconeClientInstance = new Pinecone({
        apiKey: apiKey
      })
      console.log('✓ Pinecone client initialized with credentials from .env')
    } catch (error) {
      console.error('Error initializing Pinecone client:', error)
      throw error
    }
  }
  return pineconeClientInstance
}

// Namespace for different data types
export const NAMESPACES = {
  UFDR_CHATS: 'ufdr-chats',
  UFDR_CALLS: 'ufdr-calls',
  UFDR_IMAGES: 'ufdr-images',
  UFDR_VIDEOS: 'ufdr-videos',
  UFDR_APPS: 'ufdr-apps',
  CONVERSATION_HISTORY: 'conversation-history'
}

/**
 * Get Pinecone index
 */
export const getPineconeIndex = async () => {
  try {
    const client = getPineconeClient()
    const indexName = process.env.PINECONE_INDEX_NAME || 'trial'
    
    const index = client.index(indexName)
    console.log(`✓ Connected to Pinecone index: ${indexName}`)
    
    return index
  } catch (error) {
    console.error('Error getting Pinecone index:', error)
    throw error
  }
}

/**
 * Initialize Pinecone connection
 */
export const initializePinecone = async () => {
  try {
    const client = getPineconeClient()
    const indexName = process.env.PINECONE_INDEX_NAME || 'trial'
    
    // List indexes to verify connection
    const indexes = await client.listIndexes()
    console.log('✓ Pinecone connection verified')
    console.log(`✓ Using index: ${indexName}`)
    
    return true
  } catch (error) {
    console.warn('⚠ Pinecone not available, will use local processing:', error instanceof Error ? error.message : 'Unknown error')
    return false
  }
}

/**
 * Delete all vectors in a namespace (for cleanup/reset)
 */
export const deleteNamespace = async (namespace: string) => {
  try {
    const index = await getPineconeIndex()
    await index.namespace(namespace).deleteAll()
    console.log(`✓ Namespace ${namespace} cleared`)
    return true
  } catch (error) {
    console.error(`Error deleting namespace ${namespace}:`, error)
    return false
  }
}

/**
 * Reset all namespaces
 */
export const resetAllNamespaces = async () => {
  for (const namespace of Object.values(NAMESPACES)) {
    await deleteNamespace(namespace)
  }
  console.log('✓ All namespaces reset')
}

