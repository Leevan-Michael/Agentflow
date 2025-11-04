"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Mail, 
  Settings, 
  Key, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertTriangle,
  Info
} from 'lucide-react'

interface GmailTriggerNodeProps {
  nodeId: string
  parameters: Record<string, any>
  onParameterChange: (key: string, value: any) => void
  onCredentialsClick: () => void
  isConfigured: boolean
  status?: 'idle' | 'running' | 'success' | 'error'
}

export function GmailTriggerNode({
  nodeId,
  parameters,
  onParameterChange,
  onCredentialsClick,
  isConfigured,
  status = 'idle'
}: GmailTriggerNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const triggerOn = parameters.triggerOn || 'newEmail'
  const pollInterval = parameters.pollInterval || 5
  const enabled = parameters.enabled !== false

  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Pause className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'running':
        return 'Monitoring emails...'
      case 'success':
        return 'Last check successful'
      case 'error':
        return 'Error checking emails'
      default:
        return enabled ? 'Ready to monitor' : 'Disabled'
    }
  }

  const getTriggerDescription = () => {
    switch (triggerOn) {
      case 'newEmail':
        return 'Any new email received'
      case 'labeledEmail':
        return `Emails with label: ${parameters.labelName || 'Not set'}`
      case 'senderEmail':
        return `Emails from: ${parameters.senderEmail || 'Not set'}`
      case 'subjectContains':
        return `Subject contains: ${parameters.subjectKeywords || 'Not set'}`
      case 'hasAttachment':
        return 'Emails with attachments'
      default:
        return 'Not configured'
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500 rounded-lg text-white">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm">Gmail Trigger</CardTitle>
              <CardDescription className="text-xs">
                {getTriggerDescription()}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-xs text-gray-600">{getStatusText()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={enabled ? 'default' : 'secondary'} className="text-xs">
              {enabled ? 'Enabled' : 'Disabled'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {pollInterval}min
            </Badge>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Credentials Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Gmail Credentials</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={onCredentialsClick}
                className="h-7"
              >
                <Key className="h-3 w-3 mr-1" />
                {isConfigured ? 'Configured' : 'Setup'}
              </Button>
            </div>
            {!isConfigured && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Gmail credentials required to monitor emails
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Trigger Configuration */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm">Trigger On</Label>
              <Select
                value={triggerOn}
                onValueChange={(value) => onParameterChange('triggerOn', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newEmail">New Email Received</SelectItem>
                  <SelectItem value="labeledEmail">Email with Specific Label</SelectItem>
                  <SelectItem value="senderEmail">Email from Specific Sender</SelectItem>
                  <SelectItem value="subjectContains">Subject Contains Keywords</SelectItem>
                  <SelectItem value="hasAttachment">Email with Attachment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Fields */}
            {triggerOn === 'labeledEmail' && (
              <div className="space-y-2">
                <Label className="text-sm">Label Name</Label>
                <Input
                  placeholder="Important, Work, etc."
                  value={parameters.labelName || ''}
                  onChange={(e) => onParameterChange('labelName', e.target.value)}
                  className="h-8"
                />
              </div>
            )}

            {triggerOn === 'senderEmail' && (
              <div className="space-y-2">
                <Label className="text-sm">Sender Email</Label>
                <Input
                  type="email"
                  placeholder="sender@example.com"
                  value={parameters.senderEmail || ''}
                  onChange={(e) => onParameterChange('senderEmail', e.target.value)}
                  className="h-8"
                />
              </div>
            )}

            {triggerOn === 'subjectContains' && (
              <div className="space-y-2">
                <Label className="text-sm">Subject Keywords</Label>
                <Input
                  placeholder="urgent, invoice, support"
                  value={parameters.subjectKeywords || ''}
                  onChange={(e) => onParameterChange('subjectKeywords', e.target.value)}
                  className="h-8"
                />
                <p className="text-xs text-gray-500">Comma-separated keywords</p>
              </div>
            )}

            {/* Poll Interval */}
            <div className="space-y-2">
              <Label className="text-sm">Check Interval (minutes)</Label>
              <Select
                value={pollInterval.toString()}
                onValueChange={(value) => onParameterChange('pollInterval', parseInt(value))}
              >
                <SelectTrigger className="h-8">
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

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Mark as Read</Label>
                <Switch
                  checked={parameters.markAsRead || false}
                  onCheckedChange={(checked) => onParameterChange('markAsRead', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Include Attachments</Label>
                <Switch
                  checked={parameters.includeAttachments || false}
                  onCheckedChange={(checked) => onParameterChange('includeAttachments', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Enable Trigger</Label>
                <Switch
                  checked={enabled}
                  onCheckedChange={(checked) => onParameterChange('enabled', checked)}
                />
              </div>
            </div>
          </div>

          {/* Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              This trigger will check for new emails every {pollInterval} minute{pollInterval !== 1 ? 's' : ''} 
              and execute the workflow when matching emails are found.
            </AlertDescription>
          </Alert>
        </CardContent>
      )}
    </Card>
  )
}