"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Settings, 
  Save, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Key,
  Info,
  Code
} from 'lucide-react'
import { WorkflowNode } from './workflow-canvas'
import { getNodeConfiguration, NodeParameter } from '@/lib/node-configurations'

interface EnhancedNodeEditorProps {
  node: WorkflowNode | null
  isOpen: boolean
  onClose: () => void
  onSave: (nodeId: string, parameters: Record<string, any>) => void
  onCredentialsClick?: (nodeId: string) => void
}

export function EnhancedNodeEditor({ 
  node, 
  isOpen, 
  onClose, 
  onSave,
  onCredentialsClick 
}: EnhancedNodeEditorProps) {
  const [parameters, setParameters] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)

  const nodeConfig = node ? getNodeConfiguration(node.type) : null

  useEffect(() => {
    if (node && nodeConfig) {
      // Initialize parameters with defaults
      const initialParams = { ...node.parameters }
      nodeConfig.parameters.forEach(param => {
        if (initialParams[param.id] === undefined && param.default !== undefined) {
          initialParams[param.id] = param.default
        }
      })
      setParameters(initialParams)
      setHasChanges(false)
      setErrors({})
    }
  }, [node, nodeConfig])

  const validateParameter = (param: NodeParameter, value: any): string | null => {
    if (param.required && (!value || value === '')) {
      return `${param.name} is required`
    }

    if (param.validation) {
      const { min, max, pattern, message } = param.validation
      
      if (param.type === 'number') {
        const numValue = Number(value)
        if (min !== undefined && numValue < min) {
          return message || `${param.name} must be at least ${min}`
        }
        if (max !== undefined && numValue > max) {
          return message || `${param.name} must be at most ${max}`
        }
      }
      
      if (param.type === 'string' && pattern) {
        const regex = new RegExp(pattern)
        if (!regex.test(value)) {
          return message || `${param.name} format is invalid`
        }
      }
    }

    if (param.type === 'json') {
      try {
        JSON.parse(value)
      } catch {
        return `${param.name} must be valid JSON`
      }
    }

    if (param.type === 'url' && value) {
      try {
        new URL(value)
      } catch {
        return `${param.name} must be a valid URL`
      }
    }

    if (param.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return `${param.name} must be a valid email address`
      }
    }

    return null
  }

  const handleParameterChange = (paramId: string, value: any) => {
    setParameters(prev => ({ ...prev, [paramId]: value }))
    setHasChanges(true)
    
    // Clear error for this parameter
    if (errors[paramId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[paramId]
        return newErrors
      })
    }
  }

  const handleSave = () => {
    if (!node || !nodeConfig) return

    // Validate all parameters
    const newErrors: Record<string, string> = {}
    nodeConfig.parameters.forEach(param => {
      const error = validateParameter(param, parameters[param.id])
      if (error) {
        newErrors[param.id] = error
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave(node.id, parameters)
    setHasChanges(false)
    onClose()
  }

  const renderParameterInput = (param: NodeParameter) => {
    const value = parameters[param.id] || ''
    const error = errors[param.id]

    const baseProps = {
      id: param.id,
      value,
      onChange: (e: any) => handleParameterChange(param.id, e.target?.value || e),
      placeholder: param.placeholder,
      className: error ? 'border-red-500' : ''
    }

    switch (param.type) {
      case 'string':
      case 'url':
      case 'email':
        return <Input {...baseProps} type={param.type === 'email' ? 'email' : 'text'} />
      
      case 'password':
        return <Input {...baseProps} type="password" />
      
      case 'number':
        return (
          <Input 
            {...baseProps} 
            type="number" 
            min={param.validation?.min}
            max={param.validation?.max}
            onChange={(e) => handleParameterChange(param.id, Number(e.target.value))}
          />
        )
      
      case 'boolean':
        return (
          <Switch
            checked={Boolean(value)}
            onCheckedChange={(checked) => handleParameterChange(param.id, checked)}
          />
        )
      
      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleParameterChange(param.id, val)}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={param.placeholder || 'Select option'} />
            </SelectTrigger>
            <SelectContent>
              {param.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'multiselect':
        // Simplified multiselect - could be enhanced with a proper multiselect component
        return (
          <Input 
            {...baseProps} 
            placeholder={param.placeholder || 'Enter comma-separated values'}
          />
        )
      
      case 'textarea':
        return (
          <Textarea 
            {...baseProps}
            rows={4}
            className={error ? 'border-red-500' : ''}
          />
        )
      
      case 'json':
        return (
          <Textarea 
            {...baseProps}
            rows={6}
            className={`font-mono text-sm ${error ? 'border-red-500' : ''}`}
            placeholder={param.placeholder || '{"key": "value"}'}
          />
        )
      
      default:
        return <Input {...baseProps} />
    }
  }

  if (!isOpen || !node || !nodeConfig) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] m-4">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${nodeConfig.color} text-white`}>
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{nodeConfig.name} Configuration</CardTitle>
                <CardDescription>{nodeConfig.description}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">{nodeConfig.category}</Badge>
            {nodeConfig.credentials?.required && (
              <Badge variant="secondary" className="gap-1">
                <Key className="h-3 w-3" />
                Credentials Required
              </Badge>
            )}
          </div>
        </CardHeader>

        <ScrollArea className="max-h-[60vh]">
          <CardContent className="space-y-6">
            {/* Credentials Section */}
            {nodeConfig.credentials?.required && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Credentials</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCredentialsClick?.(node.id)}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This node requires credentials to connect to external services.
                    Supported types: {nodeConfig.credentials.types.join(', ')}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Parameters Section */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Parameters</Label>
              
              {nodeConfig.parameters.map((param) => (
                <div key={param.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={param.id} className="text-sm font-medium">
                      {param.name}
                      {param.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {param.description && (
                      <div className="group relative">
                        <Info className="h-3 w-3 text-gray-400 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {param.description}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {renderParameterInput(param)}
                  
                  {errors[param.id] && (
                    <div className="flex items-center gap-1 text-red-600 text-sm">
                      <AlertTriangle className="h-3 w-3" />
                      {errors[param.id]}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Node Info */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Node Information</Label>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-gray-500">Inputs</Label>
                  <div className="space-y-1">
                    {nodeConfig.inputs.map(input => (
                      <div key={input.id} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          input.type === 'trigger' ? 'bg-purple-500' :
                          input.type === 'data' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`} />
                        <span>{input.name}</span>
                        {input.required && <span className="text-red-500">*</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Outputs</Label>
                  <div className="space-y-1">
                    {nodeConfig.outputs.map(output => (
                      <div key={output.id} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          output.type === 'trigger' ? 'bg-purple-500' :
                          output.type === 'data' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`} />
                        <span>{output.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </ScrollArea>

        <div className="p-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasChanges && (
                <div className="flex items-center gap-1 text-amber-600 text-sm">
                  <AlertTriangle className="h-3 w-3" />
                  Unsaved changes
                </div>
              )}
              {Object.keys(errors).length === 0 && !hasChanges && (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle2 className="h-3 w-3" />
                  Configuration valid
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={Object.keys(errors).length > 0}>
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}