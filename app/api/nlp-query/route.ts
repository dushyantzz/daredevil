/**
 * NLP Query API Route
 * Handles natural language queries with RAG and intent classification
 */

import { NextResponse } from 'next/server'
import { classifyIntent, analyzeQueryComplexity } from '@/lib/nlp-intent-classifier'
import { GoogleGenerativeAI } from '@google/generative-ai'
import apiKeyManager from '@/utils/api-keys'
import conversationManager from '@/lib/conversation-manager'
import { getPineconeIndex } from '@/lib/pinecone-client'
import { generateEmbedding, semanticSearch } from '@/lib/rag-engine'

/**
 * Retry with exponential backoff for rate limit errors
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error

      // If it's a rate limit error (429), retry with backoff
      if (error?.status === 429 && i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i)
        console.log(`Rate limit hit, retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, delay))

        // Try to get a new API key for next attempt
        try {
          apiKeyManager.getGeminiApiKey()
        } catch (e) {
          // Continue with same key if rotation fails
        }
        continue
      }

      // If it's not a rate limit error, or we're out of retries, throw
      throw error
    }
  }

  throw lastError
}

/**
 * Search local UFDR data based on query and intent
 */
function searchLocalData(ufdrData: any, query: string, intentClassification: any): any[] {
  const results: any[] = []
  const queryLower = query.toLowerCase()
  const { entities, intent } = intentClassification

  console.log('🔍 Local search - Query:', query)
  console.log('🔍 Intent:', intent)
  console.log('🔍 Entities:', entities)

  // Search in chats
  if (ufdrData.chats && (!entities.dataTypes || entities.dataTypes.length === 0 || entities.dataTypes.includes('chats'))) {
    ufdrData.chats.forEach((chat: any) => {
      let matches = false
      let score = 0

      // Check if message content matches
      if (chat.message?.toLowerCase().includes(queryLower)) {
        matches = true
        score += 10
      }

      // Check if contact matches
      if (entities.contacts?.some((c: string) =>
        chat.contact?.toLowerCase().includes(c.toLowerCase())
      )) {
        matches = true
        score += 20
      }

      // Check if platform matches
      if (entities.platforms?.some((p: string) =>
        chat.platform?.toLowerCase().includes(p.toLowerCase())
      )) {
        matches = true
        score += 5
      }

      // Check if location matches
      if (entities.locations?.some((l: string) =>
        chat.location?.toLowerCase().includes(l.toLowerCase())
      )) {
        matches = true
        score += 5
      }

      // Keyword matching
      if (entities.keywords?.some((k: string) =>
        chat.message?.toLowerCase().includes(k.toLowerCase())
      )) {
        matches = true
        score += 3
      }

      if (matches) {
        results.push({ ...chat, type: 'chat', relevanceScore: score })
      }
    })
  }

  // Search in calls
  if (ufdrData.calls && (!entities.dataTypes || entities.dataTypes.length === 0 || entities.dataTypes.includes('calls'))) {
    ufdrData.calls.forEach((call: any) => {
      let matches = false
      let score = 0

      if (entities.contacts?.some((c: string) =>
        call.contact?.toLowerCase().includes(c.toLowerCase())
      )) {
        matches = true
        score += 20
      }

      // Check call type
      if (call.type?.toLowerCase().includes(queryLower)) {
        matches = true
        score += 5
      }

      // Check location
      if (entities.locations?.some((l: string) =>
        call.location?.toLowerCase().includes(l.toLowerCase())
      )) {
        matches = true
        score += 5
      }

      if (matches) {
        results.push({ ...call, type: 'call', relevanceScore: score })
      }
    })
  }

  // Search in images
  if (ufdrData.images && (!entities.dataTypes || entities.dataTypes.length === 0 || entities.dataTypes.includes('images'))) {
    ufdrData.images.forEach((image: any) => {
      let matches = false
      let score = 0

      if (image.filename?.toLowerCase().includes(queryLower)) {
        matches = true
        score += 10
      }

      if (image.location?.toLowerCase().includes(queryLower)) {
        matches = true
        score += 10
      }

      if (entities.locations?.some((l: string) =>
        image.location?.toLowerCase().includes(l.toLowerCase())
      )) {
        matches = true
        score += 15
      }

      if (matches) {
        results.push({ ...image, type: 'image', relevanceScore: score })
      }
    })
  }

  // Search in videos
  if (ufdrData.videos && (!entities.dataTypes || entities.dataTypes.length === 0 || entities.dataTypes.includes('videos'))) {
    ufdrData.videos.forEach((video: any) => {
      let matches = false
      let score = 0

      if (video.filename?.toLowerCase().includes(queryLower)) {
        matches = true
        score += 10
      }

      if (video.location?.toLowerCase().includes(queryLower)) {
        matches = true
        score += 10
      }

      if (entities.locations?.some((l: string) =>
        video.location?.toLowerCase().includes(l.toLowerCase())
      )) {
        matches = true
        score += 15
      }

      if (matches) {
        results.push({ ...video, type: 'video', relevanceScore: score })
      }
    })
  }

  // Search in apps
  if (ufdrData.appData && (!entities.dataTypes || entities.dataTypes.length === 0 || entities.dataTypes.includes('apps'))) {
    ufdrData.appData.forEach((app: any) => {
      let matches = false
      let score = 0

      if (app.appName?.toLowerCase().includes(queryLower)) {
        matches = true
        score += 15
      }

      if (app.category?.toLowerCase().includes(queryLower)) {
        matches = true
        score += 10
      }

      if (matches) {
        results.push({ ...app, type: 'app', relevanceScore: score })
      }
    })
  }

  // Sort by relevance score
  results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))

  console.log(`✓ Found ${results.length} local results`)
  return results.slice(0, 20)
}

/**
 * Search Pinecone vector database using enhanced search
 */
async function searchPinecone(query: string, dataTypes: string[] = ['chats', 'calls', 'images', 'videos', 'apps']): Promise<{ results: any[]; errors: string[]; stats: any }> {
  try {
    // Map frontend data types to backend types
    const backendDataTypes = dataTypes.map(type => {
      const typeMap: Record<string, string> = {
        'chats': 'chat',
        'calls': 'call',
        'images': 'image',
        'videos': 'video',
        'apps': 'app'
      }
      return typeMap[type] || type
    })
    
    const searchResult = await semanticSearch(query, backendDataTypes, 10, 0.1)
    
    if (searchResult.errors.length > 0) {
      console.warn('⚠ Search warnings:', searchResult.errors.slice(0, 3))
    }
    
    console.log(`📊 Pinecone search stats:`, searchResult.searchStats)
    
    return {
      results: searchResult.results.map((result: any) => ({
        content: result.content,
        type: result.type,
        score: result.score,
        metadata: result.metadata,
        relevanceLevel: result.relevanceLevel
      })),
      errors: searchResult.errors,
      stats: searchResult.searchStats
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.warn('⚠ Pinecone search failed:', errorMessage)
    
    return {
      results: [],
      errors: [errorMessage],
      stats: { processingTime: 0, totalResults: 0 }
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      query, 
      conversationId, 
      conversationHistory = [],
      ufdrData = null 
    } = body

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    console.log('Processing NLP query:', query)

    // Step 1: Classify intent
    const intentClassification = await classifyIntent(query, conversationHistory)
    console.log('Intent classification:', intentClassification)

    // Step 2: Analyze query complexity
    const complexity = analyzeQueryComplexity(query)
    console.log('Query complexity:', complexity)

    // Step 3: Build context-aware query if it's a follow-up
    let enhancedQuery = query
    if (intentClassification.isFollowUp && conversationId) {
      const resolved = conversationManager.resolveFollowUpQuestion(conversationId, query)
      enhancedQuery = resolved.resolvedQuery
      console.log('Enhanced query with context:', enhancedQuery)
    }

    // Step 4: Search Pinecone vector database first, fallback to local search
    let relevantData: any[] = []
    let searchErrors: string[] = []
    let searchStats: any = {}

    // Try Pinecone search first
    const dataTypes = intentClassification.entities.dataTypes || ['chats', 'calls', 'images', 'videos', 'apps']
    
    try {
      const pineconeResult = await searchPinecone(enhancedQuery, dataTypes)
      relevantData = pineconeResult.results
      searchErrors = pineconeResult.errors
      searchStats = pineconeResult.stats
      
      if (relevantData.length > 0) {
        console.log(`✓ Found ${relevantData.length} results from Pinecone (${searchStats.processingTime}ms)`)
      } else {
        console.log('⚪ No results from Pinecone, trying local search...')
      }
    } catch (error) {
      console.warn('⚠ Pinecone search error:', error instanceof Error ? error.message : 'Unknown error')
      searchErrors.push('Pinecone search failed')
    }

    // Fallback to local search if needed
    if (relevantData.length === 0 && ufdrData) {
      console.log('💻 Using local search as fallback')
      try {
        const localResults = searchLocalData(ufdrData, enhancedQuery, intentClassification)
        relevantData = localResults.map((item: any) => ({
          ...item,
          source: 'local',
          score: item.relevanceScore / 20 // Normalize local scores to 0-1 range
        }))
        console.log(`✓ Found ${relevantData.length} results from local search`)
      } catch (localError) {
        console.error('⚠ Local search also failed:', localError)
        searchErrors.push('Local search failed')
      }
    }

    console.log(`📊 Search summary: ${relevantData.length} relevant items, ${searchErrors.length} errors`)

    // Step 5: Generate response using Gemini with context
    const response = await generateResponse(
      enhancedQuery,
      intentClassification,
      relevantData,
      ufdrData,
      conversationHistory
    )

    // Step 6: Store conversation context
    if (conversationId) {
      try {
        conversationManager.addMessage(conversationId, {
          role: 'user',
          content: query,
          timestamp: new Date().toISOString()
        })

        conversationManager.addMessage(conversationId, {
          role: 'assistant',
          content: response.answer,
          timestamp: new Date().toISOString(),
          metadata: {
            intent: intentClassification.intent,
            entities: intentClassification.entities
          }
        })
      } catch (error) {
        console.error('Error storing conversation context:', error)
      }
    }

    return NextResponse.json({
      success: true,
      answer: response.answer,
      intent: intentClassification.intent,
      confidence: response.confidence,
      sources: response.sources,
      dataType: response.dataType,
      relatedData: response.relatedData,
      entities: intentClassification.entities,
      isFollowUp: intentClassification.isFollowUp,
      complexity: complexity.complexity,
      processingTime: Date.now() - response.startTime
    })

  } catch (error) {
    console.error('Error processing NLP query:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process query',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Generate response using Gemini AI with RAG context
 */
async function generateResponse(
  query: string,
  intentClassification: any,
  relevantData: any[],
  ufdrData: any,
  conversationHistory: any[]
) {
  const startTime = Date.now()
  
  try {
    const apiKey = apiKeyManager.getGeminiApiKey()
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' })

    // Build context from relevant data
    let contextString = ''
    if (relevantData.length > 0) {
      contextString = '\n\nRelevant data found:\n' +
        relevantData.slice(0, 10).map((item, idx) => {
          let itemDesc = `${idx + 1}. [${item.type}]`

          if (item.type === 'chat') {
            itemDesc += ` ${item.contact}: "${item.message}" (${item.platform}, ${item.location})`
          } else if (item.type === 'call') {
            itemDesc += ` ${item.contact} - ${item.type} call, ${item.duration}s (${item.location})`
          } else if (item.type === 'image') {
            itemDesc += ` ${item.filename} (${item.location})`
          } else if (item.type === 'video') {
            itemDesc += ` ${item.filename}, ${item.duration}s (${item.location})`
          } else if (item.type === 'app') {
            itemDesc += ` ${item.appName} (${item.category})`
          } else if (item.content) {
            itemDesc += ` ${item.content}`
          }

          return itemDesc
        }).join('\n')
    }

    // Build context from UFDR data
    let ufdrContext = ''
    if (ufdrData) {
      ufdrContext = `\n\nAvailable UFDR Data Summary:
- Chats: ${ufdrData.chats?.length || 0} messages
- Calls: ${ufdrData.calls?.length || 0} records
- Images: ${ufdrData.images?.length || 0} files
- Videos: ${ufdrData.videos?.length || 0} files
- Apps: ${ufdrData.appData?.length || 0} records`
    }

    // Build conversation context
    let conversationContext = ''
    if (conversationHistory.length > 0) {
      conversationContext = '\n\nRecent conversation:\n' +
        conversationHistory.slice(-3).map(msg => 
          `${msg.role}: ${msg.content}`
        ).join('\n')
    }

    const systemPrompt = `You are an expert UFDR (Universal Forensic Data Repository) analyst assistant.

Your task is to answer the user's query based on the available data and context.

Query Intent: ${intentClassification.intent}
Extracted Entities: ${JSON.stringify(intentClassification.entities)}
Is Follow-up Question: ${intentClassification.isFollowUp}

${contextString}${ufdrContext}${conversationContext}

Guidelines:
1. Provide accurate, concise answers based on the available data
2. If this is a follow-up question, reference previous context appropriately
3. Cite specific data sources when possible
4. If data is insufficient, clearly state what's missing
5. For pattern analysis, provide insights and trends
6. For timeline reconstruction, present events chronologically
7. For relationship mapping, explain connections between entities
8. Be professional and forensically accurate

User Query: ${query}

Provide a comprehensive answer:`

    // Use retry logic with exponential backoff
    const result = await retryWithBackoff(async () => {
      return await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      })
    })

    const answer = result.response.text()

    // Determine data type and sources
    const dataType = intentClassification.entities.dataTypes?.[0] || 'general'
    const sources = relevantData.slice(0, 3).map(item => {
      if (item.type === 'chat') return `${item.platform} - ${item.contact}`
      if (item.type === 'call') return `Call - ${item.contact}`
      if (item.type === 'image') return `Image - ${item.filename}`
      if (item.type === 'video') return `Video - ${item.filename}`
      if (item.type === 'app') return `App - ${item.appName}`
      return `${item.type}: ${item.metadata?.contact || item.metadata?.filename || 'Unknown'}`
    })

    // Extract related data based on intent
    let relatedData: any[] = []
    if (ufdrData && intentClassification.entities.dataTypes) {
      relatedData = extractRelatedData(ufdrData, intentClassification)
    }

    return {
      answer,
      confidence: intentClassification.confidence,
      sources: sources.length > 0 ? sources : ['UFDR Database'],
      dataType,
      relatedData: relatedData.slice(0, 5),
      startTime
    }

  } catch (error) {
    console.error('Error generating response with AI, using fallback:', error)
    
    // Enhanced fallback response based on available data
    let fallbackAnswer = "I found your query but had trouble generating a detailed AI response. "
    
    if (relevantData.length > 0) {
      const dataTypeCounts = relevantData.reduce((acc: any, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1
        return acc
      }, {})
      
      const dataTypesList = Object.entries(dataTypeCounts)
        .map(([type, count]) => `${count} ${type} record${count !== 1 ? 's' : ''}`)
        .join(', ')
      
      fallbackAnswer += `Here's what I found: ${dataTypesList}. `
      
      // Add specific information based on intent
      if (intentClassification.intent === 'summary_request') {
        fallbackAnswer += "This appears to be a summary request. "
      } else if (intentClassification.intent === 'data_extraction') {
        fallbackAnswer += "I found the requested data. "
      }
      
      fallbackAnswer += "Please try a more specific question for detailed analysis."
    } else {
      fallbackAnswer += "I couldn't find any matching data for your query. Try uploading some UFDR data first or using different search terms."
    }
    
    return {
      answer: fallbackAnswer,
      confidence: 0.6,
      sources: ['Local Processing'],
      dataType: intentClassification.entities.dataTypes?.[0] || 'general',
      relatedData: relevantData.slice(0, 3),
      startTime
    }
  }
}

/**
 * Extract related data from UFDR based on intent and entities
 */
function extractRelatedData(ufdrData: any, intentClassification: any): any[] {
  const relatedData: any[] = []
  const { entities } = intentClassification

  // Extract based on data types
  if (entities.dataTypes?.includes('chats') && ufdrData.chats) {
    let filtered = ufdrData.chats

    // Filter by contact
    if (entities.contacts && entities.contacts.length > 0) {
      filtered = filtered.filter((chat: any) =>
        entities.contacts.some((contact: string) =>
          chat.contact?.toLowerCase().includes(contact.toLowerCase())
        )
      )
    }

    // Filter by platform
    if (entities.platforms && entities.platforms.length > 0) {
      filtered = filtered.filter((chat: any) =>
        entities.platforms.some((platform: string) =>
          chat.platform?.toLowerCase().includes(platform.toLowerCase())
        )
      )
    }

    relatedData.push(...filtered.slice(0, 5))
  }

  if (entities.dataTypes?.includes('calls') && ufdrData.calls) {
    let filtered = ufdrData.calls

    if (entities.contacts && entities.contacts.length > 0) {
      filtered = filtered.filter((call: any) =>
        entities.contacts.some((contact: string) =>
          call.contact?.toLowerCase().includes(contact.toLowerCase())
        )
      )
    }

    relatedData.push(...filtered.slice(0, 5))
  }

  // Similar filtering for images, videos, apps...

  return relatedData
}

