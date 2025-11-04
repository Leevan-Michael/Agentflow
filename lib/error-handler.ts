// Error Handling and Retry System for Workflows
import { WorkflowNode, Connection } from '@/components/workflow/workflow-canvas'

export interface ErrorHandlingConfig {
  strategy: 'stop' | 'continue' | 'retry' | 'skip'
  retryAttempts: number
  retryDelay: number
  retryBackoff: 'fixed' | 'exponential' | 'linear'
  continueOnFail: boolean
  saveDataOnError: boolean
  notifyOnError: boolean
  errorNotificationChannels: string[]
}

export interface WorkflowError {
  id: string
  nodeId: string
  nodeName: string
  executionId: string
  timestamp: string
  type: 'connection' | 'authentication' | 'validation' | 'timeout' | 'api' | 'unknown'
  message: string
  details?: any
  stack?: string
  retryable: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
  jitter: boolean
  retryableErrors: string[]
  nonRetryableErrors: string[]
}

export class ErrorHandler {
  private config: ErrorHandlingConfig
  private retryConfig: RetryConfig
  private errorLog: WorkflowError[] = []

  constructor(config?: Partial<ErrorHandlingConfig>) {
    this.config = {
      strategy: 'stop',
      retryAttempts: 3,
      retryDelay: 1000,
      retryBackoff: 'exponential',
      continueOnFail: false,
      saveDataOnError: true,
      notifyOnError: true,
      errorNotificationChannels: ['email'],
      ...config
    }

    this.retryConfig = {
      maxAttempts: this.config.retryAttempts,
      baseDelay: this.config.retryDelay,
      maxDelay: 60000, // 1 minute max
      backoffMultiplier: 2,
      jitter: true,
      retryableErrors: [
        'NETWORK_ERROR',
        'TIMEOUT_ERROR',
        'RATE_LIMIT_ERROR',
        'TEMPORARY_ERROR',
        'SERVICE_UNAVAILABLE'
      ],
      nonRetryableErrors: [
        'AUTHENTICATION_ERROR',
        'AUTHORIZATION_ERROR',
        'VALIDATION_ERROR',
        'NOT_FOUND_ERROR',
        'BAD_REQUEST_ERROR'
      ]
    }
  }

  // Main error handling method
  async handleError(
    error: Error | WorkflowError,
    context: {
      nodeId: string
      nodeName: string
      executionId: string
      attemptNumber: number
    }
  ): Promise<{
    shouldRetry: boolean
    shouldContinue: boolean
    delay?: number
    transformedError?: WorkflowError
  }> {
    const workflowError = this.transformError(error, context)
    this.logError(workflowError)

    // Determine if error is retryable
    const isRetryable = this.isErrorRetryable(workflowError)
    const hasRetriesLeft = context.attemptNumber < this.retryConfig.maxAttempts

    let shouldRetry = false
    let shouldContinue = false
    let delay = 0

    switch (this.config.strategy) {
      case 'stop':
        // Stop execution on any error
        break

      case 'continue':
        // Continue to next node regardless of error
        shouldContinue = true
        break

      case 'retry':
        // Retry if possible, otherwise stop
        if (isRetryable && hasRetriesLeft) {
          shouldRetry = true
          delay = this.calculateRetryDelay(context.attemptNumber)
        }
        break

      case 'skip':
        // Skip failed node and continue
        shouldContinue = true
        break
    }

    // Send notifications if configured
    if (this.config.notifyOnError) {
      await this.sendErrorNotification(workflowError)
    }

    return {
      shouldRetry,
      shouldContinue,
      delay,
      transformedError: workflowError
    }
  }

  // Transform generic errors into WorkflowError format
  private transformError(
    error: Error | WorkflowError,
    context: {
      nodeId: string
      nodeName: string
      executionId: string
      attemptNumber: number
    }
  ): WorkflowError {
    if ('id' in error) {
      // Already a WorkflowError
      return error as WorkflowError
    }

    const genericError = error as Error
    
    return {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nodeId: context.nodeId,
      nodeName: context.nodeName,
      executionId: context.executionId,
      timestamp: new Date().toISOString(),
      type: this.categorizeError(genericError),
      message: genericError.message,
      details: {
        attemptNumber: context.attemptNumber,
        originalError: genericError.name
      },
      stack: genericError.stack,
      retryable: this.isErrorRetryable(genericError),
      severity: this.determineSeverity(genericError)
    }
  }

  // Categorize error type based on error message/properties
  private categorizeError(error: Error): WorkflowError['type'] {
    const message = error.message.toLowerCase()
    
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'timeout'
    }
    
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
      return 'authentication'
    }
    
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return 'validation'
    }
    
    if (message.includes('network') || message.includes('connection') || message.includes('fetch')) {
      return 'connection'
    }
    
    if (message.includes('api') || message.includes('http') || message.includes('status')) {
      return 'api'
    }
    
    return 'unknown'
  }

  // Determine if error is retryable
  private isErrorRetryable(error: Error | WorkflowError): boolean {
    const message = error.message.toLowerCase()
    
    // Check non-retryable errors first
    for (const nonRetryable of this.retryConfig.nonRetryableErrors) {
      if (message.includes(nonRetryable.toLowerCase().replace('_', ' '))) {
        return false
      }
    }
    
    // Check retryable errors
    for (const retryable of this.retryConfig.retryableErrors) {
      if (message.includes(retryable.toLowerCase().replace('_', ' '))) {
        return true
      }
    }
    
    // Default based on error type
    if ('type' in error) {
      const workflowError = error as WorkflowError
      return ['connection', 'timeout', 'api'].includes(workflowError.type)
    }
    
    return false
  }

  // Determine error severity
  private determineSeverity(error: Error): WorkflowError['severity'] {
    const message = error.message.toLowerCase()
    
    if (message.includes('critical') || message.includes('fatal')) {
      return 'critical'
    }
    
    if (message.includes('auth') || message.includes('security')) {
      return 'high'
    }
    
    if (message.includes('timeout') || message.includes('network')) {
      return 'medium'
    }
    
    return 'low'
  }

  // Calculate retry delay with backoff
  private calculateRetryDelay(attemptNumber: number): number {
    let delay = this.retryConfig.baseDelay

    switch (this.config.retryBackoff) {
      case 'exponential':
        delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attemptNumber - 1)
        break
      
      case 'linear':
        delay = this.retryConfig.baseDelay * attemptNumber
        break
      
      case 'fixed':
      default:
        delay = this.retryConfig.baseDelay
        break
    }

    // Apply jitter to prevent thundering herd
    if (this.retryConfig.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5)
    }

    // Cap at max delay
    return Math.min(delay, this.retryConfig.maxDelay)
  }

  // Log error for debugging and monitoring
  private logError(error: WorkflowError): void {
    this.errorLog.push(error)
    
    // Keep only last 1000 errors to prevent memory issues
    if (this.errorLog.length > 1000) {
      this.errorLog = this.errorLog.slice(-1000)
    }

    // Log to console with appropriate level
    const logLevel = error.severity === 'critical' || error.severity === 'high' ? 'error' : 'warn'
    console[logLevel](`Workflow Error [${error.type}]:`, {
      nodeId: error.nodeId,
      nodeName: error.nodeName,
      message: error.message,
      severity: error.severity,
      retryable: error.retryable
    })
  }

  // Send error notifications
  private async sendErrorNotification(error: WorkflowError): Promise<void> {
    for (const channel of this.config.errorNotificationChannels) {
      try {
        switch (channel) {
          case 'email':
            await this.sendEmailNotification(error)
            break
          case 'slack':
            await this.sendSlackNotification(error)
            break
          case 'webhook':
            await this.sendWebhookNotification(error)
            break
        }
      } catch (notificationError) {
        console.error(`Failed to send ${channel} notification:`, notificationError)
      }
    }
  }

  private async sendEmailNotification(error: WorkflowError): Promise<void> {
    // Implementation would send email notification
    console.log('Sending email notification for error:', error.id)
  }

  private async sendSlackNotification(error: WorkflowError): Promise<void> {
    // Implementation would send Slack notification
    console.log('Sending Slack notification for error:', error.id)
  }

  private async sendWebhookNotification(error: WorkflowError): Promise<void> {
    // Implementation would send webhook notification
    console.log('Sending webhook notification for error:', error.id)
  }

  // Get error statistics
  getErrorStats(timeRange?: { start: Date; end: Date }): {
    total: number
    byType: Record<string, number>
    bySeverity: Record<string, number>
    byNode: Record<string, number>
    retryableCount: number
    recentErrors: WorkflowError[]
  } {
    let errors = this.errorLog

    if (timeRange) {
      errors = errors.filter(error => {
        const errorTime = new Date(error.timestamp)
        return errorTime >= timeRange.start && errorTime <= timeRange.end
      })
    }

    const byType: Record<string, number> = {}
    const bySeverity: Record<string, number> = {}
    const byNode: Record<string, number> = {}
    let retryableCount = 0

    errors.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1
      byNode[error.nodeName] = (byNode[error.nodeName] || 0) + 1
      
      if (error.retryable) {
        retryableCount++
      }
    })

    return {
      total: errors.length,
      byType,
      bySeverity,
      byNode,
      retryableCount,
      recentErrors: errors.slice(-10) // Last 10 errors
    }
  }

  // Get errors for specific execution
  getExecutionErrors(executionId: string): WorkflowError[] {
    return this.errorLog.filter(error => error.executionId === executionId)
  }

  // Clear error log
  clearErrorLog(): void {
    this.errorLog = []
  }

  // Update configuration
  updateConfig(config: Partial<ErrorHandlingConfig>): void {
    this.config = { ...this.config, ...config }
    
    // Update retry config based on new settings
    this.retryConfig.maxAttempts = this.config.retryAttempts
    this.retryConfig.baseDelay = this.config.retryDelay
  }
}

// Utility functions for common error scenarios
export class ErrorUtils {
  // Create standardized error for common scenarios
  static createTimeoutError(nodeId: string, timeout: number): WorkflowError {
    return {
      id: `timeout-${Date.now()}`,
      nodeId,
      nodeName: 'Unknown',
      executionId: 'unknown',
      timestamp: new Date().toISOString(),
      type: 'timeout',
      message: `Operation timed out after ${timeout}ms`,
      retryable: true,
      severity: 'medium'
    }
  }

  static createAuthenticationError(nodeId: string, service: string): WorkflowError {
    return {
      id: `auth-${Date.now()}`,
      nodeId,
      nodeName: 'Unknown',
      executionId: 'unknown',
      timestamp: new Date().toISOString(),
      type: 'authentication',
      message: `Authentication failed for ${service}`,
      retryable: false,
      severity: 'high'
    }
  }

  static createValidationError(nodeId: string, field: string, value: any): WorkflowError {
    return {
      id: `validation-${Date.now()}`,
      nodeId,
      nodeName: 'Unknown',
      executionId: 'unknown',
      timestamp: new Date().toISOString(),
      type: 'validation',
      message: `Validation failed for field '${field}' with value '${value}'`,
      retryable: false,
      severity: 'medium'
    }
  }

  static createNetworkError(nodeId: string, url: string): WorkflowError {
    return {
      id: `network-${Date.now()}`,
      nodeId,
      nodeName: 'Unknown',
      executionId: 'unknown',
      timestamp: new Date().toISOString(),
      type: 'connection',
      message: `Network error connecting to ${url}`,
      retryable: true,
      severity: 'medium'
    }
  }
}

// Default error handler instance
export const defaultErrorHandler = new ErrorHandler()