"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Mail, 
  Settings, 
  Key, 
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  RefreshCw,
  Eye,
  Zap,
  Tag,
  User,
  FileText,
  Paperclip,
  Database,
  Search
} from 'lucide-react'
import { EnhancedGmailTriggerConfig } from './enhanced-gmail-trigger-config'
import { GmailCredentials } from '@/lib/gmail-auth'

interface EnhancedGmailTriggerNodeProps {
  nodeId: string
  parameters: Record<string, any>
  onParameterChange: (key: string, value: any) => void
  isSelected?: boolean
  isExecuting?: boolean
  executionStatus?: 'idle' | 'running' | 'success' | 'error'
  lastExecution?: {
    timestamp: string
    emailsProcessed: number
    success: boolean
    error?: string
  }
}

export function EnhancedGmailTriggerNode({
  nodeId,
  parameters,
  onParameterChange,
  isSelected = false,
  isExecuting = false,
  executionStatus = 'idle',
  lastExecution
}: EnhancedGmailTriggerNodeProps) {
  const [showConfig, setShowConfig] = useState(false)
  const [credentials, setCredentials] = useState<GmailCredentials | null>(null)
  const [isActive, setIsActive] = useState(parameters.enabled !== false)

  useEffect(() => {
    // Load credentials from storage or context
    // This would typically come from a credentials store
    const mockCredentials: GmailCredentials = {
      id: 'gmail-cred-1',
      name: 'Gmail Account',
      email: 'user@gmail.com',
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: Date.now() + 3600000
    }
    setCredentials(mockCredentials)
  }, [])

  const getTriggerDescription = () => {
    const triggerOn = parameters.triggerOn || 'newEmail'
    const event = parameters.event || 'messageReceived'
    
    const eventText = event === 'messageSent' ? 'sent emails' : 'received emails'
    
    switch (triggerOn) {
      case 'labeledEmail':
        return `${eventText} with label "${parameters.labelName || 'any'}"`
      case 'senderEmail':
        return `${eventText} from ${parameters.senderEmail || 'specific sender'}`
      case 'recipientEmail':
        return `${eventText} to ${parameters.recipientEmail || 'specific recipient'}`
      case 'senderDomain':
        return `${eventText} from domain ${parameters.senderDomain || 'specific domain'}`
      case 'subjectContains':
        return `${eventText} with subject containing "${parameters.subjectKeywords || 'keywords'}"`
      case 'bodyContains':
        return `${eventText} with body containing "${parameters.bodyKeywords || 'keywords'}"`
      case 'hasAttachment':
        return `${eventText} with attachments`
      case 'attachmentType':
        return `${eventText} with ${parameters.attachmentType || 'specific'} attachments`
      case 'emailSize':
        return `${eventText} ${parameters.emailSizeCondition || 'larger'} than ${parameters.emailSizeValue || 'size'}`
      case 'customQuery':
        return `${eventText} matching custom query`
      default:
        return `Any ${eventText}`
    }
  }

  const getTriggerIcon = () => {
    const triggerOn = parameters.triggerOn || 'newEmail'
    
    switch (triggerOn) {
      case 'labeledEmail':
        return <Tag className="h-4 w-4" />
      case 'senderEmail':
      case 'recipientEmail':
      case 'senderDomain':
        return <User className="h-4 w-4" />
      case 'subjectContains':
      case 'bodyContains':
        return <FileText className="h-4 w-4" />
      case 'hasAttachment':
      case 'attachmentType':
        return <Paperclip className="h-4 w-4" />
      case 'emailSize':
        return <Database className="h-4 w-4" />
      case 'customQuery':
        return <Search className="h-4 w-4" />
      default:
        return <Mail className="h-4 w-4" />
    }
  }

  const getStatusColor = () => {
    switch (executionStatus) {
      case 'running':
        return 'border-blue-500 bg-blue-50'
      case 'success':
        return 'border-green-500 bg-green-50'
      case 'error':
        return 'border-red-500 bg-red-50'
      default:
        return 'border-gray-200 bg-white'
    }
  }

  const getStatusIcon = () => {
    switch (executionStatus) {
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return isActive ? <Zap className="h-4 w-4 text-blue-600" /> : <Pause className="h-4 w-4 text-gray-400" />
    }
  }

  const toggleActive = () => {
    const newActive = !isActive
    setIsActive(newActive)
    onParameterChange('enabled', newActive)
  }

  return (
    <div className="space-y-4">
      {/* Node Card */}
      <Card className={`transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''} ${getStatusColor()}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-red-500" />
              <div>
                <CardTitle className="text-sm">Gmail Trigger</CardTitle>
                <CardDescription className="text-xs">
                  {getTriggerDescription()}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfig(!showConfig)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Status Row */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {getTriggerIcon()}
                  <span className="text-muted-foreground">
                    {parameters.triggerOn === 'newEmail' ? 'Any email' : 'Filtered'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="text-muted-foreground">
                    Every {parameters.pollInterval || 5}m
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                  {isActive ? 'Active' : 'Paused'}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleActive}
                  className="h-6 w-6 p-0"
                >
                  {isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            {/* Credentials Status */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Key className="h-3 w-3" />
                {credentials ? (
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-muted-foreground">{credentials.email}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    <span className="text-muted-foreground">No credentials</span>
                  </div>
                )}
              </div>
              {lastExecution && (
                <div className="text-muted-foreground">
                  Last: {lastExecution.emailsProcessed} emails
                </div>
              )}
            </div>

            {/* Execution Status */}
            {executionStatus === 'running' && (
              <Alert className="py-2">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <AlertDescription className="text-xs">
                  Checking for new emails...
                </AlertDescription>
              </Alert>
            )}

            {executionStatus === 'error' && lastExecution?.error && (
              <Alert variant="destructive" className="py-2">
                <AlertTriangle className="h-3 w-3" />
                <AlertDescription className="text-xs">
                  {lastExecution.error}
                </AlertDescription>
              </Alert>
            )}

            {/* Quick Filters Display */}
            {parameters.triggerOn !== 'newEmail' && (
              <div className="flex flex-wrap gap-1">
                {parameters.labelName && (
                  <Badge variant="outline" className="text-xs">
                    <Tag className="h-2 w-2 mr-1" />
                    {parameters.labelName}
                  </Badge>
                )}
                {parameters.senderEmail && (
                  <Badge variant="outline" className="text-xs">
                    <User className="h-2 w-2 mr-1" />
                    {parameters.senderEmail}
                  </Badge>
                )}
                {parameters.senderDomain && (
                  <Badge variant="outline" className="text-xs">
                    <User className="h-2 w-2 mr-1" />
                    @{parameters.senderDomain}
                  </Badge>
                )}
                {parameters.subjectKeywords && (
                  <Badge variant="outline" className="text-xs">
                    <FileText className="h-2 w-2 mr-1" />
                    Subject
                  </Badge>
                )}
                {parameters.attachmentType && (
                  <Badge variant="outline" className="text-xs">
                    <Paperclip className="h-2 w-2 mr-1" />
                    {parameters.attachmentType}
                  </Badge>
                )}
                {parameters.onlyUnread !== false && (
                  <Badge variant="outline" className="text-xs">
                    <Eye className="h-2 w-2 mr-1" />
                    Unread
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Panel */}
      {showConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gmail Trigger Configuration</CardTitle>
            <CardDescription>
              Configure when and how this trigger should activate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedGmailTriggerConfig
              nodeId={nodeId}
              parameters={parameters}
              onParameterChange={onParameterChange}
              credentials={credentials}
              onCredentialsChange={setCredentials}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}