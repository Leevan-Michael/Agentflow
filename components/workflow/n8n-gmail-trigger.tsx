"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Mail, 
  Settings, 
  Key, 
  Filter,
  Clock,
  Tag,
  Search,
  Download,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw
} from 'lucide-react'
import { GmailCredentialsModal } from './gmail-credentials-modal'
import { GmailCredentials } from '@/lib/gmail-auth'

interface N8nGmailTriggerProps {
  nodeId: string
  parameters: Record<string, any>
  onParameterChange: (key: string, value: any) => void
  credentials?: GmailCredentials | null
  onCredentialsChange: (credentials: GmailCredentials) => void
}

export function N8nGmailTrigger({
  nodeId,
  parameters,
  onParameterChange,
  credentials,
  onCredentialsChange
}: N8nGmailTriggerProps) {
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [availableLabels, setAvailableLabels] = useState<Array<{id: string, name: string}>>([])
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [queryPreview, setQueryPreview] = useState('')

  // Default values matching n8n
  const event = parameters.event || 'messageReceived'
  const pollTimes = parameters.pollTimes || 'everyMinute'
  const format = parameters.format || 'simple'
  const readStatus = parameters.readStatus || 'unreadOnly'
  const maxResults = parameters.maxResults || 10
  const downloadAttachments = parameters.downloadAttachments || false
  const includeSpamTrash = parameters.includeSpamTrash || false
  const markAsRead = parameters.markAsRead || false

  useEffect(() => {
    generateQueryPreview()
  }, [parameters])

  useEffect(() => {
    if (credentials) {
      loadGmailLabels()
    }
  }, [credentials])

  const generateQueryPreview = () => {
    const queryParts = []

    // Base query based on event
    if (event === 'messageReceived') {
      queryParts.push('in:inbox')
    } else if (event === 'messageSent') {
      queryParts.push('in:sent')
    }

    // Read status
    if (readStatus === 'unreadOnly') {
      queryParts.push('is:unread')
    } else if (readStatus === 'readOnly') {
      queryParts.push('is:read')
    }

    // Exclude spam and trash unless explicitly included
    if (!includeSpamTrash) {
      queryParts.push('-in:spam -in:trash')
    }

    // Sender filter
    if (parameters.senderEmail) {
      queryParts.push(`from:${parameters.senderEmail}`)
    }

    // Subject filter
    if (parameters.subject) {
      queryParts.push(`subject:"${parameters.subject}"`)
    }

    // Label filters
    if (parameters.labelIds) {
      const labels = parameters.labelIds.split(',').map((l: string) => l.trim())
      labels.forEach((label: string) => {
        queryParts.push(`label:${label}`)
      })
    }

    // Custom query (overrides other filters if provided)
    if (parameters.query) {
      setQueryPreview(parameters.query)
      return
    }

    setQueryPreview(queryParts.join(' '))
  }

  const loadGmailLabels = async () => {
    if (!credentials) return

    try {
      const response = await fetch('/api/gmail/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      const data = await response.json()
      if (data.success) {
        setAvailableLabels(data.labels)
      }
    } catch (error) {
      console.error('Failed to load Gmail labels:', error)
    }
  }

  const testConnection = async () => {
    if (!credentials) return

    setIsTestingConnection(true)
    setConnectionStatus('testing')

    try {
      const response = await fetch('/api/gmail/auth/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      const data = await response.json()
      setConnectionStatus(data.success ? 'success' : 'error')
    } catch (error) {
      setConnectionStatus('error')
    } finally {
      setIsTestingConnection(false)
      setTimeout(() => setConnectionStatus('idle'), 3000)
    }
  }

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getPollIntervalText = (value: string) => {
    const intervals: Record<string, string> = {
      everyMinute: '1 minute',
      every2Minutes: '2 minutes',
      every5Minutes: '5 minutes',
      every10Minutes: '10 minutes',
      every30Minutes: '30 minutes',
      everyHour: '1 hour'
    }
    return intervals[value] || value
  }

  return (
    <div className="space-y-6">
      {/* Credentials Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Key className="h-4 w-4" />
            Gmail Credentials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <div>
              {credentials ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getConnectionStatusIcon()}
                    <span className="text-sm font-medium">{credentials.name}</span>
                  </div>
                  <p className="text-xs text-gray-500">{credentials.email}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">No credentials configured</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {credentials && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testConnection}
                  disabled={isTestingConnection}
                >
                  Test
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCredentialsModal(true)}
              >
                {credentials ? 'Edit' : 'Setup'}
              </Button>
            </div>
          </div>
          
          {connectionStatus === 'error' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Connection test failed. Please check your credentials.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="text-xs">Basic</TabsTrigger>
          <TabsTrigger value="filters" className="text-xs">Filters</TabsTrigger>
          <TabsTrigger value="options" className="text-xs">Options</TabsTrigger>
          <TabsTrigger value="actions" className="text-xs">Actions</TabsTrigger>
        </TabsList>

        {/* Basic Configuration */}
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Event</Label>
              <Select
                value={event}
                onValueChange={(value) => onParameterChange('event', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="messageReceived">Message Received</SelectItem>
                  <SelectItem value="messageSent">Message Sent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Poll Times</Label>
              <Select
                value={pollTimes}
                onValueChange={(value) => onParameterChange('pollTimes', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyMinute">Every Minute</SelectItem>
                  <SelectItem value="every2Minutes">Every 2 Minutes</SelectItem>
                  <SelectItem value="every5Minutes">Every 5 Minutes</SelectItem>
                  <SelectItem value="every10Minutes">Every 10 Minutes</SelectItem>
                  <SelectItem value="every30Minutes">Every 30 Minutes</SelectItem>
                  <SelectItem value="everyHour">Every Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Format</Label>
              <Select
                value={format}
                onValueChange={(value) => onParameterChange('format', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="raw">Raw</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Max Results</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={maxResults}
                onChange={(e) => onParameterChange('maxResults', parseInt(e.target.value))}
              />
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              This trigger will check for emails every {getPollIntervalText(pollTimes)} and return up to {maxResults} emails per execution.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Filters */}
        <TabsContent value="filters" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Read Status</Label>
              <Select
                value={readStatus}
                onValueChange={(value) => onParameterChange('readStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unreadOnly">Unread Only</SelectItem>
                  <SelectItem value="readOnly">Read Only</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Sender Email</Label>
              <Input
                type="email"
                placeholder="sender@example.com"
                value={parameters.senderEmail || ''}
                onChange={(e) => onParameterChange('senderEmail', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Subject Contains</Label>
              <Input
                placeholder="Subject text to search for"
                value={parameters.subject || ''}
                onChange={(e) => onParameterChange('subject', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Label IDs</Label>
              <Input
                placeholder="INBOX,IMPORTANT,WORK"
                value={parameters.labelIds || ''}
                onChange={(e) => onParameterChange('labelIds', e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Comma-separated list of Gmail label IDs
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Custom Search Query</Label>
              <Textarea
                placeholder="from:example@gmail.com has:attachment"
                value={parameters.query || ''}
                onChange={(e) => onParameterChange('query', e.target.value)}
                rows={2}
              />
              <p className="text-xs text-gray-500">
                Advanced Gmail search query (overrides other filters)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Include Spam and Trash</Label>
                <p className="text-xs text-gray-500">Include emails from spam and trash folders</p>
              </div>
              <Switch
                checked={includeSpamTrash}
                onCheckedChange={(checked) => onParameterChange('includeSpamTrash', checked)}
              />
            </div>
          </div>

          {/* Query Preview */}
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              <Search className="h-3 w-3" />
              Generated Query Preview
            </Label>
            <div className="p-3 bg-gray-50 rounded border font-mono text-xs">
              {queryPreview || 'No query generated'}
            </div>
          </div>
        </TabsContent>

        {/* Options */}
        <TabsContent value="options" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Download Attachments</Label>
                <p className="text-xs text-gray-500">Download email attachments as binary data</p>
              </div>
              <Switch
                checked={downloadAttachments}
                onCheckedChange={(checked) => onParameterChange('downloadAttachments', checked)}
              />
            </div>

            {downloadAttachments && (
              <div className="space-y-2">
                <Label className="text-sm">Attachment Prefix</Label>
                <Input
                  placeholder="attachment_"
                  value={parameters.attachmentPrefix || 'attachment_'}
                  onChange={(e) => onParameterChange('attachmentPrefix', e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Prefix for attachment property names in the output
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm">Additional Filters (JSON)</Label>
              <Textarea
                placeholder='{"hasAttachment": true, "isImportant": true}'
                value={parameters.filters || '{}'}
                onChange={(e) => onParameterChange('filters', e.target.value)}
                rows={3}
                className="font-mono text-xs"
              />
              <p className="text-xs text-gray-500">
                Additional filters in JSON format
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Actions */}
        <TabsContent value="actions" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Mark as Read</Label>
                <p className="text-xs text-gray-500">Mark processed emails as read</p>
              </div>
              <Switch
                checked={markAsRead}
                onCheckedChange={(checked) => onParameterChange('markAsRead', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Add Label IDs</Label>
              <Input
                placeholder="PROCESSED,AUTOMATED"
                value={parameters.addLabelIds || ''}
                onChange={(e) => onParameterChange('addLabelIds', e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Comma-separated list of label IDs to add to processed emails
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Remove Label IDs</Label>
              <Input
                placeholder="UNREAD,INBOX"
                value={parameters.removeLabelIds || ''}
                onChange={(e) => onParameterChange('removeLabelIds', e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Comma-separated list of label IDs to remove from processed emails
              </p>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Actions will be performed on emails after they are processed by the workflow.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>

      {/* Available Labels */}
      {availableLabels.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Available Labels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="flex flex-wrap gap-1">
                {availableLabels.map(label => (
                  <Badge
                    key={label.id}
                    variant="outline"
                    className="text-xs cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      const currentLabels = parameters.labelIds || ''
                      const newLabels = currentLabels 
                        ? `${currentLabels},${label.id}`
                        : label.id
                      onParameterChange('labelIds', newLabels)
                    }}
                  >
                    {label.name} ({label.id})
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Credentials Modal */}
      <GmailCredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        onSave={onCredentialsChange}
        existingCredentials={credentials}
      />
    </div>
  )
}