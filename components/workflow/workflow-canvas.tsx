"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Play, 
  Save, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Plus
} from "lucide-react"
import { NodeLibrary } from "./node-library"
import { NodeEditor } from "./node-editor"
import { ConnectionManager } from "./connection-manager"
import { ExecutionStatus } from "./execution-status"

// Types
export interface Position {
  x: number
  y: number
}

export interface WorkflowNode {
  id: string
  type: string
  name: string
  position: Position
  parameters: Record<string, any>
  inputs: NodePort[]
  outputs: NodePort[]
  status?: 'idle' | 'running' | 'success' | 'error'
  disabled?: boolean
}

export interface NodePort {
  id: string
  name: string
  type: 'trigger' | 'data' | 'condition'
  required?: boolean
}

export interface Connection {
  id: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
}

export interface WorkflowCanvasProps {
  workflowId?: string
  initialNodes?: WorkflowNode[]
  initialConnections?: Connection[]
  onSave?: (nodes: WorkflowNode[], connections: Connection[]) => void
  onExecute?: (workflowId: string) => void
  readOnly?: boolean
}

export function WorkflowCanvas({
  workflowId,
  initialNodes = [],
  initialConnections = [],
  onSave,
  onExecute,
  readOnly = false
}: WorkflowCanvasProps) {
  // Demo nodes if no initial nodes provided
  const demoNodes: WorkflowNode[] = initialNodes.length > 0 ? initialNodes : [
    {
      id: "webhook-1",
      type: "webhook",
      name: "Webhook Trigger",
      position: { x: 100, y: 150 },
      parameters: {
        path: "/webhook/demo",
        method: "POST"
      },
      inputs: [],
      outputs: [{ id: "trigger", name: "Trigger", type: "trigger" }],
      status: "idle"
    },
    {
      id: "http-1",
      type: "http", 
      name: "API Request",
      position: { x: 400, y: 150 },
      parameters: {
        url: "https://jsonplaceholder.typicode.com/posts/1",
        method: "GET"
      },
      inputs: [{ id: "input", name: "Input", type: "data" }],
      outputs: [{ id: "response", name: "Response", type: "data" }],
      status: "idle"
    },
    {
      id: "condition-1",
      type: "condition",
      name: "Check Response",
      position: { x: 700, y: 150 },
      parameters: {
        field: "statusCode",
        operator: "equals",
        value: "200"
      },
      inputs: [{ id: "input", name: "Input", type: "data" }],
      outputs: [
        { id: "true", name: "Success", type: "condition" },
        { id: "false", name: "Failed", type: "condition" }
      ],
      status: "idle"
    }
  ]

  const demoConnections: Connection[] = initialConnections.length > 0 ? initialConnections : [
    {
      id: "conn-1",
      sourceNodeId: "webhook-1",
      sourcePortId: "trigger",
      targetNodeId: "http-1", 
      targetPortId: "input"
    },
    {
      id: "conn-2",
      sourceNodeId: "http-1",
      sourcePortId: "response",
      targetNodeId: "condition-1",
      targetPortId: "input"
    }
  ]

  // State
  const [nodes, setNodes] = useState<WorkflowNode[]>(demoNodes)
  const [connections, setConnections] = useState<Connection[]>(demoConnections)
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 })
  const [showNodeLibrary, setShowNodeLibrary] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState<{
    nodeId: string
    portId: string
    position: Position
  } | null>(null)
  const [tempConnection, setTempConnection] = useState<Position | null>(null)

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substring(2, 11)

  // Handle node drag start
  const handleNodeDragStart = useCallback((nodeId: string, event: React.MouseEvent) => {
    if (readOnly) return
    
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const offsetX = event.clientX - rect.left - (node.position.x * zoom + pan.x)
    const offsetY = event.clientY - rect.top - (node.position.y * zoom + pan.y)

    setDraggedNode(nodeId)
    setDragOffset({ x: offsetX, y: offsetY })
    setSelectedNode(node)
  }, [nodes, zoom, pan, readOnly])

  // Handle mouse move
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const clientX = event.clientX - rect.left
    const clientY = event.clientY - rect.top

    // Handle node dragging
    if (draggedNode) {
      const newX = (clientX - dragOffset.x - pan.x) / zoom
      const newY = (clientY - dragOffset.y - pan.y) / zoom

      setNodes(prev => prev.map(node => 
        node.id === draggedNode 
          ? { ...node, position: { x: newX, y: newY } }
          : node
      ))
    }

    // Handle panning
    if (isPanning) {
      const deltaX = clientX - panStart.x
      const deltaY = clientY - panStart.y
      setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }))
      setPanStart({ x: clientX, y: clientY })
    }

    // Handle connection drawing
    if (isConnecting && connectionStart) {
      setTempConnection({ x: clientX, y: clientY })
    }
  }, [draggedNode, dragOffset, pan, zoom, isPanning, panStart, isConnecting, connectionStart])

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setDraggedNode(null)
    setIsPanning(false)
    setIsConnecting(false)
    setConnectionStart(null)
    setTempConnection(null)
  }, [])

  // Handle canvas pan start
  const handleCanvasPanStart = useCallback((event: React.MouseEvent) => {
    if (event.target === canvasRef.current) {
      setIsPanning(true)
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        setPanStart({ x: event.clientX - rect.left, y: event.clientY - rect.top })
      }
    }
  }, [])

  // Add node from library
  const handleAddNode = useCallback((nodeType: string, position?: Position) => {
    if (readOnly) return

    const rect = canvasRef.current?.getBoundingClientRect()
    const defaultPosition = position || {
      x: (rect ? rect.width / 2 : 400) / zoom - pan.x / zoom,
      y: (rect ? rect.height / 2 : 300) / zoom - pan.y / zoom
    }

    const newNode: WorkflowNode = {
      id: generateId(),
      type: nodeType,
      name: getNodeDisplayName(nodeType),
      position: defaultPosition,
      parameters: {},
      inputs: getNodeInputs(nodeType),
      outputs: getNodeOutputs(nodeType),
      status: 'idle'
    }

    setNodes(prev => [...prev, newNode])
    setSelectedNode(newNode)
    setShowNodeLibrary(false)
  }, [zoom, pan, readOnly])

  // Delete selected node
  const handleDeleteNode = useCallback((nodeId: string) => {
    if (readOnly) return

    setNodes(prev => prev.filter(n => n.id !== nodeId))
    setConnections(prev => prev.filter(c => 
      c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
    ))
    setSelectedNode(null)
  }, [readOnly])

  // Handle connection start
  const handleConnectionStart = useCallback((nodeId: string, portId: string, event: React.MouseEvent) => {
    if (readOnly) return

    event.stopPropagation()
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    setIsConnecting(true)
    setConnectionStart({
      nodeId,
      portId,
      position: { x: event.clientX - rect.left, y: event.clientY - rect.top }
    })
  }, [readOnly])

  // Handle connection end
  const handleConnectionEnd = useCallback((nodeId: string, portId: string) => {
    if (!connectionStart || !isConnecting || readOnly) return

    // Prevent self-connection
    if (connectionStart.nodeId === nodeId) return

    // Check if connection already exists
    const existingConnection = connections.find(c => 
      c.sourceNodeId === connectionStart.nodeId && 
      c.sourcePortId === connectionStart.portId &&
      c.targetNodeId === nodeId &&
      c.targetPortId === portId
    )

    if (existingConnection) return

    const newConnection: Connection = {
      id: generateId(),
      sourceNodeId: connectionStart.nodeId,
      sourcePortId: connectionStart.portId,
      targetNodeId: nodeId,
      targetPortId: portId
    }

    setConnections(prev => [...prev, newConnection])
    setIsConnecting(false)
    setConnectionStart(null)
    setTempConnection(null)
  }, [connectionStart, isConnecting, connections, readOnly])

  // Zoom functions
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.1))
  const handleZoomReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Save workflow
  const handleSave = async () => {
    if (onSave) {
      onSave(nodes, connections)
    } else {
      // Default save to API
      try {
        const response = await fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: workflowId || `workflow-${Date.now()}`,
            name: `Workflow ${nodes.length} nodes`,
            nodes,
            connections
          })
        })
        
        if (response.ok) {
          console.log('Workflow saved successfully')
        } else {
          console.error('Failed to save workflow')
        }
      } catch (error) {
        console.error('Error saving workflow:', error)
      }
    }
  }

  // Execute workflow
  const handleExecute = async () => {
    if (onExecute && workflowId) {
      onExecute(workflowId)
    } else {
      // Default execution via API
      try {
        console.log('Executing workflow with nodes:', nodes)
        
        // Set all nodes to running status
        setNodes(prev => prev.map(node => ({
          ...node,
          status: 'running'
        })))
        
        const response = await fetch('/api/workflows/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workflowId: workflowId || 'temp-workflow',
            nodes,
            connections,
            triggerData: { timestamp: new Date().toISOString() }
          })
        })
        
        const result = await response.json()
        
        console.log('Execution API response:', result)
        
        if (result.success) {
          console.log('Workflow executed successfully:', result.execution)
          console.log('Node results:', result.execution.nodeResults)
          
          // Update node statuses based on execution result
          setNodes(prev => prev.map(node => {
            const nodeResult = result.execution.nodeResults[node.id]
            let status: 'idle' | 'running' | 'success' | 'error' = 'idle'
            
            if (nodeResult) {
              if (nodeResult.error) {
                status = 'error'
              } else {
                status = 'success'
              }
            }
            
            return {
              ...node,
              status
            }
          }))
        } else {
          console.error('Workflow execution failed:', result.error)
          
          // Mark all nodes as error if workflow failed
          setNodes(prev => prev.map(node => ({
            ...node,
            status: 'error'
          })))
        }
      } catch (error) {
        console.error('Error executing workflow:', error)
        
        // Mark all nodes as error on network/API failure
        setNodes(prev => prev.map(node => ({
          ...node,
          status: 'error'
        })))
      }
    }
  }

  // Add event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMouseMove(e as any)
    }
    const handleGlobalMouseUp = () => {
      handleMouseUp()
    }

    if (draggedNode || isPanning || isConnecting) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [draggedNode, isPanning, isConnecting, handleMouseMove, handleMouseUp])

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar - Node Library */}
      <div className={`transition-all duration-300 ${showNodeLibrary ? 'w-80' : 'w-0'} overflow-hidden border-r border-border`}>
        <NodeLibrary 
          onAddNode={handleAddNode}
          onClose={() => setShowNodeLibrary(false)}
        />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNodeLibrary(!showNodeLibrary)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Node
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleExecute}>
              <Play className="h-4 w-4 mr-2" />
              Execute
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {nodes.length} nodes
            </Badge>
            <Badge variant="secondary">
              {connections.length} connections
            </Badge>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomReset}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onMouseDown={handleCanvasPanStart}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{
              backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
              backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`
            }}
          >
            {/* SVG for connections */}
            <svg
              ref={svgRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 1 }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#6b7280"
                  />
                </marker>
              </defs>

              {/* Render connections */}
              <ConnectionManager
                connections={connections}
                nodes={nodes}
                zoom={zoom}
                pan={pan}
                selectedConnection={selectedConnection}
                onSelectConnection={setSelectedConnection}
                onDeleteConnection={(id: string) => {
                  if (!readOnly) {
                    setConnections(prev => prev.filter(c => c.id !== id))
                  }
                }}
              />

              {/* Temporary connection while dragging */}
              {isConnecting && connectionStart && tempConnection && (
                <line
                  x1={connectionStart.position.x}
                  y1={connectionStart.position.y}
                  x2={tempConnection.x}
                  y2={tempConnection.y}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  markerEnd="url(#arrowhead)"
                />
              )}
            </svg>

            {/* Render nodes */}
            <div className="absolute inset-0" style={{ zIndex: 2 }}>
              {nodes.map(node => (
                <WorkflowNodeComponent
                  key={node.id}
                  node={node}
                  zoom={zoom}
                  pan={pan}
                  selected={selectedNode?.id === node.id}
                  onSelect={() => setSelectedNode(node)}
                  onDragStart={(e) => handleNodeDragStart(node.id, e)}
                  onDelete={() => handleDeleteNode(node.id)}
                  onConnectionStart={handleConnectionStart}
                  onConnectionEnd={handleConnectionEnd}
                  readOnly={readOnly}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Node Editor or Execution Status */}
      <div className="w-80 border-l border-border bg-background">
        {selectedNode ? (
          <NodeEditor
            node={selectedNode}
            onUpdateNode={(updatedNode: WorkflowNode) => {
              setNodes(prev => prev.map(n => 
                n.id === updatedNode.id ? updatedNode : n
              ))
              setSelectedNode(updatedNode)
            }}
            onClose={() => setSelectedNode(null)}
          />
        ) : (
          <div className="p-4">
            <ExecutionStatus 
              workflowId={workflowId || 'default'}
              onExecute={handleExecute}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Individual node component
interface WorkflowNodeComponentProps {
  node: WorkflowNode
  zoom: number
  pan: Position
  selected: boolean
  onSelect: () => void
  onDragStart: (e: React.MouseEvent) => void
  onDelete: () => void
  onConnectionStart: (nodeId: string, portId: string, e: React.MouseEvent) => void
  onConnectionEnd: (nodeId: string, portId: string) => void
  readOnly: boolean
}

function WorkflowNodeComponent({
  node,
  zoom,
  pan,
  selected,
  onSelect,
  onDragStart,
  onDelete,
  onConnectionStart,
  onConnectionEnd,
  readOnly
}: WorkflowNodeComponentProps) {
  const nodeStyle = {
    transform: `translate(${node.position.x * zoom + pan.x}px, ${node.position.y * zoom + pan.y}px) scale(${zoom})`,
    transformOrigin: 'top left'
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'webhook': return '🌐'
      case 'schedule': return '⏰'
      case 'http': return '🌐'
      case 'email': return '📧'
      case 'condition': return '🔀'
      case 'transform': return '🔄'
      case 'slack': return '💬'
      case 'gmail': return '📧'
      case 'notion': return '📝'
      case 'airtable': return '📊'
      case 'jira': return '🎫'
      case 'trello': return '📋'
      case 'asana': return '✅'
      case 'monday': return '📅'
      default: return '⚙️'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'running': return 'border-yellow-500 bg-yellow-50'
      case 'success': return 'border-green-500 bg-green-50'
      case 'error': return 'border-red-500 bg-red-50'
      default: return 'border-border bg-background'
    }
  }

  return (
    <div
      className="absolute pointer-events-auto"
      style={nodeStyle}
    >
      <Card
        className={`w-48 cursor-pointer transition-all ${
          selected ? 'ring-2 ring-primary' : ''
        } ${getStatusColor(node.status)} ${
          node.disabled ? 'opacity-50' : ''
        }`}
        onClick={onSelect}
        onMouseDown={onDragStart}
      >
        {/* Node Header */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getNodeIcon(node.type)}</span>
              <span className="font-medium text-sm truncate">{node.name}</span>
            </div>
            {!readOnly && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Input Ports */}
        {node.inputs.length > 0 && (
          <div className="px-3 py-2">
            {node.inputs.map(input => (
              <div
                key={input.id}
                className="flex items-center gap-2 py-1"
              >
                <div
                  className="w-3 h-3 rounded-full border-2 border-gray-400 bg-white cursor-pointer hover:border-primary"
                  onMouseUp={() => onConnectionEnd(node.id, input.id)}
                />
                <span className="text-xs text-muted-foreground">{input.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Output Ports */}
        {node.outputs.length > 0 && (
          <div className="px-3 py-2 border-t border-border">
            {node.outputs.map(output => (
              <div
                key={output.id}
                className="flex items-center justify-end gap-2 py-1"
              >
                <span className="text-xs text-muted-foreground">{output.name}</span>
                <div
                  className="w-3 h-3 rounded-full border-2 border-gray-400 bg-white cursor-pointer hover:border-primary"
                  onMouseDown={(e) => onConnectionStart(node.id, output.id, e)}
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

// Helper functions
function getNodeDisplayName(type: string): string {
  const names: Record<string, string> = {
    webhook: 'Webhook Trigger',
    schedule: 'Schedule Trigger',
    http: 'HTTP Request',
    email: 'Send Email',
    condition: 'IF Condition',
    transform: 'Transform Data',
    slack: 'Slack Message',
    gmail: 'Gmail',
    notion: 'Notion',
    airtable: 'Airtable',
    jira: 'Jira',
    trello: 'Trello',
    asana: 'Asana',
    monday: 'Monday.com'
  }
  return names[type] || type
}

function getNodeInputs(type: string): NodePort[] {
  const inputs: Record<string, NodePort[]> = {
    webhook: [],
    schedule: [],
    http: [{ id: 'input', name: 'Input', type: 'data' }],
    email: [{ id: 'data', name: 'Data', type: 'data' }],
    condition: [{ id: 'input', name: 'Input', type: 'data' }],
    transform: [{ id: 'input', name: 'Input', type: 'data' }],
    slack: [{ id: 'data', name: 'Data', type: 'data' }],
    gmail: [{ id: 'data', name: 'Data', type: 'data' }],
    notion: [{ id: 'data', name: 'Data', type: 'data' }],
    airtable: [{ id: 'data', name: 'Data', type: 'data' }],
    jira: [{ id: 'data', name: 'Data', type: 'data' }],
    trello: [{ id: 'data', name: 'Data', type: 'data' }],
    asana: [{ id: 'data', name: 'Data', type: 'data' }],
    monday: [{ id: 'data', name: 'Data', type: 'data' }]
  }
  return inputs[type] || [{ id: 'input', name: 'Input', type: 'data' }]
}

function getNodeOutputs(type: string): NodePort[] {
  const outputs: Record<string, NodePort[]> = {
    webhook: [{ id: 'trigger', name: 'Trigger', type: 'trigger' }],
    schedule: [{ id: 'trigger', name: 'Trigger', type: 'trigger' }],
    http: [{ id: 'response', name: 'Response', type: 'data' }],
    email: [{ id: 'sent', name: 'Sent', type: 'data' }],
    condition: [
      { id: 'true', name: 'True', type: 'condition' },
      { id: 'false', name: 'False', type: 'condition' }
    ],
    transform: [{ id: 'output', name: 'Output', type: 'data' }],
    slack: [{ id: 'sent', name: 'Sent', type: 'data' }],
    gmail: [{ id: 'sent', name: 'Sent', type: 'data' }],
    notion: [{ id: 'created', name: 'Created', type: 'data' }],
    airtable: [{ id: 'record', name: 'Record', type: 'data' }],
    jira: [{ id: 'result', name: 'Result', type: 'data' }],
    trello: [{ id: 'result', name: 'Result', type: 'data' }],
    asana: [{ id: 'result', name: 'Result', type: 'data' }],
    monday: [{ id: 'result', name: 'Result', type: 'data' }]
  }
  return outputs[type] || [{ id: 'output', name: 'Output', type: 'data' }]
}