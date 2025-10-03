import { NextResponse } from 'next/server'
import apiKeyManager from '@/utils/api-keys'

export async function GET() {
  try {
    // Get statistics about API key usage
    const stats = apiKeyManager.getStats();
    
    return NextResponse.json({
      status: 'success',
      data: stats
    })
  } catch (error) {
    console.error('Error getting API key status:', error)
    return NextResponse.json({ 
      status: 'error',
      error: 'Failed to get API key status' 
    }, { status: 500 })
  }
}
