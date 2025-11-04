"use client"

import React, { useState } from 'react'
import { JiraCredentials, CredentialTestResult } from '@/lib/types/credentials'
import { useCredentialsStore } from '@/lib/credentials-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ExternalLink,
  Eye,
  EyeOff,
  AlertCircle,
  Server,
  User,
  FolderOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface JiraCredentialsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCredentialsSelect: (credentials: JiraCredentials) => void
  selectedCredentialsId?: string
}

export function JiraCredentialsModal({ 
  open, 
  onOpenChange, 
  onCredentialsSelect,
  selectedCredentialsId 
}: JiraCredentialsModalProps) {
  const { 
    jiraCredentials, 
    addJiraCredentials, 
    deleteJiraCredentials, 
    testJiraCredentials 
  } = useCredentialsStore()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    baseUrl: '',
    email: '',
    apiToken: '',
    projectKey: ''
  })
  const [showApiToken, setShowApiToken] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<CredentialTestResult | null>(null)

  const handleCreateCredentials = async () => {
    if (!formData.name || !formData.baseUrl || !formData.email || !formData.apiToken) {
      return
    }

    const credentials = addJiraCredentials({
      name: formData.name,
      baseUrl: formData.baseUrl.replace(/\/$/, ''), // Remove trailing slash
      email: formData.email,
      apiToken: formData.apiToken,
      projectKey: formData.projectKey || undefined,
      userId: 'current-user' // In real app, get from auth
    })

    setFormData({
      name: '',
      baseUrl: '',
      email: '',
      apiToken: '',
      projectKey: ''
    })
    setShowCreateForm(false)
    setTestResult(null)
    onCredentialsSelect(credentials)
  }

  const handleTestCredentials = async () => {
    if (!formData.baseUrl || !formData.email || !formData.apiToken) {
      return
    }

    setTesting(true)
    try {
      const result = await testJiraCredentials({
        name: formData.name,
        baseUrl: formData.baseUrl.replace(/\/$/, ''),
        email: formData.email,
        apiToken: formData.apiToken,
        projectKey: formData.projectKey || undefined,
        userId: 'current-user'
      })
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSelectCredentials = (credentials: JiraCredentials) => {
    onCredentialsSelect(credentials)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Jira Credentials
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Credentials */}
          {jiraCredentials.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Existing Credentials</h3>
              <div className="space-y-2">
                {jiraCredentials.map((credentials) => (
                  <div
                    key={credentials.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50",
                      selectedCredentialsId === credentials.id && "border-primary bg-primary/5"
                    )}
                    onClick={() => handleSelectCredentials(credentials)}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{credentials.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {credentials.baseUrl} • {credentials.email}
                      </div>
                      {credentials.projectKey && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {credentials.projectKey}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedCredentialsId === credentials.id && (
                        <Badge variant="default">Selected</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteJiraCredentials(credentials.id)
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create New Credentials */}
          <div className="border-t pt-4">
            {!showCreateForm ? (
              <Button onClick={() => setShowCreateForm(true)} className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Add New Jira Credentials
              </Button>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Add New Jira Credentials</h3>
                
                {/* Help Text */}
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-900">How to get Jira API Token:</p>
                      <ol className="mt-1 text-blue-700 space-y-1">
                        <li>1. Go to <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" className="underline">Atlassian API Tokens</a></li>
                        <li>2. Click "Create API token"</li>
                        <li>3. Give it a label like "AgentFlow Integration"</li>
                        <li>4. Copy the generated token</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Credential Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My Jira Instance"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="baseUrl">Jira Base URL *</Label>
                    <Input
                      id="baseUrl"
                      value={formData.baseUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                      placeholder="https://yourcompany.atlassian.net"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your-email@company.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="apiToken">API Token *</Label>
                    <div className="relative">
                      <Input
                        id="apiToken"
                        type={showApiToken ? "text" : "password"}
                        value={formData.apiToken}
                        onChange={(e) => setFormData(prev => ({ ...prev, apiToken: e.target.value }))}
                        placeholder="Your Jira API token"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowApiToken(!showApiToken)}
                      >
                        {showApiToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="projectKey">Project Key (Optional)</Label>
                    <Input
                      id="projectKey"
                      value={formData.projectKey}
                      onChange={(e) => setFormData(prev => ({ ...prev, projectKey: e.target.value }))}
                      placeholder="PROJ (leave empty to access all projects)"
                    />
                  </div>
                </div>

                {/* Test Connection */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestCredentials}
                    disabled={testing || !formData.baseUrl || !formData.email || !formData.apiToken}
                  >
                    {testing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Test Connection
                  </Button>
                  <Button
                    onClick={handleCreateCredentials}
                    disabled={!formData.name || !formData.baseUrl || !formData.email || !formData.apiToken}
                  >
                    Save Credentials
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false)
                      setTestResult(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>

                {/* Test Results */}
                {testResult && (
                  <div className={cn(
                    "p-4 rounded-lg",
                    testResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      {testResult.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className={cn(
                        "font-medium",
                        testResult.success ? "text-green-900" : "text-red-900"
                      )}>
                        {testResult.message}
                      </span>
                    </div>

                    {testResult.success && testResult.details && (
                      <div className="space-y-2 text-sm">
                        {testResult.details.serverInfo && (
                          <div className="flex items-center gap-2 text-green-700">
                            <Server className="h-4 w-4" />
                            <span>{testResult.details.serverInfo.serverTitle} (v{testResult.details.serverInfo.version})</span>
                          </div>
                        )}
                        
                        {testResult.details.user && (
                          <div className="flex items-center gap-2 text-green-700">
                            <User className="h-4 w-4" />
                            <span>{testResult.details.user.displayName} ({testResult.details.user.emailAddress})</span>
                          </div>
                        )}

                        {testResult.details.projects && testResult.details.projects.length > 0 && (
                          <div className="flex items-start gap-2 text-green-700">
                            <FolderOpen className="h-4 w-4 mt-0.5" />
                            <div>
                              <div>Accessible Projects:</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {testResult.details.projects.slice(0, 5).map((project) => (
                                  <Badge key={project.key} variant="outline" className="text-xs">
                                    {project.key}
                                  </Badge>
                                ))}
                                {testResult.details.projects.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{testResult.details.projects.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!testResult.success && testResult.error && (
                      <div className="text-sm text-red-700 mt-2">
                        <strong>Error:</strong> {testResult.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}