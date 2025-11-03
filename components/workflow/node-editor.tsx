"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Settings, Play, Copy, Trash2, Eye, EyeOff } from "lucide-react"
import { WorkflowNode } from "./workflow-canvas"

// Node Tester Component
function NodeTester({ node }: { node: WorkflowNode }) {
  const [testData, setTestData] = useState('{"key": "value"}')
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleTest = async () => {
    setIsLoading(true)
    try {
      let inputData = {}
      try {
        inputData = JSON.parse(testData)
      } catch {
        inputData = { raw: testData }
      }

      const response = await fetch('/api/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: 'test-workflow',
          nodes: [node],
          connections: [],
          triggerData: inputData
        })
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Test failed'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="p-4">
        <h4 className="font-medium mb-4">Test Node</h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="test-data">Test Input Data (JSON)</Label>
            <Textarea
              id="test-data"
              placeholder='{"key": "value"}'
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
          </div>
          <Button 
            className="w-full" 
            onClick={handleTest}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Testing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Test
              </>
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-medium mb-4">Test Results</h4>
        {testResult ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={testResult.success ? "default" : "destructive"}>
                {testResult.success ? "Success" : "Failed"}
              </Badge>
              {testResult.execution?.duration && (
                <Badge variant="secondary">
                  {testResult.execution.duration}ms
                </Badge>
              )}
            </div>
            <div>
              <Label>Output:</Label>
              <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto max-h-40">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Run a test to see the results here
          </div>
        )}
      </Card>
    </>
  )
}

interface NodeEditorProps {
  node: WorkflowNode
  onUpdateNode: (node: WorkflowNode) => void
  onClose: () => void
}

export function NodeEditor({ node, onUpdateNode, onClose }: NodeEditorProps) {
  const [localNode, setLocalNode] = useState<WorkflowNode>(node)

  const updateNodeProperty = (key: string, value: any) => {
    const updatedNode = { ...localNode, [key]: value }
    setLocalNode(updatedNode)
    onUpdateNode(updatedNode)
  }

  const updateNodeParameter = (key: string, value: any) => {
    const updatedNode = {
      ...localNode,
      parameters: { ...localNode.parameters, [key]: value }
    }
    setLocalNode(updatedNode)
    onUpdateNode(updatedNode)
  }

  const getNodeIcon = (type: string) => {
    const icons: Record<string, string> = {
      trigger: '⚡',
      webhook: '🌐',
      schedule: '⏰',
      http: '🌐',
      email: '📧',
      database: '🗄️',
      condition: '🔀',
      transform: '🔄',
      slack: '💬',
      gmail: '📧',
      notion: '📝',
      airtable: '📊'
    }
    return icons[type] || '⚙️'
  }

  const renderNodeParameters = () => {
    switch (node.type) {
      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhook-path">Webhook Path</Label>
              <Input
                id="webhook-path"
                placeholder="/webhook/my-endpoint"
                value={localNode.parameters.path || ''}
                onChange={(e) => updateNodeParameter('path', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="webhook-method">HTTP Method</Label>
              <Select
                value={localNode.parameters.method || 'POST'}
                onValueChange={(value) => updateNodeParameter('method', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="webhook-auth"
                checked={localNode.parameters.requireAuth || false}
                onCheckedChange={(checked) => updateNodeParameter('requireAuth', checked)}
              />
              <Label htmlFor="webhook-auth">Require Authentication</Label>
            </div>
          </div>
        )

      case 'schedule':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cron-expression">Cron Expression</Label>
              <Input
                id="cron-expression"
                placeholder="0 0 * * *"
                value={localNode.parameters.cronExpression || ''}
                onChange={(e) => updateNodeParameter('cronExpression', e.target.value)}
              />
              <div className="text-xs text-muted-foreground mt-1">
                Example: "0 0 * * *" runs daily at midnight
              </div>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={localNode.parameters.timezone || 'UTC'}
                onValueChange={(value) => updateNodeParameter('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 'http':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="http-url">URL</Label>
              <Input
                id="http-url"
                placeholder="https://api.example.com/endpoint"
                value={localNode.parameters.url || ''}
                onChange={(e) => updateNodeParameter('url', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="http-method">Method</Label>
              <Select
                value={localNode.parameters.method || 'GET'}
                onValueChange={(value) => updateNodeParameter('method', value)}
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
              <Label htmlFor="http-headers">Headers (JSON)</Label>
              <Textarea
                id="http-headers"
                placeholder='{"Content-Type": "application/json"}'
                value={localNode.parameters.headers || ''}
                onChange={(e) => updateNodeParameter('headers', e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="http-body">Body</Label>
              <Textarea
                id="http-body"
                placeholder="Request body"
                value={localNode.parameters.body || ''}
                onChange={(e) => updateNodeParameter('body', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )

      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-to">To</Label>
              <Input
                id="email-to"
                placeholder="recipient@example.com"
                value={localNode.parameters.to || ''}
                onChange={(e) => updateNodeParameter('to', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                placeholder="Email subject"
                value={localNode.parameters.subject || ''}
                onChange={(e) => updateNodeParameter('subject', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email-body">Body</Label>
              <Textarea
                id="email-body"
                placeholder="Email content"
                value={localNode.parameters.body || ''}
                onChange={(e) => updateNodeParameter('body', e.target.value)}
                rows={6}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="email-html"
                checked={localNode.parameters.isHtml || false}
                onCheckedChange={(checked) => updateNodeParameter('isHtml', checked)}
              />
              <Label htmlFor="email-html">HTML Format</Label>
            </div>
          </div>
        )

      case 'condition':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="condition-field">Field to Check</Label>
              <Input
                id="condition-field"
                placeholder="data.status"
                value={localNode.parameters.field || ''}
                onChange={(e) => updateNodeParameter('field', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="condition-operator">Operator</Label>
              <Select
                value={localNode.parameters.operator || 'equals'}
                onValueChange={(value) => updateNodeParameter('operator', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="not_equals">Not Equals</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="greater_than">Greater Than</SelectItem>
                  <SelectItem value="less_than">Less Than</SelectItem>
                  <SelectItem value="exists">Exists</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="condition-value">Value</Label>
              <Input
                id="condition-value"
                placeholder="Expected value"
                value={localNode.parameters.value || ''}
                onChange={(e) => updateNodeParameter('value', e.target.value)}
              />
            </div>
          </div>
        )

      case 'transform':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="transform-code">Transformation Code (JavaScript)</Label>
              <Textarea
                id="transform-code"
                placeholder="return { ...input, processed: true }"
                value={localNode.parameters.code || ''}
                onChange={(e) => updateNodeParameter('code', e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Use 'input' to access the incoming data. Return the transformed data.
            </div>
          </div>
        )

      case 'jira':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="jira-domain">Jira Domain</Label>
              <Input
                id="jira-domain"
                placeholder="your-company"
                value={localNode.parameters.domain || ''}
                onChange={(e) => updateNodeParameter('domain', e.target.value)}
              />
              <div className="text-xs text-muted-foreground mt-1">
                Just the subdomain (e.g., "mycompany" for mycompany.atlassian.net)
              </div>
            </div>
            <div>
              <Label htmlFor="jira-email">Email</Label>
              <Input
                id="jira-email"
                type="email"
                placeholder="your-email@company.com"
                value={localNode.parameters.email || ''}
                onChange={(e) => updateNodeParameter('email', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="jira-token">API Token</Label>
              <Input
                id="jira-token"
                type="password"
                placeholder="Your Jira API token"
                value={localNode.parameters.apiToken || ''}
                onChange={(e) => updateNodeParameter('apiToken', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="jira-action">Action</Label>
              <Select
                value={localNode.parameters.action || 'create_issue'}
                onValueChange={(value) => updateNodeParameter('action', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create_issue">Create Issue</SelectItem>
                  <SelectItem value="get_issue">Get Issue</SelectItem>
                  <SelectItem value="update_issue">Update Issue</SelectItem>
                  <SelectItem value="search_issues">Search Issues</SelectItem>
                  <SelectItem value="add_comment">Add Comment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {localNode.parameters.action === 'create_issue' && (
              <>
                <div>
                  <Label htmlFor="jira-project">Project Key</Label>
                  <Input
                    id="jira-project"
                    placeholder="PROJ"
                    value={localNode.parameters.projectKey || ''}
                    onChange={(e) => updateNodeParameter('projectKey', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="jira-summary">Summary</Label>
                  <Input
                    id="jira-summary"
                    placeholder="Issue summary"
                    value={localNode.parameters.summary || ''}
                    onChange={(e) => updateNodeParameter('summary', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="jira-description">Description</Label>
                  <Textarea
                    id="jira-description"
                    placeholder="Issue description"
                    value={localNode.parameters.description || ''}
                    onChange={(e) => updateNodeParameter('description', e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="jira-issue-type">Issue Type</Label>
                  <Select
                    value={localNode.parameters.issueType || 'Task'}
                    onValueChange={(value) => updateNodeParameter('issueType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Task">Task</SelectItem>
                      <SelectItem value="Bug">Bug</SelectItem>
                      <SelectItem value="Story">Story</SelectItem>
                      <SelectItem value="Epic">Epic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {(localNode.parameters.action === 'get_issue' || localNode.parameters.action === 'update_issue' || localNode.parameters.action === 'add_comment') && (
              <div>
                <Label htmlFor="jira-issue-key">Issue Key</Label>
                <Input
                  id="jira-issue-key"
                  placeholder="PROJ-123"
                  value={localNode.parameters.issueKey || ''}
                  onChange={(e) => updateNodeParameter('issueKey', e.target.value)}
                />
              </div>
            )}
          </div>
        )

      case 'trello':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="trello-api-key">API Key</Label>
              <Input
                id="trello-api-key"
                placeholder="Your Trello API key"
                value={localNode.parameters.apiKey || ''}
                onChange={(e) => updateNodeParameter('apiKey', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="trello-token">Token</Label>
              <Input
                id="trello-token"
                type="password"
                placeholder="Your Trello token"
                value={localNode.parameters.token || ''}
                onChange={(e) => updateNodeParameter('token', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="trello-action">Action</Label>
              <Select
                value={localNode.parameters.action || 'create_card'}
                onValueChange={(value) => updateNodeParameter('action', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create_card">Create Card</SelectItem>
                  <SelectItem value="get_card">Get Card</SelectItem>
                  <SelectItem value="update_card">Update Card</SelectItem>
                  <SelectItem value="get_board">Get Board</SelectItem>
                  <SelectItem value="get_lists">Get Lists</SelectItem>
                  <SelectItem value="add_comment">Add Comment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {localNode.parameters.action === 'create_card' && (
              <>
                <div>
                  <Label htmlFor="trello-list-id">List ID</Label>
                  <Input
                    id="trello-list-id"
                    placeholder="List ID where card will be created"
                    value={localNode.parameters.listId || ''}
                    onChange={(e) => updateNodeParameter('listId', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="trello-card-name">Card Name</Label>
                  <Input
                    id="trello-card-name"
                    placeholder="Card name"
                    value={localNode.parameters.name || ''}
                    onChange={(e) => updateNodeParameter('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="trello-card-desc">Description</Label>
                  <Textarea
                    id="trello-card-desc"
                    placeholder="Card description"
                    value={localNode.parameters.description || ''}
                    onChange={(e) => updateNodeParameter('description', e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
        )

      case 'asana':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="asana-token">Access Token</Label>
              <Input
                id="asana-token"
                type="password"
                placeholder="Your Asana access token"
                value={localNode.parameters.accessToken || ''}
                onChange={(e) => updateNodeParameter('accessToken', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="asana-action">Action</Label>
              <Select
                value={localNode.parameters.action || 'create_task'}
                onValueChange={(value) => updateNodeParameter('action', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create_task">Create Task</SelectItem>
                  <SelectItem value="get_task">Get Task</SelectItem>
                  <SelectItem value="update_task">Update Task</SelectItem>
                  <SelectItem value="get_projects">Get Projects</SelectItem>
                  <SelectItem value="add_comment">Add Comment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {localNode.parameters.action === 'create_task' && (
              <>
                <div>
                  <Label htmlFor="asana-task-name">Task Name</Label>
                  <Input
                    id="asana-task-name"
                    placeholder="Task name"
                    value={localNode.parameters.name || ''}
                    onChange={(e) => updateNodeParameter('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="asana-project-id">Project ID (Optional)</Label>
                  <Input
                    id="asana-project-id"
                    placeholder="Project ID"
                    value={localNode.parameters.projectId || ''}
                    onChange={(e) => updateNodeParameter('projectId', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="asana-notes">Notes</Label>
                  <Textarea
                    id="asana-notes"
                    placeholder="Task notes"
                    value={localNode.parameters.notes || ''}
                    onChange={(e) => updateNodeParameter('notes', e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
        )

      case 'monday':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="monday-token">API Token</Label>
              <Input
                id="monday-token"
                type="password"
                placeholder="Your Monday.com API token"
                value={localNode.parameters.apiToken || ''}
                onChange={(e) => updateNodeParameter('apiToken', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="monday-action">Action</Label>
              <Select
                value={localNode.parameters.action || 'create_item'}
                onValueChange={(value) => updateNodeParameter('action', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create_item">Create Item</SelectItem>
                  <SelectItem value="get_items">Get Items</SelectItem>
                  <SelectItem value="update_item">Update Item</SelectItem>
                  <SelectItem value="get_boards">Get Boards</SelectItem>
                  <SelectItem value="create_update">Create Update</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {localNode.parameters.action === 'create_item' && (
              <>
                <div>
                  <Label htmlFor="monday-board-id">Board ID</Label>
                  <Input
                    id="monday-board-id"
                    placeholder="Board ID"
                    value={localNode.parameters.boardId || ''}
                    onChange={(e) => updateNodeParameter('boardId', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="monday-item-name">Item Name</Label>
                  <Input
                    id="monday-item-name"
                    placeholder="Item name"
                    value={localNode.parameters.itemName || ''}
                    onChange={(e) => updateNodeParameter('itemName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="monday-group-id">Group ID (Optional)</Label>
                  <Input
                    id="monday-group-id"
                    placeholder="Group ID"
                    value={localNode.parameters.groupId || ''}
                    onChange={(e) => updateNodeParameter('groupId', e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        )

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <div>No configuration available for this node type</div>
          </div>
        )
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getNodeIcon(node.type)}</span>
            <h3 className="font-semibold text-lg">Node Settings</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">{node.type}</Badge>
          <Badge variant={node.status === 'success' ? 'default' : 'secondary'}>
            {node.status || 'idle'}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="settings" className="h-full">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="p-4 space-y-6">
            {/* Basic Settings */}
            <Card className="p-4">
              <h4 className="font-medium mb-4">Basic Settings</h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="node-name">Node Name</Label>
                  <Input
                    id="node-name"
                    value={localNode.name}
                    onChange={(e) => updateNodeProperty('name', e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="node-disabled"
                    checked={!localNode.disabled}
                    onCheckedChange={(checked) => updateNodeProperty('disabled', !checked)}
                  />
                  <Label htmlFor="node-disabled">Enable Node</Label>
                </div>
              </div>
            </Card>

            {/* Node-specific Parameters */}
            <Card className="p-4">
              <h4 className="font-medium mb-4">Configuration</h4>
              {renderNodeParameters()}
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="p-4 space-y-6">
            <Card className="p-4">
              <h4 className="font-medium mb-4">Error Handling</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="continue-on-fail"
                    checked={localNode.parameters.continueOnFail || false}
                    onCheckedChange={(checked) => updateNodeParameter('continueOnFail', checked)}
                  />
                  <Label htmlFor="continue-on-fail">Continue on Failure</Label>
                </div>
                <div>
                  <Label htmlFor="retry-attempts">Retry Attempts</Label>
                  <Input
                    id="retry-attempts"
                    type="number"
                    min="0"
                    max="10"
                    value={localNode.parameters.retryAttempts || 0}
                    onChange={(e) => updateNodeParameter('retryAttempts', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="retry-delay">Retry Delay (ms)</Label>
                  <Input
                    id="retry-delay"
                    type="number"
                    min="0"
                    value={localNode.parameters.retryDelay || 1000}
                    onChange={(e) => updateNodeParameter('retryDelay', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium mb-4">Execution</h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="timeout">Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    min="1"
                    value={localNode.parameters.timeout || 30}
                    onChange={(e) => updateNodeParameter('timeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="always-output-data"
                    checked={localNode.parameters.alwaysOutputData || false}
                    onCheckedChange={(checked) => updateNodeParameter('alwaysOutputData', checked)}
                  />
                  <Label htmlFor="always-output-data">Always Output Data</Label>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="test" className="p-4 space-y-6">
            <NodeTester node={localNode} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}