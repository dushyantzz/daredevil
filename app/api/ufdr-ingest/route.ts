/**
 * UFDR Data Ingestion API
 * Stores UFDR data in Pinecone vector database
 */

import { NextResponse } from 'next/server'
import { storeUFDRData, UFDRDocument } from '@/lib/rag-engine'
import { initializePinecone } from '@/lib/pinecone-client'
import { validateUFDRData, sanitizeUFDRData } from '@/lib/ufdr-data-validator'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ufdrData } = body

    if (!ufdrData) {
      return NextResponse.json(
        { error: 'UFDR data is required' },
        { status: 400 }
      )
    }

    console.log('📥 Ingesting UFDR data...')
    
    // Step 1: Validate the uploaded data
    console.log('🔍 Validating UFDR data structure...')
    const validationResult = await validateUFDRData(ufdrData)
    
    if (!validationResult.isValid) {
      console.error('❌ Data validation failed:', validationResult.errors.slice(0, 5))
      return NextResponse.json(
        {
          error: 'Invalid UFDR data format',
          validationErrors: validationResult.errors,
          validationWarnings: validationResult.warnings,
          stats: validationResult.stats
        },
        { status: 400 }
      )
    }
    
    console.log(`✓ Data validation passed: ${validationResult.stats.validRecords}/${validationResult.stats.totalRecords} valid records`)
    
    if (validationResult.warnings.length > 0) {
      console.warn('⚠ Validation warnings:', validationResult.warnings.slice(0, 3))
    }
    
    // Step 2: Sanitize the data if needed
    const { sanitizedData, changes } = sanitizeUFDRData(ufdrData)
    if (changes.length > 0) {
      console.log(`🧹 Data sanitized: ${changes.length} changes made`)
    }
    
    // Use sanitized data for processing
    const processedUfdrData = sanitizedData

    // Step 3: Initialize Pinecone connection if not already done
    const pineconeInitialized = await initializePinecone()

    if (!pineconeInitialized) {
      console.log('⚠ Pinecone not available, data will be processed locally only')
    }

    // Step 4: Convert UFDR data to documents
    const documents: UFDRDocument[] = []

    // Process chats
    if (processedUfdrData.chats && Array.isArray(processedUfdrData.chats)) {
      processedUfdrData.chats.forEach((chat: any, index: number) => {
        documents.push({
          id: `chat_${index}_${Date.now()}`,
          content: `${chat.contact}: ${chat.message}`,
          metadata: {
            type: 'chat',
            contact: chat.contact,
            platform: chat.platform,
            timestamp: chat.timestamp,
            location: chat.location
          }
        })
      })
    }

    // Process calls
    if (processedUfdrData.calls && Array.isArray(processedUfdrData.calls)) {
      processedUfdrData.calls.forEach((call: any, index: number) => {
        documents.push({
          id: `call_${index}_${Date.now()}`,
          content: `Call with ${call.contact} (${call.type}) - Duration: ${call.duration}s`,
          metadata: {
            type: 'call',
            contact: call.contact,
            callType: call.type,
            duration: call.duration,
            timestamp: call.timestamp,
            location: call.location
          }
        })
      })
    }

    // Process images
    if (processedUfdrData.images && Array.isArray(processedUfdrData.images)) {
      processedUfdrData.images.forEach((image: any, index: number) => {
        documents.push({
          id: `image_${index}_${Date.now()}`,
          content: `Image: ${image.filename} - Size: ${image.size} bytes`,
          metadata: {
            type: 'image',
            filename: image.filename,
            size: image.size,
            timestamp: image.timestamp,
            location: image.location
          }
        })
      })
    }

    // Process videos
    if (processedUfdrData.videos && Array.isArray(processedUfdrData.videos)) {
      processedUfdrData.videos.forEach((video: any, index: number) => {
        documents.push({
          id: `video_${index}_${Date.now()}`,
          content: `Video: ${video.filename} - Duration: ${video.duration}s`,
          metadata: {
            type: 'video',
            filename: video.filename,
            duration: video.duration,
            timestamp: video.timestamp,
            location: video.location
          }
        })
      })
    }

    // Process app data
    if (processedUfdrData.appData && Array.isArray(processedUfdrData.appData)) {
      processedUfdrData.appData.forEach((app: any, index: number) => {
        documents.push({
          id: `app_${index}_${Date.now()}`,
          content: `App: ${app.appName} (${app.category}) - Last used: ${app.lastUsed}`,
          metadata: {
            type: 'app',
            appName: app.appName,
            category: app.category,
            lastUsed: app.lastUsed,
            dataSize: app.dataSize
          }
        })
      })
    }

    console.log(`Prepared ${documents.length} documents for ingestion`)

    // Store in vector database (if Pinecone is available)
    let storedInPinecone = false
    let storageErrors: string[] = []
    let processedCount = 0
    
    if (pineconeInitialized && documents.length > 0) {
      try {
        const storageResult = await storeUFDRData(documents)
        storedInPinecone = storageResult.success
        processedCount = storageResult.processed
        storageErrors = storageResult.errors
        
        if (storageResult.success) {
          console.log(`✓ Successfully stored ${storageResult.processed} documents in Pinecone`)
        } else {
          console.warn(`⚠ Partial storage failure: ${storageResult.processed} processed, ${storageResult.errors.length} errors`)
        }
        
        // Log errors if any
        if (storageErrors.length > 0) {
          console.warn('Storage errors:', storageErrors.slice(0, 5)) // Log first 5 errors
        }
        
      } catch (error) {
        console.error('⚠ Could not store in Pinecone:', error instanceof Error ? error.message : 'Unknown error')
        storageErrors.push(error instanceof Error ? error.message : 'Unknown storage error')
      }
    }

    return NextResponse.json({
      success: true,
      message: storedInPinecone
        ? `UFDR data ingested successfully into Pinecone (${processedCount}/${documents.length} documents processed)`
        : 'UFDR data loaded (Pinecone unavailable, using local processing)',
      documentsProcessed: processedCount > 0 ? processedCount : documents.length,
      totalDocuments: documents.length,
      ragEnabled: storedInPinecone,
      breakdown: {
        chats: processedUfdrData.chats?.length || 0,
        calls: processedUfdrData.calls?.length || 0,
        images: processedUfdrData.images?.length || 0,
        videos: processedUfdrData.videos?.length || 0,
        apps: processedUfdrData.appData?.length || 0
      },
      validationStats: validationResult.stats,
      warnings: storageErrors.length > 0 ? storageErrors.slice(0, 10) : [] // Include up to 10 warnings
    })

  } catch (error) {
    console.error('Error ingesting UFDR data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to ingest UFDR data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Initialize Pinecone connection
    const initialized = await initializePinecone()

    return NextResponse.json({
      success: true,
      message: 'Pinecone initialized',
      initialized
    })

  } catch (error) {
    console.error('Error initializing Pinecone:', error)
    return NextResponse.json(
      { 
        error: 'Failed to initialize Pinecone',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

