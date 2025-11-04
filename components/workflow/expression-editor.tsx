"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Code, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb,
  Copy,
  Wand2,
  Function,
  Variable,
  Info
} from 'lucide-react'
import { ExpressionEngine, ExpressionUtils } from '@/lib/expression-engine'
import { WorkflowNode } from './workflow-canvas'

interface ExpressionEditorProps {
  value: string
  onChange: (value: string) => void
  nodes: WorkflowNode[]
  currentNodeIndex: number
  placeholder?: string
  multiline?: boolean
  label?: string
  description?: string
}

export function ExpressionEditor({
  value,
  onChange,
  nodes,
  currentNodeIndex,
  placeholder = 'Enter expression...',
  multiline = false,
  label,
  description
}: ExpressionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const engine = new ExpressionEngine(nodes, currentNodeIndex)

  useEffect(() => {
    // Validate expression on change
    if (value && ExpressionUtils.hasExpressions(value)) {
      const validation = engine.validateExpression(value)
      setValidationError(validation.valid ? null : validation.error || 'Invalid expression')
    } else {
      setValidationError(null)
    }
  }, [value, engine])

  const handleInputChange = (newValue: string) => {
    onChange(newValue)
    
    // Get suggestions for autocomplete
    if (newValue.includes('{{')) {
      const lastExpression = newValue.match(/\{\{([^}]*)$/)?.[1] || ''
      if (lastExpression) {
        const suggestions = ExpressionUtils.getExpressionSuggestions(lastExpression, engine)
        setSuggestions(suggestions)
        setShowSuggestions(suggestions.length > 0)
      } else {
        setShowSuggestions(false)
      }
    } else {
      setShowSuggestions(false)
    }
  }

  const handleTestExpression = () => {
    try {
      const result = engine.evaluateExpression(value)
      setTestResult(result)
    } catch (error) {
      setTestResult(`Error: ${error}`)
    }
  }

  const insertExpression = (expression: string) => {
    const input = inputRef.current
    if (!input) return

    const start = input.selectionStart || 0
    const end = input.selectionEnd || 0
    const newValue = value.substring(0, start) + `{{${expression}}}` + value.substring(end)
    
    onChange(newValue)
    setShowSuggestions(false)
    
    // Focus back to input
    setTimeout(() => {
      input.focus()
      const newPosition = start + expression.length + 4 // 4 for {{ and }}
      input.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  const insertFunction = (functionName: string) => {
    insertExpression(`${functionName}()`)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const InputComponent = multiline ? Textarea : Input

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      {description && <p className="text-xs text-gray-500">{description}</p>}
      
      <div className="relative">
        <InputComponent
          ref={inputRef as any}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className={`font-mono text-sm ${validationError ? 'border-red-500' : ''}`}
          rows={multiline ? 3 : undefined}
          onFocus={() => setIsExpanded(true)}
        />
        
        <div className="absolute right-2 top-2 flex gap-1">
          {ExpressionUtils.hasExpressions(value) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTestExpression}
              className="h-6 w-6 p-0"
            >
              <Play className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            <Code className="h-3 w-3" />
          </Button>
        </div>

        {/* Autocomplete Suggestions */}
        {showSuggestions && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto">
            <CardContent className="p-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm font-mono"
                  onClick={() => insertExpression(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Validation Error */}
      {validationError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">{validationError}</AlertDescription>
        </Alert>
      )}

      {/* Test Result */}
      {testResult !== null && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Result:</strong> {JSON.stringify(testResult, null, 2)}
          </AlertDescription>
        </Alert>
      )}

      {/* Expanded Expression Builder */}
      {isExpanded && (
        <Card className="mt-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Expression Builder
            </CardTitle>
            <CardDescription className="text-xs">
              Build expressions using variables and functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="variables" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="variables" className="text-xs">
                  <Variable className="h-3 w-3 mr-1" />
                  Variables
                </TabsTrigger>
                <TabsTrigger value="functions" className="text-xs">
                  <Function className="h-3 w-3 mr-1" />
                  Functions
                </TabsTrigger>
                <TabsTrigger value="examples" className="text-xs">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Examples
                </TabsTrigger>
              </TabsList>

              <TabsContent value="variables" className="mt-3">
                <ScrollArea className="h-32">
                  <div className="space-y-1">
                    {engine.getAvailableVariables().map((variable, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => insertExpression(variable)}
                      >
                        <code className="text-xs">{variable}</code>
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="functions" className="mt-3">
                <ScrollArea className="h-32">
                  <div className="space-y-1">
                    {engine.getAvailableFunctions().map((func, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => insertFunction(func)}
                      >
                        <code className="text-xs">{func}()</code>
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="examples" className="mt-3">
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {[
                      { label: 'Get previous node data', expr: '$node["NodeName"].json.field' },
                      { label: 'Current timestamp', expr: '$now' },
                      { label: 'Environment variable', expr: '$env.API_KEY' },
                      { label: 'String manipulation', expr: 'upper($json.name)' },
                      { label: 'Math calculation', expr: '$json.price * 1.2' },
                      { label: 'Conditional logic', expr: '$json.status === "active" ? "enabled" : "disabled"' }
                    ].map((example, index) => (
                      <div key={index} className="p-2 border rounded">
                        <div className="text-xs font-medium mb-1">{example.label}</div>
                        <div className="flex items-center justify-between">
                          <code className="text-xs text-gray-600">{example.expr}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => insertExpression(example.expr)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between items-center mt-3 pt-3 border-t">
              <Alert className="flex-1 mr-2">
                <Info className="h-3 w-3" />
                <AlertDescription className="text-xs">
                  Use {`{{ }}`} to wrap expressions. Example: {`{{ $json.name }}`}
                </AlertDescription>
              </Alert>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}