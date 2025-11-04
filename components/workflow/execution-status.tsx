"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Play, Square, RefreshCw, Clock, CheckCircle, XCircle } from "lucide-react"

interface ExecutionStatusProps {
  workflowId: string
  onExecute?: () => void
}

interface ExecutionInfo {
  executionId: string
  workflowId: string
  startTime: string
  errors: Array<{
    nodeId: string
    message: string
    timestamp: string
  }>
}

export function ExecutionStatus({ workflowId, onExecute }: ExecutionStatusProps) {
  const [activeExecutions, setActiveExecutions] = useState<ExecutionInfo[]>([])
  const [lastExecution, setLastExecution] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Poll for active executions
  useEffect(() => {
    const pollExecutions = async () => {
      try {
        const response = await fetch(`/api/workflows/status?workflowId=${workflowId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.status) {
            // Convert single status to array format for compatibility
            const executions = data.status.status === 'running' ? [{
              executionId: data.status.executionId,
              workflowId: data.status.workflowId,
              startTime: data.status.startTime,
              errors: data.status.logs?.filter((log: any) => log.level === 'error').map((log: any) => ({
                nodeId: log.nodeId,
                message: log.message,
                timestamp: log.timestamp
              })) || []
            }] : []
            setActiveExecutions(executions)
            
            // Set last execution if completed
            if (data.status.status !== 'running' && data.status.endTime) {
              setLastExecution({
                status: data.status.status,
                duration: data.status.endTime ? 
                  new Date(data.status.endTime).getTime() - new Date(data.status.startTime).getTime() : 0,
                error: data.status.logs?.find((log: any) => log.level === 'error')?.message
              })
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch execution status:', error)
      }
    }

    const interval = setInterval(pollExecutions, 2000)
    pollExecutions() // Initial fetch

    return () => clearInterval(interval)
  }, [workflowId])

  const handleExecute = async () => {
    setIsLoading(true)
    try {
      if (onExecute) {
        onExecute()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const workflowExecutions = activeExecutions.filter(exec => exec.workflowId === workflowId)
  const hasActiveExecution = workflowExecutions.length > 0

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Execution Status</h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleExecute}
            disabled={isLoading || hasActiveExecution}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Execute
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Active Executions */}
        {workflowExecutions.map(execution => (
          <div key={execution.executionId} className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                <span className="text-sm font-medium">Running</span>
                <Badge variant="secondary">{execution.executionId}</Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                Started {new Date(execution.startTime).toLocaleTimeString()}
              </span>
            </div>
            
            {execution.errors.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-muted-foreground mb-1">Errors:</div>
                {execution.errors.map((error, idx) => (
                  <div key={idx} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    <span className="font-medium">{error.nodeId}:</span> {error.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* No Active Executions */}
        {!hasActiveExecution && (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">No active executions</div>
            <div className="text-xs">Click Execute to run the workflow</div>
          </div>
        )}

        {/* Last Execution Result */}
        {lastExecution && (
          <>
            <Separator />
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {lastExecution.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">
                    Last Execution
                  </span>
                  <Badge variant={lastExecution.status === 'success' ? 'default' : 'destructive'}>
                    {lastExecution.status}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {lastExecution.duration}ms
                </span>
              </div>
              
              {lastExecution.error && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {lastExecution.error}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  )
}