"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Terminal,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Bug
} from "lucide-react"
import { logger } from "./execution-logs"
import { LogViewer } from "./log-viewer"

interface QuickLogTestProps {
  workflowId?: string
  showViewer?: boolean
  compact?: boolean
}

export function QuickLogTest({ 
  workflowId = "quick-test", 
  showViewer = true,
  compact = false 
}: QuickLogTestProps) {
  const [logCount, setLogCount] = useState(0)

  const addLog = (level: 'info' | 'success' | 'warning' | 'error' | 'debug') => {
    const messages = {
      info: `Info log #${logCount + 1} - System information`,
      success: `Success log #${logCount + 1} - Operation completed!`,
      warning: `Warning log #${logCount + 1} - Potential issue detected`,
      error: `Error log #${logCount + 1} - Something went wrong`,
      debug: `Debug log #${logCount + 1} - Technical details`
    }

    const categories = {
      info: "test",
      success: "workflow", 
      warning: "validation",
      error: "api",
      debug: "system"
    }

    logger[level](
      messages[level],
      categories[level],
      { 
        testNumber: logCount + 1,
        timestamp: new Date().toISOString(),
        level: level,
        workflowId
      },
      `test-node-${level}`,
      `exec-${Date.now()}`
    )

    setLogCount(prev => prev + 1)
  }

  const runQuickTest = () => {
    logger.info("Starting quick log test", "test", { workflowId })
    
    setTimeout(() => {
      logger.success("Test step 1 completed", "test", { step: 1 }, "step-1")
    }, 200)
    
    setTimeout(() => {
      logger.warning("Test warning generated", "test", { step: 2 }, "step-2")
    }, 400)
    
    setTimeout(() => {
      logger.success("Quick test completed", "test", { totalSteps: 3, workflowId })
    }, 600)

    setLogCount(prev => prev + 3)
  }

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Button onClick={runQuickTest} size="sm">
            <Play className="h-3 w-3 mr-1" />
            Quick Test
          </Button>
          <Badge variant="secondary" className="text-xs">
            {logCount} logs
          </Badge>
        </div>
        
        {showViewer && (
          <LogViewer
            workflowId={workflowId}
            compact={true}
            maxHeight="200px"
          />
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Quick Log Test
        </CardTitle>
        <CardDescription>
          Test the logging system with sample log entries
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Log Generation Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => addLog('info')} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
            >
              <Info className="h-3 w-3 text-blue-500" />
              Info
            </Button>
            
            <Button 
              onClick={() => addLog('success')} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
            >
              <CheckCircle className="h-3 w-3 text-green-500" />
              Success
            </Button>
            
            <Button 
              onClick={() => addLog('warning')} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
            >
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
              Warning
            </Button>
            
            <Button 
              onClick={() => addLog('error')} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
            >
              <XCircle className="h-3 w-3 text-red-500" />
              Error
            </Button>
            
            <Button 
              onClick={() => addLog('debug')} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
            >
              <Bug className="h-3 w-3 text-purple-500" />
              Debug
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={runQuickTest} size="sm">
              <Play className="h-3 w-3 mr-1" />
              Run Quick Test
            </Button>
            <Badge variant="secondary">
              {logCount} logs generated
            </Badge>
          </div>

          {/* Log Viewer */}
          {showViewer && (
            <div className="mt-4">
              <LogViewer
                workflowId={workflowId}
                maxHeight="300px"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}