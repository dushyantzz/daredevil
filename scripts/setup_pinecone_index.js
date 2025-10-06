/**
 * Setup Pinecone Index with Correct Dimensions
 * Creates a new index with 768 dimensions to match text-embedding-004
 */

const { Pinecone } = require('@pinecone-database/pinecone')
const fs = require('fs')
const path = require('path')

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local')
  const envContent = fs.readFileSync(envPath, 'utf8')
  
  const envVars = {}
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim()
    }
  })
  
  return envVars
}

async function setupPineconeIndex() {
  try {
    // Load environment variables from .env.local
    const envVars = loadEnvFile()
    
    // Get credentials from environment variables
    const apiKey = envVars.PINECONE_API_KEY
    const environment = envVars.PINECONE_ENVIRONMENT || 'us-east-1'
    const indexName = 'ufdr-768' // New index name with 768 dimensions

    if (!apiKey) {
      throw new Error('Pinecone API key not found in environment variables')
    }

    const client = new Pinecone({
      apiKey: apiKey
    })

    console.log('✓ Pinecone client initialized')

    // Check if index already exists
    const indexes = await client.listIndexes()
    const existingIndex = indexes.indexes?.find(idx => idx.name === indexName)

    if (existingIndex) {
      console.log(`✓ Index '${indexName}' already exists`)
      return
    }

    // Create new index with 768 dimensions
    console.log(`Creating new index '${indexName}' with 768 dimensions...`)
    
    await client.createIndex({
      name: indexName,
      dimension: 768, // Match text-embedding-004 dimensions
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: environment
        }
      }
    })

    console.log(`✓ Index '${indexName}' created successfully with 768 dimensions`)
    console.log('\n📝 Next steps:')
    console.log(`1. Update your .env.local file:`)
    console.log(`   PINECONE_INDEX_NAME=${indexName}`)
    console.log('2. Restart your development server')
    console.log('3. The UFDR data ingestion should now work correctly')

  } catch (error) {
    console.error('Error setting up Pinecone index:', error)
    process.exit(1)
  }
}

// Run the setup
setupPineconeIndex()
