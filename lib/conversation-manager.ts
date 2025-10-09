/**
 * Conversation Manager
 * Handles conversation context, follow-up questions, and entity tracking
 */

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  intent?: string
  entities?: any
  metadata?: any
}

export interface ConversationState {
  conversationId: string
  messages: Message[]
  currentContext: {
    lastIntent?: string
    lastEntities?: any
    lastDataType?: string
    referencedContacts?: string[]
    referencedLocations?: string[]
    referencedTimeRanges?: any[]
  }
  sessionStartTime: string
}

class ConversationManager {
  private conversations: Map<string, ConversationState> = new Map()

  /**
   * Initialize a new conversation
   */
  initConversation(conversationId: string): ConversationState {
    const state: ConversationState = {
      conversationId,
      messages: [],
      currentContext: {},
      sessionStartTime: new Date().toISOString()
    }
    
    this.conversations.set(conversationId, state)
    return state
  }

  /**
   * Get conversation state
   */
  getConversation(conversationId: string): ConversationState | undefined {
    return this.conversations.get(conversationId)
  }

  /**
   * Add message to conversation
   */
  addMessage(
    conversationId: string,
    message: Message
  ): ConversationState {
    let state = this.conversations.get(conversationId)
    
    if (!state) {
      state = this.initConversation(conversationId)
    }

    state.messages.push(message)

    // Update context based on message
    if (message.role === 'user') {
      this.updateContext(state, message)
    }

    this.conversations.set(conversationId, state)
    return state
  }

  /**
   * Update conversation context
   */
  private updateContext(state: ConversationState, message: Message) {
    if (message.intent) {
      state.currentContext.lastIntent = message.intent
    }

    if (message.entities) {
      state.currentContext.lastEntities = message.entities

      // Track referenced entities
      if (message.entities.contacts) {
        state.currentContext.referencedContacts = [
          ...(state.currentContext.referencedContacts || []),
          ...message.entities.contacts
        ]
      }

      if (message.entities.locations) {
        state.currentContext.referencedLocations = [
          ...(state.currentContext.referencedLocations || []),
          ...message.entities.locations
        ]
      }

      if (message.entities.timeRange) {
        state.currentContext.referencedTimeRanges = [
          ...(state.currentContext.referencedTimeRanges || []),
          message.entities.timeRange
        ]
      }
    }

    if (message.metadata?.dataType) {
      state.currentContext.lastDataType = message.metadata.dataType
    }
  }

  /**
   * Resolve follow-up question using context
   */
  resolveFollowUpQuestion(
    conversationId: string,
    query: string
  ): {
    resolvedQuery: string
    context: any
  } {
    const state = this.conversations.get(conversationId)
    
    if (!state || state.messages.length === 0) {
      return { resolvedQuery: query, context: {} }
    }

    const lowerQuery = query.toLowerCase()
    let resolvedQuery = query
    const context = state.currentContext

    // Resolve pronouns and references
    const pronounMap: Record<string, string> = {
      'their': 'CONTACT_REF',
      'them': 'CONTACT_REF',
      'those': 'DATA_REF',
      'that': 'DATA_REF',
      'it': 'DATA_REF',
      'they': 'CONTACT_REF',
      'he': 'CONTACT_REF',
      'she': 'CONTACT_REF'
    }

    // Replace pronouns with actual references
    for (const [pronoun, refType] of Object.entries(pronounMap)) {
      if (lowerQuery.includes(pronoun)) {
        if (refType === 'CONTACT_REF' && context.referencedContacts && context.referencedContacts.length > 0) {
          const lastContact = context.referencedContacts[context.referencedContacts.length - 1]
          resolvedQuery = resolvedQuery.replace(
            new RegExp(`\\b${pronoun}\\b`, 'gi'),
            lastContact
          )
        } else if (refType === 'DATA_REF' && context.lastDataType) {
          resolvedQuery = `${resolvedQuery} (referring to ${context.lastDataType})`
        }
      }
    }

    // Add implicit context
    if (lowerQuery.includes('show me') || lowerQuery.includes('what about')) {
      if (context.lastDataType && !lowerQuery.includes(context.lastDataType)) {
        resolvedQuery = `${resolvedQuery} for ${context.lastDataType}`
      }
    }

    // Add time context if missing
    if (context.referencedTimeRanges && context.referencedTimeRanges.length > 0) {
      const lastTimeRange = context.referencedTimeRanges[context.referencedTimeRanges.length - 1]
      if (!lowerQuery.match(/last|recent|today|yesterday|week|month|year/)) {
        resolvedQuery = `${resolvedQuery} (time context: ${JSON.stringify(lastTimeRange)})`
      }
    }

    return {
      resolvedQuery,
      context: {
        lastIntent: context.lastIntent,
        lastEntities: context.lastEntities,
        lastDataType: context.lastDataType,
        referencedContacts: context.referencedContacts,
        referencedLocations: context.referencedLocations
      }
    }
  }

  /**
   * Get conversation summary
   */
  getConversationSummary(conversationId: string): string {
    const state = this.conversations.get(conversationId)
    
    if (!state || state.messages.length === 0) {
      return 'No conversation history'
    }

    const userMessages = state.messages.filter(m => m.role === 'user')
    const topics = new Set<string>()
    
    userMessages.forEach(msg => {
      if (msg.intent) topics.add(msg.intent)
    })

    return `Conversation started ${state.sessionStartTime}. ${userMessages.length} user queries. Topics: ${Array.from(topics).join(', ')}`
  }

  /**
   * Clear old conversations (cleanup)
   */
  clearOldConversations(hoursOld: number = 24) {
    const cutoffTime = Date.now() - (hoursOld * 60 * 60 * 1000)
    
    for (const [id, state] of Array.from(this.conversations.entries())) {
      const startTime = new Date(state.sessionStartTime).getTime()
      if (startTime < cutoffTime) {
        this.conversations.delete(id)
      }
    }
  }

  /**
   * Export conversation for analysis
   */
  exportConversation(conversationId: string): any {
    const state = this.conversations.get(conversationId)
    
    if (!state) {
      return null
    }

    return {
      conversationId: state.conversationId,
      sessionStartTime: state.sessionStartTime,
      messageCount: state.messages.length,
      messages: state.messages,
      context: state.currentContext
    }
  }

  /**
   * Get conversation statistics
   */
  getStatistics(): {
    totalConversations: number
    totalMessages: number
    averageMessagesPerConversation: number
    activeConversations: number
  } {
    const total = this.conversations.size
    let totalMessages = 0
    let activeCount = 0
    const oneHourAgo = Date.now() - (60 * 60 * 1000)

    for (const state of Array.from(this.conversations.values())) {
      totalMessages += state.messages.length
      
      const lastMessage = state.messages[state.messages.length - 1]
      if (lastMessage && new Date(lastMessage.timestamp).getTime() > oneHourAgo) {
        activeCount++
      }
    }

    return {
      totalConversations: total,
      totalMessages,
      averageMessagesPerConversation: total > 0 ? totalMessages / total : 0,
      activeConversations: activeCount
    }
  }
}

// Singleton instance
const conversationManager = new ConversationManager()

export default conversationManager

