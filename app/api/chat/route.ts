import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from "@google/generative-ai"
import apiKeyManager from '@/utils/api-keys'

const getGeminiClient = () => {
  try {
    // Get an API key from the manager (which handles rotation)
    const apiKey = apiKeyManager.getGeminiApiKey()
    return new GoogleGenerativeAI(apiKey)
  } catch (error) {
    console.error('Failed to get Gemini API key:', error)
    throw new Error('No Gemini API keys available')
  }
}

export async function POST(request: Request) {
  let genAI
  try {
    genAI = getGeminiClient()
  } catch (error) {
    console.error('Gemini client initialization error:', error)
    return NextResponse.json(
      { error: 'Gemini API key not properly configured' },
      { status: 500 }
    )
  }
  try {
    const { messages, events } = await request.json()

    const contextMessage = events.length > 0
      ? `Here are the recent events that have occurred during the video stream:\n${events.map((event: any) =>
          `- At ${event.timestamp}: ${event.description}${event.isDangerous ? ' (⚠️ Dangerous)' : ''}`
        ).join('\n')}\n\nPlease help the user with any questions about these events or provide general assistance.`
      : 'No events have been detected yet. I can still help you with any questions about the video stream or general assistance.'

    // Create a system prompt that combines the assistant instructions and context
    const systemPrompt = `You are a helpful assistant monitoring a real-time video stream. You have access to detected events and can provide guidance, especially during dangerous situations. Be concise but informative, and show appropriate concern for dangerous events while remaining calm and helpful.

${contextMessage}`;

    // Convert messages to Gemini format
    const userMessages = messages.filter((msg: any) => msg.role === 'user');
    const userQuery = userMessages.length > 0 ? userMessages[userMessages.length - 1].content : '';

    console.log('Sending request to Gemini...')
    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Generate content with Gemini with optimized settings
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: `${systemPrompt}\n\nUser query: ${userQuery}` }]
      }],
      generationConfig: {
        temperature: 0.5, // Reduced from 0.7 for faster responses
        maxOutputTokens: 100, // Reduced from 150 for faster responses
        topK: 20, // Added for better performance
        topP: 0.8, // Added for better performance
      },
    });

    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Invalid response from Gemini')
    }

    console.log('Successfully received response from Gemini')
    return NextResponse.json({
      content: text,
      role: 'assistant'
    })
  } catch (error: any) {
    console.error('Chat API error:', error)

    // If there's an API key error, mark the key as inactive
    if (error.message && error.message.includes('API key')) {
      try {
        // Try to extract the API key from the error message if possible
        const keyMatch = error.message.match(/key: ([A-Za-z0-9_-]+)/);
        if (keyMatch && keyMatch[1]) {
          apiKeyManager.markKeyInactive(keyMatch[1]);
        }
      } catch (e) {
        // Ignore errors in error handling
        console.warn('Failed to mark API key as inactive:', e);
      }
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: `Failed to get chat response: ${errorMessage}` },
      { status: 500 }
    )
  }
}
