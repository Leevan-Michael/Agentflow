"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Play, 
  Square, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Zap,
  AlertTriangle
} from 'lucide-react'

interface TestScenario {
  id: string
  name: string
  description: string
  steps: string[]
  expectedResult: string
  status: 'pending' | 'running' | 'passed' | 'failed'
}

const testScenarios: TestScenario[] = [
  {
    id: 'basic-canvas',
    name: 'Basic Canvas Operations',
    description: 'Test pan, zoom, and basic canvas interactions',
    steps: [
      'Pan the canvas by dragging',
      'Zoom in and out using mouse wheel',
      'Double-click to reset view'
    ],
    expectedResult: 'Canvas responds smoothly to all interactions',
    status: 'pending'
  },
  {
    id: 'add-nodes',
    name: 'Add Nodes',
    description: 'Test adding different types of nodes',
    steps: [
      'Open node library',
      'Add a Webhook trigger node',
      'Add an HTTP Request action node',
      'Add a Jira integration node'
    ],
    expectedResult: 'All nodes appear correctly on canvas with proper styling',
    status: 'pending'
  },
  {
    id: 'create-connections',
    name: 'Create Connections',
    description: 'Test the n8n-style connection system',
    steps: [
      'Hover over a node to see ports',
      'Drag from output port to input port',
      'Try invalid connections (should fail)',
      'Create multiple connections'
    ],
    expectedResult: 'Valid connections created, invalid ones rejected with visual feedback',
    status: 'pending'
  },
  {
    id: 'node-management',
    name: 'Node Management',
    description: 'Test node selection, movement, and deletion',
    steps: [
      'Select nodes by clicking',
      'Move nodes by dragging',
      'Use node context menu',
      'Delete nodes and verify connections are removed'
    ],
    expectedResult: 'All node operations work correctly',
    status: 'pending'
  },
  {
    id: 'keyboard-shortcuts',
    name: 'Keyboard Shortcuts',
    description: 'Test keyboard shortcuts functionality',
    steps: [
      'Select node and press Delete',
      'Select node and press Ctrl+D to duplicate',
      'Press Escape during connection creation',
      'Use Backspace to delete'
    ],
    expectedResult: 'All keyboard shortcuts work as expected',
    status: 'pending'
  },
  {
    id: 'workflow-execution',
    name: 'Workflow Execution',
    description: 'Test workflow execution and status updates',
    steps: [
      'Create a simple workflow',
      'Click Execute button',
      'Observe status changes',
      'Test Stop functionality'
    ],
    expectedResult: 'Execution starts, shows progress, and completes with status updates',
    status: 'pending'
  }
]

export function WorkflowTestHelper() {
  const [scenarios, setScenarios] = useState<TestScenario[]>(testScenarios)
  const [currentTest, setCurrentTest] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const updateScenarioStatus = (id: string, status: TestScenario['status']) => {
    setScenarios(prev => prev.map(scenario => 
      scenario.id === id ? { ...scenario, status } : scenario
    ))
  }

  const runTest = async (scenario: TestScenario) => {
    setCurrentTest(scenario.id)
    updateScenarioStatus(scenario.id, 'running')
    
    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // For demo purposes, randomly pass/fail
    const passed = Math.random() > 0.3
    updateScenarioStatus(scenario.id, passed ? 'passed' : 'failed')
    setCurrentTest(null)
  }

  const runAllTests = async () => {
    for (const scenario of scenarios) {
      await runTest(scenario)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  const resetTests = () => {
    setScenarios(prev => prev.map(scenario => ({ ...scenario, status: 'pending' })))
    setCurrentTest(null)
  }

  const getStatusIcon = (status: TestScenario['status']) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case 'passed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusColor = (status: TestScenario['status']) => {
    switch (status) {
      case 'running': return 'border-blue-500 bg-blue-50'
      case 'passed': return 'border-green-500 bg-green-50'
      case 'failed': return 'border-red-500 bg-red-50'
      default: return 'border-gray-200 bg-white'
    }
  }

  const passedCount = scenarios.filter(s => s.status === 'passed').length
  const failedCount = scenarios.filter(s => s.status === 'failed').length
  const totalCount = scenarios.length

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
        size="sm"
      >
        <Zap className="h-4 w-4 mr-2" />
        Test Helper
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto z-50 shadow-lg">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Workflow Test Helper</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            ×
          </Button>
        </div>

        {/* Test Summary */}
        <div className="flex items-center gap-4 mb-4">
          <Badge variant="outline">
            {passedCount}/{totalCount} Passed
          </Badge>
          {failedCount > 0 && (
            <Badge variant="destructive">
              {failedCount} Failed
            </Badge>
          )}
        </div>

        {/* Test Controls */}
        <div className="flex gap-2 mb-4">
          <Button
            onClick={runAllTests}
            disabled={currentTest !== null}
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            Run All
          </Button>
          <Button
            onClick={resetTests}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        <Separator className="mb-4" />

        {/* Test Scenarios */}
        <div className="space-y-3">
          {scenarios.map((scenario) => (
            <Card
              key={scenario.id}
              className={`p-3 transition-all ${getStatusColor(scenario.status)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(scenario.status)}
                  <h4 className="font-medium text-sm">{scenario.name}</h4>
                </div>
                <Button
                  onClick={() => runTest(scenario)}
                  disabled={currentTest !== null}
                  size="sm"
                  variant="ghost"
                >
                  <Play className="h-3 w-3" />
                </Button>
              </div>
              
              <p className="text-xs text-gray-600 mb-2">
                {scenario.description}
              </p>
              
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                  View Steps
                </summary>
                <div className="mt-2 space-y-1">
                  {scenario.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-gray-400">{index + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                    <strong>Expected:</strong> {scenario.expectedResult}
                  </div>
                </div>
              </details>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-800">
              <strong>Manual Testing Required:</strong> This helper provides test scenarios. 
              You need to manually perform the steps and verify the results.
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}