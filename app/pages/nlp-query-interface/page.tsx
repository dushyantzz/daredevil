"use client"

import { useState, useEffect, useRef } from "react"
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  FileText, 
  Database, 
  Search,
  Loader2,
  Upload,
  X,
  Download,
  Filter,
  Calendar,
  MapPin,
  Phone,
  Image,
  Video,
  Smartphone,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { UFDRDataParser } from "@/components/ufdr-data-parser"
import { NLPQuickActions } from "@/components/nlp-quick-actions"

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  dataType?: string
  confidence?: number
  sources?: string[]
}

interface UFDRData {
  chats: any[]
  calls: any[]
  images: any[]
  videos: any[]
  appData: any[]
  metadata: {
    totalSize: string
    deviceInfo: string
    extractionDate: string
    dataTypes: string[]
  }
}

interface QueryResult {
  answer: string
  confidence: number
  sources: string[]
  dataType: string
  relatedData: any[]
}

export default function NLPQueryInterfacePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [ufdrData, setUfdrData] = useState<UFDRData | null>(null)
  const [selectedDataType, setSelectedDataType] = useState<string>("all")
  const [showDataParser, setShowDataParser] = useState(false)
  const [queryHistory, setQueryHistory] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'assistant',
        content: "Hello! I'm your UFDR Analysis Assistant. I can help you query and analyze forensic data including chats, calls, images, videos, and app data. Upload your UFDR files or ask me questions about the data!",
        timestamp: new Date()
      }])
    }
  }, [])

  const processNLPQuery = async (query: string): Promise<QueryResult> => {
    // Simulate NLP processing with mock responses
    const lowerQuery = query.toLowerCase()
    
    // Chat-related queries
    if (lowerQuery.includes('chat') || lowerQuery.includes('message') || lowerQuery.includes('conversation')) {
      const chatResults = ufdrData?.chats.filter(chat => 
        chat.message.toLowerCase().includes(query.toLowerCase()) ||
        chat.contact.toLowerCase().includes(query.toLowerCase()) ||
        chat.platform.toLowerCase().includes(query.toLowerCase())
      ) || []
      
      return {
        answer: `Found ${chatResults.length} chat messages related to your query. ${chatResults.length > 0 ? `Most recent from ${chatResults[0]?.contact} on ${chatResults[0]?.platform}.` : 'No matching chat messages found.'}`,
        confidence: 0.85,
        sources: chatResults.slice(0, 3).map(chat => `${chat.platform} - ${chat.contact}`),
        dataType: 'chats',
        relatedData: chatResults.slice(0, 5)
      }
    }
    
    // Call-related queries
    if (lowerQuery.includes('call') || lowerQuery.includes('phone') || lowerQuery.includes('duration')) {
      const callResults = ufdrData?.calls.filter(call => 
        call.contact.toLowerCase().includes(query.toLowerCase()) ||
        call.type.toLowerCase().includes(query.toLowerCase())
      ) || []
      
      const totalDuration = callResults.reduce((sum, call) => sum + call.duration, 0)
      
      return {
        answer: `Found ${callResults.length} call records. Total duration: ${Math.floor(totalDuration / 60)} minutes. ${callResults.length > 0 ? `Most recent call with ${callResults[0]?.contact} (${callResults[0]?.type}).` : 'No matching call records found.'}`,
        confidence: 0.90,
        sources: callResults.slice(0, 3).map(call => `Call - ${call.contact}`),
        dataType: 'calls',
        relatedData: callResults.slice(0, 5)
      }
    }
    
    // Image-related queries
    if (lowerQuery.includes('image') || lowerQuery.includes('photo') || lowerQuery.includes('picture')) {
      const imageResults = ufdrData?.images.filter(img => 
        img.filename.toLowerCase().includes(query.toLowerCase()) ||
        img.location?.toLowerCase().includes(query.toLowerCase())
      ) || []
      
      return {
        answer: `Found ${imageResults.length} images. ${imageResults.length > 0 ? `Total size: ${Math.round(imageResults.reduce((sum, img) => sum + img.size, 0) / 1024 / 1024)} MB. Most recent: ${imageResults[0]?.filename}.` : 'No matching images found.'}`,
        confidence: 0.80,
        sources: imageResults.slice(0, 3).map(img => `Image - ${img.filename}`),
        dataType: 'images',
        relatedData: imageResults.slice(0, 5)
      }
    }
    
    // Video-related queries
    if (lowerQuery.includes('video') || lowerQuery.includes('recording') || lowerQuery.includes('clip')) {
      const videoResults = ufdrData?.videos.filter(vid => 
        vid.filename.toLowerCase().includes(query.toLowerCase()) ||
        vid.location?.toLowerCase().includes(query.toLowerCase())
      ) || []
      
      return {
        answer: `Found ${videoResults.length} videos. ${videoResults.length > 0 ? `Total duration: ${Math.floor(videoResults.reduce((sum, vid) => sum + vid.duration, 0) / 60)} minutes. Most recent: ${videoResults[0]?.filename}.` : 'No matching videos found.'}`,
        confidence: 0.85,
        sources: videoResults.slice(0, 3).map(vid => `Video - ${vid.filename}`),
        dataType: 'videos',
        relatedData: videoResults.slice(0, 5)
      }
    }
    
    // App-related queries
    if (lowerQuery.includes('app') || lowerQuery.includes('application') || lowerQuery.includes('software')) {
      const appResults = ufdrData?.appData.filter(app => 
        app.appName.toLowerCase().includes(query.toLowerCase()) ||
        app.category.toLowerCase().includes(query.toLowerCase())
      ) || []
      
      return {
        answer: `Found ${appResults.length} app records. ${appResults.length > 0 ? `Most used apps: ${[...new Set(appResults.map(app => app.appName))].slice(0, 3).join(', ')}.` : 'No matching app data found.'}`,
        confidence: 0.75,
        sources: appResults.slice(0, 3).map(app => `App - ${app.appName}`),
        dataType: 'appData',
        relatedData: appResults.slice(0, 5)
      }
    }
    
    // Location-related queries
    if (lowerQuery.includes('location') || lowerQuery.includes('where') || lowerQuery.includes('place')) {
      const allData = [
        ...(ufdrData?.chats.filter(chat => chat.location) || []),
        ...(ufdrData?.calls.filter(call => call.location) || []),
        ...(ufdrData?.images.filter(img => img.location) || []),
        ...(ufdrData?.videos.filter(vid => vid.location) || [])
      ]
      
      const locationCounts = allData.reduce((acc: { [key: string]: number }, item) => {
        acc[item.location] = (acc[item.location] || 0) + 1
        return acc
      }, {})
      
      const topLocations = Object.entries(locationCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
      
      return {
        answer: `Found location data for ${Object.keys(locationCounts).length} different places. Most frequent locations: ${topLocations.map(([loc, count]) => `${loc} (${count} activities)`).join(', ')}.`,
        confidence: 0.70,
        sources: topLocations.map(([loc]) => `Location - ${loc}`),
        dataType: 'location',
        relatedData: allData.slice(0, 5)
      }
    }
    
    // Time-related queries
    if (lowerQuery.includes('when') || lowerQuery.includes('time') || lowerQuery.includes('date') || lowerQuery.includes('recent')) {
      const allData = [
        ...(ufdrData?.chats || []),
        ...(ufdrData?.calls || []),
        ...(ufdrData?.images || []),
        ...(ufdrData?.videos || [])
      ]
      
      const recentData = allData
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5)
      
      return {
        answer: `Found ${allData.length} total records. Most recent activity: ${recentData[0] ? new Date(recentData[0].timestamp).toLocaleDateString() : 'No data available'}. Recent activities include ${recentData.slice(0, 3).map(item => item.filename || item.message?.substring(0, 30) || 'Unknown').join(', ')}.`,
        confidence: 0.80,
        sources: recentData.slice(0, 3).map(item => `Recent - ${item.filename || 'Activity'}`),
        dataType: 'timeline',
        relatedData: recentData
      }
    }
    
    // General summary queries
    if (lowerQuery.includes('summary') || lowerQuery.includes('overview') || lowerQuery.includes('total')) {
      const totalChats = ufdrData?.chats.length || 0
      const totalCalls = ufdrData?.calls.length || 0
      const totalImages = ufdrData?.images.length || 0
      const totalVideos = ufdrData?.videos.length || 0
      const totalApps = ufdrData?.appData.length || 0
      
      return {
        answer: `UFDR Data Summary: ${totalChats} chat messages, ${totalCalls} call records, ${totalImages} images, ${totalVideos} videos, and ${totalApps} app records. Total data size: ${ufdrData?.metadata.totalSize || 'Unknown'}. Device: ${ufdrData?.metadata.deviceInfo || 'Unknown'}.`,
        confidence: 0.95,
        sources: ['UFDR Metadata'],
        dataType: 'summary',
        relatedData: []
      }
    }
    
    // Default response for unrecognized queries
    return {
      answer: "I understand you're asking about the UFDR data, but I need more specific information. Try asking about chats, calls, images, videos, apps, locations, or time periods. For example: 'Show me recent chat messages' or 'What calls were made to John?'",
      confidence: 0.30,
      sources: [],
      dataType: 'general',
      relatedData: []
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setQueryHistory(prev => [...prev, inputMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const result = await processNLPQuery(inputMessage)
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.answer,
        timestamp: new Date(),
        dataType: result.dataType,
        confidence: result.confidence,
        sources: result.sources
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error processing your query. Please try again or rephrase your question.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getDataTypeIcon = (dataType?: string) => {
    switch (dataType) {
      case 'chats': return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'calls': return <Phone className="h-4 w-4 text-green-500" />
      case 'images': return <Image className="h-4 w-4 text-yellow-500" />
      case 'videos': return <Video className="h-4 w-4 text-red-500" />
      case 'appData': return <Smartphone className="h-4 w-4 text-purple-500" />
      case 'location': return <MapPin className="h-4 w-4 text-orange-500" />
      case 'timeline': return <Clock className="h-4 w-4 text-cyan-500" />
      case 'summary': return <BarChart3 className="h-4 w-4 text-indigo-500" />
      default: return <Database className="h-4 w-4 text-gray-500" />
    }
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-400'
    if (confidence >= 0.8) return 'text-green-400'
    if (confidence >= 0.6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` : `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold mb-4 text-center text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]">
            Advanced NLP Query Interface
          </h1>
          <p className="text-center text-gray-400 text-lg">
            Chat with your UFDR data using natural language queries
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => setShowDataParser(!showDataParser)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {showDataParser ? 'Hide Parser' : 'Upload UFDR Data'}
          </Button>
          <select
            value={selectedDataType}
            onChange={(e) => setSelectedDataType(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-full focus:ring-2 focus:ring-white focus:border-transparent"
          >
            <option value="all">All Data Types</option>
            <option value="chats">Chats</option>
            <option value="calls">Calls</option>
            <option value="images">Images</option>
            <option value="videos">Videos</option>
            <option value="appData">App Data</option>
          </select>
        </div>

        {/* Data Parser */}
        {showDataParser && (
          <div className="mb-8">
            <UFDRDataParser onDataParsed={setUfdrData} />
          </div>
        )}

        {/* Data Status */}
        {ufdrData && (
          <div className="mb-6 bg-zinc-900 rounded-lg p-4 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">UFDR Data Loaded</span>
                <Badge variant="secondary">{ufdrData.metadata.totalSize}</Badge>
                <Badge variant="outline">{ufdrData.metadata.dataTypes.length} data types</Badge>
              </div>
              <div className="text-sm text-gray-400">
                {ufdrData.chats.length + ufdrData.calls.length + ufdrData.images.length + ufdrData.videos.length + ufdrData.appData.length} total records
              </div>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Messages */}
          <div className="lg:col-span-3">
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-800 text-white border border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {message.type === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                        <span className="text-xs text-gray-400">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        {message.dataType && getDataTypeIcon(message.dataType)}
                        {message.confidence && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getConfidenceColor(message.confidence)}`}
                          >
                            {Math.round(message.confidence * 100)}% confidence
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-zinc-700">
                          <p className="text-xs text-gray-400 mb-1">Sources:</p>
                          <div className="flex flex-wrap gap-1">
                            {message.sources.map((source, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {source}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-400">Processing your query...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-zinc-800">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your UFDR data..."
                    className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 focus:ring-2 focus:ring-white focus:border-transparent"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-6"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <NLPQuickActions 
              onQuerySelect={setInputMessage}
              recentQueries={queryHistory}
              favoriteQueries={[]}
            />

            {/* Data Overview */}
            {ufdrData && (
              <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Database className="h-5 w-5 mr-2 text-green-500" />
                  Data Overview
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Chats</span>
                    </div>
                    <Badge variant="secondary">{ufdrData.chats.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Calls</span>
                    </div>
                    <Badge variant="secondary">{ufdrData.calls.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Images</span>
                    </div>
                    <Badge variant="secondary">{ufdrData.images.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Videos</span>
                    </div>
                    <Badge variant="secondary">{ufdrData.videos.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">App Data</span>
                    </div>
                    <Badge variant="secondary">{ufdrData.appData.length}</Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Query History */}
            {queryHistory.length > 0 && (
              <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-purple-500" />
                  Recent Queries
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {queryHistory.slice(-5).reverse().map((query, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => setInputMessage(query)}
                      className="w-full text-left justify-start text-xs h-auto p-2 hover:bg-zinc-800"
                    >
                      {query}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <AlertCircle className="h-6 w-6 mr-3 text-yellow-500" />
            How to Use the NLP Query Interface
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium mb-2">Chat Queries</h3>
              <p className="text-sm text-gray-400">
                Ask about messages, conversations, or specific contacts. Example: "Show me messages from John"
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Call Analysis</h3>
              <p className="text-sm text-gray-400">
                Query call records, duration, and contact information. Example: "What calls were made yesterday?"
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Media Files</h3>
              <p className="text-sm text-gray-400">
                Search images and videos by filename, location, or date. Example: "Find photos from New York"
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">App Usage</h3>
              <p className="text-sm text-gray-400">
                Analyze application data and usage patterns. Example: "What apps were used most frequently?"
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Location Data</h3>
              <p className="text-sm text-gray-400">
                Query location information from various data sources. Example: "Show me all location data"
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Time-based Queries</h3>
              <p className="text-sm text-gray-400">
                Ask about recent activity or specific time periods. Example: "What happened last week?"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
