import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from "@google/generative-ai"

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Gemini API key not found in environment variables')
  }
  return new GoogleGenerativeAI(apiKey)
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
