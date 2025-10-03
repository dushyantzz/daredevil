"use client"

import { useState, useEffect } from "react"
import { 
  Brain, 
  Search, 
  Filter, 
  TrendingUp, 
  Calendar,
  MapPin,
  User,
  Phone,
  Image,
  Video,
  Smartphone,
  MessageSquare,
  Clock,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"

interface QueryIntent {
  type: 'search' | 'filter' | 'analyze' | 'summarize' | 'compare' | 'timeline'
  dataType: 'chats' | 'calls' | 'images' | 'videos' | 'appData' | 'all'
  parameters: {
    keywords?: string[]
    timeRange?: string
    location?: string
    contact?: string
    platform?: string
    fileType?: string
    sortBy?: string
    limit?: number
  }
  confidence: number
}

interface QueryResult {
  answer: string
  confidence: number
  sources: string[]
  dataType: string
  relatedData: any[]
  suggestions: string[]
  metadata: {
    totalResults: number
    processingTime: number
    queryComplexity: 'simple' | 'medium' | 'complex'
  }
}

interface NLPQueryProcessorProps {
  query: string
  ufdrData: any
  onResult: (result: QueryResult) => void
  onError: (error: string) => void
}

export function NLPQueryProcessor({ query, ufdrData, onResult, onError }: NLPQueryProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingSteps, setProcessingSteps] = useState<string[]>([])

  // Enhanced NLP processing with intent recognition
  const processQuery = async (userQuery: string): Promise<QueryResult> => {
    setIsProcessing(true)
    setProcessingSteps(['Analyzing query intent...', 'Extracting parameters...', 'Searching data...', 'Generating response...'])

    try {
      const intent = await analyzeQueryIntent(userQuery)
      const result = await executeQuery(intent, userQuery)
      
      setProcessingSteps([])
      setIsProcessing(false)
      return result
    } catch (error) {
      setProcessingSteps([])
      setIsProcessing(false)
      throw error
    }
  }

  const analyzeQueryIntent = async (query: string): Promise<QueryIntent> => {
    const lowerQuery = query.toLowerCase()
    
    // Intent classification
    let intentType: QueryIntent['type'] = 'search'
    if (lowerQuery.includes('show') || lowerQuery.includes('find') || lowerQuery.includes('search')) {
      intentType = 'search'
    } else if (lowerQuery.includes('filter') || lowerQuery.includes('where') || lowerQuery.includes('from')) {
      intentType = 'filter'
    } else if (lowerQuery.includes('analyze') || lowerQuery.includes('compare') || lowerQuery.includes('vs')) {
      intentType = 'analyze'
    } else if (lowerQuery.includes('summary') || lowerQuery.includes('overview') || lowerQuery.includes('total')) {
      intentType = 'summarize'
    } else if (lowerQuery.includes('timeline') || lowerQuery.includes('when') || lowerQuery.includes('recent')) {
      intentType = 'timeline'
    }

    // Data type classification
    let dataType: QueryIntent['dataType'] = 'all'
    if (lowerQuery.includes('chat') || lowerQuery.includes('message') || lowerQuery.includes('conversation')) {
      dataType = 'chats'
    } else if (lowerQuery.includes('call') || lowerQuery.includes('phone')) {
      dataType = 'calls'
    } else if (lowerQuery.includes('image') || lowerQuery.includes('photo') || lowerQuery.includes('picture')) {
      dataType = 'images'
    } else if (lowerQuery.includes('video') || lowerQuery.includes('recording')) {
      dataType = 'videos'
    } else if (lowerQuery.includes('app') || lowerQuery.includes('application')) {
      dataType = 'appData'
    }

    // Parameter extraction
    const parameters: QueryIntent['parameters'] = {}
    
    // Extract keywords
    const keywords = query.split(' ').filter(word => 
      word.length > 2 && 
      !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(word.toLowerCase())
    )
    if (keywords.length > 0) parameters.keywords = keywords

    // Extract time references
    if (lowerQuery.includes('today')) parameters.timeRange = 'today'
    else if (lowerQuery.includes('yesterday')) parameters.timeRange = 'yesterday'
    else if (lowerQuery.includes('week') || lowerQuery.includes('recent')) parameters.timeRange = 'week'
    else if (lowerQuery.includes('month')) parameters.timeRange = 'month'
    else if (lowerQuery.includes('year')) parameters.timeRange = 'year'

    // Extract location references
    const locationKeywords = ['location', 'where', 'place', 'city', 'address']
    const locationMatch = locationKeywords.find(keyword => lowerQuery.includes(keyword))
    if (locationMatch) parameters.location = 'any'

    // Extract contact references
    const contactPattern = /(?:from|to|with|contact)\s+([a-zA-Z\s]+)/i
    const contactMatch = query.match(contactPattern)
    if (contactMatch) parameters.contact = contactMatch[1].trim()

    // Extract platform references
    const platforms = ['whatsapp', 'telegram', 'signal', 'sms', 'imessage', 'facebook', 'instagram']
    const platformMatch = platforms.find(platform => lowerQuery.includes(platform))
    if (platformMatch) parameters.platform = platformMatch

    // Calculate confidence
    let confidence = 0.5
    if (dataType !== 'all') confidence += 0.2
    if (parameters.keywords && parameters.keywords.length > 0) confidence += 0.1
    if (parameters.timeRange) confidence += 0.1
    if (parameters.contact) confidence += 0.1
    if (parameters.platform) confidence += 0.1

    return {
      type: intentType,
      dataType,
      parameters,
      confidence: Math.min(confidence, 1.0)
    }
  }

  const executeQuery = async (intent: QueryIntent, originalQuery: string): Promise<QueryResult> => {
    const startTime = Date.now()
    let results: any[] = []
    let answer = ""
    let sources: string[] = []
    let suggestions: string[] = []

    switch (intent.type) {
      case 'search':
        results = await performSearch(intent)
        answer = generateSearchAnswer(results, intent, originalQuery)
        break
      case 'filter':
        results = await performFilter(intent)
        answer = generateFilterAnswer(results, intent, originalQuery)
        break
      case 'analyze':
        results = await performAnalysis(intent)
        answer = generateAnalysisAnswer(results, intent, originalQuery)
        break
      case 'summarize':
        results = await performSummary(intent)
        answer = generateSummaryAnswer(results, intent, originalQuery)
        break
      case 'timeline':
        results = await performTimelineAnalysis(intent)
        answer = generateTimelineAnswer(results, intent, originalQuery)
        break
      default:
        results = await performSearch(intent)
        answer = generateSearchAnswer(results, intent, originalQuery)
    }

    // Generate sources
    sources = results.slice(0, 5).map(item => {
      if (item.platform) return `${item.platform} - ${item.contact || item.filename}`
      if (item.filename) return `File - ${item.filename}`
      if (item.appName) return `App - ${item.appName}`
      return 'Data Record'
    })

    // Generate suggestions
    suggestions = generateSuggestions(intent, results)

    const processingTime = Date.now() - startTime
    const queryComplexity = results.length > 100 ? 'complex' : results.length > 20 ? 'medium' : 'simple'

    return {
      answer,
      confidence: intent.confidence,
      sources,
      dataType: intent.dataType,
      relatedData: results.slice(0, 10),
      suggestions,
      metadata: {
        totalResults: results.length,
        processingTime,
        queryComplexity
      }
    }
  }

  const performSearch = async (intent: QueryIntent): Promise<any[]> => {
    let data: any[] = []
    
    if (intent.dataType === 'all' || intent.dataType === 'chats') {
      data = [...data, ...(ufdrData?.chats || [])]
    }
    if (intent.dataType === 'all' || intent.dataType === 'calls') {
      data = [...data, ...(ufdrData?.calls || [])]
    }
    if (intent.dataType === 'all' || intent.dataType === 'images') {
      data = [...data, ...(ufdrData?.images || [])]
    }
    if (intent.dataType === 'all' || intent.dataType === 'videos') {
      data = [...data, ...(ufdrData?.videos || [])]
    }
    if (intent.dataType === 'all' || intent.dataType === 'appData') {
      data = [...data, ...(ufdrData?.appData || [])]
    }

    // Apply keyword filtering
    if (intent.parameters.keywords) {
      data = data.filter(item => {
        const searchableText = [
          item.message,
          item.contact,
          item.filename,
          item.appName,
          item.platform,
          item.location
        ].filter(Boolean).join(' ').toLowerCase()
        
        return intent.parameters.keywords!.some(keyword => 
          searchableText.includes(keyword.toLowerCase())
        )
      })
    }

    // Apply contact filtering
    if (intent.parameters.contact) {
      data = data.filter(item => 
        item.contact?.toLowerCase().includes(intent.parameters.contact!.toLowerCase())
      )
    }

    // Apply platform filtering
    if (intent.parameters.platform) {
      data = data.filter(item => 
        item.platform?.toLowerCase().includes(intent.parameters.platform!.toLowerCase())
      )
    }

    // Apply time filtering
    if (intent.parameters.timeRange) {
      const now = new Date()
      const timeRanges = {
        today: 24 * 60 * 60 * 1000,
        yesterday: 2 * 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        year: 365 * 24 * 60 * 60 * 1000
      }
      
      const timeLimit = timeRanges[intent.parameters.timeRange as keyof typeof timeRanges]
      if (timeLimit) {
        data = data.filter(item => {
          const itemTime = new Date(item.timestamp).getTime()
          return (now.getTime() - itemTime) <= timeLimit
        })
      }
    }

    return data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  const performFilter = async (intent: QueryIntent): Promise<any[]> => {
    return performSearch(intent) // Similar to search but with different answer generation
  }

  const performAnalysis = async (intent: QueryIntent): Promise<any[]> => {
    const data = await performSearch(intent)
    
    // Perform statistical analysis
    const analysis = {
      totalCount: data.length,
      byType: data.reduce((acc: any, item) => {
        const type = item.platform || item.appName || 'Unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {}),
      timeDistribution: data.reduce((acc: any, item) => {
        const hour = new Date(item.timestamp).getHours()
        acc[hour] = (acc[hour] || 0) + 1
        return acc
      }, {}),
      locationDistribution: data.reduce((acc: any, item) => {
        if (item.location) {
          acc[item.location] = (acc[item.location] || 0) + 1
        }
        return acc
      }, {})
    }

    return [analysis, ...data.slice(0, 5)]
  }

  const performSummary = async (intent: QueryIntent): Promise<any[]> => {
    const data = await performSearch(intent)
    return data
  }

  const performTimelineAnalysis = async (intent: QueryIntent): Promise<any[]> => {
    const data = await performSearch(intent)
    return data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  const generateSearchAnswer = (results: any[], intent: QueryIntent, originalQuery: string): string => {
    if (results.length === 0) {
      return `No results found for "${originalQuery}". Try adjusting your search terms or check if the data type is correct.`
    }

    const dataTypeName = intent.dataType === 'all' ? 'records' : intent.dataType
    const topResult = results[0]
    
    let answer = `Found ${results.length} ${dataTypeName} matching your query. `
    
    if (topResult.message) {
      answer += `Most recent message: "${topResult.message.substring(0, 100)}..." from ${topResult.contact} on ${topResult.platform}.`
    } else if (topResult.filename) {
      answer += `Most recent file: ${topResult.filename} (${formatFileSize(topResult.size || 0)}).`
    } else if (topResult.contact) {
      answer += `Most recent activity with ${topResult.contact} (${topResult.type || 'unknown type'}).`
    }

    return answer
  }

  const generateFilterAnswer = (results: any[], intent: QueryIntent, originalQuery: string): string => {
    if (results.length === 0) {
      return `No data matches your filter criteria for "${originalQuery}".`
    }

    const dataTypeName = intent.dataType === 'all' ? 'records' : intent.dataType
    return `Filtered ${results.length} ${dataTypeName} based on your criteria. ${results.length > 5 ? 'Showing top 5 results.' : ''}`
  }

  const generateAnalysisAnswer = (results: any[], intent: QueryIntent, originalQuery: string): string => {
    if (results.length === 0) {
      return `No data available for analysis of "${originalQuery}".`
    }

    const analysis = results[0]
    if (analysis.totalCount) {
      return `Analysis of ${analysis.totalCount} records: ${Object.keys(analysis.byType).length} different types found. Most active time: ${getMostActiveHour(analysis.timeDistribution)}. ${Object.keys(analysis.locationDistribution).length > 0 ? `Locations: ${Object.keys(analysis.locationDistribution).slice(0, 3).join(', ')}.` : ''}`
    }

    return `Analyzed ${results.length} records for "${originalQuery}".`
  }

  const generateSummaryAnswer = (results: any[], intent: QueryIntent, originalQuery: string): string => {
    if (results.length === 0) {
      return `No data available for summary of "${originalQuery}".`
    }

    const dataTypeName = intent.dataType === 'all' ? 'records' : intent.dataType
    const totalSize = results.reduce((sum, item) => sum + (item.size || 0), 0)
    const uniqueContacts = new Set(results.map(item => item.contact).filter(Boolean)).size
    const uniquePlatforms = new Set(results.map(item => item.platform).filter(Boolean)).size

    return `Summary of ${results.length} ${dataTypeName}: ${totalSize > 0 ? `Total size: ${formatFileSize(totalSize)}. ` : ''}${uniqueContacts > 0 ? `${uniqueContacts} unique contacts. ` : ''}${uniquePlatforms > 0 ? `${uniquePlatforms} different platforms. ` : ''}Time range: ${new Date(Math.min(...results.map(item => new Date(item.timestamp).getTime()))).toLocaleDateString()} to ${new Date(Math.max(...results.map(item => new Date(item.timestamp).getTime()))).toLocaleDateString()}.`
  }

  const generateTimelineAnswer = (results: any[], intent: QueryIntent, originalQuery: string): string => {
    if (results.length === 0) {
      return `No timeline data available for "${originalQuery}".`
    }

    const firstActivity = results[0]
    const lastActivity = results[results.length - 1]
    const timeSpan = new Date(lastActivity.timestamp).getTime() - new Date(firstActivity.timestamp).getTime()
    const daysSpan = Math.ceil(timeSpan / (24 * 60 * 60 * 1000))

    return `Timeline analysis: ${results.length} activities over ${daysSpan} days. First activity: ${new Date(firstActivity.timestamp).toLocaleDateString()}. Last activity: ${new Date(lastActivity.timestamp).toLocaleDateString()}. Most active period: ${getMostActivePeriod(results)}.`
  }

  const generateSuggestions = (intent: QueryIntent, results: any[]): string[] => {
    const suggestions: string[] = []
    
    if (results.length === 0) {
      suggestions.push("Try a broader search term")
      suggestions.push("Check if the data type is correct")
      suggestions.push("Search for recent activity")
    } else if (results.length > 50) {
      suggestions.push("Add more specific filters")
      suggestions.push("Search by time range")
      suggestions.push("Filter by contact or platform")
    } else {
      suggestions.push("Show more details")
      suggestions.push("Analyze patterns")
      suggestions.push("Export results")
    }

    return suggestions
  }

  const getMostActiveHour = (timeDistribution: any): string => {
    const hour = Object.entries(timeDistribution).reduce((max, [hour, count]) => 
      count > max.count ? { hour, count } : max, { hour: '0', count: 0 }
    )
    return `${hour.hour}:00`
  }

  const getMostActivePeriod = (results: any[]): string => {
    const hourlyCounts = results.reduce((acc: any, item) => {
      const hour = new Date(item.timestamp).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {})

    const peakHour = Object.entries(hourlyCounts).reduce((max, [hour, count]) => 
      count > max.count ? { hour, count } : max, { hour: '0', count: 0 }
    )

    return `${peakHour.hour}:00-${parseInt(peakHour.hour) + 1}:00`
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Process query when component receives new query
  useEffect(() => {
    if (query && ufdrData) {
      processQuery(query)
        .then(onResult)
        .catch(onError)
    }
  }, [query, ufdrData])

  return (
    <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-purple-500" />
        <h3 className="text-lg font-semibold">NLP Query Processor</h3>
        {isProcessing && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
      </div>
      
      {isProcessing && (
        <div className="space-y-2">
          {processingSteps.map((step, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              {step}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
