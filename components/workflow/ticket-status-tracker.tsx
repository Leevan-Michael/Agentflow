"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  Play, 
  Square, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Ticket,
  Mail,
  Bot,
  ExternalLink
} from "lucide-react"
import { logger } from './execution-logs'

interface TicketStatusTrackerProps {
  workflowId: string
  onExecute?: () => void
}

interface TicketCreationStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'success' | 'error'
  message?: string
  ticketId?: string
  ticketUrl?: string
  timestamp?: string
  duration?: number
}

interface WorkflowExecution {
  executionId: string
  workflowId: string
  status: 'running' | 'success' | 'error'
  startTime: string
  endTime?: string
  currentStep?: string
  progress: number
  steps: TicketCreationStep[]
  totalTicketsCreated: number
  errors: Array<{
    nodeId: string
    message: string
    timestamp: string
  }>
}

export function TicketStatusTracker({ workflowId, onExecute }: TicketStatusTrackerProps) {
  const [execution, setExecution] = useState<WorkflowExecution | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastExecution, setLastExecution] = useState<WorkflowExecution | null>(null)

  // Mock workflow steps for ticket creation
  const mockSteps: TicketCreationStep[] = [
    { id: 'email-trigger', name: 'Email Received', status: 'pending' },
    { id: 'ai-analysis', name: 'AI Content Analysis', status: 'pending' },
    { id: 'ticket-creation', name: 'Creating Ticket', status: 'pending' },
    { id: 'notification', name: 'Sending Notifications', status: 'pending' }
  ]

  // Simulate workflow execution with ticket creation steps
  const simulateExecution = async () => {
    const executionId = `exec-${Date.now()}`
    const startTime = new Date().toISOString()
    
    logger.info('Starting ticket creation workflow', 'ticket-workflow', { 
      executionId, 
      workflowId,
      steps: mockSteps.length 
    })
    
    const newExecution: WorkflowExecution = {
      executionId,
      workflowId,
      status: 'running',
      startTime,
      currentStep: 'email-trigger',
      progress: 0,
      steps: [...mockSteps],
      totalTicketsCreated: 0,
      errors: []
    }
    
    setExecution(newExecution)

    // Simulate step-by-step execution
    for (let i = 0; i < mockSteps.length; i++) {
      const step = mockSteps[i]
      
      // Update current step to running
      setExecution(prev => prev ? {
        ...prev,
        currentStep: step.id,
        progress: (i / mockSteps.length) * 100,
        steps: prev.steps.map(s => 
          s.id === step.id 
            ? { ...s, status: 'running', timestamp: new Date().toISOString() }
            : s
        )
      } : null)

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))

      // Simulate success/failure (90% success rate)
      const isSuccess = Math.random() > 0.1
      const stepResult: Partial<TicketCreationStep> = {
        status: isSuccess ? 'success' : 'error',
        timestamp: new Date().toISOString(),
        duration: 1500 + Math.random() * 1000
      }

      // Add specific results for each step
      if (step.id === 'email-trigger' && isSuccess) {
        stepResult.message = 'Email processed: Bug report from user@example.com'
        logger.success('Email trigger activated', 'gmail-trigger', { 
          email: 'user@example.com',
          subject: 'Bug report',
          executionId 
        }, step.id, executionId)
      } else if (step.id === 'ai-analysis' && isSuccess) {
        stepResult.message = 'Classified as: High Priority Bug - UI Issue'
        logger.success('AI analysis completed', 'openai', { 
          classification: 'High Priority Bug',
          category: 'UI Issue',
          executionId 
        }, step.id, executionId)
      } else if (step.id === 'ticket-creation' && isSuccess) {
        stepResult.ticketId = `PROJ-${Math.floor(Math.random() * 1000) + 100}`
        stepResult.ticketUrl = `https://company.atlassian.net/browse/${stepResult.ticketId}`
        stepResult.message = `Ticket created: ${stepResult.ticketId}`
        logger.success(`JIRA ticket created: ${stepResult.ticketId}`, 'jira', { 
          ticketId: stepResult.ticketId,
          ticketUrl: stepResult.ticketUrl,
          project: 'PROJ',
          executionId 
        }, step.id, executionId)
      } else if (step.id === 'notification' && isSuccess) {
        stepResult.message = 'Notifications sent to team members'
        logger.success('Notifications sent', 'email', { 
          recipients: ['team@company.com'],
          type: 'ticket-created',
          executionId 
        }, step.id, executionId)
      } else if (!isSuccess) {
        stepResult.message = `Failed: ${step.name} encountered an error`
        logger.error(`Step failed: ${step.name}`, 'ticket-workflow', { 
          stepId: step.id,
          error: 'Simulated failure',
          executionId 
        }, step.id, executionId)
      }

      // Update step status
      setExecution(prev => prev ? {
        ...prev,
        steps: prev.steps.map(s => 
          s.id === step.id ? { ...s, ...stepResult } : s
        ),
        totalTicketsCreated: step.id === 'ticket-creation' && isSuccess 
          ? prev.totalTicketsCreated + 1 
          : prev.totalTicketsCreated,
        errors: !isSuccess ? [
          ...prev.errors,
          {
            nodeId: step.id,
            message: stepResult.message || 'Unknown error',
            timestamp: new Date().toISOString()
          }
        ] : prev.errors
      } : null)

      // If step failed, break execution
      if (!isSuccess) {
        setExecution(prev => prev ? {
          ...prev,
          status: 'error',
          endTime: new Date().toISOString(),
          progress: 100
        } : null)
        break
      }
    }

    // Complete execution if all steps succeeded
    setExecution(prev => {
      if (prev && prev.status === 'running') {
        const completed = {
          ...prev,
          status: 'success' as const,
          endTime: new Date().toISOString(),
          progress: 100
        }
        setLastExecution(completed)
        return null // Clear active execution
      }
      return prev
    })
  }

  const handleExecute = async () => {
    setIsLoading(true)
    try {
      await simulateExecution()
      if (onExecute) {
        onExecute()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getStepIcon = (step: TicketCreationStep) => {
    switch (step.id) {
      case 'email-trigger':
        return <Mail className="h-4 w-4" />
      case 'ai-analysis':
        return <Bot className="h-4 w-4" />
      case 'ticket-creation':
        return <Ticket className="h-4 w-4" />
      case 'notification':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStepStatusColor = (status: TicketCreationStep['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'running':
        return 'text-blue-600'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          <h3 className="font-medium">Ticket Creation Status</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleExecute}
            disabled={isLoading || !!execution}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Starting...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Execute Workflow
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Active Execution */}
        {execution && (
          <div className="p-4 border rounded-lg bg-blue-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                <span className="font-medium">Processing Workflow</span>
                <Badge variant="secondary">{execution.executionId}</Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                Started {new Date(execution.startTime).toLocaleTimeString()}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{Math.round(execution.progress)}%</span>
              </div>
              <Progress value={execution.progress} className="h-2" />
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {execution.steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3 p-2 rounded">
                  <div className={`${getStepStatusColor(step.status)}`}>
                    {step.status === 'running' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    ) : step.status === 'success' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : step.status === 'error' ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      getStepIcon(step)
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{step.name}</span>
                      {step.status === 'running' && (
                        <Badge variant="outline" className="text-xs">
                          Processing...
                        </Badge>
                      )}
                      {step.ticketId && (
                        <Badge variant="default" className="text-xs">
                          {step.ticketId}
                        </Badge>
                      )}
                    </div>
                    
                    {step.message && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {step.message}
                      </div>
                    )}
                    
                    {step.ticketUrl && (
                      <a 
                        href={step.ticketUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1"
                      >
                        View Ticket <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  
                  {step.timestamp && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(step.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-3 border-t">
              <div className="flex justify-between text-sm">
                <span>Tickets Created:</span>
                <span className="font-medium">{execution.totalTicketsCreated}</span>
              </div>
            </div>
          </div>
        )}

        {/* No Active Execution */}
        {!execution && !lastExecution && (
          <div className="text-center py-8 text-muted-foreground">
            <Ticket className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <div className="text-sm font-medium mb-1">Ready to Create Tickets</div>
            <div className="text-xs">
              Execute the workflow to automatically create tickets from emails
            </div>
          </div>
        )}

        {/* Last Execution Result */}
        {lastExecution && !execution && (
          <>
            <Separator />
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {lastExecution.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">Last Execution</span>
                  <Badge variant={lastExecution.status === 'success' ? 'default' : 'destructive'}>
                    {lastExecution.status}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {lastExecution.endTime && new Date(lastExecution.endTime).toLocaleTimeString()}
                </span>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="text-lg font-bold text-green-600">
                    {lastExecution.totalTicketsCreated}
                  </div>
                  <div className="text-xs text-green-700">Tickets Created</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="text-lg font-bold text-blue-600">
                    {lastExecution.steps.filter(s => s.status === 'success').length}
                  </div>
                  <div className="text-xs text-blue-700">Steps Completed</div>
                </div>
              </div>

              {/* Created Tickets */}
              {lastExecution.steps
                .filter(step => step.ticketId)
                .map(step => (
                  <div key={step.id} className="flex items-center justify-between p-2 bg-gray-50 rounded mb-2">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">{step.ticketId}</span>
                    </div>
                    {step.ticketUrl && (
                      <a 
                        href={step.ticketUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}

              {/* Errors */}
              {lastExecution.errors.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-muted-foreground mb-2">Errors:</div>
                  {lastExecution.errors.map((error, idx) => (
                    <div key={idx} className="text-xs text-red-600 bg-red-50 p-2 rounded mb-1">
                      <span className="font-medium">{error.nodeId}:</span> {error.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  )
}