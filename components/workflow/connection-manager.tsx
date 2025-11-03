"use client"

import React from "react"
import { Connection, WorkflowNode, Position } from "./workflow-canvas"

interface ConnectionManagerProps {
  connections: Connection[]
  nodes: WorkflowNode[]
  zoom: number
  pan: Position
  selectedConnection: Connection | null
  onSelectConnection: (connection: Connection | null) => void
  onDeleteConnection: (connectionId: string) => void
}

export function ConnectionManager({
  connections,
  nodes,
  zoom,
  pan,
  selectedConnection,
  onSelectConnection,
  onDeleteConnection
}: ConnectionManagerProps) {
  
  const getNodeById = (nodeId: string) => {
    return nodes.find(node => node.id === nodeId)
  }

  const getPortPosition = (node: WorkflowNode, portId: string, isOutput: boolean): Position => {
    const nodeX = node.position.x * zoom + pan.x
    const nodeY = node.position.y * zoom + pan.y
    
    // Node dimensions (should match the actual node component)
    const nodeWidth = 192 * zoom // 48 * 4 = 192px (w-48)
    const nodeHeight = 120 * zoom // Approximate height
    
    if (isOutput) {
      // Output ports are on the right side
      return {
        x: nodeX + nodeWidth,
        y: nodeY + nodeHeight / 2
      }
    } else {
      // Input ports are on the left side
      return {
        x: nodeX,
        y: nodeY + nodeHeight / 2
      }
    }
  }

  const createConnectionPath = (start: Position, end: Position): string => {
    const dx = end.x - start.x
    const dy = end.y - start.y
    
    // Create a curved path for better visual appeal
    const controlPointOffset = Math.abs(dx) * 0.5
    const cp1x = start.x + controlPointOffset
    const cp1y = start.y
    const cp2x = end.x - controlPointOffset
    const cp2y = end.y
    
    return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`
  }

  const handleConnectionClick = (connection: Connection, event: React.MouseEvent) => {
    event.stopPropagation()
    onSelectConnection(connection)
  }

  const handleConnectionDoubleClick = (connection: Connection, event: React.MouseEvent) => {
    event.stopPropagation()
    onDeleteConnection(connection.id)
  }

  return (
    <g>
      {connections.map(connection => {
        const sourceNode = getNodeById(connection.sourceNodeId)
        const targetNode = getNodeById(connection.targetNodeId)
        
        if (!sourceNode || !targetNode) return null
        
        const startPos = getPortPosition(sourceNode, connection.sourcePortId, true)
        const endPos = getPortPosition(targetNode, connection.targetPortId, false)
        const path = createConnectionPath(startPos, endPos)
        
        const isSelected = selectedConnection?.id === connection.id
        
        return (
          <g key={connection.id}>
            {/* Invisible thick line for easier clicking */}
            <path
              d={path}
              stroke="transparent"
              strokeWidth="12"
              fill="none"
              className="cursor-pointer"
              onClick={(e) => handleConnectionClick(connection, e)}
              onDoubleClick={(e) => handleConnectionDoubleClick(connection, e)}
            />
            
            {/* Visible connection line */}
            <path
              d={path}
              stroke={isSelected ? "#3b82f6" : "#6b7280"}
              strokeWidth={isSelected ? "3" : "2"}
              fill="none"
              markerEnd="url(#arrowhead)"
              className={`transition-all duration-200 ${isSelected ? 'drop-shadow-sm' : ''}`}
              style={{
                filter: isSelected ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))' : 'none'
              }}
            />
            
            {/* Connection label (optional) */}
            {isSelected && (
              <g>
                <circle
                  cx={(startPos.x + endPos.x) / 2}
                  cy={(startPos.y + endPos.y) / 2}
                  r="8"
                  fill="#3b82f6"
                  className="cursor-pointer"
                  onClick={(e) => handleConnectionDoubleClick(connection, e)}
                />
                <text
                  x={(startPos.x + endPos.x) / 2}
                  y={(startPos.y + endPos.y) / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="10"
                  className="pointer-events-none select-none"
                >
                  ×
                </text>
              </g>
            )}
          </g>
        )
      })}
    </g>
  )
}