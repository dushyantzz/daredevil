"use client"

import { useState } from "react"
import { 
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
  Star,
  History,
  Zap
} from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"

interface QuickAction {
  id: string
  title: string
  query: string
  icon: React.ReactNode
  category: 'search' | 'analysis' | 'filter' | 'summary'
  description: string
  tags: string[]
}

interface NLPQuickActionsProps {
  onQuerySelect: (query: string) => void
  recentQueries?: string[]
  favoriteQueries?: string[]
}

export function NLPQuickActions({ onQuerySelect, recentQueries = [], favoriteQueries = [] }: NLPQuickActionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState("")

  const quickActions: QuickAction[] = [
    // Search Actions
    {
      id: 'search-recent-chats',
      title: 'Recent Chat Messages',
      query: 'Show me recent chat messages from the last 24 hours',
      icon: <MessageSquare className="h-4 w-4" />,
      category: 'search',
      description: 'Find the most recent chat conversations',
      tags: ['chats', 'recent', 'messages']
    },
    {
      id: 'search-specific-contact',
      title: 'Messages from Contact',
      query: 'Find all messages from John Doe',
      icon: <User className="h-4 w-4" />,
      category: 'search',
      description: 'Search messages by specific contact',
      tags: ['chats', 'contact', 'search']
    },
    {
      id: 'search-platform',
      title: 'WhatsApp Messages',
      query: 'Show me all WhatsApp messages',
      icon: <MessageSquare className="h-4 w-4" />,
      category: 'search',
      description: 'Filter messages by platform',
      tags: ['whatsapp', 'platform', 'chats']
    },
    {
      id: 'search-calls',
      title: 'Recent Phone Calls',
      query: 'Show me recent phone calls from today',
      icon: <Phone className="h-4 w-4" />,
      category: 'search',
      description: 'Find recent call records',
      tags: ['calls', 'phone', 'recent']
    },
    {
      id: 'search-images',
      title: 'Recent Photos',
      query: 'Find images from the last week',
      icon: <Image className="h-4 w-4" />,
      category: 'search',
      description: 'Search for recent photos',
      tags: ['images', 'photos', 'recent']
    },
    {
      id: 'search-videos',
      title: 'Video Files',
      query: 'Show me all video files',
      icon: <Video className="h-4 w-4" />,
      category: 'search',
      description: 'Find all video recordings',
      tags: ['videos', 'recordings', 'files']
    },

    // Analysis Actions
    {
      id: 'analyze-communication-patterns',
      title: 'Communication Patterns',
      query: 'Analyze communication patterns and most active hours',
      icon: <TrendingUp className="h-4 w-4" />,
      category: 'analysis',
      description: 'Analyze when and how communication happens',
      tags: ['analysis', 'patterns', 'communication']
    },
    {
      id: 'analyze-app-usage',
      title: 'App Usage Analysis',
      query: 'What apps were used most frequently?',
      icon: <Smartphone className="h-4 w-4" />,
      category: 'analysis',
      description: 'Analyze application usage patterns',
      tags: ['apps', 'usage', 'analysis']
    },
    {
      id: 'analyze-location-data',
      title: 'Location Analysis',
      query: 'Show me location data and frequent places',
      icon: <MapPin className="h-4 w-4" />,
      category: 'analysis',
      description: 'Analyze location patterns',
      tags: ['location', 'places', 'analysis']
    },
    {
      id: 'analyze-timeline',
      title: 'Activity Timeline',
      query: 'Create a timeline of all activities',
      icon: <Clock className="h-4 w-4" />,
      category: 'analysis',
      description: 'View chronological activity sequence',
      tags: ['timeline', 'chronological', 'activities']
    },

    // Filter Actions
    {
      id: 'filter-by-date',
      title: 'Filter by Date Range',
      query: 'Show me all data from last month',
      icon: <Calendar className="h-4 w-4" />,
      category: 'filter',
      description: 'Filter data by specific time period',
      tags: ['date', 'filter', 'time']
    },
    {
      id: 'filter-by-location',
      title: 'Filter by Location',
      query: 'Find all data from New York',
      icon: <MapPin className="h-4 w-4" />,
      category: 'filter',
      description: 'Filter data by geographic location',
      tags: ['location', 'filter', 'geography']
    },
    {
      id: 'filter-by-contact',
      title: 'Filter by Contact',
      query: 'Show me all interactions with specific contacts',
      icon: <User className="h-4 w-4" />,
      category: 'filter',
      description: 'Filter data by specific contacts',
      tags: ['contact', 'filter', 'interactions']
    },
    {
      id: 'filter-by-platform',
      title: 'Filter by Platform',
      query: 'Show me only Telegram messages',
      icon: <MessageSquare className="h-4 w-4" />,
      category: 'filter',
      description: 'Filter data by communication platform',
      tags: ['platform', 'filter', 'telegram']
    },

    // Summary Actions
    {
      id: 'summary-overview',
      title: 'Data Overview',
      query: 'Give me a complete summary of all UFDR data',
      icon: <BarChart3 className="h-4 w-4" />,
      category: 'summary',
      description: 'Get comprehensive data summary',
      tags: ['summary', 'overview', 'complete']
    },
    {
      id: 'summary-recent-activity',
      title: 'Recent Activity Summary',
      query: 'Summarize all activity from the last 7 days',
      icon: <Clock className="h-4 w-4" />,
      category: 'summary',
      description: 'Summary of recent activities',
      tags: ['summary', 'recent', 'activity']
    },
    {
      id: 'summary-by-type',
      title: 'Data Type Summary',
      query: 'Break down the data by type (chats, calls, images, etc.)',
      icon: <BarChart3 className="h-4 w-4" />,
      category: 'summary',
      description: 'Summary organized by data type',
      tags: ['summary', 'types', 'breakdown']
    }
  ]

  const categories = [
    { id: 'all', label: 'All', icon: <Search className="h-4 w-4" /> },
    { id: 'search', label: 'Search', icon: <Search className="h-4 w-4" /> },
    { id: 'analysis', label: 'Analysis', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'filter', label: 'Filter', icon: <Filter className="h-4 w-4" /> },
    { id: 'summary', label: 'Summary', icon: <BarChart3 className="h-4 w-4" /> }
  ]

  const filteredActions = quickActions.filter(action => {
    const matchesCategory = selectedCategory === 'all' || action.category === selectedCategory
    const matchesSearch = searchTerm === '' || 
      action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'search': return 'text-blue-500'
      case 'analysis': return 'text-green-500'
      case 'filter': return 'text-yellow-500'
      case 'summary': return 'text-purple-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center text-white">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            Quick Actions
          </h3>
        </div>
        <input
          type="text"
          placeholder="Search actions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Category Filter */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 transition-all ${
                selectedCategory === category.id
                  ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                  : 'hover:bg-zinc-800'
              }`}
            >
              {category.icon}
              <span className="text-xs font-medium">{category.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredActions.map((action) => (
            <div
              key={action.id}
              className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700 hover:border-yellow-500/50 hover:bg-zinc-800 transition-all cursor-pointer group"
              onClick={() => onQuerySelect(action.query)}
            >
              <div className="flex items-start gap-3">
                <div className={`${getCategoryColor(action.category)} mt-0.5 flex-shrink-0`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-medium text-sm text-white group-hover:text-yellow-400 transition-colors line-clamp-1">
                      {action.title}
                    </h4>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {action.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                    {action.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {action.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs px-2 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Queries */}
      {recentQueries.length > 0 && (
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
          <h4 className="text-sm font-medium mb-3 flex items-center text-white">
            <History className="h-4 w-4 mr-2 text-gray-400" />
            Recent Queries
          </h4>
          <div className="space-y-2">
            {recentQueries.slice(-5).reverse().map((query, index) => (
              <button
                key={index}
                onClick={() => onQuerySelect(query)}
                className="w-full text-left text-xs p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-yellow-500/50 text-gray-300 hover:text-white transition-all line-clamp-2"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Favorite Queries */}
      {favoriteQueries.length > 0 && (
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
          <h4 className="text-sm font-medium mb-3 flex items-center text-white">
            <Star className="h-4 w-4 mr-2 text-yellow-400" />
            Favorite Queries
          </h4>
          <div className="space-y-2">
            {favoriteQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => onQuerySelect(query)}
                className="w-full text-left text-xs p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-yellow-500/50 text-gray-300 hover:text-white transition-all line-clamp-2"
              >
                <Star className="h-3 w-3 inline mr-1 text-yellow-400" />
                {query}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

