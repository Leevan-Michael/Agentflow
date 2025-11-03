import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for demo (in production, use a database)
const workflows = new Map<string, any>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workflowId = searchParams.get('id')

    if (workflowId) {
      const workflow = workflows.get(workflowId)
      if (!workflow) {
        return NextResponse.json(
          { error: 'Workflow not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, workflow })
    }

    // Return all workflows
    const allWorkflows = Array.from(workflows.entries()).map(([id, workflow]) => ({
      id,
      ...workflow
    }))

    return NextResponse.json({
      success: true,
      workflows: allWorkflows
    })
  } catch (error) {
    console.error('[API] Failed to get workflows:', error)
    return NextResponse.json(
      { error: 'Failed to get workflows' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, nodes, connections } = body

    if (!id || !nodes || !connections) {
      return NextResponse.json(
        { error: 'Missing required fields: id, nodes, connections' },
        { status: 400 }
      )
    }

    const workflow = {
      id,
      name: name || `Workflow ${id}`,
      description: description || '',
      nodes,
      connections,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    workflows.set(id, workflow)

    console.log(`[API] Saved workflow ${id} with ${nodes.length} nodes`)

    return NextResponse.json({
      success: true,
      workflow
    })
  } catch (error) {
    console.error('[API] Failed to save workflow:', error)
    return NextResponse.json(
      { error: 'Failed to save workflow' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, nodes, connections } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      )
    }

    const existingWorkflow = workflows.get(id)
    if (!existingWorkflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    const updatedWorkflow = {
      ...existingWorkflow,
      name: name || existingWorkflow.name,
      description: description || existingWorkflow.description,
      nodes: nodes || existingWorkflow.nodes,
      connections: connections || existingWorkflow.connections,
      updatedAt: new Date().toISOString()
    }

    workflows.set(id, updatedWorkflow)

    console.log(`[API] Updated workflow ${id}`)

    return NextResponse.json({
      success: true,
      workflow: updatedWorkflow
    })
  } catch (error) {
    console.error('[API] Failed to update workflow:', error)
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workflowId = searchParams.get('id')

    if (!workflowId) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      )
    }

    const deleted = workflows.delete(workflowId)
    if (!deleted) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    console.log(`[API] Deleted workflow ${workflowId}`)

    return NextResponse.json({
      success: true,
      message: 'Workflow deleted successfully'
    })
  } catch (error) {
    console.error('[API] Failed to delete workflow:', error)
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    )
  }
}