# UFDR RAG System Documentation

## Overview

The UFDR (Universal Forensic Data Repository) Analysis System now includes a complete **RAG (Retrieval-Augmented Generation)** implementation powered by ChromaDB and Google's Gemini AI. This system enables investigators to query forensic data using natural language with context-aware processing and follow-up question handling.

## Architecture

### Components

1. **ChromaDB Vector Database** (`lib/chromadb-client.ts`)
   - Cloud-hosted vector database for semantic search
   - Separate collections for each data type (chats, calls, images, videos, apps)
   - Conversation history storage

2. **RAG Engine** (`lib/rag-engine.ts`)
   - Vector embeddings generation using Gemini
   - Semantic search across UFDR data
   - Context-aware query building
   - Conversation context management

3. **NLP Intent Classifier** (`lib/nlp-intent-classifier.ts`)
   - AI-powered intent classification
   - Entity extraction (contacts, locations, time ranges, etc.)
   - Query complexity analysis
   - Support for 10 different intent types

4. **Conversation Manager** (`lib/conversation-manager.ts`)
   - Conversation state tracking
   - Follow-up question resolution
   - Pronoun and reference resolution
   - Context persistence

## Features

### 1. Intent Classification

The system classifies queries into these intents:

- **data_extraction**: Extract specific data (messages, calls, files)
- **pattern_analysis**: Analyze patterns (communication patterns, usage patterns)
- **timeline_reconstruction**: Chronological events or timeline
- **relationship_mapping**: Relationships between contacts
- **location_analysis**: Location data analysis
- **search_query**: Search for specific information
- **summary_request**: Summary or overview
- **comparison**: Compare data points
- **follow_up**: Follow-up questions based on previous context
- **unknown**: Unclear intent

### 2. Entity Extraction

Automatically extracts:
- Contact names
- Time ranges (relative and absolute)
- Locations
- Data types (chats, calls, images, videos, apps)
- Communication platforms (WhatsApp, Telegram, etc.)
- Keywords

### 3. Conversation History Tracking

- Maintains conversation context across multiple queries
- Resolves pronouns ("their", "those", "them") to actual entities
- Tracks referenced contacts, locations, and time ranges
- Enables natural follow-up questions

### 4. Semantic Search

- Vector-based similarity search
- Cross-data-type search capabilities
- Relevance scoring
- Context-aware result ranking

## API Endpoints

### 1. NLP Query API (`/api/nlp-query`)

**POST** - Process natural language queries

```json
{
  "query": "Show me recent WhatsApp messages from John",
  "conversationId": "conv_1234567890",
  "conversationHistory": [...],
  "ufdrData": {...}
}
```

**Response:**
```json
{
  "success": true,
  "answer": "Found 15 WhatsApp messages from John...",
  "intent": "search_query",
  "confidence": 0.85,
  "sources": ["WhatsApp - John Doe"],
  "dataType": "chats",
  "relatedData": [...],
  "entities": {...},
  "isFollowUp": false,
  "complexity": "moderate",
  "processingTime": 1234
}
```

### 2. UFDR Ingestion API (`/api/ufdr-ingest`)

**POST** - Ingest UFDR data into vector database

```json
{
  "ufdrData": {
    "chats": [...],
    "calls": [...],
    "images": [...],
    "videos": [...],
    "appData": [...]
  }
}
```

**GET** - Initialize collections

### 3. Conversation API (`/api/conversation`)

**POST** - Manage conversations

Actions:
- `init`: Initialize new conversation
- `addMessage`: Add message to conversation
- `resolveFollowUp`: Resolve follow-up question
- `getSummary`: Get conversation summary
- `export`: Export conversation data
- `statistics`: Get system statistics

**GET** - Retrieve conversation or statistics

## Usage Examples

### Example 1: Basic Query

```javascript
// User asks: "Show me recent chat messages"
const response = await fetch('/api/nlp-query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "Show me recent chat messages",
    conversationId: "conv_123",
    ufdrData: loadedData
  })
})
```

### Example 2: Follow-up Question

```javascript
// User asks: "Show me messages from John"
// Then asks: "What about their location during those calls?"

// First query
await fetch('/api/nlp-query', {
  method: 'POST',
  body: JSON.stringify({
    query: "Show me messages from John",
    conversationId: "conv_123"
  })
})

// Follow-up query (automatically resolves "their" to "John")
await fetch('/api/nlp-query', {
  method: 'POST',
  body: JSON.stringify({
    query: "What about their location during those calls?",
    conversationId: "conv_123", // Same conversation ID
    conversationHistory: [...]
  })
})
```

### Example 3: Pattern Analysis

```javascript
const response = await fetch('/api/nlp-query', {
  method: 'POST',
  body: JSON.stringify({
    query: "Analyze communication patterns for the last week",
    conversationId: "conv_123"
  })
})
// Intent: pattern_analysis
// Entities: { timeRange: { relative: "last week" } }
```

## Configuration

### ChromaDB Setup

The system uses ChromaDB Cloud with the following configuration:

```typescript
const client = new ChromaClient({
  path: 'https://api.trychroma.com',
  auth: {
    provider: 'token',
    credentials: 'YOUR_API_KEY',
    providerOptions: {
      headerType: 'X_CHROMA_TOKEN'
    }
  },
  tenant: 'YOUR_TENANT_ID',
  database: 'YOUR_DATABASE_NAME'
})
```

### Environment Variables

Required environment variables:
- `GEMINI_API_KEY`: Google Gemini API key for embeddings and generation
- `GEMINI_API_KEY_1` to `GEMINI_API_KEY_4`: Additional API keys for load balancing

## Data Flow

1. **User Query** → NLP Query API
2. **Intent Classification** → Determine query type and extract entities
3. **Context Resolution** → Resolve follow-up questions using conversation history
4. **Semantic Search** → Search vector database for relevant data
5. **Response Generation** → Generate answer using Gemini with RAG context
6. **Context Storage** → Store conversation for future follow-ups

## Performance Optimization

- **API Key Rotation**: Automatic rotation across multiple Gemini API keys
- **Caching**: Conversation context cached in memory
- **Batch Processing**: Multiple documents processed in batches
- **Lazy Loading**: Collections initialized on-demand

## Best Practices

### For Investigators

1. **Start with data upload**: Upload UFDR data before querying
2. **Use natural language**: Ask questions as you would to a human analyst
3. **Follow-up questions**: Reference previous queries naturally
4. **Be specific**: Include time ranges, contacts, or platforms when known

### For Developers

1. **Error Handling**: Always implement fallback processing
2. **Context Management**: Use consistent conversation IDs
3. **Rate Limiting**: Monitor API usage across keys
4. **Data Validation**: Validate UFDR data before ingestion

## Troubleshooting

### Common Issues

1. **"No Gemini API keys available"**
   - Check environment variables
   - Verify API key validity

2. **"Collection not found"**
   - Call `/api/ufdr-ingest` GET endpoint to initialize
   - Check ChromaDB connection

3. **Poor search results**
   - Ensure data is properly ingested
   - Check query specificity
   - Verify embeddings are generated

4. **Follow-up questions not working**
   - Use consistent conversation ID
   - Ensure conversation history is passed
   - Check context resolution

## Future Enhancements

- [ ] Multi-language support
- [ ] Advanced relationship graph visualization
- [ ] Real-time data streaming
- [ ] Custom embedding models
- [ ] Advanced analytics dashboard
- [ ] Export to forensic report formats

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Contact development team

## License

Proprietary - UFDR Analysis System

