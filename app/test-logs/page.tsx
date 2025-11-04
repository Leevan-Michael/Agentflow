"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Terminal,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Bug,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { ExecutionLogs, logger } from "@/components/workflow/execution-logs"
import { LogViewer } from "@/components/workflow/log-viewer"

export default function TestLogsPage() {
  const [logCount, setLogCount] = useState(0)

  const addTestLog = (level: 'info' | 'success' | 'warning' | 'error' | 'debug') => {
    const messages = {
      info: "This is an info message",
      success: "Operation completed successfully!",
      warning: "This is a warning message",
      error: "An error occurred during processing",
      debug: "Debug information for troubleshooting"
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
        testData: `Sample data for ${level}`,
        timestamp: new Date().toISOString(),
        count: logCount + 1
      },
      `test-node-${level}`,
      `exec-${Date.now()}`
    )

    setLogCount(prev => prev + 1)
  }

  const addWorkflowLogs = () => {
    const executionId = `exec-${Date.now()}`
    
    logger.info("Starting test workflow", "workflow", { executionId })
    
    setTimeout(() => {
      logger.success("Node 1 completed", "gmail-trigger", { emails: 3 }, "node-1", executionId)
    }, 500)
    
    setTimeout(() => {
      logger.info("Processing data", "transform", { records: 3 }, "node-2", executionId)
    }, 1000)
    
    setTimeout(() => {
      logger.success("Data transformed", "transform", { output: "processed" }, "node-2", executionId)
    }, 1500)
    
    setTimeout(() => {
      logger.success("Workflow completed", "workflow", { duration: "2.1s", executionId })
    }, 2000)

    setLogCount(prev => prev + 4)
  }

  const addErrorFlow = () => {
    const executionId = `exec-${Date.now()}`
    
    logger.info("Starting error test workflow", "workflow", { executionId })
    
    setTimeout(() => {
      logger.warning("Rate limit approaching", "api", { remaining: 5 }, "node-1", executionId)
    }, 300)
    
    setTimeout(() => {
      logger.error("API call failed", "api", { error: "Rate limit exceeded" }, "node-1", executionId)
    }, 600)
    
    setTimeout(() => {
      logger.error("Workflow failed", "workflow", { executionId, error: "Node execution failed" })
    }, 900)

    setLogCount(prev => prev + 3)
  }

  const clearLogs = () => {
    // Access the global log store and clear it
    const { logStore } = require("@/components/workflow/execution-logs")
    logStore.clearLogs()
    setLogCount(0)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold mb-4">
              Frontend Logging Test
            </h1>
            <p className="text-lg text-green-100 mb-6">
              Test the frontend logging system to ensure logs are visible in the UI.
              Click the buttons below to generate different types of logs.
            </p>
            <Badge variant="secondary" className="bg-white/20 text-white">
              Total Logs Generated: {logCount}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Test Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Log Generation Controls
            </CardTitle>
            <CardDescription>
              Generate different types of logs to test the frontend logging system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <Button 
                onClick={() => addTestLog('info')} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Info className="h-4 w-4 text-blue-500" />
                Info Log
              </Button>
              
              <Button 
                onClick={() => addTestLog('success')} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
                Success Log
              </Button>
              
              <Button 
                onClick={() => addTestLog('warning')} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Warning Log
              </Button>
              
              <Button 
                onClick={() => addTestLog('error')} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4 text-red-500" />
                Error Log
              </Button>
              
              <Button 
                onClick={() => addTestLog('debug')} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Bug className="h-4 w-4 text-purple-500" />
                Debug Log
              </Button>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex flex-wrap gap-4">
              <Button onClick={addWorkflowLogs} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Simulate Workflow
              </Button>
              
              <Button onClick={addErrorFlow} variant="destructive" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Simulate Errors
              </Button>
              
              <Button onClick={clearLogs} variant="outline" className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Clear All Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Log Viewers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Compact Log Viewer */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Compact Log Viewer
            </h2>
            <LogViewer
              workflowId="test-logs"
              maxHeight="400px"
            />
          </div>

          {/* Full Execution Logs */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Full Execution Logs
            </h2>
            <ExecutionLogs
              workflowId="test-logs"
              maxEntries={50}
              showFilters={true}
              className="h-96"
            />
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Generate Individual Logs</h4>
                <p className="text-sm text-muted-foreground">
                  Click the colored buttons above to generate individual log entries of different levels.
                  You should see them appear immediately in both log viewers below.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">2. Simulate Workflow Execution</h4>
                <p className="text-sm text-muted-foreground">
                  Click "Simulate Workflow" to generate a sequence of logs that mimics a real workflow execution.
                  Watch the logs appear over time with different categories and execution IDs.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">3. Test Error Handling</h4>
                <p className="text-sm text-muted-foreground">
                  Click "Simulate Errors" to generate warning and error logs.
                  These should appear with appropriate colors and icons.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">4. Test Filtering</h4>
                <p className="text-sm text-muted-foreground">
                  In the Full Execution Logs viewer, try filtering by log level or searching for specific terms.
                  The compact viewer shows recent logs with collapsible details.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Display */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{logCount}</div>
                <div className="text-sm text-muted-foreground">Total Logs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm text-muted-foreground">System Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">2</div>
                <div className="text-sm text-muted-foreground">Log Viewers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">5</div>
                <div className="text-sm text-muted-foreground">Log Levels</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}