# UFDR RAG System - Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  NLP Query Interface (app/pages/nlp-query-interface/page.tsx)   │  │
│  │  - Chat Interface                                                 │  │
│  │  - Quick Actions Panel (Fixed UI)                                │  │
│  │  - Data Upload                                                    │  │
│  │  - Status Indicators (RAG Enabled, Conversation ID)              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                          API LAYER                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │  /api/nlp-query  │  │ /api/ufdr-ingest │  │ /api/conversation│     │
│  │  - Process Query │  │ - Ingest Data    │  │ - Manage Context │     │
│  │  - Intent Class. │  │ - Store Vectors  │  │ - Resolve Follow │     │
│  │  - Generate Resp │  │ - Initialize DB  │  │ - Export Data    │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                       CORE LIBRARIES                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Intent Classifier (lib/nlp-intent-classifier.ts)                │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │ • Data Extraction      • Pattern Analysis                  │ │  │
│  │  │ • Timeline Recon.      • Relationship Mapping              │ │  │
│  │  │ • Location Analysis    • Search Query                      │ │  │
│  │  │ • Summary Request      • Comparison                        │ │  │
│  │  │ • Follow-up            • Unknown                           │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  RAG Engine (lib/rag-engine.ts)                                  │  │
│  │  • Generate Embeddings (Gemini)                                  │  │
│  │  • Semantic Search                                               │  │
│  │  • Context Building                                              │  │
│  │  • Store/Retrieve Conversations                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Conversation Manager (lib/conversation-manager.ts)              │  │
│  │  • Track Conversation State                                      │  │
│  │  • Resolve Follow-up Questions                                   │  │
│  │  • Pronoun Resolution (their → John's)                           │  │
│  │  • Entity Tracking                                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │   ChromaDB       │  │  Google Gemini   │  │   API Key Mgr    │     │
│  │   Cloud          │  │  AI              │  │   (5 Keys)       │     │
│  │                  │  │                  │  │                  │     │
│  │  • Vector Store  │  │  • Embeddings    │  │  • Auto Rotation │     │
│  │  • Collections:  │  │  • Generation    │  │  • Load Balance  │     │
│  │    - Chats       │  │  • Intent Class. │  │  • Fallback      │     │
│  │    - Calls       │  │  • Entity Extr.  │  │                  │     │
│  │    - Images      │  │                  │  │                  │     │
│  │    - Videos      │  │                  │  │                  │     │
│  │    - Apps        │  │                  │  │                  │     │
│  │    - History     │  │                  │  │                  │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────┐
│ User Query  │
│ "Show me    │
│ messages    │
│ from John"  │
└──────┬──────┘
       │
       ↓
┌──────────────────────────────────────────┐
│ Step 1: Intent Classification            │
│ ┌──────────────────────────────────────┐ │
│ │ Intent: search_query                 │ │
│ │ Entities: {contacts: ["John"]}       │ │
│ │ Confidence: 0.85                     │ │
│ └──────────────────────────────────────┘ │
└──────┬───────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────┐
│ Step 2: Context Resolution               │
│ ┌──────────────────────────────────────┐ │
│ │ Check conversation history           │ │
│ │ Is follow-up? No                     │ │
│ │ Previous context: None               │ │
│ └──────────────────────────────────────┘ │
└──────┬───────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────┐
│ Step 3: Semantic Search                  │
│ ┌──────────────────────────────────────┐ │
│ │ Generate query embedding             │ │
│ │ Search ChromaDB collections          │ │
│ │ Retrieve top 10 relevant docs        │ │
│ │ Rank by similarity                   │ │
│ └──────────────────────────────────────┘ │
└──────┬───────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────┐
│ Step 4: RAG Context Building             │
│ ┌──────────────────────────────────────┐ │
│ │ Combine:                             │ │
│ │ • Retrieved documents                │ │
│ │ • UFDR data summary                  │ │
│ │ • Conversation history               │ │
│ │ • Intent & entities                  │ │
│ └──────────────────────────────────────┘ │
└──────┬───────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────┐
│ Step 5: Response Generation              │
│ ┌──────────────────────────────────────┐ │
│ │ Send to Gemini AI with context       │ │
│ │ Generate natural language response   │ │
│ │ Extract sources and confidence       │ │
│ └──────────────────────────────────────┘ │
└──────┬───────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────┐
│ Step 6: Store Conversation               │
│ ┌──────────────────────────────────────┐ │
│ │ Save to conversation manager         │ │
│ │ Update context for follow-ups        │ │
│ │ Track entities mentioned             │ │
│ └──────────────────────────────────────┘ │
└──────┬───────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────┐
│ Response to User                         │
│ ┌──────────────────────────────────────┐ │
│ │ "Found 32 messages from John..."     │ │
│ │ Confidence: 85%                      │ │
│ │ Sources: WhatsApp - John Doe         │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

## Follow-up Question Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ Initial Query: "Show me messages from John"                     │
└──────┬──────────────────────────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────────────────────────┐
│ Response: "Found 32 messages from John..."                       │
│ Context Stored:                                                  │
│ • lastIntent: search_query                                       │
│ • referencedContacts: ["John"]                                   │
│ • lastDataType: chats                                            │
└──────┬───────────────────────────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────────────────────────┐
│ Follow-up Query: "What about their location during those calls?" │
└──────┬───────────────────────────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────────────────────────┐
│ Conversation Manager Resolves:                                   │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ "their" → "John" (from referencedContacts)                   │ │
│ │ "those calls" → "calls" (from context)                       │ │
│ │                                                              │ │
│ │ Resolved Query:                                              │ │
│ │ "What about John's location during calls?"                   │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────┬───────────────────────────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────────────────────────┐
│ Process as new query with resolved context                       │
│ Intent: location_analysis                                        │
│ Entities: {contacts: ["John"], dataTypes: ["calls"]}            │
└──────┬───────────────────────────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────────────────────────┐
│ Response: "John's location during calls: 3 from NYC, 2 from LA" │
└──────────────────────────────────────────────────────────────────┘
```

## Component Interaction Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                    NLP Query Interface                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Chat Display │  │ Quick Actions│  │ Data Upload  │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                  │                  │                     │
│         └──────────────────┴──────────────────┘                     │
│                            │                                        │
└────────────────────────────┼────────────────────────────────────────┘
                             │
                             ↓
┌────────────────────────────────────────────────────────────────────┐
│                      API Routes                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  /api/nlp-query                                              │ │
│  │  ├─→ classifyIntent()                                        │ │
│  │  ├─→ buildContextAwareQuery()                                │ │
│  │  ├─→ semanticSearch()                                        │ │
│  │  ├─→ generateResponse()                                      │ │
│  │  └─→ storeConversationContext()                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  /api/ufdr-ingest                                            │ │
│  │  ├─→ initializeCollections()                                 │ │
│  │  ├─→ convertToDocuments()                                    │ │
│  │  └─→ storeUFDRData()                                         │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  /api/conversation                                           │ │
│  │  ├─→ initConversation()                                      │ │
│  │  ├─→ addMessage()                                            │ │
│  │  ├─→ resolveFollowUpQuestion()                               │ │
│  │  └─→ exportConversation()                                    │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
│  • Next.js 14                                               │
│  • React 19                                                 │
│  • TypeScript                                               │
│  • Tailwind CSS                                             │
│  • Lucide Icons                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend Layer                            │
│  • Next.js API Routes                                       │
│  • Server-side Processing                                   │
│  • TypeScript                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    AI/ML Layer                              │
│  • Google Gemini 1.5 Pro (Response Generation)             │
│  • Google Gemini 1.5 Flash (Intent Classification)         │
│  • Gemini embedding-001 (Vector Embeddings)                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
│  • ChromaDB Cloud (Vector Database)                        │
│  • In-Memory Caching (Conversation State)                  │
└─────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Layer 1: API Key Management                           │ │
│  │ • 5 Gemini API Keys with Auto-rotation                │ │
│  │ • Environment Variable Storage                        │ │
│  │ • Key Usage Tracking                                  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Layer 2: Data Isolation                               │ │
│  │ • Conversation ID-based Isolation                     │ │
│  │ • Tenant-based ChromaDB Separation                    │ │
│  │ • Session-based Context                               │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Layer 3: Secure Communication                         │ │
│  │ • HTTPS for ChromaDB Cloud                            │ │
│  │ • Token-based Authentication                          │ │
│  │ • Encrypted Data Transfer                             │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Layer 4: Data Cleanup                                 │ │
│  │ • Automatic Conversation Cleanup (7 days)             │ │
│  │ • Session Expiration                                  │ │
│  │ • Memory Management                                   │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Development                              │
│  • Local Next.js Server (npm run dev)                      │
│  • Hot Reload                                               │
│  • Debug Mode                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Production                               │
│  • Vercel Deployment (Recommended)                         │
│  • Edge Functions                                           │
│  • Global CDN                                               │
│  • Auto-scaling                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
│  • ChromaDB Cloud (Vector Database)                        │
│  • Google Gemini API (AI Processing)                       │
│  • Monitoring & Analytics                                  │
└─────────────────────────────────────────────────────────────┘
```

---

**Legend:**
- `→` : Data flow
- `↓` : Process flow
- `┌─┐` : Component boundary
- `•` : Feature/capability

