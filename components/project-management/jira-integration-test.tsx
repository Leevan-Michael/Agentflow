"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ExternalLink, 
  RefreshCw,
  Plus,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface JiraTestResult {
  success: boolean
  message: string
  error?: string
  details?: string
  issues?: any[]
  count?: number
  synced?: number
  errors?: string[]
}

export function JiraIntegrationTest() {
  const [testResults, setTestResults] = useState<Record<string, JiraTestResult>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [jiraIssues, setJiraIssues] = useState<any[]>([])
  const [newIssue, setNewIssue] = useState({
    summary: '',
    description: '',
    priority: 'Medium'
  })

  const setLoadingState = (key: string, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [key]: isLoading }))
  }

  const setTestResult = (key: string, result: JiraTestResult) => {
    setTestResults(prev => ({ ...prev, [key]: result }))
  }

  const testJiraConnection = async () => {
    setLoadingState('connection', true)
    try {
      const response = await fetch('/api/jira/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-connection' })
      })
      const result = await response.json()
      setTestResult('connection', result)
    } catch (error) {
      setTestResult('connection', {
        success: false,
        message: 'Failed to test connection',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoadingState('connection', false)
    }
  }

  const fetchJiraIssues = async () => {
    setLoadingState('fetch', true)
    try {
      const response = await fetch('/api/jira/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetch-issues' })
      })
      const result = await response.json()
      setTestResult('fetch', result)
      if (result.success && result.issues) {
        setJiraIssues(result.issues)
      }
    } catch (error) {
      setTestResult('fetch', {
        success: false,
        message: 'Failed to fetch issues',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoadingState('fetch', false)
    }
  }

  const createJiraIssue = async () => {
    if (!newIssue.summary.trim()) return

    setLoadingState('create', true)
    try {
      const response = await fetch('/api/jira/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'create-issue',
          data: {
            summary: newIssue.summary,
            description: newIssue.description,
            issueType: 'Task',
            priority: newIssue.priority
          }
        })
      })
      const result = await response.json()
      setTestResult('create', result)
      
      if (result.success) {
        setNewIssue({ summary: '', description: '', priority: 'Medium' })
        // Refresh issues list
        fetchJiraIssues()
      }
    } catch (error) {
      setTestResult('create', {
        success: false,
        message: 'Failed to create issue',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoadingState('create', false)
    }
  }

  const syncWithJira = async () => {
    setLoadingState('sync', true)
    try {
      // Get current tasks from our system (you'd implement this)
      const tasksResponse = await fetch('/api/tasks')
      const tasksData = await tasksResponse.json()
      
      const response = await fetch('/api/jira/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'sync-tasks',
          data: { tasks: tasksData.tasks || [] }
        })
      })
      const result = await response.json()
      setTestResult('sync', result)
    } catch (error) {
      setTestResult('sync', {
        success: false,
        message: 'Failed to sync tasks',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoadingState('sync', false)
    }
  }

  const runFullTest = async () => {
    setLoadingState('full', true)
    try {
      const response = await fetch('/api/jira/test')
      const result = await response.json()
      setTestResult('full', result)
    } catch (error) {
      setTestResult('full', {
        success: false,
        message: 'Full test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoadingState('full', false)
    }
  }

  const TestResultBadge = ({ result, loading }: { result?: JiraTestResult, loading: boolean }) => {
    if (loading) {
      return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Testing...</Badge>
    }
    if (!result) {
      return <Badge variant="outline">Not tested</Badge>
    }
    return (
      <Badge variant={result.success ? "default" : "destructive"}>
        {result.success ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
        {result.success ? 'Success' : 'Failed'}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Jira Integration Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration Check */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configuration</h3>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                To test Jira integration, add these environment variables to your <code>.env.local</code> file:
              </p>
              <pre className="text-xs bg-background p-2 rounded border">
{`JIRA_BASE_URL=https://yourcompany.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-jira-api-token
JIRA_PROJECT_KEY=YOUR_PROJECT_KEY`}
              </pre>
              <p className="text-xs text-muted-foreground mt-2">
                Get your API token from: <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" className="text-primary hover:underline">Atlassian API Tokens</a>
              </p>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  Connection Test
                  <TestResultBadge result={testResults.connection} loading={loading.connection} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Test basic connection to your Jira instance
                </p>
                <Button onClick={testJiraConnection} disabled={loading.connection} className="w-full">
                  {loading.connection && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Test Connection
                </Button>
                {testResults.connection && (
                  <div className={cn(
                    "mt-2 p-2 rounded text-xs",
                    testResults.connection.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  )}>
                    {testResults.connection.message}
                    {testResults.connection.error && (
                      <div className="mt-1 font-mono">{testResults.connection.error}</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  Fetch Issues
                  <TestResultBadge result={testResults.fetch} loading={loading.fetch} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Retrieve issues from your Jira project
                </p>
                <Button onClick={fetchJiraIssues} disabled={loading.fetch} className="w-full">
                  {loading.fetch && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Download className="h-4 w-4 mr-2" />
                  Fetch Issues
                </Button>
                {testResults.fetch && (
                  <div className={cn(
                    "mt-2 p-2 rounded text-xs",
                    testResults.fetch.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  )}>
                    {testResults.fetch.message}
                    {testResults.fetch.count !== undefined && (
                      <div>Found {testResults.fetch.count} issues</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  Create Issue
                  <TestResultBadge result={testResults.create} loading={loading.create} />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="summary">Summary</Label>
                  <Input
                    id="summary"
                    value={newIssue.summary}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Test issue from AgentFlow"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newIssue.description}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Test description"
                    rows={2}
                  />
                </div>
                <Button onClick={createJiraIssue} disabled={loading.create || !newIssue.summary.trim()} className="w-full">
                  {loading.create && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Plus className="h-4 w-4 mr-2" />
                  Create Issue
                </Button>
                {testResults.create && (
                  <div className={cn(
                    "mt-2 p-2 rounded text-xs",
                    testResults.create.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  )}>
                    {testResults.create.message}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  Sync Tasks
                  <TestResultBadge result={testResults.sync} loading={loading.sync} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Sync current tasks with Jira issues
                </p>
                <Button onClick={syncWithJira} disabled={loading.sync} className="w-full">
                  {loading.sync && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Tasks
                </Button>
                {testResults.sync && (
                  <div className={cn(
                    "mt-2 p-2 rounded text-xs",
                    testResults.sync.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  )}>
                    {testResults.sync.message}
                    {testResults.sync.synced !== undefined && (
                      <div>Synced: {testResults.sync.synced} tasks</div>
                    )}
                    {testResults.sync.errors && testResults.sync.errors.length > 0 && (
                      <div className="mt-1">
                        Errors: {testResults.sync.errors.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Full Test */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Full Integration Test</h3>
              <TestResultBadge result={testResults.full} loading={loading.full} />
            </div>
            <Button onClick={runFullTest} disabled={loading.full} size="lg" className="w-full">
              {loading.full && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Run Complete Test Suite
            </Button>
            {testResults.full && (
              <div className={cn(
                "mt-4 p-4 rounded",
                testResults.full.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              )}>
                <div className="font-medium">{testResults.full.message}</div>
                {testResults.full.error && (
                  <div className="mt-2 text-sm font-mono">{testResults.full.error}</div>
                )}
                {testResults.full.details && (
                  <div className="mt-2 text-sm">{testResults.full.details}</div>
                )}
              </div>
            )}
          </div>

          {/* Jira Issues Display */}
          {jiraIssues.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Jira Issues ({jiraIssues.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {jiraIssues.map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <div>
                      <div className="font-medium">{issue.key}: {issue.summary}</div>
                      <div className="text-sm text-muted-foreground">
                        Status: {issue.status.name} | Priority: {issue.priority.name}
                        {issue.assignee && ` | Assignee: ${issue.assignee.displayName}`}
                      </div>
                    </div>
                    <Badge variant="outline">{issue.status.name}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}