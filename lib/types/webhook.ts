export interface WebhookTrigger {
  id: string
  workflowId: string
  nodeId: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  isActive: boolean
  requireAuth: boolean
  authToken?: string
  createdAt: string
  updatedAt: string
}

export interface WebhookExecution {
  id: string
  webhookId: string
  workflowId: string
  method: string
  path: string
  headers: Record<string, string>
  query: Record<string, string>
  body: any
  response: {
    status: number
    data: any
    error?: string
  }
  executionTime: number
  createdAt: string
}

export interface WebhookRequest {
  method: string
  path: string
  headers: Record<string, string>
  query: Record<string, string>
  body: any
  ip: string
  userAgent: string
}

export interface WebhookResponse {
  success: boolean
  executionId?: string
  data?: any
  error?: string
  message: string
}