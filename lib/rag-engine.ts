/**
 * RAG (Retrieval-Augmented Generation) Engine
 * Handles vector embeddings, semantic search, and context retrieval
 */

import { getPineconeIndex, NAMESPACES } from './pinecone-client'
import { GoogleGenerativeAI } from '@google/generative-ai'
import apiKeyManager from '@/utils/api-keys'

export interface UFDRDocument {
  id: string
  content: string
  metadata: {
    type: 'chat' | 'call' | 'image' | 'video' | 'app'
    timestamp?: string
    contact?: string
    platform?: string
    location?: string
    duration?: number
    filename?: string
    [key: string]: any
  }
}

export interface ConversationContext {
  conversationId: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
    intent?: string
    entities?: any
  }>
  lastQuery?: string
  extractedEntities?: any
}

/**
 * Generate embeddings using Google's Gemini API with retry logic
 */
export const generateEmbedding = async (text: string, maxRetries: number = 3): Promise<number[]> => {
  let lastError: any
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const apiKey = apiKeyManager.getGeminiApiKey()
      const genAI = new GoogleGenerativeAI(apiKey)
      // Use text-embedding-004 which generates 768-dimensional vectors
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' })

      const result = await model.embedContent(text)
      
      if (!result.embedding?.values || result.embedding.values.length === 0) {
        throw new Error('Empty embedding result received from Gemini API')
      }
      
      // Validate embedding dimension and adapt if needed
      let embeddingValues = result.embedding.values
      
      if (embeddingValues.length === 768) {
        // If we have 768 dimensions but index expects 1024, pad with zeros
        const paddingNeeded = 1024 - 768
        embeddingValues = [...embeddingValues, ...new Array(paddingNeeded).fill(0)]
        console.log(`📏 Padded embedding from 768 to 1024 dimensions`)
      } else if (embeddingValues.length !== 768 && embeddingValues.length !== 1024) {
        console.warn(`Warning: Unexpected embedding dimension: ${embeddingValues.length}`)
      }
      
      return embeddingValues
    } catch (error: any) {
      lastError = error
      
      // Check if it's a rate limit or quota error
      if (error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('rate limit')) {
        const delay = Math.pow(2, attempt) * 1000 // Exponential backoff: 1s, 2s, 4s
        console.log(`Rate limit hit, waiting ${delay}ms before retry (attempt ${attempt + 1}/${maxRetries})`)
        
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
      }
      
      // If it's the last attempt or a non-retryable error, throw
      if (attempt === maxRetries - 1) {
        console.error(`Failed to generate embedding after ${maxRetries} attempts:`, error)
        throw new Error(`Embedding generation failed: ${error.message || 'Unknown error'}`)
      }
    }
  }
  
  throw lastError
}

/**
 * Store UFDR data in Pinecone vector database with enhanced error handling
 */
export const storeUFDRData = async (documents: UFDRDocument[]): Promise<{ success: boolean; processed: number; errors: string[] }> => {
  const errors: string[] = []
  let processedCount = 0
  
  try {
    if (!documents || documents.length === 0) {
      throw new Error('No documents provided for storage')
    }
    
    console.log(`📤 Starting to store ${documents.length} documents in Pinecone...`)
    
    const index = await getPineconeIndex()

    // Validate documents
    const validDocuments = documents.filter((doc, idx) => {
      if (!doc.id || !doc.content || !doc.metadata?.type) {
        errors.push(`Document ${idx}: Missing required fields (id, content, or metadata.type)`)
        return false
      }
      if (doc.content.length > 8000) {
        console.warn(`Document ${doc.id}: Content truncated from ${doc.content.length} to 8000 characters`)
        doc.content = doc.content.substring(0, 8000) + '...'
      }
      return true
    })
    
    if (validDocuments.length === 0) {
      throw new Error('No valid documents to store')
    }

    // Group documents by type
    const groupedDocs = validDocuments.reduce((acc, doc) => {
      if (!acc[doc.metadata.type]) {
        acc[doc.metadata.type] = []
      }
      acc[doc.metadata.type].push(doc)
      return acc
    }, {} as Record<string, UFDRDocument[]>)

    // Store each type in its respective namespace with batch processing
    for (const [type, docs] of Object.entries(groupedDocs)) {
      try {
        const namespace = getNamespaceByType(type)
        console.log(`📋 Processing ${docs.length} ${type} documents...`)

        // Process in batches to avoid memory issues and API limits
        const batchSize = 100
        for (let i = 0; i < docs.length; i += batchSize) {
          const batch = docs.slice(i, i + batchSize)
          
          try {
            // Generate embeddings with retry logic
            const vectors = await Promise.all(
              batch.map(async (doc, batchIdx) => {
                try {
                  const embedding = await generateEmbedding(doc.content)
                  return {
                    id: `${doc.id}_${Date.now()}_${batchIdx}`, // Ensure unique IDs
                    values: embedding,
                    metadata: {
                      ...doc.metadata,
                      content: doc.content,
                      storedAt: new Date().toISOString()
                    }
                  }
                } catch (error) {
                  errors.push(`Failed to generate embedding for document ${doc.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
                  return null
                }
              })
            )

            // Filter out failed embeddings
            const validVectors = vectors.filter(v => v !== null)
            
            if (validVectors.length === 0) {
              errors.push(`No valid vectors generated for ${type} batch ${Math.floor(i/batchSize) + 1}`)
              continue
            }

            // Upsert vectors to Pinecone with retry
            let upsertAttempts = 0
            const maxUpsertAttempts = 3
            
            while (upsertAttempts < maxUpsertAttempts) {
              try {
                await index.namespace(namespace).upsert(validVectors as any[])
                processedCount += validVectors.length
                console.log(`✓ Stored batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(docs.length/batchSize)} (${validVectors.length} vectors) in namespace: ${namespace}`)
                break
              } catch (upsertError: any) {
                upsertAttempts++
                if (upsertAttempts >= maxUpsertAttempts) {
                  errors.push(`Failed to upsert ${type} batch after ${maxUpsertAttempts} attempts: ${upsertError.message}`)
                } else {
                  console.log(`Upsert attempt ${upsertAttempts} failed, retrying...`)
                  await new Promise(resolve => setTimeout(resolve, 1000 * upsertAttempts))
                }
              }
            }
          } catch (batchError) {
            errors.push(`Failed to process ${type} batch: ${batchError instanceof Error ? batchError.message : 'Unknown error'}`)
          }
        }
        
        console.log(`✅ Completed storing ${type} documents`)
      } catch (typeError) {
        errors.push(`Failed to process ${type} documents: ${typeError instanceof Error ? typeError.message : 'Unknown error'}`)
      }
    }

    const success = processedCount > 0
    console.log(`📊 Storage complete: ${processedCount} documents processed, ${errors.length} errors`)
    
    return { success, processed: processedCount, errors }
    
  } catch (error) {
    const errorMessage = `Fatal error storing UFDR data: ${error instanceof Error ? error.message : 'Unknown error'}`
    console.error(errorMessage, error)
    errors.push(errorMessage)
    return { success: false, processed: processedCount, errors }
  }
}

/**
 * Semantic search across UFDR data using Pinecone with enhanced error handling
 */
export const semanticSearch = async (
  query: string,
  dataTypes: string[] = ['chat', 'call', 'image', 'video', 'app'],
  limit: number = 10,
  minScore: number = 0.1
): Promise<{ results: any[]; errors: string[]; searchStats: any }> => {
  const errors: string[] = []
  const searchStats = {
    queryProcessed: false,
    embeddingGenerated: false,
    namespacesSearched: 0,
    totalResults: 0,
    processingTime: 0
  }
  
  const startTime = Date.now()
  
  try {
    if (!query || query.trim().length === 0) {
      throw new Error('Query cannot be empty')
    }
    
    if (query.length > 1000) {
      console.warn(`Query truncated from ${query.length} to 1000 characters`)
      query = query.substring(0, 1000)
    }
    
    searchStats.queryProcessed = true
    console.log(`🔍 Searching for: "${query.substring(0, 100)}${query.length > 100 ? '...' : ''}" across ${dataTypes.length} data types`)
    
    const index = await getPineconeIndex()
    const results: any[] = []

    // Generate query embedding with retry
    let queryEmbedding: number[]
    try {
      queryEmbedding = await generateEmbedding(query)
      searchStats.embeddingGenerated = true
      
      if (queryEmbedding.length !== 768) {
        errors.push(`Warning: Query embedding has ${queryEmbedding.length} dimensions, expected 768`)
      }
    } catch (embeddingError) {
      const message = `Failed to generate query embedding: ${embeddingError instanceof Error ? embeddingError.message : 'Unknown error'}`
      errors.push(message)
      throw new Error(message)
    }

    // Search each namespace with individual error handling
    const searchPromises = dataTypes.map(async (type) => {
      try {
        const namespace = getNamespaceByType(type)
        console.log(`🔍 Searching namespace: ${namespace}`)
        
        const searchResults = await index.namespace(namespace).query({
          vector: queryEmbedding,
          topK: Math.min(limit * 2, 100), // Get more results to allow for filtering
          includeMetadata: true,
          filter: undefined // Could add filters here in the future
        })

        searchStats.namespacesSearched++
        
        if (searchResults.matches && searchResults.matches.length > 0) {
          const validMatches = searchResults.matches
            .filter((match: any) => {
              // Filter out low-relevance results
              if (!match.score || match.score < minScore) {
                return false
              }
              // Ensure metadata exists
              if (!match.metadata) {
                errors.push(`Match ${match.id} has no metadata`)
                return false
              }
              return true
            })
            .map((match: any) => ({
              id: match.id,
              content: match.metadata.content || '',
              metadata: {
                ...match.metadata,
                namespace,
                searchType: type
              },
              score: match.score,
              type,
              relevanceLevel: match.score > 0.8 ? 'high' : match.score > 0.5 ? 'medium' : 'low'
            }))
          
          console.log(`✓ Found ${validMatches.length} relevant results in ${namespace} (max score: ${validMatches[0]?.score?.toFixed(3) || 'N/A'})`)
          return validMatches
        } else {
          console.log(`⚪ No results found in ${namespace}`)
          return []
        }
        
      } catch (namespaceError: any) {
        const message = `Error searching namespace ${type}: ${namespaceError.message}`
        console.warn(message)
        errors.push(message)
        return []
      }
    })
    
    // Wait for all searches to complete
    const searchResultArrays = await Promise.all(searchPromises)
    const allResults = searchResultArrays.flat()
    
    // Sort by relevance (higher score = more relevant in Pinecone)
    allResults.sort((a, b) => {
      // First sort by score
      const scoreDiff = b.score - a.score
      if (Math.abs(scoreDiff) > 0.01) return scoreDiff
      
      // If scores are very close, prefer more recent content
      const aTime = new Date(a.metadata.timestamp || 0).getTime()
      const bTime = new Date(b.metadata.timestamp || 0).getTime()
      return bTime - aTime
    })

    const finalResults = allResults.slice(0, limit)
    searchStats.totalResults = finalResults.length
    searchStats.processingTime = Date.now() - startTime
    
    console.log(`📊 Search complete: ${finalResults.length} results (${searchStats.namespacesSearched} namespaces, ${searchStats.processingTime}ms)`)
    
    return {
      results: finalResults,
      errors,
      searchStats
    }
    
  } catch (error) {
    const errorMessage = `Semantic search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    console.error(errorMessage, error)
    errors.push(errorMessage)
    
    searchStats.processingTime = Date.now() - startTime
    
    return {
      results: [],
      errors,
      searchStats
    }
  }
}

/**
 * Store conversation context in Pinecone
 */
export const storeConversationContext = async (context: ConversationContext) => {
  try {
    const index = await getPineconeIndex()
    const namespace = NAMESPACES.CONVERSATION_HISTORY

    const contextString = JSON.stringify(context.messages)
    const embedding = await generateEmbedding(contextString)

    await index.namespace(namespace).upsert([{
      id: context.conversationId,
      values: embedding,
      metadata: {
        conversationId: context.conversationId,
        lastQuery: context.lastQuery || '',
        timestamp: new Date().toISOString(),
        messageCount: context.messages.length,
        content: contextString
      }
    }])

    return true
  } catch (error) {
    console.error('Error storing conversation context:', error)
    throw error
  }
}

/**
 * Retrieve conversation context from Pinecone
 */
export const retrieveConversationContext = async (
  conversationId: string
): Promise<ConversationContext | null> => {
  try {
    const index = await getPineconeIndex()
    const namespace = NAMESPACES.CONVERSATION_HISTORY

    const results = await index.namespace(namespace).fetch([conversationId])

    if (results.records && results.records[conversationId]) {
      const record = results.records[conversationId]
      const metadata = record.metadata || {}
      const messages = JSON.parse(metadata.content as string || '[]')

      return {
        conversationId,
        messages,
        lastQuery: metadata.lastQuery as string
      }
    }

    return null
  } catch (error) {
    console.error('Error retrieving conversation context:', error)
    return null
  }
}

/**
 * Build context-aware query with conversation history
 */
export const buildContextAwareQuery = async (
  currentQuery: string,
  conversationId: string
): Promise<string> => {
  const context = await retrieveConversationContext(conversationId)
  
  if (!context || context.messages.length === 0) {
    return currentQuery
  }

  // Get last 3 messages for context
  const recentMessages = context.messages.slice(-3)
  const contextString = recentMessages
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n')

  return `Previous conversation:\n${contextString}\n\nCurrent query: ${currentQuery}`
}

/**
 * Helper function to get namespace by data type
 */
const getNamespaceByType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'chat': NAMESPACES.UFDR_CHATS,
    'call': NAMESPACES.UFDR_CALLS,
    'image': NAMESPACES.UFDR_IMAGES,
    'video': NAMESPACES.UFDR_VIDEOS,
    'app': NAMESPACES.UFDR_APPS
  }
  return typeMap[type] || NAMESPACES.UFDR_CHATS
}

/**
 * Clear old conversation history (cleanup)
 */
export const clearOldConversations = async (daysOld: number = 7) => {
  try {
    // Get collection for future implementation
    // const collection = await getCollection(COLLECTIONS.CONVERSATION_HISTORY)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    // This is a simplified version - in production, you'd want to query and delete selectively
    console.log(`Cleanup: Would delete conversations older than ${cutoffDate.toISOString()}`)

    return true
  } catch (error) {
    console.error('Error clearing old conversations:', error)
    return false
  }
}

