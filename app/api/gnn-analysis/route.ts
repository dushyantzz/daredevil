import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ufdrData, analysisType = 'full' } = body

    if (!ufdrData) {
      return NextResponse.json({ error: 'UFDR data is required' }, { status: 400 })
    }

    // Create temporary file for UFDR data
    const tempDir = tmpdir()
    const tempFilePath = join(tempDir, `ufdr_gnn_data_${Date.now()}.json`)
    
    await writeFile(tempFilePath, JSON.stringify(ufdrData, null, 2))

    try {
      // Call Python GNN script
      const pythonScript = join(process.cwd(), 'scripts', 'gnn_alias_resolver.py')
      
      return new Promise<NextResponse>((resolve, reject) => {
        const python = spawn('python', [pythonScript, tempFilePath])
        
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
              console.error('GNN Python script error:', errorOutput)
              resolve(NextResponse.json(
                { error: 'GNN analysis failed', details: errorOutput },
                { status: 500 }
              ))
              return
            }

            // Parse the JSON output from Python script
            const result = JSON.parse(output)
            
            resolve(NextResponse.json({
              success: true,
              gnnAnalysis: result,
              metadata: {
                timestamp: new Date().toISOString(),
                analysisType,
                aliasGroups: result.alias_groups?.length || 0,
                hiddenRelationships: result.hidden_relationships?.length || 0,
                graphNodes: result.interaction_graph?.nodes?.length || 0,
                graphEdges: result.interaction_graph?.edges?.length || 0
              }
            }))
          } catch (parseError) {
            console.error('Error parsing GNN output:', parseError)
            resolve(NextResponse.json(
              { error: 'Failed to parse GNN analysis results' },
              { status: 500 }
            ))
          }
        })

        python.on('error', async (error) => {
          await unlink(tempFilePath).catch(() => {})
          console.error('GNN Python process error:', error)
          resolve(NextResponse.json(
            { error: 'Failed to start GNN analysis process' },
            { status: 500 }
          ))
        })
      })
    } catch (error) {
      await unlink(tempFilePath).catch(() => {})
      console.error('GNN Analysis API error:', error)
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
    message: 'GNN Alias Resolution and Relationship Detection API',
    endpoints: {
      POST: '/api/gnn-analysis',
      description: 'Analyze UFDR data with GNN for alias resolution and hidden relationship detection'
    },
    features: [
      'Automatic alias resolution across multiple identifiers',
      'Hidden relationship detection using graph analysis',
      'Community detection and clustering',
      '3D visualization data generation',
      'Confidence scoring for relationships',
      'Temporal proximity analysis',
      'Multi-platform correlation'
    ],
    analysisTypes: [
      'full',
      'alias_resolution',
      'relationship_detection',
      'community_analysis'
    ]
  })
}
