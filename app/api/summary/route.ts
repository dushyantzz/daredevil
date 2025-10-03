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
    const { keyMoments } = await request.json()

    // Format the key moments into a readable string
    const momentsText = keyMoments.map((moment: any) =>
      `Video: ${moment.videoName}\nTimestamp: ${moment.timestamp}\nDescription: ${moment.description}\nDangerous: ${moment.isDangerous ? 'Yes' : 'No'}\n`
    ).join('\n')

    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Generate content with Gemini
    const prompt = `You are an expert at analyzing video safety data. Provide concise, insightful summaries of video analysis data, focusing on safety patterns and potential concerns.

Here are the key moments from video analysis sessions. Please provide a concise summary of the important events and any safety concerns:

${momentsText}

Please format your response in this way:
1. Overall Summary (2-3 sentences)
2. Key Safety Concerns (if any)
3. Notable Patterns (if any)`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const response = result.response;
    const text = response.text();

    return NextResponse.json({
      summary: text || 'Unable to generate summary.'
    })
  } catch (error: any) {
    console.error('Error generating summary:', error)

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

    const errorMessage = error.message || 'Failed to generate summary'
    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
