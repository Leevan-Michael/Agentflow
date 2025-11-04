"use client"

import React from "react"
import { WorkflowCanvas, WorkflowNode, Connection } from "./workflow-canvas"

// Demo data for the workflow canvas
const demoNodes: WorkflowNode[] = [
  {
    id: "http-1", 
    type: "http",
    name: "Send Welcome Email",
    position: { x: 400, y: 100 },
    parameters: {
      url: "https://api.sendgrid.com/v3/mail/send",
      method: "POST"
    },
    inputs: [{ id: "input", name: "Input", type: "data" }],
    outputs: [{ id: "response", name: "Response", type: "data" }],
    status: "idle"
  },
  {
    id: "condition-1",
    type: "condition", 
    name: "Check Email Success",
    position: { x: 700, y: 100 },
    parameters: {
      field: "response.status",
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

const demoConnections: Connection[] = [
  {
    id: "conn-2",
    sourceNodeId: "http-1",
    sourcePortId: "response",
    targetNodeId: "condition-1", 
    targetPortId: "input"
  }
]

export function WorkflowDemo() {
  const handleSave = (nodes: WorkflowNode[], connections: Connection[]) => {
    console.log("Saving workflow:", { nodes, connections })
    // Here you would typically save to your backend
  }

  const handleExecute = (workflowId: string) => {
    console.log("Executing workflow:", workflowId)
    // Here you would trigger workflow execution
  }

  return (
    <div className="h-screen">
      <WorkflowCanvas
        workflowId="demo-workflow"
        initialNodes={demoNodes}
        initialConnections={demoConnections}
        onSave={handleSave}
        onExecute={handleExecute}
      />
    </div>
  )
}