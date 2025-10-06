/**
 * NLP Intent Classification System
 * Classifies user queries into specific intents for better processing
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import apiKeyManager from '@/utils/api-keys'

export type QueryIntent = 
  | 'data_extraction'
  | 'pattern_analysis'
  | 'timeline_reconstruction'
  | 'relationship_mapping'
  | 'location_analysis'
  | 'search_query'
  | 'summary_request'
  | 'comparison'
  | 'follow_up'
  | 'unknown'

export interface IntentClassification {
  intent: QueryIntent
  confidence: number
  entities: {
    contacts?: string[]
    timeRange?: {
      start?: string
      end?: string
      relative?: string
    }
    locations?: string[]
    dataTypes?: string[]
    platforms?: string[]
    keywords?: string[]
  }
  isFollowUp: boolean
}

/**
 * Classify query intent using Gemini AI
 */
export const classifyIntent = async (
  query: string,
  conversationHistory?: Array<{ role: string; content: string }>
): Promise<IntentClassification> => {
  try {
    const apiKey = apiKeyManager.getGeminiApiKey()
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const systemPrompt = `You are an NLP intent classifier for a UFDR (Universal Forensic Data Repository) analysis system.

Classify the user's query into one of these intents:
1. data_extraction - User wants to extract specific data (messages, calls, files)
2. pattern_analysis - User wants to analyze patterns (communication patterns, usage patterns)
3. timeline_reconstruction - User wants to see chronological events or timeline
4. relationship_mapping - User wants to understand relationships between contacts
5. location_analysis - User wants to analyze location data
6. search_query - User wants to search for specific information
7. summary_request - User wants a summary or overview
8. comparison - User wants to compare data points
9. follow_up - User is asking a follow-up question based on previous context
10. unknown - Intent is unclear

Also extract entities:
- contacts: Names of people mentioned
- timeRange: Time periods (start, end, or relative like "last week")
- locations: Places mentioned
- dataTypes: Types of data (chats, calls, images, videos, apps)
- platforms: Communication platforms (WhatsApp, Telegram, etc.)
- keywords: Important keywords

Return ONLY a JSON object with this structure:
{
  "intent": "intent_name",
  "confidence": 0.95,
  "entities": {
    "contacts": ["name1", "name2"],
    "timeRange": {"relative": "last 24 hours"},
    "locations": ["New York"],
    "dataTypes": ["chats", "calls"],
    "platforms": ["WhatsApp"],
    "keywords": ["urgent", "meeting"]
  },
  "isFollowUp": false
}`

    let contextString = ''
    if (conversationHistory && conversationHistory.length > 0) {
      contextString = '\n\nPrevious conversation:\n' + 
        conversationHistory.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join('\n')
    }

    const prompt = `${systemPrompt}\n\nUser query: "${query}"${contextString}\n\nClassification:`

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500
      }
    })

    const response = result.response.text()
    
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const classification = JSON.parse(jsonMatch[0])
      return classification
    }

    // Fallback to rule-based classification
    return ruleBasedClassification(query, conversationHistory)
  } catch (error) {
    console.error('Error in AI intent classification:', error)
    // Fallback to rule-based classification
    return ruleBasedClassification(query, conversationHistory)
  }
}

/**
 * Rule-based intent classification (fallback)
 */
const ruleBasedClassification = (
  query: string,
  conversationHistory?: Array<{ role: string; content: string }>
): IntentClassification => {
  const lowerQuery = query.toLowerCase()
  const entities: IntentClassification['entities'] = {}

  // Check if it's a follow-up question
  const followUpIndicators = ['their', 'those', 'that', 'them', 'it', 'show me more', 'what about']
  const isFollowUp = followUpIndicators.some(indicator => lowerQuery.includes(indicator)) &&
                     conversationHistory && conversationHistory.length > 0

  // Extract data types
  const dataTypeKeywords = {
    chats: ['chat', 'message', 'conversation', 'text'],
    calls: ['call', 'phone', 'dial'],
    images: ['image', 'photo', 'picture', 'pic'],
    videos: ['video', 'recording', 'clip'],
    apps: ['app', 'application', 'software']
  }

  entities.dataTypes = []
  for (const [type, keywords] of Object.entries(dataTypeKeywords)) {
    if (keywords.some(kw => lowerQuery.includes(kw))) {
      entities.dataTypes.push(type)
    }
  }

  // Extract time ranges
  const timePatterns = [
    { pattern: /last (\d+) (hour|day|week|month)s?/i, type: 'relative' },
    { pattern: /today|yesterday|this week|this month/i, type: 'relative' },
    { pattern: /recent|latest/i, type: 'relative' }
  ]

  for (const { pattern, type } of timePatterns) {
    const match = lowerQuery.match(pattern)
    if (match) {
      entities.timeRange = { relative: match[0] }
      break
    }
  }

  // Extract platforms
  const platforms = ['whatsapp', 'telegram', 'facebook', 'instagram', 'twitter', 'signal']
  entities.platforms = platforms.filter(p => lowerQuery.includes(p))

  // Extract locations (simple pattern matching)
  const locationPattern = /(?:in|at|from|to) ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/g
  const locationMatches = query.match(locationPattern)
  if (locationMatches) {
    entities.locations = locationMatches.map(m => m.replace(/^(in|at|from|to) /, ''))
  }

  // Classify intent
  let intent: QueryIntent = 'unknown'
  let confidence = 0.7

  if (isFollowUp) {
    intent = 'follow_up'
    confidence = 0.85
  } else if (lowerQuery.match(/pattern|trend|frequent|most|analysis|analyze/)) {
    intent = 'pattern_analysis'
    confidence = 0.8
  } else if (lowerQuery.match(/timeline|chronological|sequence|when|history/)) {
    intent = 'timeline_reconstruction'
    confidence = 0.8
  } else if (lowerQuery.match(/relationship|connection|between|network|contact/)) {
    intent = 'relationship_mapping'
    confidence = 0.75
  } else if (lowerQuery.match(/location|where|place|gps|map/)) {
    intent = 'location_analysis'
    confidence = 0.8
  } else if (lowerQuery.match(/summary|overview|total|count|how many/)) {
    intent = 'summary_request'
    confidence = 0.85
  } else if (lowerQuery.match(/compare|difference|versus|vs/)) {
    intent = 'comparison'
    confidence = 0.75
  } else if (lowerQuery.match(/find|search|show|get|retrieve/)) {
    intent = 'search_query'
    confidence = 0.7
  } else if (lowerQuery.match(/extract|export|download|save/)) {
    intent = 'data_extraction'
    confidence = 0.75
  }

  return {
    intent,
    confidence,
    entities,
    isFollowUp
  }
}

/**
 * Extract entities from query using NER
 */
export const extractEntities = async (query: string) => {
  // This is a simplified version - in production, you'd use a proper NER model
  const entities = {
    contacts: [] as string[],
    dates: [] as string[],
    locations: [] as string[],
    numbers: [] as string[]
  }

  // Extract potential contact names (capitalized words)
  const namePattern = /\b[A-Z][a-z]+(?: [A-Z][a-z]+)*\b/g
  const names = query.match(namePattern)
  if (names) {
    entities.contacts = names.filter(name => 
      !['Show', 'Find', 'Get', 'What', 'When', 'Where', 'How', 'Why'].includes(name)
    )
  }

  // Extract dates
  const datePattern = /\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/g
  const dates = query.match(datePattern)
  if (dates) {
    entities.dates = dates
  }

  // Extract phone numbers
  const phonePattern = /\+?\d{10,}/g
  const numbers = query.match(phonePattern)
  if (numbers) {
    entities.numbers = numbers
  }

  return entities
}

/**
 * Determine query complexity
 */
export const analyzeQueryComplexity = (query: string): {
  complexity: 'simple' | 'moderate' | 'complex'
  requiresMultiStep: boolean
  estimatedProcessingTime: number
} => {
  const wordCount = query.split(/\s+/).length
  const hasMultipleClauses = query.split(/and|or|but|then/).length > 1
  const hasTimeRange = /last|recent|between|from.*to/.test(query.toLowerCase())
  const hasMultipleDataTypes = (query.match(/chat|call|image|video|app/gi) || []).length > 1

  let complexity: 'simple' | 'moderate' | 'complex' = 'simple'
  let requiresMultiStep = false
  let estimatedProcessingTime = 1000 // ms

  if (wordCount > 15 || hasMultipleClauses || hasMultipleDataTypes) {
    complexity = 'complex'
    requiresMultiStep = true
    estimatedProcessingTime = 5000
  } else if (wordCount > 8 || hasTimeRange) {
    complexity = 'moderate'
    estimatedProcessingTime = 2500
  }

  return {
    complexity,
    requiresMultiStep,
    estimatedProcessingTime
  }
}

