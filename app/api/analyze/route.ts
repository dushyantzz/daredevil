import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import apiKeyManager from '@/utils/api-keys'

// Get a Gemini API key from the manager
const genAI = new GoogleGenerativeAI(apiKeyManager.getGeminiApiKey())

export async function POST(request: Request) {
  try {
    const { videoUrl } = await request.json()

    // mocking right now
    const mockTimestamps = [
      {
        timestamp: "00:03",
        description: "Introduction begins with main topic overview",
      },
      {
        timestamp: "01:30",
        description: "First key point discussion starts",
      },
      {
        timestamp: "02:45",
        description: "Demonstration of main concept",
      },
      {
        timestamp: "04:20",
        description: "Summary of key takeaways",
      },
    ]

    await new Promise((resolve) => setTimeout(resolve, 2000))

    return NextResponse.json(mockTimestamps)
  } catch (error: any) {
    console.error('Error analyzing video:', error)

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

    return NextResponse.json({
      error: "Error analyzing video",
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

