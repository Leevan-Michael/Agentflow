import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const workflowId = searchParams.get('workflowId')
  const executionId = searchParams.get('executionId')

  if (!workflowId) {
    return NextResponse.json({
      success: false,
      error: 'Workflow ID is required'
    }, { status: 400 })
  }

  // Mock different execution statuses for testing
  const statuses = ['idle', 'running', 'success', 'error']
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

  const mockStatus = {
    workflowId,
    executionId: executionId || `exec-${Date.now()}`,
    status: randomStatus,
    progress: randomStatus === 'running' ? Math.floor(Math.random() * 100) : 100,
    currentNode: randomStatus === 'running' ? 'http-request' : null,
    startTime: new Date(Date.now() - 10000).toISOString(),
    endTime: randomStatus === 'running' ? null : new Date().toISOString(),
    nodeStatuses: {
      'webhook-trigger': randomStatus === 'idle' ? 'idle' : 'success',
      'http-request': randomStatus === 'idle' ? 'idle' : randomStatus === 'running' ? 'running' : 'success',
      'condition-check': randomStatus === 'idle' || randomStatus === 'running' ? 'idle' : 'success',
      'jira-create': randomStatus === 'idle' || randomStatus === 'running' ? 'idle' : randomStatus,
      'email-notification': randomStatus === 'idle' || randomStatus === 'running' ? 'idle' : 'idle'
    },
    logs: [
      {
        timestamp: new Date(Date.now() - 8000).toISOString(),
        level: 'info',
        message: 'Workflow execution started',
        nodeId: 'webhook-trigger'
      },
      {
        timestamp: new Date(Date.now() - 6000).toISOString(),
        level: 'info',
        message: 'HTTP request initiated',
        nodeId: 'http-request'
      },
      {
        timestamp: new Date(Date.now() - 4000).toISOString(),
        level: randomStatus === 'error' ? 'error' : 'info',
        message: randomStatus === 'error' ? 'HTTP request failed' : 'HTTP request completed successfully',
        nodeId: 'http-request'
      }
    ]
  }

  return NextResponse.json({
    success: true,
    status: mockStatus
  })
}

export async function POST(request: NextRequest) {
  try {
    const { workflowId, action } = await request.json()

    if (!workflowId || !action) {
      return NextResponse.json({
        success: false,
        error: 'Workflow ID and action are required'
      }, { status: 400 })
    }

    let message = ''
    switch (action) {
      case 'start':
        message = `Workflow ${workflowId} started successfully`
        break
      case 'stop':
        message = `Workflow ${workflowId} stopped successfully`
        break
      case 'pause':
        message = `Workflow ${workflowId} paused successfully`
        break
      case 'resume':
        message = `Workflow ${workflowId} resumed successfully`
        break
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message,
      workflowId,
      action,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Workflow status update error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update workflow status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}