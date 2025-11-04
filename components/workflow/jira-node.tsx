"use client"

import React, { useState } from 'react'
import { JiraCredentials } from '@/lib/types/credentials'
import { useCredentialsStore } from '@/lib/credentials-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { JiraCredentialsModal } from './jira-credentials-modal'
import { 
  ExternalLink, 
  Settings, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

interface JiraNodeProps {
  nodeId: string
  parameters: {
    credentialsId?: string
    operation?: 'create-issue' | 'update-issue' | 'get-issue' | 'search-issues'
    projectKey?: string
    issueType?: string
    summary?: string
    description?: string
    priority?: string
    assignee?: string
    issueKey?: string
    jql?: string
  }
  onParameterChange: (key: string, value: any) => void
}

export function JiraNode({ nodeId, parameters, onParameterChange }: JiraNodeProps) {
  const { getJiraCredentials } = useCredentialsStore()
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)

  const selectedCredentials = parameters.credentialsId 
    ? getJiraCredentials(parameters.credentialsId)
    : null

  const handleCredentialsSelect = (credentials: JiraCredentials) => {
    onParameterChange('credentialsId', credentials.id)
    setShowCredentialsModal(false)
  }

  const renderOperationFields = () => {
    switch (parameters.operation) {
      case 'create-issue':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectKey">Project Key *</Label>
                <Input
                  id="projectKey"
                  value={parameters.projectKey || ''}
                  onChange={(e) => onParameterChange('projectKey', e.target.value)}
                  placeholder="PROJ"
                />
              </div>
              <div>
                <Label htmlFor="issueType">Issue Type *</Label>
                <Select
                  value={parameters.issueType || ''}
                  onValueChange={(value) => onParameterChange('issueType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Task">Task</SelectItem>
                    <SelectItem value="Story">Story</SelectItem>
                    <SelectItem value="Bug">Bug</SelectItem>
                    <SelectItem value="Epic">Epic</SelectItem>
                    <SelectItem value="Sub-task">Sub-task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="summary">Summary *</Label>
              <Input
                id="summary"
                value={parameters.summary || ''}
                onChange={(e) => onParameterChange('summary', e.target.value)}
                placeholder="Issue summary"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={parameters.description || ''}
                onChange={(e) => onParameterChange('description', e.target.value)}
                placeholder="Issue description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={parameters.priority || ''}
                  onValueChange={(value) => onParameterChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Highest">Highest</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Lowest">Lowest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assignee">Assignee</Label>
                <Input
                  id="assignee"
                  value={parameters.assignee || ''}
                  onChange={(e) => onParameterChange('assignee', e.target.value)}
                  placeholder="username or email"
                />
              </div>
            </div>
          </div>
        )

      case 'update-issue':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="issueKey">Issue Key *</Label>
              <Input
                id="issueKey"
                value={parameters.issueKey || ''}
                onChange={(e) => onParameterChange('issueKey', e.target.value)}
                placeholder="PROJ-123"
              />
            </div>

            <div>
              <Label htmlFor="summary">Summary</Label>
              <Input
                id="summary"
                value={parameters.summary || ''}
                onChange={(e) => onParameterChange('summary', e.target.value)}
                placeholder="Updated summary"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={parameters.description || ''}
                onChange={(e) => onParameterChange('description', e.target.value)}
                placeholder="Updated description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={parameters.priority || ''}
                  onValueChange={(value) => onParameterChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Highest">Highest</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Lowest">Lowest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assignee">Assignee</Label>
                <Input
                  id="assignee"
                  value={parameters.assignee || ''}
                  onChange={(e) => onParameterChange('assignee', e.target.value)}
                  placeholder="username or email"
                />
              </div>
            </div>
          </div>
        )

      case 'get-issue':
        return (
          <div>
            <Label htmlFor="issueKey">Issue Key *</Label>
            <Input
              id="issueKey"
              value={parameters.issueKey || ''}
              onChange={(e) => onParameterChange('issueKey', e.target.value)}
              placeholder="PROJ-123"
            />
          </div>
        )

      case 'search-issues':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="jql">JQL Query *</Label>
              <Textarea
                id="jql"
                value={parameters.jql || ''}
                onChange={(e) => onParameterChange('jql', e.target.value)}
                placeholder="project = PROJ AND status = 'To Do'"
                rows={3}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Use JQL (Jira Query Language) to search for issues. 
              <a 
                href="https://support.atlassian.com/jira-service-management-cloud/docs/use-advanced-search-with-jira-query-language-jql/" 
                target="_blank" 
                className="text-primary hover:underline ml-1"
              >
                Learn JQL syntax
              </a>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-4 text-muted-foreground">
            Select an operation to configure parameters
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Credentials Section */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Jira Credentials</Label>
        
        {selectedCredentials ? (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div>
                <div className="font-medium text-green-900">{selectedCredentials.name}</div>
                <div className="text-sm text-green-700">
                  {selectedCredentials.baseUrl} • {selectedCredentials.email}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCredentialsModal(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Change
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-orange-900">No Jira credentials configured</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCredentialsModal(true)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        )}
      </div>

      {/* Operation Selection */}
      <div className="space-y-3">
        <Label htmlFor="operation">Operation</Label>
        <Select
          value={parameters.operation || ''}
          onValueChange={(value) => onParameterChange('operation', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Jira operation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="create-issue">Create Issue</SelectItem>
            <SelectItem value="update-issue">Update Issue</SelectItem>
            <SelectItem value="get-issue">Get Issue</SelectItem>
            <SelectItem value="search-issues">Search Issues</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Operation-specific Parameters */}
      {parameters.operation && (
        <div className="space-y-3">
          <Label className="text-base font-medium">Parameters</Label>
          {renderOperationFields()}
        </div>
      )}

      {/* Credentials Modal */}
      <JiraCredentialsModal
        open={showCredentialsModal}
        onOpenChange={setShowCredentialsModal}
        onCredentialsSelect={handleCredentialsSelect}
        selectedCredentialsId={parameters.credentialsId}
      />
    </div>
  )
}