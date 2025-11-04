"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ExecutionTest() {
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testWorkflow = {
    workflowId: "test-execution",
    nodes: [
      {
        id: "http-1", 
        type: "http",
        name: "Test API Call",
        parameters: {
          url: "https://jsonplaceholder.typicode.com/posts/1",
          method: "GET"
        }
      }
    ],
    connections: []
  }

  const handleTest = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testWorkflow,
          triggerData: { test: true, timestamp: new Date().toISOString() }
        })
      })

      const data = await response.json()
      setResult(data)
      console.log('Test execution result:', data)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Test failed' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6 max-w-2xl">
      <h3 className="text-lg font-semibold mb-4">Execution Engine Test</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            This will test the execution engine with a simple 2-node workflow:
          </p>
          <ul className="text-sm space-y-1 ml-4">
            <li>• HTTP Request node only</li>
            <li>• Makes real API call to JSONPlaceholder</li>
          </ul>
        </div>

        <Button onClick={handleTest} disabled={isLoading} className="w-full">
          {isLoading ? 'Testing...' : 'Test Execution Engine'}
        </Button>

        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.success ? "Success" : "Failed"}
              </Badge>
              {result.execution?.duration && (
                <Badge variant="secondary">
                  {result.execution.duration}ms
                </Badge>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-2">Result:</h4>
              <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-60">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>

            {result.execution?.nodeResults && (
              <div>
                <h4 className="font-medium mb-2">Node Results:</h4>
                {Object.entries(result.execution.nodeResults).map(([nodeId, nodeResult]: [string, any]) => (
                  <div key={nodeId} className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{nodeId}</Badge>
                      <Badge variant={nodeResult.error ? "destructive" : "default"}>
                        {nodeResult.error ? "Error" : "Success"}
                      </Badge>
                    </div>
                    <pre className="bg-muted p-2 rounded text-xs">
                      {JSON.stringify(nodeResult, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}