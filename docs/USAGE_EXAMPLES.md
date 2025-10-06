# UFDR RAG System - Usage Examples

## Table of Contents
1. [Basic Queries](#basic-queries)
2. [Follow-up Questions](#follow-up-questions)
3. [Pattern Analysis](#pattern-analysis)
4. [Timeline Reconstruction](#timeline-reconstruction)
5. [Relationship Mapping](#relationship-mapping)
6. [Advanced Queries](#advanced-queries)

## Basic Queries

### Example 1: Search for Recent Messages

**Query:** "Show me recent chat messages from the last 24 hours"

**Expected Response:**
```
Found 45 chat messages from the last 24 hours. Most recent from Sarah Johnson on WhatsApp at 2:30 PM. 
The messages include conversations about the meeting scheduled for tomorrow and project updates.

Sources: WhatsApp - Sarah Johnson, Telegram - Mike Chen, WhatsApp - Alex Brown
Confidence: 85%
```

### Example 2: Find Calls to Specific Contact

**Query:** "What calls were made to John Doe?"

**Expected Response:**
```
Found 8 call records with John Doe. Total duration: 45 minutes. 
Most recent call was outgoing on March 15, 2024 at 3:45 PM, lasting 12 minutes.

Sources: Call - John Doe (Outgoing), Call - John Doe (Incoming)
Confidence: 90%
```

### Example 3: Search Images by Location

**Query:** "Find images from New York"

**Expected Response:**
```
Found 23 images with location data from New York. Total size: 45 MB. 
Most recent: IMG_2024_0315.jpg taken on March 15, 2024.

Sources: Image - IMG_2024_0315.jpg, Image - NYC_Skyline.jpg
Confidence: 80%
```

## Follow-up Questions

### Scenario 1: Contact-based Follow-up

**Initial Query:** "Show me messages from Sarah"

**Response:**
```
Found 32 messages from Sarah Johnson. Most recent on WhatsApp discussing the project deadline.
```

**Follow-up Query:** "What about their location during those calls?"

**Resolved Query:** "What about Sarah Johnson's location during those calls?"

**Response:**
```
Based on the previous conversation about Sarah Johnson, I found location data for 5 calls:
- 3 calls from New York, NY
- 2 calls from Boston, MA

The most recent call from New York was on March 14, 2024.
```

### Scenario 2: Data Type Follow-up

**Initial Query:** "Analyze WhatsApp messages from last week"

**Response:**
```
Analyzed 156 WhatsApp messages from the last week. Peak activity on Wednesday with 45 messages.
Top contacts: Sarah (23 messages), Mike (18 messages), Alex (15 messages).
```

**Follow-up Query:** "Show me those from Sarah"

**Resolved Query:** "Show me WhatsApp messages from Sarah from last week"

**Response:**
```
Here are the 23 WhatsApp messages from Sarah during last week:
- 8 messages about project planning
- 7 messages about meeting schedules
- 5 messages about budget discussions
- 3 casual conversations
```

### Scenario 3: Time-based Follow-up

**Initial Query:** "What happened on March 15th?"

**Response:**
```
On March 15, 2024, there were:
- 12 chat messages
- 3 phone calls
- 5 images captured
- 2 videos recorded
- 8 app activities logged
```

**Follow-up Query:** "What about the calls?"

**Resolved Query:** "What about the phone calls on March 15th?"

**Response:**
```
The 3 phone calls on March 15th were:
1. Outgoing call to John Doe at 9:30 AM (8 minutes)
2. Incoming call from Sarah Johnson at 2:15 PM (15 minutes)
3. Outgoing call to Mike Chen at 5:45 PM (6 minutes)
```

## Pattern Analysis

### Example 1: Communication Patterns

**Query:** "Analyze communication patterns and most active hours"

**Expected Response:**
```
Communication Pattern Analysis:

Peak Activity Hours:
- 9:00 AM - 11:00 AM: 35% of messages
- 2:00 PM - 4:00 PM: 28% of messages
- 7:00 PM - 9:00 PM: 22% of messages

Most Active Days:
- Wednesday: 156 messages
- Tuesday: 142 messages
- Thursday: 138 messages

Communication Breakdown:
- WhatsApp: 45%
- Telegram: 30%
- SMS: 15%
- Other: 10%

Confidence: 95%
```

### Example 2: App Usage Patterns

**Query:** "What apps were used most frequently?"

**Expected Response:**
```
App Usage Analysis:

Top 5 Most Used Apps:
1. WhatsApp - 234 sessions, 12.5 hours total
2. Chrome Browser - 189 sessions, 8.3 hours total
3. Gmail - 156 sessions, 4.2 hours total
4. Instagram - 98 sessions, 6.7 hours total
5. Maps - 67 sessions, 2.1 hours total

Usage Patterns:
- Social Media: 40% of app time
- Productivity: 35% of app time
- Entertainment: 15% of app time
- Utilities: 10% of app time

Confidence: 85%
```

## Timeline Reconstruction

### Example 1: Daily Timeline

**Query:** "Create a timeline of all activities on March 15th"

**Expected Response:**
```
Timeline for March 15, 2024:

08:30 AM - WhatsApp message to Sarah: "Good morning, ready for the meeting?"
09:15 AM - Gmail app opened (15 minutes)
09:30 AM - Outgoing call to John Doe (8 minutes)
10:00 AM - Location: Office Building, New York
11:30 AM - Image captured: IMG_2024_0315_001.jpg
12:15 PM - WhatsApp message from Mike: "Lunch at the usual place?"
02:15 PM - Incoming call from Sarah Johnson (15 minutes)
03:30 PM - Video recorded: VID_20240315_1530.mp4
05:45 PM - Outgoing call to Mike Chen (6 minutes)
07:00 PM - Location: Home, Brooklyn
08:30 PM - Instagram app opened (45 minutes)

Total Activities: 18 events
Confidence: 90%
```

### Example 2: Week Timeline

**Query:** "Show me a timeline of activities from last week"

**Expected Response:**
```
Weekly Timeline (March 8-15, 2024):

Monday, March 8:
- 23 messages, 2 calls, 3 images
- Peak activity: 2:00 PM - 4:00 PM

Tuesday, March 9:
- 34 messages, 4 calls, 5 images, 1 video
- Peak activity: 10:00 AM - 12:00 PM

[... continues for each day ...]

Key Events:
- March 10: Important meeting (multiple calls and messages)
- March 12: Travel day (location changes, photos)
- March 14: High communication volume (45 messages)

Confidence: 88%
```

## Relationship Mapping

### Example 1: Contact Network

**Query:** "Show me the relationship network between contacts"

**Expected Response:**
```
Contact Relationship Analysis:

Primary Contact: Sarah Johnson
- Direct messages: 45
- Calls: 8
- Shared group chats: 3
- Connected contacts: Mike Chen, Alex Brown

Secondary Contacts:
- Mike Chen: 32 messages, 5 calls
  - Mutual contacts: Sarah Johnson, Alex Brown
- Alex Brown: 28 messages, 3 calls
  - Mutual contacts: Sarah Johnson, Mike Chen

Communication Clusters:
1. Work Group: Sarah, Mike, Alex (156 messages)
2. Family Group: Mom, Dad, Sister (89 messages)
3. Friends Group: Tom, Jerry, Lisa (67 messages)

Confidence: 82%
```

### Example 2: Communication Flow

**Query:** "Analyze the communication flow between John and Sarah"

**Expected Response:**
```
Communication Flow Analysis: John Doe ↔ Sarah Johnson

Total Interactions: 67
- Messages: 45 (John → Sarah: 23, Sarah → John: 22)
- Calls: 12 (John → Sarah: 7, Sarah → John: 5)
- Group interactions: 10

Communication Pattern:
- Initiated by John: 55%
- Initiated by Sarah: 45%

Response Time:
- John's avg response: 12 minutes
- Sarah's avg response: 8 minutes

Peak Communication Times:
- Morning (9-11 AM): 35%
- Afternoon (2-4 PM): 40%
- Evening (7-9 PM): 25%

Topics Discussed:
- Work/Projects: 60%
- Personal: 25%
- Planning/Scheduling: 15%

Confidence: 87%
```

## Advanced Queries

### Example 1: Multi-criteria Search

**Query:** "Find all WhatsApp messages from Sarah in New York during last week about the project"

**Expected Response:**
```
Advanced Search Results:

Criteria:
- Platform: WhatsApp
- Contact: Sarah Johnson
- Location: New York
- Time: Last week (March 8-15)
- Topic: Project-related

Found 18 matching messages:

March 10, 2:30 PM (New York):
"The project deadline needs to be moved to next Friday"

March 12, 10:15 AM (New York):
"Can we schedule a project review meeting?"

[... more messages ...]

Summary:
- 18 messages found
- 12 about project deadlines
- 4 about project meetings
- 2 about project budget

Confidence: 91%
```

### Example 2: Comparative Analysis

**Query:** "Compare communication frequency between March and February"

**Expected Response:**
```
Comparative Analysis: March vs February 2024

Messages:
- March: 456 messages (+23% from February)
- February: 371 messages

Calls:
- March: 67 calls (+15% from February)
- February: 58 calls

Images:
- March: 89 images (+45% from February)
- February: 61 images

Top Contacts (March vs February):
1. Sarah Johnson: 89 vs 67 (+33%)
2. Mike Chen: 67 vs 72 (-7%)
3. Alex Brown: 54 vs 45 (+20%)

Activity Trends:
- Overall communication increased by 21%
- WhatsApp usage increased by 28%
- Call duration increased by 12%

Confidence: 93%
```

### Example 3: Anomaly Detection

**Query:** "Find unusual patterns or anomalies in the data"

**Expected Response:**
```
Anomaly Detection Report:

Detected Anomalies:

1. Unusual Activity Spike
   - Date: March 12, 2024
   - Activity: 3x normal message volume
   - Contacts: Multiple new contacts
   - Recommendation: Review for context

2. Location Anomaly
   - Date: March 14, 2024
   - Pattern: Rapid location changes (5 cities in 2 hours)
   - Possible explanation: Travel or data error

3. Communication Gap
   - Period: March 8-9, 2024
   - Pattern: No activity for 18 hours (unusual for this user)
   - Previous average: Activity every 2-3 hours

4. New Contact Pattern
   - Contact: Unknown Number (+1-555-0123)
   - First contact: March 13, 2024
   - Frequency: 15 messages in 2 days (high for new contact)

Confidence: 78%
```

## Tips for Effective Queries

1. **Be Specific**: Include time ranges, contacts, or platforms when known
2. **Use Natural Language**: Ask questions as you would to a human
3. **Follow-up Naturally**: Reference previous queries using pronouns
4. **Combine Criteria**: Use multiple filters for precise results
5. **Ask for Analysis**: Request patterns, trends, or summaries
6. **Verify Results**: Check confidence scores and sources

## Query Templates

- "Show me [data type] from [contact] in [location] during [time range]"
- "Analyze [pattern type] for [time period]"
- "Create a timeline of [activities] on [date]"
- "Compare [metric] between [period 1] and [period 2]"
- "Find relationships between [contact 1] and [contact 2]"
- "What about [pronoun reference]?" (for follow-ups)

