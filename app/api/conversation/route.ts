/**
 * Conversation Management API
 * Handles conversation context and follow-up question resolution
 */

import { NextResponse } from 'next/server'
import conversationManager from '@/lib/conversation-manager'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, conversationId, message, query } = body

    switch (action) {
      case 'init':
        const newConversation = conversationManager.initConversation(conversationId)
        return NextResponse.json({
          success: true,
          conversation: newConversation
        })

      case 'addMessage':
        if (!conversationId || !message) {
          return NextResponse.json(
            { error: 'conversationId and message are required' },
            { status: 400 }
          )
        }
        
        const updatedConversation = conversationManager.addMessage(conversationId, message)
        return NextResponse.json({
          success: true,
          conversation: updatedConversation
        })

      case 'resolveFollowUp':
        if (!conversationId || !query) {
          return NextResponse.json(
            { error: 'conversationId and query are required' },
            { status: 400 }
          )
        }
        
        const resolved = conversationManager.resolveFollowUpQuestion(conversationId, query)
        return NextResponse.json({
          success: true,
          resolvedQuery: resolved.resolvedQuery,
          context: resolved.context
        })

      case 'getSummary':
        if (!conversationId) {
          return NextResponse.json(
            { error: 'conversationId is required' },
            { status: 400 }
          )
        }
        
        const summary = conversationManager.getConversationSummary(conversationId)
        return NextResponse.json({
          success: true,
          summary
        })

      case 'export':
        if (!conversationId) {
          return NextResponse.json(
            { error: 'conversationId is required' },
            { status: 400 }
          )
        }
        
        const exported = conversationManager.exportConversation(conversationId)
        return NextResponse.json({
          success: true,
          conversation: exported
        })

      case 'statistics':
        const stats = conversationManager.getStatistics()
        return NextResponse.json({
          success: true,
          statistics: stats
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error in conversation API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process conversation request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (conversationId) {
      const conversation = conversationManager.getConversation(conversationId)
      
      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        conversation
      })
    } else {
      // Return statistics
      const stats = conversationManager.getStatistics()
      return NextResponse.json({
        success: true,
        statistics: stats
      })
    }

  } catch (error) {
    console.error('Error getting conversation:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get conversation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

