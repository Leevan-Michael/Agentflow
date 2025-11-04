"use client"

import React, { useState, useEffect } from 'react'
import { WebhookTrigger } from '@/lib/types/webhook'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Copy, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff,
  RefreshCw,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface WebhookTriggerNodeProps {
  nodeId: string
  workflowId: string
  parameters: {
    path?: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    requireAuth?: boolean
    authToken?: string
    isActive?: boolean
  }
  onParameterChange: (key: string, value: any) => void
}

export function WebhookTriggerNode({ 
  nodeId, 
  workflowId, 
  parameters, 
  onParameterChange 
}: WebhookTriggerNodeProps) {
  const { toast } = useToast()
  const [webhook, setWebhook] = useState<WebhookTrigger | null>(null)
  const [loading, setLoading] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [executions, setExecutions] = useState<any[]>([])
  const [loadingExecutions, setLoadingExecutions] = useState(false)

  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}`
    : 'http://localhost:3000'

  const webhookUrl = parameters.path 
    ? `${baseUrl}/api/webhooks${parameters.path}`
    : ''

  // Load existing webhook on mount
  useEffect(() => {
    loadWebhook()
  }, [nodeId])

  const loadWebhook = async () => {
    try {
      const response = await fetch(`/api/webhooks/manage?workflowId=${workflowId}`)
      const data = await response.json()
      
      if (data.success) {
        const existingWebhook = data.webhooks.find((w: WebhookTrigger) => w.nodeId === nodeId)
        if (existingWebhook) {
          setWebhook(existingWebhook)
          // Sync parameters with existing webhook
          onParameterChange('path', existingWebhook.path)
          onParameterChange('method', existingWebhook.method)
          onParameterChange('requireAuth', existingWebhook.requireAuth)
          onParameterChange('authToken', existingWebhook.authToken)
          onParameterChange('isActive', existingWebhook.isActive)
        }
      }
    } catch (error) {
      console.error('Failed to load webhook:', error)
    }
  }

  const loadExecutions = async () => {
    if (!webhook) return
    
    setLoadingExecutions(true)
    try {
      const response = await fetch(`/api/webhooks/manage?action=executions&id=${webhook.id}`)
      const data = await response.json()
      
      if (data.success) {
        setExecutions(data.executions.slice(0, 10)) // Show last 10 executions
      }
    } catch (error) {
      console.error('Failed to load executions:', error)
    } finally {
      setLoadingExecutions(false)
    }
  }

  const createOrUpdateWebhook = async () => {
    if (!parameters.path || !parameters.method) {
      toast({
        title: "Missing Configuration",
        description: "Please set both path and method",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const webhookData = {
        workflowId,
        nodeId,
        path: parameters.path,
        method: parameters.method,
        requireAuth: parameters.requireAuth || false,
        authToken: parameters.authToken,
        isActive: parameters.isActive !== false
      }

      const response = await fetch('/api/webhooks/manage', {
        method: webhook ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhook ? { id: webhook.id, ...webhookData } : webhookData)
      })

      const data = await response.json()

      if (data.success) {
        setWebhook(data.webhook)
        onParameterChange('authToken', data.webhook.authToken)
        toast({
          title: "Webhook Configured",
          description: `Webhook ${webhook ? 'updated' : 'created'} successfully`,
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Configuration Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteWebhook = async () => {
    if (!webhook) return

    setLoading(true)
    try {
      const response = await fetch(`/api/webhooks/manage?id=${webhook.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setWebhook(null)
        setExecutions([])
        // Clear parameters
        onParameterChange('authToken', undefined)
        toast({
          title: "Webhook Deleted",
          description: "Webhook has been removed successfully",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const copyWebhookUrl = async () => {
    if (!webhookUrl) return
    
    try {
      await navigator.clipboard.writeText(webhookUrl)
      toast({
        title: "URL Copied",
        description: "Webhook URL copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive"
      })
    }
  }

  const testWebhook = async () => {
    if (!webhookUrl) return

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      if (parameters.requireAuth && parameters.authToken) {
        headers['Authorization'] = `Bearer ${parameters.authToken}`
      }

      const response = await fetch(webhookUrl, {
        method: parameters.method || 'POST',
        headers,
        body: parameters.method !== 'GET' ? JSON.stringify({
          test: true,
          message: 'Test webhook trigger',
          timestamp: new Date().toISOString()
        }) : undefined
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Webhook Test Successful",
          description: "Webhook triggered successfully",
        })
        loadExecutions() // Refresh executions
      } else {
        throw new Error(data.message || 'Test failed')
      }
    } catch (error) {
      toast({
        title: "Webhook Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Webhook Configuration</Label>
          {webhook && (
            <Badge variant={webhook.isActive ? "default" : "secondary"}>
              {webhook.isActive ? "Active" : "Inactive"}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="method">HTTP Method</Label>
            <Select
              value={parameters.method || 'POST'}
              onValueChange={(value) => onParameterChange('method', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="path">Webhook Path</Label>
            <Input
              id="path"
              value={parameters.path || ''}
              onChange={(e) => onParameterChange('path', e.target.value)}
              placeholder="/my-webhook"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="requireAuth"
            checked={parameters.requireAuth || false}
            onCheckedChange={(checked) => onParameterChange('requireAuth', checked)}
          />
          <Label htmlFor="requireAuth">Require Authentication</Label>
        </div>

        {parameters.requireAuth && (
          <div>
            <Label htmlFor="authToken">Auth Token</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="authToken"
                  type={showToken ? "text" : "password"}
                  value={parameters.authToken || ''}
                  onChange={(e) => onParameterChange('authToken', e.target.value)}
                  placeholder="Enter or generate auth token"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => onParameterChange('authToken', crypto.randomUUID())}
              >
                Generate
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={createOrUpdateWebhook}
            disabled={loading || !parameters.path || !parameters.method}
          >
            {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
            {webhook ? 'Update Webhook' : 'Create Webhook'}
          </Button>
          
          {webhook && (
            <Button
              variant="destructive"
              onClick={deleteWebhook}
              disabled={loading}
            >
              Delete Webhook
            </Button>
          )}
        </div>
      </div>

      {/* Webhook URL Section */}
      {webhookUrl && (
        <div className="space-y-3">
          <Label className="text-base font-medium">Webhook URL</Label>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Badge variant="outline">{parameters.method}</Badge>
            <code className="flex-1 text-sm font-mono">{webhookUrl}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyWebhookUrl}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={testWebhook}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          
          {parameters.requireAuth && parameters.authToken && (
            <div className="text-xs text-muted-foreground">
              Include header: <code>Authorization: Bearer {parameters.authToken}</code>
            </div>
          )}
        </div>
      )}

      {/* Recent Executions */}
      {webhook && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Recent Executions</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadExecutions}
              disabled={loadingExecutions}
            >
              {loadingExecutions ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Activity className="h-4 w-4" />
              )}
            </Button>
          </div>

          {executions.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {executions.map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    {execution.response.status < 400 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <Badge variant="outline" className="text-xs">
                      {execution.method}
                    </Badge>
                    <span className="font-mono">{execution.path}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{execution.executionTime}ms</span>
                    <span>{new Date(execution.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No executions yet. Test your webhook to see results here.
            </div>
          )}
        </div>
      )}
    </div>
  )
}