"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  History, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Pause,
  RotateCcw,
  Search,
  Filter,
  Calendar,
  Timer,
  Activity,
  AlertTriangle,
  Info,
  Download,
  Eye,
  Trash2
} from 'lucide-react'

export interface ExecutionRecord {
  id: string
  workflowId: string
  workflowName: string
  status: 'running' | 'success' | 'error' | 'cancelled' | 'waiting'
  startTime: string
  endTime?: string
  duration?: number
  mode: 'manual' | 'trigger' | 'webhook' | 'schedule'
  triggeredBy: string
  nodeExecutions: NodeExecution[]
  error?: {
    message: string
    node?: string
    stack?: string
  }
  data?: Record<string, any>
  retryCount: number
  maxRetries: number
}

export interface NodeExecution {
  nodeId: string
  nodeName: string
  status: 'waiting' | 'running' | 'success' | 'error' | 'skipped'
  startTime?: string
  endTime?: string
  duration?: number
  inputData?: any
  outputData?: any
  error?: string
}

interface ExecutionHistoryProps {
  workflowId?: string
  maxItems?: number
  showFilters?: boolean
  onExecutionSelect?: (execution: ExecutionRecord) => void
}

export function ExecutionHistory({ 
  workflowId, 
  maxItems = 50,
  showFilters = true,
  onExecutionSelect 
}: ExecutionHistoryProps) {
  const [executions, setExecutions] = useState<ExecutionRecord[]>([])
  const [filteredExecutions, setFilteredExecutions] = useState<ExecutionRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [modeFilter, setModeFilter] = useState<string>('all')
  const [selectedExecution, setSelectedExecution] = useState<ExecutionRecord | null>(null)

  useEffect(() => {
    loadExecutions()
  }, [workflowId])

  useEffect(() => {
    filterExecutions()
  }, [executions, searchQuery, statusFilter, modeFilter])

  const loadExecutions = async () => {
    setIsLoading(true)
    
    try {
      // Mock execution data - in real implementation, this would fetch from API
      const mockExecutions: ExecutionRecord[] = [
        {
          id: 'exec-1',
          workflowId: 'workflow-1',
          workflowName: 'Email to Slack Workflow',
          status: 'success',
          startTime: new Date(Date.now() - 3600000).toISOString(),
          endTime: new Date(Date.now() - 3580000).toISOString(),
          duration: 20000,
          mode: 'manual',
          triggeredBy: 'user@example.com',
          nodeExecutions: [
            {
              nodeId: 'webhook-1',
              nodeName: 'Webhook Trigger',
              status: 'success',
              startTime: new Date(Date.now() - 3600000).toISOString(),
              endTime: new Date(Date.now() - 3595000).toISOString(),
              duration: 5000,
              outputData: { message: 'Webhook received' }
            },
            {
              nodeId: 'slack-1',
              nodeName: 'Send to Slack',
              status: 'success',
              startTime: new Date(Date.now() - 3595000).toISOString(),
              endTime: new Date(Date.now() - 3580000).toISOString(),
              duration: 15000,
              inputData: { message: 'Webhook received' },
              outputData: { sent: true, messageId: 'msg-123' }
            }
          ],
          retryCount: 0,
          maxRetries: 3
        },
        {
          id: 'exec-2',
          workflowId: 'workflow-1',
          workflowName: 'Email to Slack Workflow',
          status: 'error',
          startTime: new Date(Date.now() - 7200000).toISOString(),
          endTime: new Date(Date.now() - 7180000).toISOString(),
          duration: 20000,
          mode: 'trigger',
          triggeredBy: 'gmail-trigger',
          nodeExecutions: [
            {
              nodeId: 'gmail-1',
              nodeName: 'Gmail Trigger',
              status: 'success',
              startTime: new Date(Date.now() - 7200000).toISOString(),
              endTime: new Date(Date.now() - 7195000).toISOString(),
              duration: 5000,
              outputData: { subject: 'Test Email', sender: 'test@example.com' }
            },
            {
              nodeId: 'slack-1',
              nodeName: 'Send to Slack',
              status: 'error',
              startTime: new Date(Date.now() - 7195000).toISOString(),
              endTime: new Date(Date.now() - 7180000).toISOString(),
              duration: 15000,
              error: 'Invalid Slack token'
            }
          ],
          error: {
            message: 'Invalid Slack token',
            node: 'slack-1'
          },
          retryCount: 2,
          maxRetries: 3
        },
        {
          id: 'exec-3',
          workflowId: 'workflow-2',
          workflowName: 'Data Processing Pipeline',
          status: 'running',
          startTime: new Date(Date.now() - 300000).toISOString(),
          mode: 'schedule',
          triggeredBy: 'cron-scheduler',
          nodeExecutions: [
            {
              nodeId: 'http-1',
              nodeName: 'Fetch Data',
              status: 'success',
              startTime: new Date(Date.now() - 300000).toISOString(),
              endTime: new Date(Date.now() - 280000).toISOString(),
              duration: 20000,
              outputData: { records: 150 }
            },
            {
              nodeId: 'transform-1',
              nodeName: 'Transform Data',
              status: 'running',
              startTime: new Date(Date.now() - 280000).toISOString()
            }
          ],
          retryCount: 0,
          maxRetries: 3
        }
      ]

      // Filter by workflowId if provided
      const filtered = workflowId 
        ? mockExecutions.filter(exec => exec.workflowId === workflowId)
        : mockExecutions

      setExecutions(filtered.slice(0, maxItems))
    } catch (error) {
      console.error('Failed to load executions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterExecutions = () => {
    let filtered = executions

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(exec => 
        exec.workflowName.toLowerCase().includes(query) ||
        exec.triggeredBy.toLowerCase().includes(query) ||
        exec.id.toLowerCase().includes(query)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(exec => exec.status === statusFilter)
    }

    if (modeFilter !== 'all') {
      filtered = filtered.filter(exec => exec.mode === modeFilter)
    }

    setFilteredExecutions(filtered)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'cancelled':
        return <Pause className="h-4 w-4 text-gray-500" />
      case 'waiting':
        return <Timer className="h-4 w-4 text-yellow-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800'
      case 'success': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      case 'waiting': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'manual': return <Play className="h-3 w-3" />
      case 'trigger': return <Activity className="h-3 w-3" />
      case 'webhook': return <Activity className="h-3 w-3" />
      case 'schedule': return <Calendar className="h-3 w-3" />
      default: return <Activity className="h-3 w-3" />
    }
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const retryExecution = async (executionId: string) => {
    // Implementation for retrying execution
    console.log('Retrying execution:', executionId)
  }

  const cancelExecution = async (executionId: string) => {
    // Implementation for cancelling execution
    console.log('Cancelling execution:', executionId)
  }

  const deleteExecution = async (executionId: string) => {
    if (!confirm('Are you sure you want to delete this execution record?')) return
    
    setExecutions(prev => prev.filter(exec => exec.id !== executionId))
  }

  const downloadExecutionData = (execution: ExecutionRecord) => {
    const data = JSON.stringify(execution, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `execution-${execution.id}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <History className="h-4 w-4" />
          Execution History
        </CardTitle>
        <CardDescription className="text-xs">
          {workflowId ? 'Workflow execution history' : 'All workflow executions'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        {showFilters && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                placeholder="Search executions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 h-8 text-xs"
              />
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={modeFilter} onValueChange={setModeFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="trigger">Trigger</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="schedule">Schedule</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Execution List */}
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {filteredExecutions.map(execution => (
              <div
                key={execution.id}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedExecution(execution)
                  onExecutionSelect?.(execution)
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(execution.status)}
                    <span className="font-medium text-sm">{execution.workflowName}</span>
                    <Badge className={`text-xs ${getStatusColor(execution.status)}`}>
                      {execution.status}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-1">
                    {execution.status === 'error' && execution.retryCount < execution.maxRetries && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          retryExecution(execution.id)
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {execution.status === 'running' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          cancelExecution(execution.id)
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Pause className="h-3 w-3" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadExecutionData(execution)
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteExecution(execution.id)
                      }}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1">
                    {getModeIcon(execution.mode)}
                    {execution.mode}
                  </span>
                  <span>{execution.triggeredBy}</span>
                  <span>{new Date(execution.startTime).toLocaleString()}</span>
                  <span>{formatDuration(execution.duration)}</span>
                </div>

                {execution.error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTriangle className="h-3 w-3" />
                    <AlertDescription className="text-xs">
                      {execution.error.message}
                      {execution.error.node && ` (Node: ${execution.error.node})`}
                    </AlertDescription>
                  </Alert>
                )}

                {execution.retryCount > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <Info className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-blue-600">
                      Retry {execution.retryCount}/{execution.maxRetries}
                    </span>
                  </div>
                )}

                {/* Node execution progress */}
                <div className="mt-2">
                  <div className="flex gap-1">
                    {execution.nodeExecutions.map(nodeExec => (
                      <div
                        key={nodeExec.nodeId}
                        className={`h-2 w-4 rounded-sm ${
                          nodeExec.status === 'success' ? 'bg-green-500' :
                          nodeExec.status === 'error' ? 'bg-red-500' :
                          nodeExec.status === 'running' ? 'bg-blue-500' :
                          nodeExec.status === 'waiting' ? 'bg-yellow-500' :
                          'bg-gray-300'
                        }`}
                        title={`${nodeExec.nodeName}: ${nodeExec.status}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {filteredExecutions.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No execution history found</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {filteredExecutions.filter(e => e.status === 'success').length}
            </div>
            <div className="text-xs text-gray-500">Success</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-red-600">
              {filteredExecutions.filter(e => e.status === 'error').length}
            </div>
            <div className="text-xs text-gray-500">Error</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {filteredExecutions.filter(e => e.status === 'running').length}
            </div>
            <div className="text-xs text-gray-500">Running</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-600">
              {filteredExecutions.length}
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}