"use client"

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Save, 
  Upload, 
  Download, 
  Settings, 
  History, 
  Database, 
  Code,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Workflow,
  Globe,
  Terminal
} from 'lucide-react'
import { WorkflowCanvas, WorkflowNode, Connection } from './workflow-canvas'
import { NodeLibrary } from './node-library'
import { DataInspector } from './data-inspector'
import { ExecutionHistory, ExecutionRecord } from './execution-history'
import { EnvironmentVariables, EnvironmentVariable } from './environment-variables'
import { WorkflowManagerModal } from './workflow-manager-modal'
import { ExpressionEditor } from './expression-editor'
import { TicketStatusTracker } from './ticket-status-tracker'
import { LogViewer, generateSampleLogs } from './log-viewer'
import { logger } from './execution-logs'
import { QuickLogTest } from './quick-log-test'
import { WorkflowManager, WorkflowDefinition } from '@/lib/workflow-manager'
import { ErrorHandler } from '@/lib/error-handler'

interface EnhancedWorkflowEditorProps {
  workflowId?: string
  initialWorkflow?: WorkflowDefinition
  onWorkflowChange?: (workflow: { nodes: WorkflowNode[]; connections: Connection[] }) => void
}

export function EnhancedWorkflowEditor({
  workflowId,
  initialWorkflow,
  onWorkflowChange
}: EnhancedWorkflowEditorProps) {
  // Workflow state
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialWorkflow?.nodes || [])
  const [connections, setConnections] = useState<Connection[]>(initialWorkflow?.connections || [])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [workflowName, setWorkflowName] = useState(initialWorkflow?.name || 'Untitled Workflow')
  const [workflowDescription, setWorkflowDescription] = useState(initialWorkflow?.description || '')

  // UI state
  const [activeTab, setActiveTab] = useState('canvas')
  const [showNodeLibrary, setShowNodeLibrary] = useState(true)
  const [showManagerModal, setShowManagerModal] = useState(false)
  const [managerMode, setManagerMode] = useState<'save' | 'load' | 'templates' | 'import' | 'export'>('save')
  
  // Execution state
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [executionData, setExecutionData] = useState<Record<string, any>>({})
  const [executionHistory, setExecutionHistory] = useState<ExecutionRecord[]>([])

  // Environment variables
  const [environmentVariables, setEnvironmentVariables] = useState<EnvironmentVariable[]>([])

  const workflowManager = WorkflowManager.getInstance()
  const errorHandler = new ErrorHandler()

  // Workflow operations
  const handleNodesChange = useCallback((newNodes: WorkflowNode[]) => {
    setNodes(newNodes)
    onWorkflowChange?.({ nodes: newNodes, connections })
  }, [connections, onWorkflowChange])

  const handleConnectionsChange = useCallback((newConnections: Connection[]) => {
    setConnections(newConnections)
    onWorkflowChange?.({ nodes, connections: newConnections })
  }, [nodes, onWorkflowChange])

  const handleSaveWorkflow = async () => {
    try {
      const workflowData = {
        id: workflowId,
        name: workflowName,
        description: workflowDescription,
        nodes,
        connections,
        variables: environmentVariables.reduce((acc, env) => {
          acc[env.key] = env.value
          return acc
        }, {} as Record<string, any>)
      }

      await workflowManager.saveWorkflow(workflowData)
      
      // Show success feedback
      setExecutionStatus('success')
      setTimeout(() => setExecutionStatus('idle'), 2000)
    } catch (error) {
      console.error('Failed to save workflow:', error)
      setExecutionStatus('error')
      setTimeout(() => setExecutionStatus('idle'), 2000)
    }
  }

  const handleLoadWorkflow = (workflow: WorkflowDefinition) => {
    setNodes(workflow.nodes)
    setConnections(workflow.connections)
    setWorkflowName(workflow.name)
    setWorkflowDescription(workflow.description || '')
    
    // Load environment variables
    if (workflow.variables) {
      const envVars: EnvironmentVariable[] = Object.entries(workflow.variables).map(([key, value]) => ({
        id: `env-${key}`,
        key,
        value: String(value),
        type: 'string',
        encrypted: false,
        scope: 'workflow',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
      setEnvironmentVariables(envVars)
    }
  }

  const handleExecuteWorkflow = async () => {
    if (nodes.length === 0) {
      logger.warning('No nodes in workflow', 'workflow', { workflowId })
      alert('Add some nodes to execute the workflow')
      return
    }

    setIsExecuting(true)
    setExecutionStatus('running')

    const executionId = `exec-${Date.now()}`
    const startTime = new Date().toISOString()

    logger.info('Starting workflow execution', 'workflow', { 
      workflowId, 
      executionId,
      workflowName,
      nodeCount: nodes.length, 
      connectionCount: connections.length 
    })

    try {
      // Mock execution data for each node
      const mockExecutionData: Record<string, any> = {}
      
      for (const node of nodes) {
        logger.info(`Executing node: ${node.name}`, 'workflow', { 
          nodeId: node.id, 
          nodeType: node.type,
          executionId 
        }, node.id, executionId)

        // Update node to running status
        setNodes(prev => prev.map(n => 
          n.id === node.id ? { ...n, status: 'running' } : n
        ))
        
        // Simulate processing time
        const processingTime = 1000 + Math.random() * 1000
        await new Promise(resolve => setTimeout(resolve, processingTime))
        
        // Generate mock output based on node type
        mockExecutionData[node.id] = generateMockNodeOutput(node)
        
        // Update node status to success
        setNodes(prev => prev.map(n => 
          n.id === node.id ? { ...n, status: 'success' } : n
        ))

        logger.success(`Node executed successfully: ${node.name}`, 'workflow', { 
          nodeId: node.id, 
          executionTime: Math.round(processingTime),
          output: mockExecutionData[node.id],
          executionId 
        }, node.id, executionId)
      }

      setExecutionData(mockExecutionData)
      setExecutionStatus('success')

      // Add to execution history
      const executionRecord: ExecutionRecord = {
        id: executionId,
        workflowId: workflowId || 'current',
        workflowName,
        status: 'success',
        startTime,
        endTime: new Date().toISOString(),
        duration: nodes.length * 1000,
        mode: 'manual',
        triggeredBy: 'user',
        nodeExecutions: nodes.map(node => ({
          nodeId: node.id,
          nodeName: node.name,
          status: 'success',
          startTime,
          endTime: new Date().toISOString(),
          duration: 1000,
          outputData: mockExecutionData[node.id]
        })),
        retryCount: 0,
        maxRetries: 3
      }

      setExecutionHistory(prev => [executionRecord, ...prev])

      logger.success('Workflow execution completed successfully', 'workflow', { 
        executionId,
        duration: executionRecord.duration,
        nodesExecuted: nodes.length,
        workflowId,
        workflowName
      })

    } catch (error) {
      logger.error('Workflow execution failed', 'workflow', { 
        executionId,
        error: error instanceof Error ? error.message : 'Unknown error',
        workflowId,
        workflowName
      })
      setExecutionStatus('error')
      
      // Reset node statuses
      setNodes(prev => prev.map(n => ({ ...n, status: 'error' })))
    } finally {
      setIsExecuting(false)
      
      // Reset status after delay
      setTimeout(() => {
        setExecutionStatus('idle')
        setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })))
      }, 3000)
    }
  }

  const generateMockNodeOutput = (node: WorkflowNode): any => {
    switch (node.type) {
      case 'webhook':
        return {
          headers: { 'content-type': 'application/json' },
          body: { message: 'Webhook triggered', timestamp: new Date().toISOString() },
          query: { source: 'test' }
        }
      case 'http':
        return {
          statusCode: 200,
          body: { success: true, data: 'API response' },
          headers: { 'content-type': 'application/json' }
        }
      case 'gmail-trigger':
        return {
          subject: 'Test Email',
          sender: 'test@example.com',
          body: 'This is a test email',
          receivedAt: new Date().toISOString()
        }
      case 'jira':
        return {
          key: 'PROJ-123',
          summary: 'Test Issue',
          status: 'Open',
          created: new Date().toISOString()
        }
      default:
        return { result: 'success', timestamp: new Date().toISOString() }
    }
  }

  const getExecutionStatusIcon = () => {
    switch (executionStatus) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold">{workflowName}</h1>
            {workflowDescription && (
              <p className="text-sm text-gray-600">{workflowDescription}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">{nodes.length} nodes</Badge>
            <Badge variant="outline">{connections.length} connections</Badge>
            {getExecutionStatusIcon()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setManagerMode('save')
              setShowManagerModal(true)
            }}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setManagerMode('load')
              setShowManagerModal(true)
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Load
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setManagerMode('templates')
              setShowManagerModal(true)
            }}
          >
            <Code className="h-4 w-4 mr-2" />
            Templates
          </Button>

          <Button
            onClick={handleExecuteWorkflow}
            disabled={isExecuting || nodes.length === 0}
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            {isExecuting ? 'Executing...' : 'Execute'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Node Library */}
        {showNodeLibrary && (
          <div className="w-80 border-r bg-white">
            <NodeLibrary
              onAddNode={(nodeType) => {
                // Add node logic would be handled by WorkflowCanvas
                console.log('Adding node:', nodeType)
              }}
              onClose={() => setShowNodeLibrary(false)}
            />
          </div>
        )}

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col">
          <WorkflowCanvas
            workflowId={workflowId || 'current'}
            initialNodes={nodes}
            initialConnections={connections}
            onSave={(newNodes, newConnections) => {
              setNodes(newNodes)
              setConnections(newConnections)
            }}
            onExecute={() => handleExecuteWorkflow()}
          />
        </div>

        {/* Right Sidebar - Tabs */}
        <div className="w-96 border-l bg-white">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-6 m-2">
              <TabsTrigger value="canvas" className="text-xs">
                <Workflow className="h-3 w-3 mr-1" />
                Canvas
              </TabsTrigger>
              <TabsTrigger value="tickets" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Tickets
              </TabsTrigger>
              <TabsTrigger value="logs" className="text-xs">
                <Terminal className="h-3 w-3 mr-1" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="data" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                Data
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs">
                <History className="h-3 w-3 mr-1" />
                History
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">
                <Settings className="h-3 w-3 mr-1" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="canvas" className="h-full m-0 p-4">
                <div className="space-y-4">
                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Workflow Info</h3>
                    <div className="space-y-2 text-sm">
                      <div>Nodes: {nodes.length}</div>
                      <div>Connections: {connections.length}</div>
                      <div>Status: {executionStatus}</div>
                    </div>
                  </Card>

                  {selectedNodeId && (
                    <Card className="p-4">
                      <h3 className="font-medium mb-2">Selected Node</h3>
                      <div className="text-sm">
                        {nodes.find(n => n.id === selectedNodeId)?.name || 'Unknown'}
                      </div>
                    </Card>
                  )}

                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setShowNodeLibrary(!showNodeLibrary)}
                      >
                        <Code className="h-4 w-4 mr-2" />
                        {showNodeLibrary ? 'Hide' : 'Show'} Node Library
                      </Button>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="tickets" className="h-full m-0 p-4">
                <TicketStatusTracker
                  workflowId={workflowId || 'default'}
                  onExecute={handleExecuteWorkflow}
                />
              </TabsContent>

              <TabsContent value="logs" className="h-full m-0 p-4">
                <div className="space-y-4">
                  <QuickLogTest 
                    workflowId={workflowId || 'default'}
                    showViewer={false}
                    compact={true}
                  />
                  <LogViewer
                    workflowId={workflowId || 'default'}
                    maxHeight="calc(100vh - 400px)"
                  />
                </div>
              </TabsContent>

              <TabsContent value="data" className="h-full m-0">
                <DataInspector
                  nodes={nodes}
                  selectedNodeId={selectedNodeId || undefined}
                  executionData={executionData}
                  onNodeSelect={setSelectedNodeId}
                />
              </TabsContent>

              <TabsContent value="history" className="h-full m-0">
                <ExecutionHistory
                  workflowId={workflowId}
                  onExecutionSelect={(execution) => {
                    console.log('Selected execution:', execution)
                  }}
                />
              </TabsContent>

              <TabsContent value="settings" className="h-full m-0">
                <EnvironmentVariables
                  workflowId={workflowId}
                  scope="workflow"
                  onVariableChange={setEnvironmentVariables}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Workflow Manager Modal */}
      <WorkflowManagerModal
        isOpen={showManagerModal}
        onClose={() => setShowManagerModal(false)}
        mode={managerMode}
        currentWorkflow={{
          nodes,
          connections,
          name: workflowName,
          description: workflowDescription
        }}
        onWorkflowLoad={handleLoadWorkflow}
      />
    </div>
  )
}