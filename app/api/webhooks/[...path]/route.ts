import { NextRequest, NextResponse } from 'next/server'
import { WebhookRequest, WebhookResponse } from '@/lib/types/webhook'

// In-memory storage for demo (in production, use database)
const webhooks = new Map<string, any>()
const executions = new Map<string, any>()

// Helper function to generate webhook path key
function getWebhookKey(path: string, method: string): string {
  return `${method.toUpperCase()}:${path}`
}

// Helper function to execute workflow
async function executeWorkflow(workflowId: string, triggerData: any) {
  try {
    // In a real implementation, this would trigger the workflow engine
    console.log(`[Webhook] Executing workflow ${workflowId} with data:`, triggerData)
    
    // Simulate workflow execution
    const executionResult = {
      success: true,
      executionId: `exec-${Date.now()}`,
      data: {
        message: 'Workflow executed successfully',
        triggerData,
        timestamp: new Date().toISOString()
      }
    }
    
    return executionResult
  } catch (error) {
    console.error('[Webhook] Workflow execution failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Handle all HTTP methods
async function handleWebhookRequest(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const method = request.method
  const webhookPath = '/' + params.path.join('/')
  const webhookKey = getWebhookKey(webhookPath, method)
  
  console.log(`[Webhook] Received ${method} request for path: ${webhookPath}`)
  
  try {
    // Parse request data
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })
    
    const url = new URL(request.url)
    const query: Record<string, string> = {}
    url.searchParams.forEach((value, key) => {
      query[key] = value
    })
    
    let body: any = null
    const contentType = headers['content-type'] || ''
    
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        if (contentType.includes('application/json')) {
          body = await request.json()
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          const formData = await request.formData()
          body = Object.fromEntries(formData.entries())
        } else if (contentType.includes('text/')) {
          body = await request.text()
        } else {
          // For other content types, try to get as text
          body = await request.text()
        }
      } catch (error) {
        console.warn('[Webhook] Failed to parse request body:', error)
        body = null
      }
    }
    
    const webhookRequest: WebhookRequest = {
      method,
      path: webhookPath,
      headers,
      query,
      body,
      ip: headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown',
      userAgent: headers['user-agent'] || 'unknown'
    }
    
    // Find matching webhook
    const webhook = webhooks.get(webhookKey)
    if (!webhook) {
      console.log(`[Webhook] No webhook found for ${webhookKey}`)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Webhook not found',
          message: `No webhook configured for ${method} ${webhookPath}`
        } as WebhookResponse,
        { status: 404 }
      )
    }
    
    if (!webhook.isActive) {
      console.log(`[Webhook] Webhook ${webhookKey} is inactive`)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Webhook inactive',
          message: 'This webhook is currently disabled'
        } as WebhookResponse,
        { status: 403 }
      )
    }
    
    // Check authentication if required
    if (webhook.requireAuth) {
      const authHeader = headers['authorization']
      const expectedToken = `Bearer ${webhook.authToken}`
      
      if (!authHeader || authHeader !== expectedToken) {
        console.log(`[Webhook] Authentication failed for ${webhookKey}`)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Authentication required',
            message: 'Invalid or missing authorization token'
          } as WebhookResponse,
          { status: 401 }
        )
      }
    }
    
    // Execute workflow
    const startTime = Date.now()
    const executionResult = await executeWorkflow(webhook.workflowId, {
      webhook: {
        method,
        path: webhookPath,
        headers,
        query,
        body
      },
      timestamp: new Date().toISOString()
    })
    const executionTime = Date.now() - startTime
    
    // Store execution record
    const execution = {
      id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      webhookId: webhook.id,
      workflowId: webhook.workflowId,
      method,
      path: webhookPath,
      headers,
      query,
      body,
      response: {
        status: executionResult.success ? 200 : 500,
        data: executionResult.data,
        error: executionResult.error
      },
      executionTime,
      createdAt: new Date().toISOString()
    }
    
    executions.set(execution.id, execution)
    
    // Return response
    const response: WebhookResponse = {
      success: executionResult.success,
      executionId: execution.id,
      data: executionResult.data,
      error: executionResult.error,
      message: executionResult.success 
        ? 'Webhook executed successfully' 
        : 'Webhook execution failed'
    }
    
    console.log(`[Webhook] Execution completed in ${executionTime}ms:`, response)
    
    return NextResponse.json(response, { 
      status: executionResult.success ? 200 : 500 
    })
    
  } catch (error) {
    console.error('[Webhook] Request handling failed:', error)
    
    const response: WebhookResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Internal server error'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

// Export handlers for all HTTP methods
export const GET = handleWebhookRequest
export const POST = handleWebhookRequest
export const PUT = handleWebhookRequest
export const DELETE = handleWebhookRequest
export const PATCH = handleWebhookRequest
export const HEAD = handleWebhookRequest
export const OPTIONS = handleWebhookRequest

// Register webhook (called by webhook nodes)
export async function registerWebhook(webhook: any) {
  const webhookKey = getWebhookKey(webhook.path, webhook.method)
  webhooks.set(webhookKey, webhook)
  console.log(`[Webhook] Registered webhook: ${webhookKey}`)
}

// Unregister webhook
export async function unregisterWebhook(path: string, method: string) {
  const webhookKey = getWebhookKey(path, method)
  webhooks.delete(webhookKey)
  console.log(`[Webhook] Unregistered webhook: ${webhookKey}`)
}

// Get webhook executions
export function getWebhookExecutions(webhookId?: string) {
  const allExecutions = Array.from(executions.values())
  return webhookId 
    ? allExecutions.filter(exec => exec.webhookId === webhookId)
    : allExecutions
}