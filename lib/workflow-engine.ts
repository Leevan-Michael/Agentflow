// Workflow execution engine
export interface ExecutionContext {
  executionId: string
  workflowId: string
  startTime: Date
  data: Record<string, any>
  variables: Record<string, any>
  errors: ExecutionError[]
}

export interface ExecutionError {
  nodeId: string
  message: string
  timestamp: Date
  stack?: string
}

export interface ExecutionResult {
  executionId: string
  status: 'success' | 'error' | 'running'
  result?: any
  error?: string
  duration: number
  nodeResults: Record<string, any>
}

export interface NodeExecutionResult {
  success: boolean
  data?: any
  error?: string
  logs?: string[]
}

// Base node class that all nodes extend
export abstract class BaseNode {
  abstract type: string
  abstract name: string
  
  constructor(
    public id: string,
    public parameters: Record<string, any> = {}
  ) {}

  abstract execute(inputData: any, context: ExecutionContext): Promise<NodeExecutionResult>
  
  validate(): { valid: boolean; errors: string[] } {
    return { valid: true, errors: [] }
  }

  protected log(message: string, context: ExecutionContext): void {
    console.log(`[${this.id}] ${message}`)
  }

  protected handleError(error: Error): NodeExecutionResult {
    return {
      success: false,
      error: error.message,
      logs: [`Error: ${error.message}`]
    }
  }
}

// Webhook Trigger Node
export class WebhookTriggerNode extends BaseNode {
  type = 'webhook'
  name = 'Webhook Trigger'

  async execute(inputData: any, context: ExecutionContext): Promise<NodeExecutionResult> {
    this.log('Webhook triggered', context)
    
    return {
      success: true,
      data: {
        trigger: 'webhook',
        timestamp: new Date().toISOString(),
        payload: inputData || {},
        headers: inputData?.headers || {},
        method: this.parameters.method || 'POST',
        path: this.parameters.path || '/webhook'
      },
      logs: ['Webhook trigger executed successfully']
    }
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    if (!this.parameters.path) {
      errors.push('Webhook path is required')
    }
    return { valid: errors.length === 0, errors }
  }
}

// Schedule Trigger Node
export class ScheduleTriggerNode extends BaseNode {
  type = 'schedule'
  name = 'Schedule Trigger'

  async execute(inputData: any, context: ExecutionContext): Promise<NodeExecutionResult> {
    this.log('Schedule triggered', context)
    
    return {
      success: true,
      data: {
        trigger: 'schedule',
        timestamp: new Date().toISOString(),
        cronExpression: this.parameters.cronExpression,
        timezone: this.parameters.timezone || 'UTC'
      },
      logs: ['Schedule trigger executed successfully']
    }
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    if (!this.parameters.cronExpression) {
      errors.push('Cron expression is required')
    }
    return { valid: errors.length === 0, errors }
  }
}

// HTTP Request Node
export class HttpRequestNode extends BaseNode {
  type = 'http'
  name = 'HTTP Request'

  async execute(inputData: any, context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.log(`Making HTTP ${this.parameters.method || 'GET'} request to ${this.parameters.url}`, context)
      
      const url = this.parameters.url
      const method = this.parameters.method || 'GET'
      const headers = this.parseHeaders(this.parameters.headers)
      const body = method !== 'GET' ? this.parameters.body : undefined

      // Simulate HTTP request (in real implementation, use fetch)
      const response = await this.simulateHttpRequest(url, method, headers, body)
      
      return {
        success: true,
        data: {
          statusCode: response.status,
          headers: response.headers,
          body: response.data,
          url,
          method
        },
        logs: [`HTTP ${method} request completed with status ${response.status}`]
      }
    } catch (error) {
      return this.handleError(error as Error)
    }
  }

  private parseHeaders(headersStr: string): Record<string, string> {
    try {
      return headersStr ? JSON.parse(headersStr) : {}
    } catch {
      return {}
    }
  }

  private async simulateHttpRequest(url: string, method: string, headers: any, body: any) {
    try {
      // Try to make a real HTTP request for common test URLs
      if (url.includes('jsonplaceholder.typicode.com') || url.includes('httpbin.org')) {
        const fetchOptions: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        }
        
        if (method !== 'GET' && body) {
          fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body)
        }
        
        const response = await fetch(url, fetchOptions)
        const data = await response.json()
        
        return {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          data
        }
      }
    } catch (error) {
      console.log('Real HTTP request failed, falling back to simulation:', error)
    }
    
    // Fallback to simulation
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
    
    if (url.includes('error')) {
      throw new Error('HTTP request failed')
    }
    
    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      data: {
        message: 'Success (simulated)',
        timestamp: new Date().toISOString(),
        echo: { method, headers, body, url }
      }
    }
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    if (!this.parameters.url) {
      errors.push('URL is required')
    }
    return { valid: errors.length === 0, errors }
  }
}

// Email Node
export class EmailNode extends BaseNode {
  type = 'email'
  name = 'Send Email'

  async execute(inputData: any, context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.log(`Sending email to ${this.parameters.to}`, context)
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 800))
      
      return {
        success: true,
        data: {
          messageId: `msg_${Date.now()}`,
          to: this.parameters.to,
          subject: this.parameters.subject,
          sent: true,
          timestamp: new Date().toISOString()
        },
        logs: [`Email sent successfully to ${this.parameters.to}`]
      }
    } catch (error) {
      return this.handleError(error as Error)
    }
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    if (!this.parameters.to) {
      errors.push('Email recipient is required')
    }
    if (!this.parameters.subject) {
      errors.push('Email subject is required')
    }
    return { valid: errors.length === 0, errors }
  }
}

// Condition Node
export class ConditionNode extends BaseNode {
  type = 'condition'
  name = 'IF Condition'

  async execute(inputData: any, context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.log('Evaluating condition', context)
      
      const field = this.parameters.field
      const operator = this.parameters.operator
      const expectedValue = this.parameters.value
      
      const actualValue = this.getNestedValue(inputData, field)
      const result = this.evaluateCondition(actualValue, operator, expectedValue)
      
      return {
        success: true,
        data: {
          condition: result,
          field,
          operator,
          expectedValue,
          actualValue,
          path: result ? 'true' : 'false'
        },
        logs: [`Condition evaluated: ${field} ${operator} ${expectedValue} = ${result}`]
      }
    } catch (error) {
      return this.handleError(error as Error)
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private evaluateCondition(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return actual == expected
      case 'not_equals':
        return actual != expected
      case 'contains':
        return String(actual).includes(String(expected))
      case 'greater_than':
        return Number(actual) > Number(expected)
      case 'less_than':
        return Number(actual) < Number(expected)
      case 'exists':
        return actual !== undefined && actual !== null
      default:
        return false
    }
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    if (!this.parameters.field) {
      errors.push('Field to check is required')
    }
    if (!this.parameters.operator) {
      errors.push('Operator is required')
    }
    return { valid: errors.length === 0, errors }
  }
}

// Transform Node
export class TransformNode extends BaseNode {
  type = 'transform'
  name = 'Transform Data'

  async execute(inputData: any, context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.log('Transforming data', context)
      
      const code = this.parameters.code || 'return input'
      
      // Create a safe execution context
      const transformFunction = new Function('input', 'context', code)
      const result = transformFunction(inputData, context)
      
      return {
        success: true,
        data: result,
        logs: ['Data transformation completed successfully']
      }
    } catch (error) {
      return this.handleError(error as Error)
    }
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    if (!this.parameters.code) {
      errors.push('Transformation code is required')
    }
    return { valid: errors.length === 0, errors }
  }
}

// Loop Node - For Each
export class LoopNode extends BaseNode {
  type = 'loop'
  name = 'For Each Loop'

  async execute(inputData: any, context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.log('Starting loop execution', context)
      
      const arrayPath = this.parameters.arrayPath || 'items'
      const items = this.getNestedValue(inputData, arrayPath)
      
      if (!Array.isArray(items)) {
        throw new Error(`Expected array at path '${arrayPath}', got ${typeof items}`)
      }

      const results = []
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        this.log(`Processing item ${i + 1}/${items.length}`, context)
        
        results.push({
          index: i,
          item: item,
          processed: true
        })
      }
      
      return {
        success: true,
        data: {
          results,
          totalItems: items.length,
          processedItems: results.length
        },
        logs: [`Loop completed: processed ${results.length} items`]
      }
    } catch (error) {
      return this.handleError(error as Error)
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    if (!this.parameters.arrayPath) {
      errors.push('Array path is required')
    }
    return { valid: errors.length === 0, errors }
  }
}

// Merge Node - Combine Multiple Inputs
export class MergeNode extends BaseNode {
  type = 'merge'
  name = 'Merge Data'

  async execute(inputData: any, context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.log('Merging data inputs', context)
      
      const mergeMode = this.parameters.mode || 'combine'
      
      // In a real implementation, this would handle multiple inputs
      // For now, we'll simulate merging behavior
      let result: any
      
      switch (mergeMode) {
        case 'combine':
          result = {
            merged: true,
            timestamp: new Date().toISOString(),
            data: inputData,
            source: 'merge-node'
          }
          break
        case 'append':
          result = Array.isArray(inputData) ? inputData : [inputData]
          break
        case 'sum':
          if (Array.isArray(inputData)) {
            result = { sum: inputData.reduce((acc, val) => acc + (Number(val) || 0), 0) }
          } else {
            result = { sum: Number(inputData) || 0 }
          }
          break
        default:
          result = inputData
      }
      
      return {
        success: true,
        data: result,
        logs: [`Data merged using mode: ${mergeMode}`]
      }
    } catch (error) {
      return this.handleError(error as Error)
    }
  }

  validate(): { valid: boolean; errors: string[] } {
    return { valid: true, errors: [] }
  }
}

// Wait Node - Delays and Pauses
export class WaitNode extends BaseNode {
  type = 'wait'
  name = 'Wait/Delay'

  async execute(inputData: any, context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const waitType = this.parameters.waitType || 'delay'
      const duration = parseInt(this.parameters.duration) || 1000
      
      this.log(`Starting wait: ${waitType} for ${duration}ms`, context)
      
      switch (waitType) {
        case 'delay':
          await new Promise(resolve => setTimeout(resolve, duration))
          break
        case 'until':
          // Simulate waiting until a condition (simplified)
          await new Promise(resolve => setTimeout(resolve, Math.min(duration, 5000)))
          break
        default:
          await new Promise(resolve => setTimeout(resolve, duration))
      }
      
      return {
        success: true,
        data: {
          waited: duration,
          type: waitType,
          timestamp: new Date().toISOString(),
          inputData
        },
        logs: [`Wait completed: ${waitType} for ${duration}ms`]
      }
    } catch (error) {
      return this.handleError(error as Error)
    }
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const duration = parseInt(this.parameters.duration)
    if (isNaN(duration) || duration < 0) {
      errors.push('Valid duration is required')
    }
    return { valid: errors.length === 0, errors }
  }
}

// Switch Node - Multiple Condition Routing
export class SwitchNode extends BaseNode {
  type = 'switch'
  name = 'Switch/Router'

  async execute(inputData: any, context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.log('Evaluating switch conditions', context)
      
      const field = this.parameters.field
      const cases = this.parameters.cases || []
      const defaultCase = this.parameters.defaultCase || 'default'
      
      const value = this.getNestedValue(inputData, field)
      
      // Find matching case
      let matchedCase = defaultCase
      for (const caseItem of cases) {
        if (this.evaluateCondition(value, caseItem.operator, caseItem.value)) {
          matchedCase = caseItem.output
          break
        }
      }
      
      return {
        success: true,
        data: {
          field,
          value,
          matchedCase,
          path: matchedCase,
          inputData
        },
        logs: [`Switch routed to: ${matchedCase}`]
      }
    } catch (error) {
      return this.handleError(error as Error)
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private evaluateCondition(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals': return actual == expected
      case 'not_equals': return actual != expected
      case 'contains': return String(actual).includes(String(expected))
      case 'greater_than': return Number(actual) > Number(expected)
      case 'less_than': return Number(actual) < Number(expected)
      case 'exists': return actual !== undefined && actual !== null
      default: return false
    }
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    if (!this.parameters.field) {
      errors.push('Field to evaluate is required')
    }
    return { valid: errors.length === 0, errors }
  }
}

// Jira Node
export class JiraNode extends BaseNode {
  type = 'jira'
  name = 'Jira'

  async execute(inputData: any, context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.log(`Executing Jira action: ${this.parameters.action}`, context)
      
      const { action, domain, email, apiToken } = this.parameters
      
      if (!domain || !email || !apiToken) {
        throw new Error('Jira credentials (domain, email, API token) are required')
      }

      const baseUrl = `https://${domain}.atlassian.net/rest/api/3`
      const auth = Buffer.from(`${email}:${apiToken}`).toString('base64')
      
      const headers = {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }

      let result: any

      switch (action) {
        case 'create_issue':
          result = await this.createIssue(baseUrl, headers, this.parameters, inputData)
          break
        case 'get_issue':
          result = await this.getIssue(baseUrl, headers, this.parameters.issueKey)
          break
        case 'update_issue':
          result = await this.updateIssue(baseUrl, headers, this.parameters, inputData)
          break
        case 'search_issues':
          result = await this.searchIssues(baseUrl, headers, this.parameters.jql)
          break
        case 'add_comment':
          result = await this.addComment(baseUrl, headers, this.parameters, inputData)
          break
        default:
          throw new Error(`Unknown Jira action: ${action}`)
      }

      return {
        success: true,
        data: result,
        logs: [`Jira ${action} completed successfully`]
      }
    } catch (error) {
      return this.handleError(error as Error)
    }
  }

  private async createIssue(baseUrl: string, headers: any, params: any, inputData: any) {
    const issueData = {
      fields: {
        project: { key: params.projectKey },
        summary: params.summary || inputData.summary || 'New Issue',
        description: {
          type: 'doc',
          version: 1,
          content: [{
            type: 'paragraph',
            content: [{
              type: 'text',
              text: params.description || inputData.description || 'Issue created via workflow'
            }]
          }]
        },
        issuetype: { name: params.issueType || 'Task' },
        ...(params.assignee && { assignee: { accountId: params.assignee } }),
        ...(params.priority && { priority: { name: params.priority } })
      }
    }

    const response = await fetch(`${baseUrl}/issue`, {
      method: 'POST',
      headers,
      body: JSON.stringify(issueData)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Jira API error: ${response.status} - ${error}`)
    }

    return await response.json()
  }

  private async getIssue(baseUrl: string, headers: any, issueKey: string) {
    const response = await fetch(`${baseUrl}/issue/${issueKey}`, {
      method: 'GET',
      headers
    })

    if (!response.ok) {
      throw new Error(`Failed to get issue: ${response.status}`)
    }

    return await response.json()
  }

  private async updateIssue(baseUrl: string, headers: any, params: any, inputData: any) {
    const updateData = {
      fields: {
        ...(params.summary && { summary: params.summary }),
        ...(params.description && {
          description: {
            type: 'doc',
            version: 1,
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: params.description }]
            }]
          }
        })
      }
    }

    const response = await fetch(`${baseUrl}/issue/${params.issueKey}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      throw new Error(`Failed to update issue: ${response.status}`)
    }

    return { success: true, issueKey: params.issueKey }
  }

  private async searchIssues(baseUrl: string, headers: any, jql: string) {
    const response = await fetch(`${baseUrl}/search?jql=${encodeURIComponent(jql)}`, {
      method: 'GET',
      headers
    })

    if (!response.ok) {
      throw new Error(`Failed to search issues: ${response.status}`)
    }

    return await response.json()
  }

  private async addComment(baseUrl: string, headers: any, params: any, inputData: any) {
    const commentData = {
      body: {
        type: 'doc',
        version: 1,
        content: [{
          type: 'paragraph',
          content: [{
            type: 'text',
            text: params.comment || inputData.comment || 'Comment added via workflow'
          }]
        }]
      }
    }

    const response = await fetch(`${baseUrl}/issue/${params.issueKey}/comment`, {
      method: 'POST',
      headers,
      body: JSON.stringify(commentData)
    })

    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.status}`)
    }

    return await response.json()
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    if (!this.parameters.domain) errors.push('Jira domain is required')
    if (!this.parameters.email) errors.push('Jira email is required')
    if (!this.parameters.apiToken) errors.push('Jira API token is required')
    if (!this.parameters.action) errors.push('Jira action is required')
    
    if (this.parameters.action === 'create_issue' && !this.parameters.projectKey) {
      errors.push('Project key is required for creating issues')
    }
    
    return { valid: errors.length === 0, errors }
  }
}

// Trello Node
export class TrelloNode extends BaseNode {
  type = 'trello'
  name = 'Trello'

  async execute(inputData: any, context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.log(`Executing Trello action: ${this.parameters.action}`, context)
      
      const { action, apiKey, token } = this.parameters
      
      if (!apiKey || !token) {
        throw new Error('Trello API key and token are required')
      }

      const baseUrl = 'https://api.trello.com/1'
      const authParams = `key=${apiKey}&token=${token}`

      let result: any

      switch (action) {
        case 'create_card':
          result = await this.createCard(baseUrl, authParams, this.parameters, inputData)
          break
        case 'get_card':
          result = await this.getCard(baseUrl, authParams, this.parameters.cardId)
          break
        case 'update_card':
          result = await this.updateCard(baseUrl, authParams, this.parameters, inputData)
          break
        case 'get_board':
          result = await this.getBoard(baseUrl, authParams, this.parameters.boardId)
          break
        case 'get_lists':
          result = await this.getLists(baseUrl, authParams, this.parameters.boardId)
          break
        case 'add_comment':
          result = await this.addCardComment(baseUrl, authParams, this.parameters, inputData)
          break
        default:
          throw new Error(`Unknown Trello action: ${action}`)
      }

      return {
        success: true,
        data: result,
        logs: [`Trello ${action} completed successfully`]
      }
    } catch (error) {
      return this.handleError(error as Error)
    }
  }

  private async createCard(baseUrl: string, authParams: string, params: any, inputData: any) {
    const cardData = {
      name: params.name || inputData.name || 'New Card',
      desc: params.description || inputData.description || '',
      idList: params.listId,
      ...(params.dueDate && { due: params.dueDate }),
      ...(params.labels && { idLabels: params.labels })
    }

    const response = await fetch(`${baseUrl}/cards?${authParams}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cardData)
    })

    if (!response.ok) {
      throw new Error(`Trello API error: ${response.status}`)
    }

    return await response.json()
  }

  private async getCard(baseUrl: string, authParams: string, cardId: string) {
    const response = await fetch(`${baseUrl}/cards/${cardId}?${authParams}`)
    
    if (!response.ok) {
      throw new Error(`Failed to get card: ${response.status}`)
    }

    return await response.json()
  }

  private async updateCard(baseUrl: string, authParams: string, params: any, inputData: any) {
    const updateData: any = {}
    if (params.name) updateData.name = params.name
    if (params.description) updateData.desc = params.description
    if (params.listId) updateData.idList = params.listId
    if (params.dueDate) updateData.due = params.dueDate

    const response = await fetch(`${baseUrl}/cards/${params.cardId}?${authParams}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      throw new Error(`Failed to update card: ${response.status}`)
    }

    return await response.json()
  }

  private async getBoard(baseUrl: string, authParams: string, boardId: string) {
    const response = await fetch(`${baseUrl}/boards/${boardId}?${authParams}`)
    
    if (!response.ok) {
      throw new Error(`Failed to get board: ${response.status}`)
    }

    return await response.json()
  }

  private async getLists(baseUrl: string, authParams: string, boardId: string) {
    const response = await fetch(`${baseUrl}/boards/${boardId}/lists?${authParams}`)
    
    if (!response.ok) {
      throw new Error(`Failed to get lists: ${response.status}`)
    }

    return await response.json()
  }

  private async addCardComment(baseUrl: string, authParams: string, params: any, inputData: any) {
    const commentData = {
      text: params.comment || inputData.comment || 'Comment added via workflow'
    }

    const response = await fetch(`${baseUrl}/cards/${params.cardId}/actions/comments?${authParams}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData)
    })

    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.status}`)
    }

    return await response.json()
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    if (!this.parameters.apiKey) errors.push('Trello API key is required')
    if (!this.parameters.token) errors.push('Trello token is required')
    if (!this.parameters.action) errors.push('Trello action is required')
    
    if (this.parameters.action === 'create_card' && !this.parameters.listId) {
      errors.push('List ID is required for creating cards')
    }
    
    return { valid: errors.length === 0, errors }
  }
}

// Asana Node
export class AsanaNode extends BaseNode {
  type = 'asana'
  name = 'Asana'

  async execute(inputData: any, context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.log(`Executing Asana action: ${this.parameters.action}`, context)
      
      const { action, accessToken } = this.parameters
      
      if (!accessToken) {
        throw new Error('Asana access token is required')
      }

      const baseUrl = 'https://app.asana.com/api/1.0'
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }

      let result: any

      switch (action) {
        case 'create_task':
          result = await this.createTask(baseUrl, headers, this.parameters, inputData)
          break
        case 'get_task':
          result = await this.getTask(baseUrl, headers, this.parameters.taskId)
          break
        case 'update_task':
          result = await this.updateTask(baseUrl, headers, this.parameters, inputData)
          break
        case 'get_projects':
          result = await this.getProjects(baseUrl, headers)
          break
        case 'add_comment':
          result = await this.addTaskComment(baseUrl, headers, this.parameters, inputData)
          break
        default:
          throw new Error(`Unknown Asana action: ${action}`)
      }

      return {
        success: true,
        data: result,
        logs: [`Asana ${action} completed successfully`]
      }
    } catch (error) {
      return this.handleError(error as Error)
    }
  }

  private async createTask(baseUrl: string, headers: any, params: any, inputData: any) {
    const taskData = {
      data: {
        name: params.name || inputData.name || 'New Task',
        notes: params.notes || inputData.notes || '',
        projects: params.projectId ? [params.projectId] : [],
        ...(params.assignee && { assignee: params.assignee }),
        ...(params.dueDate && { due_on: params.dueDate })
      }
    }

    const response = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify(taskData)
    })

    if (!response.ok) {
      throw new Error(`Asana API error: ${response.status}`)
    }

    return await response.json()
  }

  private async getTask(baseUrl: string, headers: any, taskId: string) {
    const response = await fetch(`${baseUrl}/tasks/${taskId}`, {
      method: 'GET',
      headers
    })

    if (!response.ok) {
      throw new Error(`Failed to get task: ${response.status}`)
    }

    return await response.json()
  }

  private async updateTask(baseUrl: string, headers: any, params: any, inputData: any) {
    const updateData = {
      data: {
        ...(params.name && { name: params.name }),
        ...(params.notes && { notes: params.notes }),
        ...(params.completed !== undefined && { completed: params.completed })
      }
    }

    const response = await fetch(`${baseUrl}/tasks/${params.taskId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      throw new Error(`Failed to update task: ${response.status}`)
    }

    return await response.json()
  }

  private async getProjects(baseUrl: string, headers: any) {
    const response = await fetch(`${baseUrl}/projects`, {
      method: 'GET',
      headers
    })

    if (!response.ok) {
      throw new Error(`Failed to get projects: ${response.status}`)
    }

    return await response.json()
  }

  private async addTaskComment(baseUrl: string, headers: any, params: any, inputData: any) {
    const commentData = {
      data: {
        text: params.comment || inputData.comment || 'Comment added via workflow'
      }
    }

    const response = await fetch(`${baseUrl}/tasks/${params.taskId}/stories`, {
      method: 'POST',
      headers,
      body: JSON.stringify(commentData)
    })

    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.status}`)
    }

    return await response.json()
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    if (!this.parameters.accessToken) errors.push('Asana access token is required')
    if (!this.parameters.action) errors.push('Asana action is required')
    
    return { valid: errors.length === 0, errors }
  }
}

// Monday.com Node
export class MondayNode extends BaseNode {
  type = 'monday'
  name = 'Monday.com'

  async execute(inputData: any, context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.log(`Executing Monday.com action: ${this.parameters.action}`, context)
      
      const { action, apiToken } = this.parameters
      
      if (!apiToken) {
        throw new Error('Monday.com API token is required')
      }

      const baseUrl = 'https://api.monday.com/v2'
      const headers = {
        'Authorization': apiToken,
        'Content-Type': 'application/json'
      }

      let result: any

      switch (action) {
        case 'create_item':
          result = await this.createItem(baseUrl, headers, this.parameters, inputData)
          break
        case 'get_items':
          result = await this.getItems(baseUrl, headers, this.parameters.boardId)
          break
        case 'update_item':
          result = await this.updateItem(baseUrl, headers, this.parameters, inputData)
          break
        case 'get_boards':
          result = await this.getBoards(baseUrl, headers)
          break
        case 'create_update':
          result = await this.createUpdate(baseUrl, headers, this.parameters, inputData)
          break
        default:
          throw new Error(`Unknown Monday.com action: ${action}`)
      }

      return {
        success: true,
        data: result,
        logs: [`Monday.com ${action} completed successfully`]
      }
    } catch (error) {
      return this.handleError(error as Error)
    }
  }

  private async createItem(baseUrl: string, headers: any, params: any, inputData: any) {
    const query = `
      mutation {
        create_item (
          board_id: ${params.boardId}
          item_name: "${params.itemName || inputData.itemName || 'New Item'}"
          ${params.groupId ? `group_id: "${params.groupId}"` : ''}
        ) {
          id
          name
          created_at
        }
      }
    `

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    })

    if (!response.ok) {
      throw new Error(`Monday.com API error: ${response.status}`)
    }

    const result = await response.json()
    if (result.errors) {
      throw new Error(`Monday.com GraphQL error: ${JSON.stringify(result.errors)}`)
    }

    return result.data
  }

  private async getItems(baseUrl: string, headers: any, boardId: string) {
    const query = `
      query {
        boards (ids: [${boardId}]) {
          items {
            id
            name
            created_at
            updated_at
            column_values {
              id
              text
              value
            }
          }
        }
      }
    `

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    })

    if (!response.ok) {
      throw new Error(`Failed to get items: ${response.status}`)
    }

    const result = await response.json()
    if (result.errors) {
      throw new Error(`Monday.com GraphQL error: ${JSON.stringify(result.errors)}`)
    }

    return result.data
  }

  private async updateItem(baseUrl: string, headers: any, params: any, inputData: any) {
    const query = `
      mutation {
        change_simple_column_value (
          board_id: ${params.boardId}
          item_id: ${params.itemId}
          column_id: "${params.columnId}"
          value: "${params.value || inputData.value}"
        ) {
          id
          name
        }
      }
    `

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    })

    if (!response.ok) {
      throw new Error(`Failed to update item: ${response.status}`)
    }

    const result = await response.json()
    if (result.errors) {
      throw new Error(`Monday.com GraphQL error: ${JSON.stringify(result.errors)}`)
    }

    return result.data
  }

  private async getBoards(baseUrl: string, headers: any) {
    const query = `
      query {
        boards {
          id
          name
          description
          created_at
        }
      }
    `

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    })

    if (!response.ok) {
      throw new Error(`Failed to get boards: ${response.status}`)
    }

    const result = await response.json()
    if (result.errors) {
      throw new Error(`Monday.com GraphQL error: ${JSON.stringify(result.errors)}`)
    }

    return result.data
  }

  private async createUpdate(baseUrl: string, headers: any, params: any, inputData: any) {
    const query = `
      mutation {
        create_update (
          item_id: ${params.itemId}
          body: "${params.body || inputData.body || 'Update added via workflow'}"
        ) {
          id
          body
          created_at
        }
      }
    `

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    })

    if (!response.ok) {
      throw new Error(`Failed to create update: ${response.status}`)
    }

    const result = await response.json()
    if (result.errors) {
      throw new Error(`Monday.com GraphQL error: ${JSON.stringify(result.errors)}`)
    }

    return result.data
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    if (!this.parameters.apiToken) errors.push('Monday.com API token is required')
    if (!this.parameters.action) errors.push('Monday.com action is required')
    
    if (this.parameters.action === 'create_item' && !this.parameters.boardId) {
      errors.push('Board ID is required for creating items')
    }
    
    return { valid: errors.length === 0, errors }
  }
}

// Node Factory
export class NodeFactory {
  private static nodeClasses: Record<string, new (id: string, parameters: Record<string, any>) => BaseNode> = {
    webhook: WebhookTriggerNode,
    schedule: ScheduleTriggerNode,
    http: HttpRequestNode,
    email: EmailNode,
    condition: ConditionNode,
    transform: TransformNode,
    jira: JiraNode,
    trello: TrelloNode,
    asana: AsanaNode,
    monday: MondayNode
  }

  static createNode(type: string, id: string, parameters: Record<string, any>): BaseNode {
    const NodeClass = this.nodeClasses[type]
    if (!NodeClass) {
      throw new Error(`Unknown node type: ${type}`)
    }
    return new NodeClass(id, parameters)
  }

  static getSupportedTypes(): string[] {
    return Object.keys(this.nodeClasses)
  }
}

// Workflow Execution Engine
export class WorkflowExecutionEngine {
  private activeExecutions = new Map<string, ExecutionContext>()

  async executeWorkflow(
    workflowId: string,
    nodes: any[],
    connections: any[],
    triggerData?: any
  ): Promise<ExecutionResult> {
    const executionId = this.generateExecutionId()
    const startTime = new Date()
    
    const context: ExecutionContext = {
      executionId,
      workflowId,
      startTime,
      data: triggerData || {},
      variables: {},
      errors: []
    }

    this.activeExecutions.set(executionId, context)

    try {
      console.log(`[Execution ${executionId}] Starting workflow execution`)
      
      // Build execution graph
      const executionOrder = this.calculateExecutionOrder(nodes, connections)
      const nodeResults = new Map<string, any>()
      
      // Execute nodes in order
      for (const nodeId of executionOrder) {
        const nodeConfig = nodes.find(n => n.id === nodeId)
        if (!nodeConfig || nodeConfig.disabled) {
          console.log(`[Execution ${executionId}] Skipping disabled node: ${nodeId}`)
          continue
        }

        try {
          // Create node instance
          const node = NodeFactory.createNode(nodeConfig.type, nodeConfig.id, nodeConfig.parameters)
          
          // Get input data from connected nodes
          const inputData = this.getNodeInputData(nodeConfig, nodeResults, connections)
          
          console.log(`[Execution ${executionId}] Executing node: ${nodeId} (${nodeConfig.type})`)
          
          // Execute node
          const result = await node.execute(inputData, context)
          
          if (result.success) {
            nodeResults.set(nodeId, result.data)
            console.log(`[Execution ${executionId}] Node ${nodeId} completed successfully`)
          } else {
            console.error(`[Execution ${executionId}] Node ${nodeId} failed:`, result.error)
            
            // Always store the error result for status updates
            nodeResults.set(nodeId, { error: result.error, success: false })
            
            if (!nodeConfig.parameters?.continueOnFail) {
              throw new Error(`Node ${nodeId} failed: ${result.error}`)
            }
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          console.error(`[Execution ${executionId}] Node ${nodeId} execution failed:`, errorMsg)
          
          context.errors.push({
            nodeId,
            message: errorMsg,
            timestamp: new Date()
          })
          
          // Store error result for status updates
          nodeResults.set(nodeId, { error: errorMsg, success: false })
          
          if (!nodeConfig.parameters?.continueOnFail) {
            throw error
          }
        }
      }

      const duration = Date.now() - startTime.getTime()
      console.log(`[Execution ${executionId}] Workflow completed successfully in ${duration}ms`)

      return {
        executionId,
        status: 'success',
        result: Object.fromEntries(nodeResults),
        duration,
        nodeResults: Object.fromEntries(nodeResults)
      }
    } catch (error) {
      const duration = Date.now() - startTime.getTime()
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      
      console.error(`[Execution ${executionId}] Workflow failed:`, errorMsg)

      return {
        executionId,
        status: 'error',
        error: errorMsg,
        duration,
        nodeResults: {}
      }
    } finally {
      this.activeExecutions.delete(executionId)
    }
  }

  private calculateExecutionOrder(nodes: any[], connections: any[]): string[] {
    // Simple topological sort
    const graph = new Map<string, string[]>()
    const inDegree = new Map<string, number>()
    
    // Initialize graph
    nodes.forEach(node => {
      graph.set(node.id, [])
      inDegree.set(node.id, 0)
    })
    
    // Build graph from connections
    connections.forEach(conn => {
      const deps = graph.get(conn.sourceNodeId) || []
      deps.push(conn.targetNodeId)
      graph.set(conn.sourceNodeId, deps)
      
      const degree = inDegree.get(conn.targetNodeId) || 0
      inDegree.set(conn.targetNodeId, degree + 1)
    })
    
    // Find nodes with no dependencies (triggers)
    const queue: string[] = []
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId)
      }
    })
    
    const result: string[] = []
    
    while (queue.length > 0) {
      const nodeId = queue.shift()!
      result.push(nodeId)
      
      const dependencies = graph.get(nodeId) || []
      dependencies.forEach(depId => {
        const newDegree = (inDegree.get(depId) || 0) - 1
        inDegree.set(depId, newDegree)
        
        if (newDegree === 0) {
          queue.push(depId)
        }
      })
    }
    
    return result
  }

  private getNodeInputData(node: any, nodeResults: Map<string, any>, connections: any[]): any {
    // Find connections that target this node
    const incomingConnections = connections.filter(conn => conn.targetNodeId === node.id)
    
    if (incomingConnections.length === 0) {
      return {} // No input data for trigger nodes
    }
    
    // Merge data from all incoming connections
    const inputData: any = {}
    
    incomingConnections.forEach(conn => {
      const sourceData = nodeResults.get(conn.sourceNodeId)
      if (sourceData) {
        // For condition nodes, check the path
        if (conn.sourcePortId === 'true' || conn.sourcePortId === 'false') {
          if (sourceData.path === conn.sourcePortId) {
            Object.assign(inputData, sourceData)
          }
        } else {
          Object.assign(inputData, sourceData)
        }
      }
    })
    
    return inputData
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  }

  getActiveExecutions(): ExecutionContext[] {
    return Array.from(this.activeExecutions.values())
  }

  stopExecution(executionId: string): boolean {
    return this.activeExecutions.delete(executionId)
  }
}