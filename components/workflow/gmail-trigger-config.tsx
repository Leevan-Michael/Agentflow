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
import { 
  Mail, 
  Settings, 
  Key, 
  Filter,
  Clock,
  FileText,
  AlertTriangle,
  Info,
  CheckCircle2,
  Search
} from 'lucide-react'
import { GmailCredentialsModal } from './gmail-credentials-modal'
import { GmailCredentials } from '@/lib/gmail-auth'

interface GmailTriggerConfigProps {
  nodeId: string
  parameters: Record<string, any>
  onParameterChange: (key: string, value: any) => void
  credentials?: GmailCredentials | null
  onCredentialsChange: (credentials: GmailCredentials) => void
}

export function GmailTriggerConfig({
  nodeId,
  parameters,
  onParameterChange,
  credentials,
  onCredentialsChange
}: GmailTriggerConfigProps) {
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [availableLabels, setAvailableLabels] = useState<Array<{id: string, name: string}>>([])
  const [queryPreview, setQueryPreview] = useState('')

  const triggerOn = parameters.triggerOn || 'newEmail'

  useEffect(() => {
    // Generate query preview based on current parameters
    generateQueryPreview()
  }, [parameters])

  useEffect(() => {
    // Load available labels when credentials are available
    if (credentials) {
      loadGmailLabels()
    }
  }, [credentials])

  const generateQueryPreview = () => {
    const parts = []

    // Base conditions
    if (parameters.onlyUnread !== false) {
      parts.push('is:unread')
    }
    if (parameters.excludeSpam !== false) {
      parts.push('-in:spam')
    }
    if (parameters.excludeTrash !== false) {
      parts.push('-in:trash')
    }

    // Trigger-specific conditions
    switch (triggerOn) {
      case 'labeledEmail':
        if (parameters.labelName) {
          parts.push(`label:${parameters.labelName}`)
        }
        break
      case 'senderEmail':
        if (parameters.senderEmail) {
          parts.push(`from:${parameters.senderEmail}`)
        }
        break
      case 'recipientEmail':
        if (parameters.recipientEmail) {
          parts.push(`to:${parameters.recipientEmail}`)
        }
        break
      case 'senderDomain':
        if (parameters.senderDomain) {
          parts.push(`from:*@${parameters.senderDomain}`)
        }
        break
      case 'subjectContains':
        if (parameters.subjectKeywords) {
          const keywords = parameters.subjectKeywords.split(',').map((k: string) => k.trim())
          keywords.forEach(keyword => parts.push(`subject:"${keyword}"`))
        }
        break
      case 'bodyContains':
        if (parameters.bodyKeywords) {
          const keywords = parameters.bodyKeywords.split(',').map((k: string) => k.trim())
          keywords.forEach(keyword => parts.push(`"${keyword}"`))
        }
        break
      case 'hasAttachment':
        parts.push('has:attachment')
        break
      case 'attachmentType':
        parts.push('has:attachment')
        if (parameters.attachmentType && parameters.attachmentType !== 'any') {
          const typeMap: Record<string, string> = {
            pdf: 'filename:pdf',
            image: '(filename:jpg OR filename:png OR filename:jpeg)',
            excel: '(filename:xls OR filename:xlsx)',
            word: '(filename:doc OR filename:docx)',
            zip: 'filename:zip'
          }
          if (typeMap[parameters.attachmentType]) {
            parts.push(typeMap[parameters.attachmentType])
          }
        }
        break
      case 'emailSize':
        if (parameters.emailSizeCondition && parameters.emailSizeValue) {
          parts.push(`${parameters.emailSizeCondition}:${parameters.emailSizeValue}`)
        }
        break
      case 'customQuery':
        if (parameters.customQuery) {
          return parameters.customQuery
        }
        break
    }

    // Date range
    if (parameters.dateRange && parameters.dateRange !== 'any') {
      const dateMap: Record<string, string> = {
        '1h': 'newer_than:1h',
        '1d': 'newer_than:1d',
        '7d': 'newer_than:7d',
        '30d': 'newer_than:30d'
      }
      if (dateMap[parameters.dateRange]) {
        parts.push(dateMap[parameters.dateRange])
      }
    }

    setQueryPreview(parts.join(' '))
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

  const renderTriggerSpecificFields = () => {
    switch (triggerOn) {
      case 'labeledEmail':
        return (
          <div className="space-y-2">
            <Label>Gmail Label</Label>
            {availableLabels.length > 0 ? (
              <Select
                value={parameters.labelName || ''}
                onValueChange={(value) => onParameterChange('labelName', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a label" />
                </SelectTrigger>
                <SelectContent>
                  {availableLabels.map(label => (
                    <SelectItem key={label.id} value={label.name}>
                      {label.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="Important, Work, etc."
                value={parameters.labelName || ''}
                onChange={(e) => onParameterChange('labelName', e.target.value)}
              />
            )}
          </div>
        )

      case 'senderEmail':
        return (
          <div className="space-y-2">
            <Label>Sender Email Address</Label>
            <Input
              type="email"
              placeholder="sender@example.com"
              value={parameters.senderEmail || ''}
              onChange={(e) => onParameterChange('senderEmail', e.target.value)}
            />
          </div>
        )

      case 'recipientEmail':
        return (
          <div className="space-y-2">
            <Label>Recipient Email Address</Label>
            <Input
              type="email"
              placeholder="recipient@example.com"
              value={parameters.recipientEmail || ''}
              onChange={(e) => onParameterChange('recipientEmail', e.target.value)}
            />
          </div>
        )

      case 'senderDomain':
        return (
          <div className="space-y-2">
            <Label>Sender Domain</Label>
            <Input
              placeholder="company.com"
              value={parameters.senderDomain || ''}
              onChange={(e) => onParameterChange('senderDomain', e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Will match any email from this domain (e.g., *@company.com)
            </p>
          </div>
        )

      case 'subjectContains':
        return (
          <div className="space-y-2">
            <Label>Subject Keywords</Label>
            <Input
              placeholder="urgent, invoice, support"
              value={parameters.subjectKeywords || ''}
              onChange={(e) => onParameterChange('subjectKeywords', e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Comma-separated keywords. Email will trigger if subject contains any of these.
            </p>
          </div>
        )

      case 'bodyContains':
        return (
          <div className="space-y-2">
            <Label>Body Keywords</Label>
            <Input
              placeholder="action required, deadline, important"
              value={parameters.bodyKeywords || ''}
              onChange={(e) => onParameterChange('bodyKeywords', e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Comma-separated keywords. Email will trigger if body contains any of these.
            </p>
          </div>
        )

      case 'attachmentType':
        return (
          <div className="space-y-2">
            <Label>Attachment Type</Label>
            <Select
              value={parameters.attachmentType || 'any'}
              onValueChange={(value) => onParameterChange('attachmentType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Attachment</SelectItem>
                <SelectItem value="pdf">PDF Documents</SelectItem>
                <SelectItem value="image">Images (JPG, PNG)</SelectItem>
                <SelectItem value="excel">Excel Files</SelectItem>
                <SelectItem value="word">Word Documents</SelectItem>
                <SelectItem value="zip">ZIP Archives</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 'emailSize':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Size Condition</Label>
              <Select
                value={parameters.emailSizeCondition || 'larger'}
                onValueChange={(value) => onParameterChange('emailSizeCondition', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="larger">Larger than</SelectItem>
                  <SelectItem value="smaller">Smaller than</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Size Value</Label>
              <Input
                placeholder="1M, 500K, 10MB"
                value={parameters.emailSizeValue || ''}
                onChange={(e) => onParameterChange('emailSizeValue', e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Examples: 1M (1MB), 500K (500KB), 10MB
              </p>
            </div>
          </div>
        )

      case 'customQuery':
        return (
          <div className="space-y-2">
            <Label>Custom Gmail Query</Label>
            <Textarea
              placeholder="from:support@company.com has:attachment larger:1M"
              value={parameters.customQuery || ''}
              onChange={(e) => onParameterChange('customQuery', e.target.value)}
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Use Gmail's advanced search syntax. 
              <a 
                href="https://support.google.com/mail/answer/7190?hl=en" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                Learn more about Gmail search operators
              </a>
            </p>
          </div>
        )

      default:
        return null
    }
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
          <div className="flex items-center justify-between">
            <div>
              {credentials ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCredentialsModal(true)}
            >
              {credentials ? 'Edit' : 'Setup'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      <Tabs defaultValue="trigger" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trigger" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Trigger
          </TabsTrigger>
          <TabsTrigger value="options" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Options
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Trigger Configuration */}
        <TabsContent value="trigger" className="space-y-4">
          <div className="space-y-2">
            <Label>Trigger Condition</Label>
            <Select
              value={triggerOn}
              onValueChange={(value) => onParameterChange('triggerOn', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newEmail">New Email Received</SelectItem>
                <SelectItem value="labeledEmail">Email with Specific Label</SelectItem>
                <SelectItem value="senderEmail">Email from Specific Sender</SelectItem>
                <SelectItem value="recipientEmail">Email to Specific Recipient</SelectItem>
                <SelectItem value="senderDomain">Email from Domain</SelectItem>
                <SelectItem value="subjectContains">Subject Contains Keywords</SelectItem>
                <SelectItem value="bodyContains">Body Contains Keywords</SelectItem>
                <SelectItem value="hasAttachment">Email with Attachment</SelectItem>
                <SelectItem value="attachmentType">Specific Attachment Type</SelectItem>
                <SelectItem value="emailSize">Email Size Condition</SelectItem>
                <SelectItem value="customQuery">Advanced Query</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderTriggerSpecificFields()}

          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select
              value={parameters.dateRange || 'any'}
              onValueChange={(value) => onParameterChange('dateRange', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any time</SelectItem>
                <SelectItem value="1h">Last hour</SelectItem>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last week</SelectItem>
                <SelectItem value="30d">Last month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        {/* Options Configuration */}
        <TabsContent value="options" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Poll Interval</Label>
              <Select
                value={parameters.pollInterval?.toString() || '5'}
                onValueChange={(value) => onParameterChange('pollInterval', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minute</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Max Emails per Check</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={parameters.maxEmails || 10}
                onChange={(e) => onParameterChange('maxEmails', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Only Unread Emails</Label>
                <p className="text-xs text-gray-500">Only trigger on unread emails</p>
              </div>
              <Switch
                checked={parameters.onlyUnread !== false}
                onCheckedChange={(checked) => onParameterChange('onlyUnread', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Mark as Read</Label>
                <p className="text-xs text-gray-500">Mark processed emails as read</p>
              </div>
              <Switch
                checked={parameters.markAsRead || false}
                onCheckedChange={(checked) => onParameterChange('markAsRead', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Include Attachments</Label>
                <p className="text-xs text-gray-500">Include attachment metadata</p>
              </div>
              <Switch
                checked={parameters.includeAttachments || false}
                onCheckedChange={(checked) => onParameterChange('includeAttachments', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Download Attachments</Label>
                <p className="text-xs text-gray-500">Download attachment content</p>
              </div>
              <Switch
                checked={parameters.downloadAttachments || false}
                onCheckedChange={(checked) => onParameterChange('downloadAttachments', checked)}
                disabled={!parameters.includeAttachments}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Exclude Spam</Label>
                <p className="text-xs text-gray-500">Exclude spam emails</p>
              </div>
              <Switch
                checked={parameters.excludeSpam !== false}
                onCheckedChange={(checked) => onParameterChange('excludeSpam', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Exclude Trash</Label>
                <p className="text-xs text-gray-500">Exclude deleted emails</p>
              </div>
              <Switch
                checked={parameters.excludeTrash !== false}
                onCheckedChange={(checked) => onParameterChange('excludeTrash', checked)}
              />
            </div>
          </div>
        </TabsContent>

        {/* Query Preview */}
        <TabsContent value="preview" className="space-y-4">
          <div className="space-y-2">
            <Label>Gmail Search Query</Label>
            <Textarea
              value={queryPreview}
              readOnly
              rows={3}
              className="font-mono text-sm bg-gray-50"
            />
            <p className="text-xs text-gray-500">
              This is the Gmail search query that will be used to find matching emails.
            </p>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              The trigger will check for emails matching this query every {parameters.pollInterval || 5} minutes
              and process up to {parameters.maxEmails || 10} emails per check.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

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