"use client"

import { useState, useCallback } from "react"
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Database,
  Loader2,
  X,
  File,
  Download
} from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"

interface ParsedData {
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
    sourceFiles: string[]
  }
}

interface UFDRDataParserProps {
  onDataParsed: (data: ParsedData) => void
}

export function UFDRDataParser({ onDataParsed }: UFDRDataParserProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [parsingStatus, setParsingStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle')
  const [parsingProgress, setParsingProgress] = useState(0)
  const [parsedResults, setParsedResults] = useState<{
    totalFiles: number
    parsedFiles: number
    errors: string[]
    warnings: string[]
  } | null>(null)

  const supportedFormats = [
    '.json', '.xml', '.csv', '.db', '.sqlite', '.plist', 
    '.txt', '.log', '.ufdr', '.cellebrite', '.oxygen'
  ]

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const validFiles = files.filter(file => 
      supportedFormats.some(format => file.name.toLowerCase().endsWith(format))
    )
    
    setUploadedFiles(prev => [...prev, ...validFiles])
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => 
      supportedFormats.some(format => file.name.toLowerCase().endsWith(format))
    )
    
    setUploadedFiles(prev => [...prev, ...validFiles])
  }, [])

  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const parseUFDRData = useCallback(async () => {
    if (uploadedFiles.length === 0) return

    setParsingStatus('parsing')
    setParsingProgress(0)
    setParsedResults({
      totalFiles: uploadedFiles.length,
      parsedFiles: 0,
      errors: [],
      warnings: []
    })

    try {
      const parsedData: ParsedData = {
        chats: [],
        calls: [],
        images: [],
        videos: [],
        appData: [],
        metadata: {
          totalSize: '0 MB',
          deviceInfo: 'Unknown Device',
          extractionDate: new Date().toISOString(),
          dataTypes: [],
          sourceFiles: uploadedFiles.map(f => f.name)
        }
      }

      let totalSize = 0
      const errors: string[] = []
      const warnings: string[] = []

      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i]
        totalSize += file.size
        
        try {
          const content = await file.text()
          const parsed = await parseFileContent(file.name, content)
          
          // Merge parsed data
          parsedData.chats.push(...parsed.chats)
          parsedData.calls.push(...parsed.calls)
          parsedData.images.push(...parsed.images)
          parsedData.videos.push(...parsed.videos)
          parsedData.appData.push(...parsed.appData)
          
          if (parsed.metadata) {
            Object.assign(parsedData.metadata, parsed.metadata)
          }
          
        } catch (error) {
          errors.push(`Failed to parse ${file.name}: ${error}`)
        }
        
        setParsingProgress(((i + 1) / uploadedFiles.length) * 100)
        setParsedResults(prev => prev ? {
          ...prev,
          parsedFiles: i + 1,
          errors,
          warnings
        } : null)
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      parsedData.metadata.totalSize = formatFileSize(totalSize)
      parsedData.metadata.dataTypes = [
        ...(parsedData.chats.length > 0 ? ['Chats'] : []),
        ...(parsedData.calls.length > 0 ? ['Calls'] : []),
        ...(parsedData.images.length > 0 ? ['Images'] : []),
        ...(parsedData.videos.length > 0 ? ['Videos'] : []),
        ...(parsedData.appData.length > 0 ? ['App Data'] : [])
      ]

      setParsingStatus('success')
      onDataParsed(parsedData)
      
    } catch (error) {
      setParsingStatus('error')
      setParsedResults(prev => prev ? {
        ...prev,
        errors: [...(prev.errors || []), `Parsing failed: ${error}`]
      } : null)
    }
  }, [uploadedFiles, onDataParsed])

  const parseFileContent = async (filename: string, content: string) => {
    const extension = filename.toLowerCase().split('.').pop()
    
    switch (extension) {
      case 'json':
        return parseJSONFile(content)
      case 'xml':
        return parseXMLFile(content)
      case 'csv':
        return parseCSVFile(content)
      case 'txt':
      case 'log':
        return parseTextFile(content)
      default:
        return parseGenericFile(content)
    }
  }

  const parseJSONFile = (content: string) => {
    try {
      const data = JSON.parse(content)
      return {
        chats: data.chats || data.messages || [],
        calls: data.calls || data.callLogs || [],
        images: data.images || data.photos || [],
        videos: data.videos || [],
        appData: data.appData || data.applications || [],
        metadata: data.metadata || {}
      }
    } catch (error) {
      throw new Error('Invalid JSON format')
    }
  }

  const parseXMLFile = (content: string) => {
    // Basic XML parsing - in a real implementation, you'd use a proper XML parser
    const chats = extractFromXML(content, 'message', 'chat')
    const calls = extractFromXML(content, 'call', 'callLog')
    const images = extractFromXML(content, 'image', 'photo')
    const videos = extractFromXML(content, 'video')
    
    return {
      chats,
      calls,
      images,
      videos,
      appData: [],
      metadata: {}
    }
  }

  const parseCSVFile = (content: string) => {
    const lines = content.split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim())
      const obj: any = {}
      headers.forEach((header, index) => {
        obj[header] = values[index] || ''
      })
      return obj
    })

    // Determine data type based on headers
    if (headers.some(h => ['message', 'text', 'content'].includes(h.toLowerCase()))) {
      return { chats: data, calls: [], images: [], videos: [], appData: [], metadata: {} }
    } else if (headers.some(h => ['duration', 'callType'].includes(h.toLowerCase()))) {
      return { chats: [], calls: data, images: [], videos: [], appData: [], metadata: {} }
    } else {
      return { chats: [], calls: [], images: [], videos: [], appData: data, metadata: {} }
    }
  }

  const parseTextFile = (content: string) => {
    // Basic text parsing for log files
    const lines = content.split('\n')
    const chats = lines
      .filter(line => line.includes('message') || line.includes('chat'))
      .map((line, index) => ({
        id: `text_${index}`,
        message: line,
        timestamp: new Date().toISOString(),
        type: 'received'
      }))

    return {
      chats,
      calls: [],
      images: [],
      videos: [],
      appData: [],
      metadata: {}
    }
  }

  const parseGenericFile = (content: string) => {
    // Generic parsing for unknown formats
    return {
      chats: [],
      calls: [],
      images: [],
      videos: [],
      appData: [],
      metadata: { note: 'Generic file format - limited parsing available' }
    }
  }

  const extractFromXML = (content: string, tag: string, container?: string) => {
    const regex = new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 'gs')
    const matches = content.match(regex) || []
    
    return matches.map((match, index) => {
      const textContent = match.replace(/<[^>]*>/g, '').trim()
      return {
        id: `${tag}_${index}`,
        content: textContent,
        timestamp: new Date().toISOString()
      }
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2 flex items-center">
          <Database className="h-6 w-6 mr-3 text-blue-500" />
          UFDR Data Parser
        </h2>
        <p className="text-gray-400">
          Upload forensic data files to parse and analyze. Supports multiple formats including JSON, XML, CSV, and database files.
        </p>
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-zinc-700 hover:border-zinc-600'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium mb-2">
          Drag and drop UFDR files here, or click to select
        </p>
        <p className="text-sm text-gray-400 mb-4">
          Supported formats: {supportedFormats.join(', ')}
        </p>
        <input
          type="file"
          multiple
          accept={supportedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <Button asChild>
          <label htmlFor="file-upload" className="cursor-pointer">
            <File className="h-4 w-4 mr-2" />
            Select Files
          </label>
        </Button>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Uploaded Files</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-zinc-800 rounded-lg p-3">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parse Button */}
      {uploadedFiles.length > 0 && parsingStatus === 'idle' && (
        <div className="mt-6 text-center">
          <Button onClick={parseUFDRData} className="px-8">
            <Database className="h-4 w-4 mr-2" />
            Parse UFDR Data
          </Button>
        </div>
      )}

      {/* Parsing Progress */}
      {parsingStatus === 'parsing' && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Parsing files...</span>
            <span className="text-sm text-gray-400">{Math.round(parsingProgress)}%</span>
          </div>
          <Progress value={parsingProgress} className="mb-4" />
          {parsedResults && (
            <div className="text-sm text-gray-400">
              {parsedResults.parsedFiles} of {parsedResults.totalFiles} files processed
            </div>
          )}
        </div>
      )}

      {/* Parsing Results */}
      {parsedResults && (parsingStatus === 'success' || parsingStatus === 'error') && (
        <div className="mt-6">
          <div className="flex items-center mb-4">
            {parsingStatus === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <h3 className="text-lg font-semibold">
              {parsingStatus === 'success' ? 'Parsing Complete' : 'Parsing Failed'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-zinc-800 rounded-lg p-3">
              <p className="text-sm text-gray-400">Files Processed</p>
              <p className="text-xl font-bold text-white">{parsedResults.parsedFiles}</p>
            </div>
            <div className="bg-zinc-800 rounded-lg p-3">
              <p className="text-sm text-gray-400">Errors</p>
              <p className="text-xl font-bold text-red-400">{parsedResults.errors.length}</p>
            </div>
            <div className="bg-zinc-800 rounded-lg p-3">
              <p className="text-sm text-gray-400">Warnings</p>
              <p className="text-xl font-bold text-yellow-400">{parsedResults.warnings.length}</p>
            </div>
          </div>

          {parsedResults.errors.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-red-400 mb-2">Errors:</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {parsedResults.errors.map((error, index) => (
                  <p key={index} className="text-xs text-red-300 bg-red-900/20 p-2 rounded">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}

          {parsedResults.warnings.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-yellow-400 mb-2">Warnings:</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {parsedResults.warnings.map((warning, index) => (
                  <p key={index} className="text-xs text-yellow-300 bg-yellow-900/20 p-2 rounded">
                    {warning}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
