import { NextRequest, NextResponse } from 'next/server'
import { WorkflowExecutionEngine } from '@/lib/workflow-engine'

const executionEngine = new WorkflowExecutionEngine()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workflowId, nodes, connections, triggerData } = body

    if (!workflowId || !nodes || !connections) {
      return NextResponse.json(
        { error: 'Missing required fields: workflowId, nodes, connections' },
        { status: 400 }
      )
    }

    console.log(`[API] Executing workflow ${workflowId} with ${nodes.length} nodes`)

    const result = await executionEngine.executeWorkflow(
      workflowId,
      nodes,
      connections,
      triggerData
    )

    return NextResponse.json({
      success: true,
      execution: result
    })
  } catch (error) {
    console.error('[API] Workflow execution failed:', error)
    
    return NextResponse.json(
      { 
        error: 'Workflow execution failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const activeExecutions = executionEngine.getActiveExecutions()
    
    return NextResponse.json({
      success: true,
      activeExecutions: activeExecutions.map(exec => ({
        executionId: exec.executionId,
        workflowId: exec.workflowId,
        startTime: exec.startTime,
        errors: exec.errors
      }))
    })
  } catch (error) {
    console.error('[API] Failed to get active executions:', error)
    
    return NextResponse.json(
      { error: 'Failed to get active executions' },
      { status: 500 }
    )
  }
}