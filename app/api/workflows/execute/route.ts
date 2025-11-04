import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { workflowId, nodes, connections } = await request.json()

    // Simulate workflow execution
    console.log(`🚀 Executing workflow: ${workflowId}`)
    console.log(`📊 Nodes: ${nodes?.length || 0}`)
    console.log(`🔗 Connections: ${connections?.length || 0}`)

    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock execution results
    const executionResult = {
      id: `exec-${Date.now()}`,
      workflowId,
      status: 'completed',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 2000).toISOString(),
      duration: 2000,
      nodeResults: nodes?.map((node: any) => ({
        nodeId: node.id,
        status: Math.random() > 0.1 ? 'success' : 'error',
        executionTime: Math.floor(Math.random() * 1000) + 100,
        output: {
          message: `Node ${node.name} executed successfully`,
          data: { processed: true, timestamp: new Date().toISOString() }
        }
      })) || [],
      summary: {
        totalNodes: nodes?.length || 0,
        successfulNodes: Math.floor((nodes?.length || 0) * 0.9),
        failedNodes: Math.ceil((nodes?.length || 0) * 0.1),
        totalExecutionTime: 2000
      }
    }

    return NextResponse.json({
      success: true,
      execution: executionResult,
      message: 'Workflow executed successfully'
    })

  } catch (error) {
    console.error('❌ Workflow execution error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to execute workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const workflowId = searchParams.get('workflowId')

  // If no workflowId provided, return empty active executions instead of error
  if (!workflowId) {
    return NextResponse.json({
      success: true,
      activeExecutions: [],
      message: 'No workflow ID provided'
    })
  }

  // Mock execution status
  const mockStatus = {
    workflowId,
    status: 'running',
    progress: Math.floor(Math.random() * 100),
    currentNode: 'http-request',
    startTime: new Date(Date.now() - 5000).toISOString(),
    estimatedCompletion: new Date(Date.now() + 3000).toISOString()
  }

  return NextResponse.json({
    success: true,
    status: mockStatus
  })
}