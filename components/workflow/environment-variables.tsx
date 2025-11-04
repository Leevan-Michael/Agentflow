"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { 
  Settings, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff,
  Copy,
  Save,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  Info,
  Key,
  Globe,
  Code
} from 'lucide-react'

export interface EnvironmentVariable {
  id: string
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'json' | 'secret'
  description?: string
  encrypted: boolean
  scope: 'global' | 'workflow' | 'execution'
  createdAt: string
  updatedAt: string
}

interface EnvironmentVariablesProps {
  workflowId?: string
  scope?: 'global' | 'workflow' | 'execution'
  onVariableChange?: (variables: EnvironmentVariable[]) => void
}

export function EnvironmentVariables({ 
  workflowId, 
  scope = 'workflow',
  onVariableChange 
}: EnvironmentVariablesProps) {
  const [variables, setVariables] = useState<EnvironmentVariable[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showValues, setShowValues] = useState<Record<string, boolean>>({})
  
  // New variable form
  const [newVariable, setNewVariable] = useState({
    key: '',
    value: '',
    type: 'string' as EnvironmentVariable['type'],
    description: '',
    encrypted: false
  })

  useEffect(() => {
    loadVariables()
  }, [workflowId, scope])

  const loadVariables = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Mock data - in real implementation, this would fetch from API
      const mockVariables: EnvironmentVariable[] = [
        {
          id: 'var-1',
          key: 'API_KEY',
          value: 'sk-1234567890abcdef',
          type: 'secret',
          description: 'API key for external service',
          encrypted: true,
          scope: 'global',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'var-2',
          key: 'BASE_URL',
          value: 'https://api.example.com',
          type: 'string',
          description: 'Base URL for API requests',
          encrypted: false,
          scope: 'workflow',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'var-3',
          key: 'MAX_RETRIES',
          value: '3',
          type: 'number',
          description: 'Maximum number of retry attempts',
          encrypted: false,
          scope: 'workflow',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'var-4',
          key: 'DEBUG_MODE',
          value: 'false',
          type: 'boolean',
          description: 'Enable debug logging',
          encrypted: false,
          scope: 'execution',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'var-5',
          key: 'CONFIG',
          value: '{"timeout": 30000, "retries": 3}',
          type: 'json',
          description: 'Configuration object',
          encrypted: false,
          scope: 'workflow',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]

      // Filter by scope if specified
      const filtered = scope === 'global' 
        ? mockVariables 
        : mockVariables.filter(v => v.scope === scope || v.scope === 'global')

      setVariables(filtered)
      onVariableChange?.(filtered)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load variables')
    } finally {
      setIsLoading(false)
    }
  }

  const addVariable = async () => {
    if (!newVariable.key.trim()) {
      setError('Variable key is required')
      return
    }

    // Check for duplicate keys
    if (variables.some(v => v.key === newVariable.key)) {
      setError('Variable key already exists')
      return
    }

    const variable: EnvironmentVariable = {
      id: `var-${Date.now()}`,
      key: newVariable.key,
      value: newVariable.value,
      type: newVariable.type,
      description: newVariable.description,
      encrypted: newVariable.encrypted,
      scope,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedVariables = [...variables, variable]
    setVariables(updatedVariables)
    onVariableChange?.(updatedVariables)

    // Reset form
    setNewVariable({
      key: '',
      value: '',
      type: 'string',
      description: '',
      encrypted: false
    })
    setError(null)
  }

  const updateVariable = async (id: string, updates: Partial<EnvironmentVariable>) => {
    const updatedVariables = variables.map(v => 
      v.id === id 
        ? { ...v, ...updates, updatedAt: new Date().toISOString() }
        : v
    )
    setVariables(updatedVariables)
    onVariableChange?.(updatedVariables)
  }

  const deleteVariable = async (id: string) => {
    if (!confirm('Are you sure you want to delete this variable?')) return

    const updatedVariables = variables.filter(v => v.id !== id)
    setVariables(updatedVariables)
    onVariableChange?.(updatedVariables)
  }

  const toggleShowValue = (id: string) => {
    setShowValues(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const copyValue = (value: string) => {
    navigator.clipboard.writeText(value)
  }

  const validateValue = (type: EnvironmentVariable['type'], value: string): boolean => {
    switch (type) {
      case 'number':
        return !isNaN(Number(value))
      case 'boolean':
        return value === 'true' || value === 'false'
      case 'json':
        try {
          JSON.parse(value)
          return true
        } catch {
          return false
        }
      default:
        return true
    }
  }

  const formatValue = (variable: EnvironmentVariable): string => {
    if (variable.encrypted && !showValues[variable.id]) {
      return '••••••••'
    }

    switch (variable.type) {
      case 'secret':
        return showValues[variable.id] ? variable.value : '••••••••'
      case 'json':
        try {
          return JSON.stringify(JSON.parse(variable.value), null, 2)
        } catch {
          return variable.value
        }
      default:
        return variable.value
    }
  }

  const getTypeIcon = (type: EnvironmentVariable['type']) => {
    switch (type) {
      case 'secret': return <Key className="h-3 w-3" />
      case 'json': return <Code className="h-3 w-3" />
      case 'boolean': return <Settings className="h-3 w-3" />
      case 'number': return <Settings className="h-3 w-3" />
      default: return <Settings className="h-3 w-3" />
    }
  }

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'global': return 'bg-blue-100 text-blue-800'
      case 'workflow': return 'bg-green-100 text-green-800'
      case 'execution': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Environment Variables
        </CardTitle>
        <CardDescription className="text-xs">
          Manage environment variables for {scope} scope
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="variables" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="variables" className="text-xs">Variables</TabsTrigger>
            <TabsTrigger value="add" className="text-xs">Add New</TabsTrigger>
          </TabsList>

          <TabsContent value="variables" className="space-y-3">
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {variables.map(variable => (
                  <div key={variable.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(variable.type)}
                        <span className="font-medium text-sm">{variable.key}</span>
                        <Badge className={`text-xs ${getScopeColor(variable.scope)}`}>
                          {variable.scope}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {variable.type}
                        </Badge>
                        {variable.encrypted && (
                          <Lock className="h-3 w-3 text-gray-500" />
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        {(variable.type === 'secret' || variable.encrypted) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleShowValue(variable.id)}
                            className="h-6 w-6 p-0"
                          >
                            {showValues[variable.id] ? 
                              <EyeOff className="h-3 w-3" /> : 
                              <Eye className="h-3 w-3" />
                            }
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyValue(variable.value)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteVariable(variable.id)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {variable.description && (
                      <p className="text-xs text-gray-600 mb-2">{variable.description}</p>
                    )}

                    <div className="space-y-2">
                      <div className="font-mono text-xs bg-gray-50 p-2 rounded">
                        {variable.type === 'json' && showValues[variable.id] ? (
                          <pre className="whitespace-pre-wrap">
                            {formatValue(variable)}
                          </pre>
                        ) : (
                          formatValue(variable)
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Created: {new Date(variable.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(variable.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {variables.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-gray-500">
                    <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No environment variables found</p>
                    <p className="text-xs">Add variables to store configuration and secrets</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Variable Key *</Label>
                <Input
                  placeholder="API_KEY, BASE_URL, etc."
                  value={newVariable.key}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, key: e.target.value.toUpperCase() }))}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <Select
                  value={newVariable.type}
                  onValueChange={(value) => setNewVariable(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="secret">Secret</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Value *</Label>
                {newVariable.type === 'json' ? (
                  <Textarea
                    placeholder='{"key": "value"}'
                    value={newVariable.value}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, value: e.target.value }))}
                    className="h-20 text-xs font-mono"
                    rows={3}
                  />
                ) : (
                  <Input
                    type={newVariable.type === 'secret' ? 'password' : 'text'}
                    placeholder={
                      newVariable.type === 'boolean' ? 'true or false' :
                      newVariable.type === 'number' ? '123' :
                      'Enter value'
                    }
                    value={newVariable.value}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, value: e.target.value }))}
                    className="h-8 text-xs font-mono"
                  />
                )}
                
                {newVariable.value && !validateValue(newVariable.type, newVariable.value) && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-3 w-3" />
                    <AlertDescription className="text-xs">
                      Invalid {newVariable.type} value
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Description</Label>
                <Input
                  placeholder="Describe what this variable is used for"
                  value={newVariable.description}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newVariable.encrypted}
                    onCheckedChange={(checked) => setNewVariable(prev => ({ ...prev, encrypted: checked }))}
                  />
                  <Label className="text-xs">Encrypt value</Label>
                </div>
                
                <Button onClick={addVariable} size="sm" className="h-8">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Variable
                </Button>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Usage in expressions:</strong> Access variables using {`$env.VARIABLE_NAME`} syntax.
                Example: {`{{ $env.API_KEY }}`}
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="flex justify-between items-center pt-3 border-t">
          <div className="text-xs text-gray-500">
            {variables.length} variable{variables.length !== 1 ? 's' : ''}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadVariables}
              disabled={isLoading}
              className="h-7"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}