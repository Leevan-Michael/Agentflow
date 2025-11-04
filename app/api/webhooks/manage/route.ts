import { NextRequest, NextResponse } from 'next/server'
import { WebhookTrigger } from '@/lib/types/webhook'
import { v4 as uuidv4 } from 'uuid'
import { registerWebhook, unregisterWebhook, getWebhookExecutions } from '../[...path]/route'

// In-memory storage for demo (in production, use database)
const webhooks = new Map<string, WebhookTrigger>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const webhookId = searchParams.get('id')
    const workflowId = searchParams.get('workflowId')
    const action = searchParams.get('action')

    if (action === 'executions') {
      const executions = getWebhookExecutions(webhookId || undefined)
      return NextResponse.json({
        success: true,
        executions: executions.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      })
    }

    if (webhookId) {
      const webhook = webhooks.get(webhookId)
      if (!webhook) {
        return NextResponse.json(
          { error: 'Webhook not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, webhook })
    }

    // Return all webhooks or filter by workflow
    let allWebhooks = Array.from(webhooks.values())
    if (workflowId) {
      allWebhooks = allWebhooks.filter(webhook => webhook.workflowId === workflowId)
    }

    return NextResponse.json({
      success: true,
      webhooks: allWebhooks
    })
  } catch (error) {
    console.error('[API] Failed to get webhooks:', error)
    return NextResponse.json(
      { error: 'Failed to get webhooks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workflowId, nodeId, path, method, requireAuth, authToken } = body

    if (!workflowId || !nodeId || !path || !method) {
      return NextResponse.json(
        { error: 'Missing required fields: workflowId, nodeId, path, method' },
        { status: 400 }
      )
    }

    // Validate path format
    if (!path.startsWith('/')) {
      return NextResponse.json(
        { error: 'Path must start with /' },
        { status: 400 }
      )
    }

    // Check if webhook path already exists
    const existingWebhook = Array.from(webhooks.values()).find(
      webhook => webhook.path === path && webhook.method === method
    )

    if (existingWebhook) {
      return NextResponse.json(
        { error: 'Webhook path already exists for this method' },
        { status: 409 }
      )
    }

    const webhook: WebhookTrigger = {
      id: uuidv4(),
      workflowId,
      nodeId,
      path,
      method: method.toUpperCase(),
      isActive: true,
      requireAuth: requireAuth || false,
      authToken: requireAuth ? (authToken || uuidv4()) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    webhooks.set(webhook.id, webhook)

    // Register webhook with the handler
    await registerWebhook(webhook)

    console.log(`[API] Created webhook ${webhook.id}: ${method.toUpperCase()} ${path}`)

    return NextResponse.json({
      success: true,
      webhook
    })
  } catch (error) {
    console.error('[API] Failed to create webhook:', error)
    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, path, method, isActive, requireAuth, authToken } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Webhook ID is required' },
        { status: 400 }
      )
    }

    const existingWebhook = webhooks.get(id)
    if (!existingWebhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      )
    }

    // If path or method is changing, check for conflicts
    if ((path && path !== existingWebhook.path) || (method && method !== existingWebhook.method)) {
      const newPath = path || existingWebhook.path
      const newMethod = method || existingWebhook.method
      
      const conflictingWebhook = Array.from(webhooks.values()).find(
        webhook => webhook.id !== id && webhook.path === newPath && webhook.method === newMethod
      )

      if (conflictingWebhook) {
        return NextResponse.json(
          { error: 'Webhook path already exists for this method' },
          { status: 409 }
        )
      }

      // Unregister old webhook
      await unregisterWebhook(existingWebhook.path, existingWebhook.method)
    }

    const updatedWebhook: WebhookTrigger = {
      ...existingWebhook,
      path: path || existingWebhook.path,
      method: method ? method.toUpperCase() : existingWebhook.method,
      isActive: isActive !== undefined ? isActive : existingWebhook.isActive,
      requireAuth: requireAuth !== undefined ? requireAuth : existingWebhook.requireAuth,
      authToken: requireAuth !== undefined 
        ? (requireAuth ? (authToken || existingWebhook.authToken || uuidv4()) : undefined)
        : existingWebhook.authToken,
      updatedAt: new Date().toISOString()
    }

    webhooks.set(id, updatedWebhook)

    // Re-register webhook with new settings
    await registerWebhook(updatedWebhook)

    console.log(`[API] Updated webhook ${id}`)

    return NextResponse.json({
      success: true,
      webhook: updatedWebhook
    })
  } catch (error) {
    console.error('[API] Failed to update webhook:', error)
    return NextResponse.json(
      { error: 'Failed to update webhook' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const webhookId = searchParams.get('id')

    if (!webhookId) {
      return NextResponse.json(
        { error: 'Webhook ID is required' },
        { status: 400 }
      )
    }

    const webhook = webhooks.get(webhookId)
    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      )
    }

    // Unregister webhook
    await unregisterWebhook(webhook.path, webhook.method)

    webhooks.delete(webhookId)

    console.log(`[API] Deleted webhook ${webhookId}`)

    return NextResponse.json({
      success: true,
      message: 'Webhook deleted successfully'
    })
  } catch (error) {
    console.error('[API] Failed to delete webhook:', error)
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    )
  }
}