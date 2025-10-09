'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Users, 
  Link, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle,
  Target,
  Network,
  Filter,
  Download,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'

interface AliasGroup {
  id: string
  entities: string[]
  confidence: number
  evidence: string[]
}

interface HiddenRelationship {
  type: string
  source: string
  target: string
  strength: number
  evidence: string
  confidence: number
}

interface CommunityCluster {
  id: string
  members: string[]
  member_count: number
  center: [number, number, number]
  radius: number
  color: string
}

interface GNNAnalysisData {
  alias_groups: Record<string, string[]>
  hidden_relationships: HiddenRelationship[]
  interaction_graph: {
    nodes: Array<{
      id: string
      attributes: {
        platforms: string[]
        locations: string[]
        interactions: number
        call_duration: number
      }
    }>
    edges: Array<{
      source: string
      target: string
      weight: number
    }>
  }
  visualization_data: {
    nodes: Array<{
      id: string
      x: number
      y: number
      z: number
      size: number
      color: string
      platforms: string[]
      locations: string[]
      interactions: number
      call_duration: number
    }>
    edges: Array<{
      source: string
      target: string
      sourcePos: [number, number, number]
      targetPos: [number, number, number]
      weight: number
      type: string
    }>
    alias_clusters: Array<{
      id: string
      center: [number, number, number]
      radius: number
      entity_count: number
      entities: string[]
      color: string
    }>
    hidden_relationship_indicators: Array<{
      source: string
      target: string
      sourcePos: [number, number, number]
      targetPos: [number, number, number]
      type: string
      strength: number
      confidence: number
      evidence: string
      color: string
    }>
    community_clusters: CommunityCluster[]
  }
  metadata: {
    total_entities: number
    alias_groups_count: number
    hidden_relationships_count: number
    graph_nodes: number
    graph_edges: number
    processing_timestamp: string
  }
}

interface GNNAnalysisPanelProps {
  data: GNNAnalysisData | null
  onToggleAliasClusters: (show: boolean) => void
  onToggleHiddenRelationships: (show: boolean) => void
  onToggleCommunityClusters: (show: boolean) => void
  onConfidenceThresholdChange: (threshold: number) => void
  onExportAnalysis: () => void
  isAnalyzing: boolean
  analysisProgress: number
}

export default function GNNAnalysisPanel({
  data,
  onToggleAliasClusters,
  onToggleHiddenRelationships,
  onToggleCommunityClusters,
  onConfidenceThresholdChange,
  onExportAnalysis,
  isAnalyzing,
  analysisProgress
}: GNNAnalysisPanelProps) {
  const [showAliasClusters, setShowAliasClusters] = useState(true)
  const [showHiddenRelationships, setShowHiddenRelationships] = useState(true)
  const [showCommunityClusters, setShowCommunityClusters] = useState(true)
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5)
  const [selectedRelationship, setSelectedRelationship] = useState<HiddenRelationship | null>(null)
  const [selectedAliasGroup, setSelectedAliasGroup] = useState<string | null>(null)

  const handleToggleAliasClusters = () => {
    const newState = !showAliasClusters
    setShowAliasClusters(newState)
    onToggleAliasClusters(newState)
  }

  const handleToggleHiddenRelationships = () => {
    const newState = !showHiddenRelationships
    setShowHiddenRelationships(newState)
    onToggleHiddenRelationships(newState)
  }

  const handleToggleCommunityClusters = () => {
    const newState = !showCommunityClusters
    setShowCommunityClusters(newState)
    onToggleCommunityClusters(newState)
  }

  const handleConfidenceChange = (value: number[]) => {
    const newThreshold = value[0]
    setConfidenceThreshold(newThreshold)
    onConfidenceThresholdChange(newThreshold)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400'
    if (confidence >= 0.6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500/20 text-green-400 border-green-500'
    if (confidence >= 0.6) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
    return 'bg-red-500/20 text-red-400 border-red-500'
  }

  const filteredHiddenRelationships = data?.hidden_relationships.filter(
    rel => rel.confidence >= confidenceThreshold
  ) || []

  if (isAnalyzing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 right-4 w-80 bg-zinc-900/95 backdrop-blur-md border border-zinc-700 rounded-xl p-4 z-50"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="animate-spin">
            <Brain className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">GNN Analysis</h3>
            <p className="text-gray-400 text-sm">Processing forensic data...</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Progress</span>
            <span>{Math.round(analysisProgress)}%</span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${analysisProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </motion.div>
    )
  }

  if (!data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 right-4 w-80 bg-zinc-900/95 backdrop-blur-md border border-zinc-700 rounded-xl p-4 z-50"
      >
        <div className="flex items-center gap-3 mb-4">
          <Brain className="h-6 w-6 text-gray-400" />
          <div>
            <h3 className="text-white font-semibold">GNN Analysis</h3>
            <p className="text-gray-400 text-sm">No analysis data available</p>
          </div>
        </div>
        <p className="text-gray-500 text-sm">
          Upload UFDR data and run GNN analysis to detect aliases and hidden relationships.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 right-4 w-96 bg-zinc-900/95 backdrop-blur-md border border-zinc-700 rounded-xl z-50 max-h-[80vh] overflow-hidden"
    >
      <div className="p-4 border-b border-zinc-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-blue-400" />
            <h3 className="text-white font-semibold">GNN Analysis</h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onExportAnalysis}
            className="bg-zinc-800 border-zinc-600 hover:bg-zinc-700"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2 text-xs">
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            {data.metadata.alias_groups_count} Alias Groups
          </Badge>
          <Badge variant="outline" className="text-purple-400 border-purple-400">
            {data.metadata.hidden_relationships_count} Hidden Relations
          </Badge>
          <Badge variant="outline" className="text-green-400 border-green-400">
            {data.metadata.graph_nodes} Nodes
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-zinc-800">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="aliases" className="text-xs">Aliases</TabsTrigger>
            <TabsTrigger value="relationships" className="text-xs">Relationships</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Visualization Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">Alias Clusters</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleToggleAliasClusters}
                    className="p-1 h-8 w-8"
                  >
                    {showAliasClusters ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-pink-400" />
                    <span className="text-sm text-gray-300">Hidden Relationships</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleToggleHiddenRelationships}
                    className="p-1 h-8 w-8"
                  >
                    {showHiddenRelationships ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-gray-300">Communities</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleToggleCommunityClusters}
                    className="p-1 h-8 w-8"
                  >
                    {showCommunityClusters ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Confidence Threshold</span>
                    <Badge variant="outline" className="text-xs">
                      {confidenceThreshold.toFixed(1)}
                    </Badge>
                  </div>
                  <Slider
                    value={[confidenceThreshold]}
                    onValueChange={handleConfidenceChange}
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Entities:</span>
                  <span className="text-white">{data.metadata.total_entities}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Graph Nodes:</span>
                  <span className="text-white">{data.metadata.graph_nodes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Graph Edges:</span>
                  <span className="text-white">{data.metadata.graph_edges}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Processing Time:</span>
                  <span className="text-white">
                    {new Date(data.metadata.processing_timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aliases" className="space-y-3 mt-4">
            {Object.entries(data.alias_groups).map(([groupId, entities]) => (
              <motion.div
                key={groupId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 cursor-pointer hover:bg-zinc-800/70 transition-colors"
                onClick={() => setSelectedAliasGroup(selectedAliasGroup === groupId ? null : groupId)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium text-white">
                      Alias Group {groupId.split('_').pop()}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {entities.length} entities
                  </Badge>
                </div>
                
                <AnimatePresence>
                  {selectedAliasGroup === groupId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 pt-2 border-t border-zinc-700"
                    >
                      {entities.map((entity, index) => (
                        <div key={index} className="text-xs text-gray-300 bg-zinc-700/50 rounded px-2 py-1">
                          {entity}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="relationships" className="space-y-3 mt-4">
            {filteredHiddenRelationships.map((relationship, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 cursor-pointer hover:bg-zinc-800/70 transition-colors"
                onClick={() => setSelectedRelationship(
                  selectedRelationship === relationship ? null : relationship
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-pink-400" />
                    <span className="text-sm font-medium text-white">
                      {relationship.source} ↔ {relationship.target}
                    </span>
                  </div>
                  <Badge className={getConfidenceBadge(relationship.confidence)}>
                    {relationship.confidence.toFixed(2)}
                  </Badge>
                </div>
                
                <div className="text-xs text-gray-400 mb-2">
                  Type: {relationship.type.replace('_', ' ')}
                </div>
                
                <AnimatePresence>
                  {selectedRelationship === relationship && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 pt-2 border-t border-zinc-700"
                    >
                      <div className="text-xs text-gray-300">
                        <span className="text-gray-400">Evidence:</span> {relationship.evidence}
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          Strength: {relationship.strength.toFixed(2)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Confidence: {relationship.confidence.toFixed(2)}
                        </Badge>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
            
            {filteredHiddenRelationships.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hidden relationships found above confidence threshold</p>
                <p className="text-xs mt-1">Try lowering the confidence threshold</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  )
}
