"use client"

import React, { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Terminal,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { logStore, logger } from "./execution-logs"

export function LogStatusIndicator() {
  const [logCount, setLogCount] = useState(0)
  const [isWorking, setIsWorking] = useState<boolean | null>(null)

  useEffect(() => {
    // Subscribe to log updates
    const unsubscribe = logStore.subscribe((logs) => {
      setLogCount(logs.length)
    })

    // Initial count
    setLogCount(logStore.getLogs().length)

    return unsubscribe
  }, [])

  const testLogging = () => {
    setIsWorking(null)
    
    // Clear any existing logs first
    logStore.clearLogs()
    
    // Add a test log
    logger.info("Testing logging system", "test", { 
      timestamp: new Date().toISOString(),
      test: true 
    })
    
    // Check if the log was added
    setTimeout(() => {
      const logs = logStore.getLogs()
      setIsWorking(logs.length > 0)
    }, 100)
  }

  const getStatusIcon = () => {
    if (isWorking === null) {
      return <Terminal className="h-4 w-4" />
    }
    return isWorking ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusText = () => {
    if (isWorking === null) {
      return "Not tested"
    }
    return isWorking ? "Working" : "Not working"
  }

  const getStatusColor = () => {
    if (isWorking === null) {
      return "bg-gray-100 text-gray-800"
    }
    return isWorking ? 
      "bg-green-100 text-green-800" : 
      "bg-red-100 text-red-800"
  }

  return (
    <div className="flex items-center gap-2">
      <Badge className={`flex items-center gap-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-xs">
          Logging: {getStatusText()}
        </span>
      </Badge>
      
      <Badge variant="secondary" className="text-xs">
        {logCount} logs
      </Badge>
      
      <Button 
        onClick={testLogging} 
        size="sm" 
        variant="outline"
        className="h-6 px-2"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Test
      </Button>
    </div>
  )
}