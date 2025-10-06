/**
 * Pinecone Index Setup Script
 * 
 * This script creates a new Pinecone index with the correct configuration
 * for the UFDR RAG system. Run this script once to set up your Pinecone index.
 * 
 * Usage: node scripts/setup-pinecone-index.js
 */

const { Pinecone } = require('@pinecone-database/pinecone')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local')
  
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local file not found')
  }

  const envFile = fs.readFileSync(envPath, 'utf8')
  const envVars = {}

  envFile.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=')
      const value = valueParts.join('=').replace(/^["']|["']$/g, '')
      envVars[key.trim()] = value
    }
  })

  return envVars
}

async function setupPineconeIndex() {
  try {
    console.log('🚀 Setting up Pinecone index for UFDR RAG system...\n')

    // Load environment variables
    const env = loadEnvFile()
    
    if (!env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY not found in .env.local')
    }

    const indexName = env.PINECONE_INDEX_NAME || 'ufdr-rag'
    
    console.log(`📋 Configuration:`)
    console.log(`   Index Name: ${indexName}`)
    console.log(`   Dimension: 768 (for Gemini text-embedding-004)`)
    console.log(`   Metric: cosine`)
    console.log(`   Cloud: AWS`)
    console.log(`   Region: us-east-1\n`)

    // Initialize Pinecone
    const pc = new Pinecone({
      apiKey: env.PINECONE_API_KEY
    })

    // Check if index already exists
    console.log(`🔍 Checking if index '${indexName}' exists...`)
    
    try {
      const indexes = await pc.listIndexes()
      const indexExists = indexes.indexes?.some(idx => idx.name === indexName)
      
      if (indexExists) {
        console.log(`✅ Index '${indexName}' already exists!`)
        
        // Get index details
        const indexDesc = await pc.describeIndex(indexName)
        console.log(`📊 Index details:`)
        console.log(`   Dimension: ${indexDesc.dimension}`)
        console.log(`   Metric: ${indexDesc.metric}`)
        console.log(`   Status: ${indexDesc.status?.state}`)
        
        if (indexDesc.dimension !== 768) {
          console.log(`⚠️  WARNING: Index dimension is ${indexDesc.dimension}, but Gemini embeddings are 768-dimensional.`)
          console.log(`   Consider creating a new index with correct dimensions.`)
        } else {
          console.log(`✅ Index configuration is correct!`)
        }
        
        return true
      }
    } catch (error) {
      console.log(`⚠️  Could not check existing indexes: ${error.message}`)
    }

    // Create the index
    console.log(`📝 Creating new index '${indexName}'...`)
    
    await pc.createIndex({
      name: indexName,
      dimension: 768,
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    })

    console.log(`⏳ Waiting for index to be ready...`)
    
    // Wait for index to be ready (may take a few minutes)
    let isReady = false
    let attempts = 0
    const maxAttempts = 30 // 5 minutes max
    
    while (!isReady && attempts < maxAttempts) {
      try {
        const indexDesc = await pc.describeIndex(indexName)
        isReady = indexDesc.status?.state === 'Ready'
        
        if (!isReady) {
          console.log(`   Status: ${indexDesc.status?.state} (attempt ${attempts + 1}/${maxAttempts})`)
          await new Promise(resolve => setTimeout(resolve, 10000)) // Wait 10 seconds
        }
      } catch (error) {
        console.log(`   Checking status... (attempt ${attempts + 1}/${maxAttempts})`)
        await new Promise(resolve => setTimeout(resolve, 10000))
      }
      
      attempts++
    }

    if (isReady) {
      console.log(`🎉 Index '${indexName}' created successfully and is ready!`)
      
      // Test the index
      console.log(`🧪 Testing index connection...`)
      const index = pc.index(indexName)
      const stats = await index.describeIndexStats()
      console.log(`✅ Index connection successful!`)
      console.log(`📊 Index stats: ${stats.totalVectorCount} vectors`)
      
    } else {
      console.log(`❌ Index creation timed out. Please check Pinecone console.`)
      return false
    }

    console.log(`\n🎯 Setup complete! Your Pinecone index is ready for the UFDR RAG system.`)
    console.log(`\n📖 Next steps:`)
    console.log(`   1. Restart your development server: npm run dev`)
    console.log(`   2. Open the NLP Query Interface: http://localhost:3000/pages/nlp-query-interface`)
    console.log(`   3. Upload some UFDR data to test the system`)
    console.log(`   4. Try queries like: "Show me messages from John"`)

    return true

  } catch (error) {
    console.error(`❌ Error setting up Pinecone index:`, error)
    return false
  }
}

// Alternative setup for existing index with wrong dimensions
async function createNewIndexWithCorrectDimensions() {
  try {
    const env = loadEnvFile()
    const pc = new Pinecone({ apiKey: env.PINECONE_API_KEY })
    
    const oldIndexName = env.PINECONE_INDEX_NAME || 'trial'
    const newIndexName = `${oldIndexName}-768`
    
    console.log(`🔄 Creating new index '${newIndexName}' with correct dimensions...`)
    
    await pc.createIndex({
      name: newIndexName,
      dimension: 768,
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    })
    
    console.log(`✅ New index created! Update your .env.local:`)
    console.log(`   PINECONE_INDEX_NAME=${newIndexName}`)
    
    return newIndexName
    
  } catch (error) {
    console.error(`❌ Error creating new index:`, error)
    return null
  }
}

// Check command line arguments
const args = process.argv.slice(2)

if (args.includes('--new-index')) {
  createNewIndexWithCorrectDimensions()
} else {
  setupPineconeIndex()
}
