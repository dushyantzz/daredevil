import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ufdrData, visualizationType = 'comprehensive' } = body

    if (!ufdrData) {
      return NextResponse.json({ error: 'UFDR data is required' }, { status: 400 })
    }

    // Create temporary file for UFDR data
    const tempDir = tmpdir()
    const tempFilePath = join(tempDir, `ufdr_data_${Date.now()}.json`)
    
    await writeFile(tempFilePath, JSON.stringify(ufdrData, null, 2))

    try {
      // Call Python script for 3D visualization processing
      const pythonScript = join(process.cwd(), 'scripts', 'ufdr_3d_visualizer.py')
      
      return new Promise((resolve, reject) => {
        const python = spawn('python', [pythonScript, tempFilePath, visualizationType])
        
        let output = ''
        let errorOutput = ''

        python.stdout.on('data', (data) => {
          output += data.toString()
        })

        python.stderr.on('data', (data) => {
          errorOutput += data.toString()
        })

        python.on('close', async (code) => {
          try {
            // Clean up temporary file
            await unlink(tempFilePath)
            
            if (code !== 0) {
              console.error('Python script error:', errorOutput)
              resolve(NextResponse.json(
                { error: 'Visualization processing failed', details: errorOutput },
                { status: 500 }
              ))
              return
            }

            // Parse the JSON output from Python script
            const result = JSON.parse(output)
            
            resolve(NextResponse.json({
              success: true,
              visualizationData: result,
              metadata: {
                timestamp: new Date().toISOString(),
                visualizationType,
                dataPoints: result.dataPoints || 0
              }
            }))
          } catch (parseError) {
            console.error('Error parsing Python output:', parseError)
            resolve(NextResponse.json(
              { error: 'Failed to parse visualization results' },
              { status: 500 }
            ))
          }
        })

        python.on('error', async (error) => {
          await unlink(tempFilePath).catch(() => {})
          console.error('Python process error:', error)
          resolve(NextResponse.json(
            { error: 'Failed to start visualization process' },
            { status: 500 }
          ))
        })
      })
    } catch (error) {
      await unlink(tempFilePath).catch(() => {})
      console.error('Visualization API error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Request processing error:', error)
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'UFDR 3D Visualization API',
    endpoints: {
      POST: '/api/ufdr-3d-visualization',
      description: 'Process UFDR data for 3D visualization'
    },
    supportedVisualizations: [
      'comprehensive',
      'temporal',
      'spatial',
      'communication_network',
      'activity_heatmap',
      'data_flow'
    ]
  })
}

