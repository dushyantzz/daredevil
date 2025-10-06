# UFDR RAG System - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- UFDR data files ready
- Internet connection for AI features

### Step 1: Install Dependencies ✅

The required packages are already installed:
```bash
npm install chromadb chromadb-default-embed @xenova/transformers
```

### Step 2: Environment Setup ✅

Your `.env.local` already contains the required API keys:
```env
GEMINI_API_KEY=AIzaSyCA7NG4tDBBHVXy-IXxnqkRcdX9bEIaFLo
GEMINI_API_KEY_1=AIzaSyCA7NG4tDBBHVXy-IXxnqkRcdX9bEIaFLo
GEMINI_API_KEY_2=AIzaSyCA7NG4tDBBHVXy-IXxnqkRcdX9bEIaFLo
GEMINI_API_KEY_3=AIzaSyCA7NG4tDBBHVXy-IXxnqkRcdX9bEIaFLo
GEMINI_API_KEY_4=AIzaSyCA7NG4tDBBHVXy-IXxnqkRcdX9bEIaFLo
```

ChromaDB credentials are configured in `lib/chromadb-client.ts`:
```typescript
{
  api_key: 'ck-HXkkSoWeJeAU7Kw3jwnh3kJrtJnoXMiVJ2iK4ceneX4v',
  tenant: 'ab77a1dd-1f90-4d59-8903-77d085a9643c',
  database: 'FIrst_db'
}
```

### Step 3: Start the Development Server

```bash
npm run dev
```

Navigate to: `http://localhost:3000/pages/nlp-query-interface`

### Step 4: Upload UFDR Data

1. Click **"Upload UFDR Data"** button
2. Select your UFDR file (JSON, XML, CSV, or TXT)
3. Wait for parsing and ingestion
4. Look for **"✓ RAG Enabled"** badge

### Step 5: Start Querying!

Try these example queries:

**Basic Search:**
```
Show me recent chat messages from the last 24 hours
```

**Specific Contact:**
```
Find all messages from John Doe
```

**Pattern Analysis:**
```
Analyze communication patterns and most active hours
```

**Follow-up Question:**
```
First: "Show me messages from Sarah"
Then: "What about their location during those calls?"
```

## 📋 Common Use Cases

### Use Case 1: Investigating a Contact

```
Step 1: "Show me all data related to John Doe"
Step 2: "What about their call history?"
Step 3: "Show me their location data"
Step 4: "Analyze their communication patterns"
```

### Use Case 2: Timeline Investigation

```
Step 1: "Create a timeline of March 15th"
Step 2: "What calls were made that day?"
Step 3: "Show me images from that time period"
Step 4: "What was the location during those activities?"
```

### Use Case 3: Pattern Analysis

```
Step 1: "Analyze communication patterns for last week"
Step 2: "What apps were used most frequently?"
Step 3: "Show me the most active contacts"
Step 4: "Compare this week with last week"
```

## 🎯 Quick Actions

Use the **Quick Actions** panel on the right side:

### Categories:
- **All**: View all available actions
- **Search**: Find specific data
- **Analysis**: Analyze patterns and trends
- **Filter**: Filter by criteria
- **Summary**: Get overviews

### Popular Actions:
1. **Recent Chat Messages** - Last 24 hours of chats
2. **Messages from Contact** - Search by contact name
3. **WhatsApp Messages** - Filter by platform
4. **Recent Phone Calls** - Today's call records
5. **Communication Patterns** - Analyze activity patterns

## 🔍 Query Tips

### Be Specific
❌ "Show me messages"
✅ "Show me WhatsApp messages from John in the last week"

### Use Natural Language
❌ "SELECT * FROM chats WHERE contact='John'"
✅ "Find all conversations with John"

### Follow-up Naturally
✅ First: "Show me messages from Sarah"
✅ Then: "What about their calls?"
✅ Then: "Show me their location"

### Include Context
✅ "Find images from New York last week"
✅ "Analyze call patterns during business hours"
✅ "Show me all WhatsApp messages about the project"

## 📊 Understanding Results

### Confidence Scores
- **90-100%**: High confidence, reliable results
- **70-89%**: Good confidence, verify if critical
- **50-69%**: Moderate confidence, review carefully
- **Below 50%**: Low confidence, may need refinement

### Data Types
- 🔵 **Chats**: Messages and conversations
- 🟢 **Calls**: Phone call records
- 🟡 **Images**: Photos and pictures
- 🔴 **Videos**: Video recordings
- 🟣 **Apps**: Application data

### Sources
Results show sources like:
- "WhatsApp - John Doe"
- "Call - Sarah Johnson"
- "Image - NYC_2024.jpg"

## 🛠️ Troubleshooting

### Issue: "No data loaded"
**Solution**: Upload UFDR data using the Upload button

### Issue: "RAG not enabled"
**Solution**: Wait for data ingestion to complete (check for ✓ RAG Enabled badge)

### Issue: "Low confidence results"
**Solution**: 
- Be more specific in your query
- Include time ranges or contact names
- Try rephrasing the question

### Issue: "No results found"
**Solution**:
- Check if data type exists in uploaded data
- Verify spelling of contact names
- Try broader search terms

### Issue: "API Error"
**Solution**:
- Check internet connection
- Verify API keys in .env.local
- Try again (automatic key rotation will use backup keys)

## 🎓 Learning Path

### Beginner (Day 1)
1. Upload sample UFDR data
2. Try basic search queries
3. Use Quick Actions
4. Explore different data types

### Intermediate (Day 2-3)
1. Practice follow-up questions
2. Use pattern analysis
3. Create timelines
4. Filter by multiple criteria

### Advanced (Day 4+)
1. Complex multi-criteria queries
2. Relationship mapping
3. Comparative analysis
4. Anomaly detection

## 📱 Mobile Usage

The interface is responsive and works on mobile devices:
- Swipe to scroll Quick Actions
- Tap to select actions
- Voice input supported (browser-dependent)

## 🔐 Privacy & Security

- All data processed locally first
- ChromaDB uses secure cloud connection
- Conversation data isolated by ID
- Automatic cleanup of old conversations (7 days)

## 📈 Performance Tips

### For Best Performance:
1. **Upload data once**: Don't re-upload unless data changes
2. **Use specific queries**: Faster than broad searches
3. **Leverage follow-ups**: Reuses context, faster processing
4. **Check confidence**: High confidence = faster results

### Optimize Queries:
- Include time ranges to limit search scope
- Specify data types when known
- Use contact names for targeted search
- Combine criteria for precision

## 🎨 UI Features

### Status Indicators
- ✅ **Green Badge**: Data loaded successfully
- 🔵 **Blue Badge**: Conversation ID active
- 🟢 **RAG Enabled**: Vector search active
- ⏳ **Processing**: Query in progress

### Visual Feedback
- **Confidence bars**: Color-coded by confidence level
- **Source badges**: Show data origins
- **Timestamp**: When message was sent
- **Data type icons**: Visual data type indicators

## 🔄 Workflow Example

### Complete Investigation Workflow

```
1. Upload Data
   ↓
2. Initial Query: "Give me a summary of all data"
   ↓
3. Focused Query: "Show me messages from John"
   ↓
4. Follow-up: "What about their call history?"
   ↓
5. Deep Dive: "Show me their location during those calls"
   ↓
6. Analysis: "Analyze communication patterns with John"
   ↓
7. Timeline: "Create a timeline of all interactions with John"
   ↓
8. Export: Download conversation for report
```

## 📞 Support & Resources

### Documentation
- `RAG_SYSTEM_DOCUMENTATION.md` - Complete technical docs
- `USAGE_EXAMPLES.md` - Detailed examples
- `IMPLEMENTATION_SUMMARY.md` - System overview

### Quick Links
- ChromaDB: https://docs.trychroma.com/
- Gemini API: https://ai.google.dev/docs
- Next.js: https://nextjs.org/docs

### Getting Help
1. Check documentation first
2. Review usage examples
3. Test with sample queries
4. Contact development team

## ✅ Checklist

Before starting your investigation:
- [ ] Development server running
- [ ] UFDR data uploaded
- [ ] RAG enabled (green badge visible)
- [ ] Conversation ID assigned
- [ ] Quick Actions panel visible
- [ ] Test query successful

## 🎉 You're Ready!

You now have a complete AI-powered UFDR analysis system with:
- ✅ RAG-based semantic search
- ✅ Intent classification
- ✅ Conversation tracking
- ✅ Follow-up question support
- ✅ Pattern analysis
- ✅ Timeline reconstruction
- ✅ Relationship mapping

**Start investigating with natural language queries!**

---

**Need Help?** Check the documentation or contact support.
**Found a Bug?** Report it to the development team.
**Have Feedback?** We'd love to hear from you!

