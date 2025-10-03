"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import apiKeyManager from '@/utils/api-keys';

// Get a Google API key from the manager
let genAI: GoogleGenerativeAI;
try {
    const API_KEY = apiKeyManager.getGoogleApiKey();
    genAI = new GoogleGenerativeAI(API_KEY);
} catch (error) {
    console.error('Failed to initialize Google API client:', error);
    throw new Error('Google API key not available');
}

export interface VideoEvent {
    timestamp: string;
    description: string;
    isDangerous: boolean;
}

export async function detectEvents(base64Image: string, transcript: string = ''): Promise<{ events: VideoEvent[], rawResponse: string }> {
    console.log('Starting frame analysis...');
    try {
        if (!base64Image) {
            throw new Error("No image data provided");
        }

        const base64Data = base64Image.split(',')[1];
        if (!base64Data) {
            throw new Error("Invalid image data format");
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: 0.2, // Lower temperature for faster, more deterministic responses
                topK: 16, // Limit token selection for faster responses
                topP: 0.8, // Limit token selection for faster responses
                maxOutputTokens: 256 // Limit output size for faster responses
            }
        });
        console.log('Initialized Gemini model with optimized settings');

        // Compress the image data if it's too large (over 500KB)
        let optimizedBase64Data = base64Data;
        if (base64Data.length > 500000) {
            // Simple compression by reducing the data to 70% of original size
            const compressionRatio = 0.7;
            const dataLength = Math.floor(base64Data.length * compressionRatio);
            optimizedBase64Data = base64Data.substring(0, dataLength);
        }

        const imagePart = {
            inlineData: {
                data: optimizedBase64Data,
                mimeType: 'image/jpeg'
            },
        };

        console.log('Sending image to API...', { imageSize: base64Data.length });
        const prompt = `Analyze this frame and determine if any of these specific dangerous situations are occurring:

1. Medical Emergencies:
- Person unconscious or lying motionless
- Person clutching chest/showing signs of heart problems
- Seizures or convulsions
- Difficulty breathing or choking

2. Falls and Injuries:
- Person falling or about to fall
- Person on the ground after a fall
- Signs of injury or bleeding
- Limping or showing signs of physical trauma

3. Distress Signals:
- Person calling for help or showing distress
- Panic attacks or severe anxiety symptoms
- Signs of fainting or dizziness
- Headache or unease
- Signs of unconsciousness

4. Violence or Threats:
- Physical altercations
- Threatening behavior
- Weapons visible

5. Suspicious Activities:
- Shoplifting
- Vandalism
- Trespassing
${transcript ? `Consider this audio transcript from the scene: "${transcript}"
` : ''}
Return a JSON object in this exact format:

{
    "events": [
        {
            "timestamp": "mm:ss",
            "description": "Brief description of what's happening in this frame",
            "isDangerous": true/false // Set to true if the event involves a fall, injury, unease, pain, accident, or concerning behavior
        }
    ]
}`;

        try {
            const result = await model.generateContent([
                prompt,
                imagePart,
            ]);

            const response = await result.response;
            const text = response.text();
            console.log('Raw API Response:', text);

            // Try to extract JSON from the response, handling potential code blocks
            let jsonStr = text;

            // First try to extract content from code blocks if present
            const codeBlockMatch = text.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
            if (codeBlockMatch) {
                jsonStr = codeBlockMatch[1];
                console.log('Extracted JSON from code block:', jsonStr);
            } else {
                // If no code block, try to find raw JSON
                const jsonMatch = text.match(/\{[^]*\}/);
                if (jsonMatch) {
                    jsonStr = jsonMatch[0];
                    console.log('Extracted raw JSON:', jsonStr);
                }
            }

            try {
                const parsed = JSON.parse(jsonStr);
                return {
                    events: parsed.events || [],
                    rawResponse: text
                };
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                throw new Error('Failed to parse API response');
            }

        } catch (error: any) {
            console.error('Error calling API:', error);

            // If there's an API key error, mark the key as inactive and try with a different key
            if (error.message && error.message.includes('API key')) {
                try {
                    // Try to extract the API key from the error message if possible
                    const keyMatch = error.message.match(/key: ([A-Za-z0-9_-]+)/);
                    if (keyMatch && keyMatch[1]) {
                        apiKeyManager.markKeyInactive(keyMatch[1]);
                    }

                    // Try with a different API key
                    const newApiKey = apiKeyManager.getGoogleApiKey();
                    genAI = new GoogleGenerativeAI(newApiKey);
                    console.log('Retrying with a different API key');

                    // Retry the request (simplified for brevity)
                    const retryResult = await genAI.getGenerativeModel({
                        model: "gemini-1.5-flash",
                        generationConfig: {
                            temperature: 0.2,
                            topK: 16,
                            topP: 0.8,
                            maxOutputTokens: 256
                        }
                    }).generateContent([prompt, imagePart]);

                    const retryResponse = await retryResult.response;
                    const retryText = retryResponse.text();

                    // Process the retry response the same way
                    let retryJsonStr = retryText;
                    const retryCodeBlockMatch = retryText.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
                    if (retryCodeBlockMatch) {
                        retryJsonStr = retryCodeBlockMatch[1];
                    } else {
                        const retryJsonMatch = retryText.match(/\{[^]*\}/);
                        if (retryJsonMatch) {
                            retryJsonStr = retryJsonMatch[0];
                        }
                    }

                    const retryParsed = JSON.parse(retryJsonStr);
                    return {
                        events: retryParsed.events || [],
                        rawResponse: retryText
                    };
                } catch (retryError) {
                    console.error('Error during retry with new API key:', retryError);
                }
            }

            throw error;
        }
    } catch (error) {
        console.error('Error in detectEvents:', error);
        throw error;
    }
}
