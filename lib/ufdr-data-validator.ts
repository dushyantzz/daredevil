/**
 * UFDR Data Validation Utilities
 * Validates uploaded UFDR data to ensure it meets expected schema
 */

interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
  index?: number
}

interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  stats: {
    totalRecords: number
    validRecords: number
    invalidRecords: number
    processingTime: number
  }
}

interface UFDRSchema {
  chats?: ChatRecord[]
  calls?: CallRecord[]
  images?: ImageRecord[]
  videos?: VideoRecord[]
  appData?: AppRecord[]
  metadata?: MetadataRecord
}

interface ChatRecord {
  contact: string
  message: string
  platform: string
  timestamp: string
  location?: string
  type?: string
}

interface CallRecord {
  contact: string
  type: string
  duration: number
  timestamp: string
  location?: string
  status?: string
}

interface ImageRecord {
  filename: string
  size: number
  timestamp: string
  location?: string
  width?: number
  height?: number
  type?: string
}

interface VideoRecord {
  filename: string
  duration: number
  timestamp: string
  location?: string
  size?: number
  width?: number
  height?: number
  format?: string
}

interface AppRecord {
  appName: string
  category: string
  lastUsed: string
  dataSize?: number
  location?: string
  usageTime?: number
  version?: string
}

interface MetadataRecord {
  totalSize?: string
  deviceInfo?: string
  extractionDate?: string
  dataTypes?: string[]
  sourceFiles?: string[]
  [key: string]: any
}

/**
 * Main validation function for UFDR data
 */
export const validateUFDRData = async (data: any): Promise<ValidationResult> => {
  const startTime = Date.now()
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  let totalRecords = 0
  let validRecords = 0

  try {
    // Check if data is an object
    if (!data || typeof data !== 'object') {
      errors.push({
        field: 'root',
        message: 'Data must be a valid JSON object',
        severity: 'error'
      })
      return {
        isValid: false,
        errors,
        warnings,
        stats: { totalRecords: 0, validRecords: 0, invalidRecords: 0, processingTime: Date.now() - startTime }
      }
    }

    // Validate each data type
    if (data.chats) {
      const chatValidation = validateChats(data.chats)
      errors.push(...chatValidation.errors)
      warnings.push(...chatValidation.warnings)
      totalRecords += data.chats.length
      validRecords += chatValidation.validCount
    }

    if (data.calls) {
      const callValidation = validateCalls(data.calls)
      errors.push(...callValidation.errors)
      warnings.push(...callValidation.warnings)
      totalRecords += data.calls.length
      validRecords += callValidation.validCount
    }

    if (data.images) {
      const imageValidation = validateImages(data.images)
      errors.push(...imageValidation.errors)
      warnings.push(...imageValidation.warnings)
      totalRecords += data.images.length
      validRecords += imageValidation.validCount
    }

    if (data.videos) {
      const videoValidation = validateVideos(data.videos)
      errors.push(...videoValidation.errors)
      warnings.push(...videoValidation.warnings)
      totalRecords += data.videos.length
      validRecords += videoValidation.validCount
    }

    if (data.appData) {
      const appValidation = validateAppData(data.appData)
      errors.push(...appValidation.errors)
      warnings.push(...appValidation.warnings)
      totalRecords += data.appData.length
      validRecords += appValidation.validCount
    }

    if (data.metadata) {
      const metadataValidation = validateMetadata(data.metadata)
      errors.push(...metadataValidation.errors)
      warnings.push(...metadataValidation.warnings)
    }

    // Check if data has at least one valid data type
    const hasValidData = data.chats || data.calls || data.images || data.videos || data.appData
    if (!hasValidData) {
      errors.push({
        field: 'dataTypes',
        message: 'Data must contain at least one of: chats, calls, images, videos, or appData',
        severity: 'error'
      })
    }

    const processingTime = Date.now() - startTime
    const isValid = errors.length === 0 && totalRecords > 0

    console.log(`📊 Validation complete: ${validRecords}/${totalRecords} valid records, ${errors.length} errors, ${warnings.length} warnings (${processingTime}ms)`)

    return {
      isValid,
      errors,
      warnings,
      stats: {
        totalRecords,
        validRecords,
        invalidRecords: totalRecords - validRecords,
        processingTime
      }
    }

  } catch (error) {
    errors.push({
      field: 'validation',
      message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      severity: 'error'
    })

    return {
      isValid: false,
      errors,
      warnings,
      stats: {
        totalRecords,
        validRecords,
        invalidRecords: totalRecords - validRecords,
        processingTime: Date.now() - startTime
      }
    }
  }
}

/**
 * Validate chat records
 */
function validateChats(chats: any[]): { errors: ValidationError[]; warnings: ValidationError[]; validCount: number } {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  let validCount = 0

  if (!Array.isArray(chats)) {
    errors.push({
      field: 'chats',
      message: 'Chats must be an array',
      severity: 'error'
    })
    return { errors, warnings, validCount: 0 }
  }

  chats.forEach((chat, index) => {
    let isValid = true

    // Required fields
    if (!chat.contact || typeof chat.contact !== 'string') {
      errors.push({
        field: 'chats.contact',
        message: 'Contact is required and must be a string',
        severity: 'error',
        index
      })
      isValid = false
    }

    if (!chat.message || typeof chat.message !== 'string') {
      errors.push({
        field: 'chats.message',
        message: 'Message is required and must be a string',
        severity: 'error',
        index
      })
      isValid = false
    }

    if (!chat.platform || typeof chat.platform !== 'string') {
      errors.push({
        field: 'chats.platform',
        message: 'Platform is required and must be a string',
        severity: 'error',
        index
      })
      isValid = false
    }

    if (!chat.timestamp) {
      errors.push({
        field: 'chats.timestamp',
        message: 'Timestamp is required',
        severity: 'error',
        index
      })
      isValid = false
    } else if (!isValidTimestamp(chat.timestamp)) {
      warnings.push({
        field: 'chats.timestamp',
        message: 'Timestamp format may be invalid (expected ISO 8601)',
        severity: 'warning',
        index
      })
    }

    // Optional field validation
    if (chat.message && chat.message.length > 10000) {
      warnings.push({
        field: 'chats.message',
        message: 'Message is very long and may be truncated',
        severity: 'warning',
        index
      })
    }

    if (chat.contact && chat.contact.length > 200) {
      warnings.push({
        field: 'chats.contact',
        message: 'Contact name is unusually long',
        severity: 'warning',
        index
      })
    }

    if (isValid) validCount++
  })

  return { errors, warnings, validCount }
}

/**
 * Validate call records
 */
function validateCalls(calls: any[]): { errors: ValidationError[]; warnings: ValidationError[]; validCount: number } {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  let validCount = 0

  if (!Array.isArray(calls)) {
    errors.push({
      field: 'calls',
      message: 'Calls must be an array',
      severity: 'error'
    })
    return { errors, warnings, validCount: 0 }
  }

  calls.forEach((call, index) => {
    let isValid = true

    if (!call.contact || typeof call.contact !== 'string') {
      errors.push({
        field: 'calls.contact',
        message: 'Contact is required and must be a string',
        severity: 'error',
        index
      })
      isValid = false
    }

    if (!call.type || typeof call.type !== 'string') {
      errors.push({
        field: 'calls.type',
        message: 'Type is required and must be a string',
        severity: 'error',
        index
      })
      isValid = false
    }

    if (call.duration === undefined || typeof call.duration !== 'number') {
      errors.push({
        field: 'calls.duration',
        message: 'Duration is required and must be a number',
        severity: 'error',
        index
      })
      isValid = false
    } else if (call.duration < 0) {
      warnings.push({
        field: 'calls.duration',
        message: 'Duration is negative',
        severity: 'warning',
        index
      })
    }

    if (!call.timestamp) {
      errors.push({
        field: 'calls.timestamp',
        message: 'Timestamp is required',
        severity: 'error',
        index
      })
      isValid = false
    } else if (!isValidTimestamp(call.timestamp)) {
      warnings.push({
        field: 'calls.timestamp',
        message: 'Timestamp format may be invalid',
        severity: 'warning',
        index
      })
    }

    if (isValid) validCount++
  })

  return { errors, warnings, validCount }
}

/**
 * Validate image records
 */
function validateImages(images: any[]): { errors: ValidationError[]; warnings: ValidationError[]; validCount: number } {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  let validCount = 0

  if (!Array.isArray(images)) {
    errors.push({
      field: 'images',
      message: 'Images must be an array',
      severity: 'error'
    })
    return { errors, warnings, validCount: 0 }
  }

  images.forEach((image, index) => {
    let isValid = true

    if (!image.filename || typeof image.filename !== 'string') {
      errors.push({
        field: 'images.filename',
        message: 'Filename is required and must be a string',
        severity: 'error',
        index
      })
      isValid = false
    }

    if (image.size === undefined || typeof image.size !== 'number') {
      errors.push({
        field: 'images.size',
        message: 'Size is required and must be a number',
        severity: 'error',
        index
      })
      isValid = false
    } else if (image.size <= 0) {
      warnings.push({
        field: 'images.size',
        message: 'Size is zero or negative',
        severity: 'warning',
        index
      })
    }

    if (!image.timestamp) {
      errors.push({
        field: 'images.timestamp',
        message: 'Timestamp is required',
        severity: 'error',
        index
      })
      isValid = false
    }

    if (isValid) validCount++
  })

  return { errors, warnings, validCount }
}

/**
 * Validate video records
 */
function validateVideos(videos: any[]): { errors: ValidationError[]; warnings: ValidationError[]; validCount: number } {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  let validCount = 0

  if (!Array.isArray(videos)) {
    errors.push({
      field: 'videos',
      message: 'Videos must be an array',
      severity: 'error'
    })
    return { errors, warnings, validCount: 0 }
  }

  videos.forEach((video, index) => {
    let isValid = true

    if (!video.filename || typeof video.filename !== 'string') {
      errors.push({
        field: 'videos.filename',
        message: 'Filename is required and must be a string',
        severity: 'error',
        index
      })
      isValid = false
    }

    if (video.duration === undefined || typeof video.duration !== 'number') {
      errors.push({
        field: 'videos.duration',
        message: 'Duration is required and must be a number',
        severity: 'error',
        index
      })
      isValid = false
    } else if (video.duration <= 0) {
      warnings.push({
        field: 'videos.duration',
        message: 'Duration is zero or negative',
        severity: 'warning',
        index
      })
    }

    if (!video.timestamp) {
      errors.push({
        field: 'videos.timestamp',
        message: 'Timestamp is required',
        severity: 'error',
        index
      })
      isValid = false
    }

    if (isValid) validCount++
  })

  return { errors, warnings, validCount }
}

/**
 * Validate app data records
 */
function validateAppData(appData: any[]): { errors: ValidationError[]; warnings: ValidationError[]; validCount: number } {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  let validCount = 0

  if (!Array.isArray(appData)) {
    errors.push({
      field: 'appData',
      message: 'App data must be an array',
      severity: 'error'
    })
    return { errors, warnings, validCount: 0 }
  }

  appData.forEach((app, index) => {
    let isValid = true

    if (!app.appName || typeof app.appName !== 'string') {
      errors.push({
        field: 'appData.appName',
        message: 'App name is required and must be a string',
        severity: 'error',
        index
      })
      isValid = false
    }

    if (!app.category || typeof app.category !== 'string') {
      errors.push({
        field: 'appData.category',
        message: 'Category is required and must be a string',
        severity: 'error',
        index
      })
      isValid = false
    }

    if (!app.lastUsed) {
      errors.push({
        field: 'appData.lastUsed',
        message: 'Last used timestamp is required',
        severity: 'error',
        index
      })
      isValid = false
    }

    if (isValid) validCount++
  })

  return { errors, warnings, validCount }
}

/**
 * Validate metadata
 */
function validateMetadata(metadata: any): { errors: ValidationError[]; warnings: ValidationError[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  if (typeof metadata !== 'object') {
    errors.push({
      field: 'metadata',
      message: 'Metadata must be an object',
      severity: 'error'
    })
    return { errors, warnings }
  }

  if (metadata.dataTypes && !Array.isArray(metadata.dataTypes)) {
    warnings.push({
      field: 'metadata.dataTypes',
      message: 'Data types should be an array',
      severity: 'warning'
    })
  }

  if (metadata.extractionDate && !isValidTimestamp(metadata.extractionDate)) {
    warnings.push({
      field: 'metadata.extractionDate',
      message: 'Extraction date format may be invalid',
      severity: 'warning'
    })
  }

  return { errors, warnings }
}

/**
 * Validate timestamp format
 */
function isValidTimestamp(timestamp: any): boolean {
  if (typeof timestamp !== 'string') return false
  
  const date = new Date(timestamp)
  return !isNaN(date.getTime()) && timestamp.includes('T')
}

/**
 * Sanitize UFDR data by removing invalid records and fixing common issues
 */
export const sanitizeUFDRData = (data: any): { sanitizedData: any; changes: string[] } => {
  const changes: string[] = []
  const sanitizedData = JSON.parse(JSON.stringify(data)) // Deep copy

  try {
    // Sanitize chats
    if (sanitizedData.chats && Array.isArray(sanitizedData.chats)) {
      const originalLength = sanitizedData.chats.length
      sanitizedData.chats = sanitizedData.chats.filter((chat: any, index: number) => {
        if (!chat.contact || !chat.message || !chat.platform) {
          changes.push(`Removed invalid chat record at index ${index}`)
          return false
        }
        
        // Truncate long messages
        if (chat.message && chat.message.length > 8000) {
          chat.message = chat.message.substring(0, 8000) + '... [truncated]'
          changes.push(`Truncated long message in chat ${index}`)
        }
        
        // Ensure type field exists
        if (!chat.type) {
          chat.type = 'unknown'
          changes.push(`Added default type to chat ${index}`)
        }
        
        return true
      })
      
      if (sanitizedData.chats.length !== originalLength) {
        changes.push(`Filtered chats: ${originalLength} -> ${sanitizedData.chats.length}`)
      }
    }

    // Sanitize calls
    if (sanitizedData.calls && Array.isArray(sanitizedData.calls)) {
      const originalLength = sanitizedData.calls.length
      sanitizedData.calls = sanitizedData.calls.filter((call: any, index: number) => {
        if (!call.contact || !call.type || call.duration === undefined) {
          changes.push(`Removed invalid call record at index ${index}`)
          return false
        }
        
        // Ensure duration is non-negative
        if (call.duration < 0) {
          call.duration = 0
          changes.push(`Fixed negative duration in call ${index}`)
        }
        
        return true
      })
      
      if (sanitizedData.calls.length !== originalLength) {
        changes.push(`Filtered calls: ${originalLength} -> ${sanitizedData.calls.length}`)
      }
    }

    // Similar sanitization for other data types...
    
    console.log(`🧹 Data sanitization complete: ${changes.length} changes made`)
    
    return { sanitizedData, changes }
    
  } catch (error) {
    console.error('Error sanitizing data:', error)
    return { sanitizedData: data, changes: ['Sanitization failed'] }
  }
}

/**
 * Generate validation report
 */
export const generateValidationReport = (result: ValidationResult): string => {
  const { isValid, errors, warnings, stats } = result
  
  let report = `# UFDR Data Validation Report\n\n`
  report += `**Status:** ${isValid ? '✅ VALID' : '❌ INVALID'}\n`
  report += `**Processing Time:** ${stats.processingTime}ms\n`
  report += `**Records:** ${stats.validRecords}/${stats.totalRecords} valid\n\n`
  
  if (errors.length > 0) {
    report += `## Errors (${errors.length})\n\n`
    errors.forEach((error, idx) => {
      report += `${idx + 1}. **${error.field}**: ${error.message}`
      if (error.index !== undefined) report += ` (record ${error.index})`
      report += `\n`
    })
    report += `\n`
  }
  
  if (warnings.length > 0) {
    report += `## Warnings (${warnings.length})\n\n`
    warnings.forEach((warning, idx) => {
      report += `${idx + 1}. **${warning.field}**: ${warning.message}`
      if (warning.index !== undefined) report += ` (record ${warning.index})`
      report += `\n`
    })
    report += `\n`
  }
  
  report += `## Summary\n\n`
  report += `- Total Records: ${stats.totalRecords}\n`
  report += `- Valid Records: ${stats.validRecords}\n`
  report += `- Invalid Records: ${stats.invalidRecords}\n`
  report += `- Errors: ${errors.length}\n`
  report += `- Warnings: ${warnings.length}\n`
  
  return report
}
