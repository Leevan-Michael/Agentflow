"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Terminal,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Minimize2,
  Maximize2,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react"
import { logStore, LogEntry, logger } from "./execution-logs"

interface LogViewerProps {
  workflowId?: string
  nodeId?: string
  compact?: boolean
  maxHeight?: string
  className?: string
}

export function LogViewer({
  workflowId,
  nodeId,
  compact = false,
  maxHeight = "200px",
  className = ""
}: LogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isMinimized, setIsMinimized] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    const unsubscribe = logStore.subscribe((newLogs) => {
      // Filter logs for this workflow/node
      let filteredLogs = newLogs
      
      if (nodeId) {
        filteredLogs = filteredLogs.filter(log => log.nodeId === nodeId)
      }
      
      if (!showDebug) {
        filteredLogs = filteredLogs.filter(log => log.level !== 'debug')
      }
      
      setLogs(filteredLogs.slice(0, 50)) // Show last 50 logs
    })

    // Initial load
    let initialLogs = logStore.getLogs()
    if (nodeId) {
      initialLogs = initialLogs.filter(log => log.nodeId === nodeId)
    }
    if (!showDebug) {
      initialLogs = initialLogs.filter(log => log.level !== 'debug')
    }
    setLogs(initialLogs.slice(0, 50))

    return unsubscribe
  }, [nodeId, showDebug])

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'error':
        return <XCircle className="h-3 w-3 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />
      case 'debug':
        return <Terminal className="h-3 w-3 text-gray-400" />
      default:
        return <Info className="h-3 w-3 text-blue-500" />
    }
  }

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'text-green-700 bg-green-50'
      case 'error':
        return 'text-red-700 bg-red-50'
      case 'warning':
        return 'text-yellow-700 bg-yellow-50'
      case 'debug':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-blue-700 bg-blue-50'
    }
  }

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const recentLogs = logs.slice(0, 10)
  const errorCount = logs.filter(log => log.level === 'error').length
  const warningCount = logs.filter(log => log.level === 'warning').length
  const successCount = logs.filter(log => log.level === 'success').length

  if (compact) {
    return (
      <div className={`border rounded-lg bg-background ${className}`}>
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            <span className="text-sm font-medium">Logs</span>
            {logs.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {logs.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {errorCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {errorCount} errors
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                {warningCount} warnings
              </Badge>
            )}
            {successCount > 0 && (
              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                {successCount} success
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        
        {!isMinimized && (
          <ScrollArea className="max-h-32">
            <div className="p-2 space-y-1">
              {recentLogs.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-2">
                  No logs yet
                </div>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center gap-2 text-xs">
                    {getLogIcon(log.level)}
                    <span className="text-muted-foreground">
                      {formatTime(log.timestamp)}
                    </span>
                    <span className="flex-1 truncate">
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Execution Logs
            {logs.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {logs.length}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebug(!showDebug)}
              className="h-6 px-2"
            >
              {showDebug ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              <span className="text-xs ml-1">Debug</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logStore.clearLogs()}
              className="h-6 px-2"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ScrollArea style={{ maxHeight }}>
          <div className="space-y-1">
            {logs.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Terminal className="h-6 w-6 mx-auto mb-2 opacity-30" />
                <div className="text-sm">No logs to display</div>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 p-2 rounded hover:bg-muted/50">
                  {getLogIcon(log.level)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`text-xs ${getLevelColor(log.level)}`}>
                        {log.level}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {log.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(log.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm">
                      {log.message}
                    </div>
                    {log.details && (
                      <div className="text-xs text-muted-foreground mt-1 font-mono">
                        {typeof log.details === 'string' 
                          ? log.details 
                          : JSON.stringify(log.details)
                        }
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// Demo function to generate sample logs
export function generateSampleLogs() {
  logger.info("Workflow execution started", "workflow", { workflowId: "demo-workflow" })
  logger.success("Gmail trigger activated", "gmail-trigger", { emails: 3 }, "gmail-trigger-1")
  logger.info("Processing email from support@company.com", "gmail-trigger", { subject: "Bug Report" }, "gmail-trigger-1")
  logger.success("AI analysis completed", "openai", { classification: "bug", priority: "high" }, "ai-analysis-1")
  logger.info("Creating JIRA ticket", "jira", { project: "SUPPORT" }, "jira-create-1")
  logger.success("JIRA ticket created: SUPPORT-123", "jira", { ticketId: "SUPPORT-123", url: "https://company.atlassian.net/browse/SUPPORT-123" }, "jira-create-1")
  logger.info("Sending confirmation email", "email", { to: "user@example.com" }, "email-notify-1")
  logger.success("Confirmation email sent", "email", { messageId: "msg-123" }, "email-notify-1")
  logger.success("Workflow execution completed", "workflow", { duration: "2.3s", ticketsCreated: 1 })
}