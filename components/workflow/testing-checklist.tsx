"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  CheckCircle2, 
  XCircle, 
  Clock,
  AlertTriangle,
  FileText,
  Zap,
  MousePointer,
  Keyboard,
  Play,
  Settings
} from 'lucide-react'

interface TestItem {
  id: string
  category: string
  title: string
  description: string
  steps: string[]
  expectedResult: string
  completed: boolean
  passed: boolean | null
}

const testItems: TestItem[] = [
  // Canvas Operations
  {
    id: 'canvas-pan',
    category: 'Canvas',
    title: 'Canvas Panning',
    description: 'Test canvas panning functionality',
    steps: [
      'Click and hold on empty canvas area',
      'Drag mouse to move canvas',
      'Release mouse button'
    ],
    expectedResult: 'Canvas moves smoothly in all directions',
    completed: false,
    passed: null
  },
  {
    id: 'canvas-zoom',
    category: 'Canvas',
    title: 'Canvas Zooming',
    description: 'Test canvas zoom functionality',
    steps: [
      'Use mouse wheel to zoom in',
      'Use mouse wheel to zoom out',
      'Test zoom limits'
    ],
    expectedResult: 'Canvas zooms smoothly with proper limits',
    completed: false,
    passed: null
  },
  
  // Node Management
  {
    id: 'add-nodes',
    category: 'Nodes',
    title: 'Add Nodes',
    description: 'Test adding different node types',
    steps: [
      'Open node library panel',
      'Click on Webhook node',
      'Click on HTTP Request node',
      'Click on Jira node'
    ],
    expectedResult: 'All nodes appear on canvas with correct styling',
    completed: false,
    passed: null
  },
  {
    id: 'select-nodes',
    category: 'Nodes',
    title: 'Select Nodes',
    description: 'Test node selection',
    steps: [
      'Click on a node',
      'Verify selection highlight',
      'Click on different node',
      'Click on empty canvas to deselect'
    ],
    expectedResult: 'Nodes highlight when selected, deselect properly',
    completed: false,
    passed: null
  },
  {
    id: 'move-nodes',
    category: 'Nodes',
    title: 'Move Nodes',
    description: 'Test node movement',
    steps: [
      'Click and drag a node',
      'Move to different position',
      'Release mouse button'
    ],
    expectedResult: 'Nodes move smoothly to new positions',
    completed: false,
    passed: null
  },
  {
    id: 'delete-nodes',
    category: 'Nodes',
    title: 'Delete Nodes',
    description: 'Test node deletion',
    steps: [
      'Select a node',
      'Press Delete key',
      'Verify node is removed'
    ],
    expectedResult: 'Selected nodes are deleted, connections removed',
    completed: false,
    passed: null
  },
  
  // Connections
  {
    id: 'create-connections',
    category: 'Connections',
    title: 'Create Connections',
    description: 'Test connection creation',
    steps: [
      'Hover over a node to see ports',
      'Click and drag from output port',
      'Drag to input port of another node',
      'Release to create connection'
    ],
    expectedResult: 'Smooth bezier curve connection created',
    completed: false,
    passed: null
  },
  {
    id: 'invalid-connections',
    category: 'Connections',
    title: 'Invalid Connections',
    description: 'Test connection validation',
    steps: [
      'Try connecting node to itself',
      'Try connecting output to output',
      'Try connecting input to input'
    ],
    expectedResult: 'Invalid connections rejected with visual feedback',
    completed: false,
    passed: null
  },
  {
    id: 'delete-connections',
    category: 'Connections',
    title: 'Delete Connections',
    description: 'Test connection deletion',
    steps: [
      'Create a connection',
      'Double-click on connection line',
      'Verify connection is removed'
    ],
    expectedResult: 'Connections can be deleted by double-clicking',
    completed: false,
    passed: null
  },
  
  // Keyboard Shortcuts
  {
    id: 'keyboard-delete',
    category: 'Keyboard',
    title: 'Delete Shortcut',
    description: 'Test Delete key functionality',
    steps: [
      'Select a node',
      'Press Delete key',
      'Select a connection',
      'Press Delete key'
    ],
    expectedResult: 'Delete key removes selected nodes and connections',
    completed: false,
    passed: null
  },
  {
    id: 'keyboard-duplicate',
    category: 'Keyboard',
    title: 'Duplicate Shortcut',
    description: 'Test Ctrl+D functionality',
    steps: [
      'Select a node',
      'Press Ctrl+D',
      'Verify duplicate appears'
    ],
    expectedResult: 'Ctrl+D creates duplicate node at offset position',
    completed: false,
    passed: null
  },
  {
    id: 'keyboard-escape',
    category: 'Keyboard',
    title: 'Escape Shortcut',
    description: 'Test Escape key functionality',
    steps: [
      'Start creating a connection',
      'Press Escape key',
      'Verify connection creation cancelled'
    ],
    expectedResult: 'Escape cancels connection creation',
    completed: false,
    passed: null
  },
  
  // Workflow Execution
  {
    id: 'workflow-execute',
    category: 'Execution',
    title: 'Execute Workflow',
    description: 'Test workflow execution',
    steps: [
      'Create a simple workflow',
      'Click Execute button',
      'Observe status changes',
      'Wait for completion'
    ],
    expectedResult: 'Workflow executes with status updates on nodes',
    completed: false,
    passed: null
  }
]

export function TestingChecklist() {
  const [items, setItems] = useState<TestItem[]>(testItems)
  const [isVisible, setIsVisible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const categories = ['All', ...Array.from(new Set(items.map(item => item.category)))]

  const updateItem = (id: string, updates: Partial<TestItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ))
  }

  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category === selectedCategory)

  const completedCount = items.filter(item => item.completed).length
  const passedCount = items.filter(item => item.passed === true).length
  const failedCount = items.filter(item => item.passed === false).length

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Canvas': return <MousePointer className="h-4 w-4" />
      case 'Nodes': return <Settings className="h-4 w-4" />
      case 'Connections': return <Zap className="h-4 w-4" />
      case 'Keyboard': return <Keyboard className="h-4 w-4" />
      case 'Execution': return <Play className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-16 right-4 z-50"
        size="sm"
        variant="outline"
      >
        <FileText className="h-4 w-4 mr-2" />
        Testing Checklist
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 left-4 w-96 max-h-96 overflow-y-auto z-50 shadow-lg">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Testing Checklist</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            ×
          </Button>
        </div>

        {/* Progress Summary */}
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline">
            {completedCount}/{items.length} Completed
          </Badge>
          <Badge variant="default" className="bg-green-500">
            {passedCount} Passed
          </Badge>
          {failedCount > 0 && (
            <Badge variant="destructive">
              {failedCount} Failed
            </Badge>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1 mb-4">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs h-7"
            >
              {category !== 'All' && getCategoryIcon(category)}
              <span className={category !== 'All' ? 'ml-1' : ''}>{category}</span>
            </Button>
          ))}
        </div>

        <Separator className="mb-4" />

        {/* Test Items */}
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className={`p-3 transition-all ${
                item.passed === true ? 'border-green-500 bg-green-50' :
                item.passed === false ? 'border-red-500 bg-red-50' :
                item.completed ? 'border-blue-500 bg-blue-50' :
                'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={(checked) => 
                      updateItem(item.id, { completed: !!checked })
                    }
                  />
                  <div>
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-600">{item.description}</p>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {item.completed && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => updateItem(item.id, { passed: true })}
                      >
                        <CheckCircle2 className={`h-3 w-3 ${item.passed === true ? 'text-green-500' : 'text-gray-400'}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => updateItem(item.id, { passed: false })}
                      >
                        <XCircle className={`h-3 w-3 ${item.passed === false ? 'text-red-500' : 'text-gray-400'}`} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700 mb-2">
                  View Test Steps
                </summary>
                <div className="space-y-2">
                  <div>
                    <strong>Steps:</strong>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      {item.steps.map((step, index) => (
                        <li key={index} className="text-gray-600">{step}</li>
                      ))}
                    </ol>
                  </div>
                  <div className="p-2 bg-gray-100 rounded">
                    <strong>Expected Result:</strong>
                    <p className="mt-1">{item.expectedResult}</p>
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
              <strong>How to use:</strong> Check off each test as you complete it, 
              then mark as passed ✅ or failed ❌ based on the results.
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}