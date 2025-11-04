"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Terminal,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Clock,
  Trash2,
  Download,
  Search,
  Filter,
  Play,
  Pause,
  RefreshCw
} from "lucide-react"

export interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'success' | 'warning' | 'error' | 'debug'
  category: string
  message: string
  details?: any
  nodeId?: string
  executionId?: string
}

interface ExecutionLogsProps {
  workflowId?: string
  nodeId?: string
  maxEntries?: number
  autoScroll?: boolean
  showFilters?: boolean
  className?: string
}

// Global log store
class LogStore {
  private logs: LogEntry[] = []
  private listeners: Set<(logs: LogEntry[]) => void> = new Set()
  private maxLogs = 1000

  addLog(entry: Omit<LogEntry, 'id' | 'timestamp'>) {
    const logEntry: LogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }

    this.logs.unshift(logEntry)
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    this.notifyListeners()
  }

  getLogs(filters?: {
    level?: string
    category?: string
    nodeId?: string
    search?: string
  }): LogEntry[] {
    let filteredLogs = [...this.logs]

    if (filters?.level && filters.level !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.level === filters.level)
    }

    if (filters?.category && filters.category !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.category === filters.category)
    }

    if (filters?.nodeId) {
      filteredLogs = filteredLogs.filter(log => log.nodeId === filters.nodeId)
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        log.category.toLowerCase().includes(searchLower)
      )
    }

    return filteredLogs
  }

  clearLogs() {
    this.logs = []
    this.notifyListeners()
  }

  subscribe(listener: (logs: LogEntry[]) => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.logs]))
  }
}

// Global log store instance
export const logStore = new LogStore()

// Logging functions
export const logger = {
  info: (message: string, category = 'general', details?: any, nodeId?: string, executionId?: string) => {
    logStore.addLog({ level: 'info', category, message, details, nodeId, executionId })
  },
  success: (message: string, category = 'general', details?: any, nodeId?: string, executionId?: string) => {
    logStore.addLog({ level: 'success', category, message, details, nodeId, executionId })
  },
  warning: (message: string, category = 'general', details?: any, nodeId?: string, executionId?: string) => {
    logStore.addLog({ level: 'warning', category, message, details, nodeId, executionId })
  },
  error: (message: string, category = 'general', details?: any, nodeId?: string, executionId?: string) => {
    logStore.addLog({ level: 'error', category, message, details, nodeId, executionId })
  },
  debug: (message: string, category = 'general', details?: any, nodeId?: string, executionId?: string) => {
    logStore.addLog({ level: 'debug', category, message, details, nodeId, executionId })
  }
}

export function ExecutionLogs({
  workflowId,
  nodeId,
  maxEntries = 100,
  autoScroll = true,
  showFilters = true,
  className = ""
}: ExecutionLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [filters, setFilters] = useState({
    level: 'all',
    category: 'all',
    search: ''
  })
  const [isPaused, setIsPaused] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsubscribe = logStore.subscribe((newLogs) => {
      if (!isPaused) {
        setLogs(newLogs.slice(0, maxEntries))
      }
    })

    // Initial load
    setLogs(logStore.getLogs().slice(0, maxEntries))

    return unsubscribe
  }, [maxEntries, isPaused])

  useEffect(() => {
    const filtered = logStore.getLogs({
      ...filters,
      nodeId: nodeId
    }).slice(0, maxEntries)
    
    setFilteredLogs(filtered)
  }, [logs, filters, nodeId, maxEntries])

  useEffect(() => {
    if (autoScroll && !isPaused && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0
    }
  }, [filteredLogs, autoScroll, isPaused])

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'debug':
        return <Terminal className="h-4 w-4 text-gray-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'debug':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    })
  }

  const exportLogs = () => {
    const logData = filteredLogs.map(log => ({
      timestamp: log.timestamp.toISOString(),
      level: log.level,
      category: log.category,
      message: log.message,
      nodeId: log.nodeId,
      executionId: log.executionId,
      details: log.details
    }))

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workflow-logs-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const categories = Array.from(new Set(logs.map(log => log.category)))

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Execution Logs
            </CardTitle>
            <CardDescription>
              Real-time workflow execution logs and status updates
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logStore.clearLogs()}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={exportLogs}
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      {showFilters && (
        <CardContent className="pb-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1">
              <Input
                placeholder="Search logs..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="h-8"
              />
            </div>
            <Select
              value={filters.level}
              onValueChange={(value) => setFilters(prev => ({ ...prev, level: value }))}
            >
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {filteredLogs.length} of {logs.length} logs
              {isPaused && <Badge variant="secondary" className="ml-2 text-xs">Paused</Badge>}
            </span>
            <span>
              {nodeId && `Node: ${nodeId}`}
            </span>
          </div>
        </CardContent>
      )}

      <CardContent className="pt-0">
        <ScrollArea className="h-96" ref={scrollAreaRef}>
          <div className="space-y-1">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Terminal className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <div className="text-sm">No logs to display</div>
                <div className="text-xs">Logs will appear here as workflows execute</div>
              </div>
            ) : (
              filteredLogs.map((log, index) => (
                <div key={log.id} className="group">
                  <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0 mt-0.5">
                      {getLogIcon(log.level)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`text-xs ${getLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {log.category}
                        </Badge>
                        {log.nodeId && (
                          <Badge variant="outline" className="text-xs">
                            {log.nodeId}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-foreground mb-1">
                        {log.message}
                      </div>
                      
                      {log.details && (
                        <details className="text-xs text-muted-foreground">
                          <summary className="cursor-pointer hover:text-foreground">
                            Show details
                          </summary>
                          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                            {typeof log.details === 'string' 
                              ? log.details 
                              : JSON.stringify(log.details, null, 2)
                            }
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                  
                  {index < filteredLogs.length - 1 && (
                    <Separator className="my-1 opacity-30" />
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// Hook for easy logging in components
export function useLogger() {
  return logger
}