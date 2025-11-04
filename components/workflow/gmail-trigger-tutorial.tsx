"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Mail,
  Settings,
  Filter,
  Clock,
  Info,
  CheckCircle,
  AlertTriangle,
  Play,
  Eye
} from "lucide-react"

export function GmailTriggerTutorial() {
  const [triggerType, setTriggerType] = useState("senderEmail")
  const [config, setConfig] = useState({
    senderEmail: "support@company.com",
    subjectKeywords: "bug, error, urgent",
    pollInterval: 5,
    maxEmails: 10,
    onlyUnread: true,
    markAsRead: false,
    includeAttachments: true,
    excludeSpam: true
  })

  const [queryPreview, setQueryPreview] = useState("")

  React.useEffect(() => {
    generateQueryPreview()
  }, [triggerType, config])

  const generateQueryPreview = () => {
    const parts = []

    // Base conditions
    if (config.onlyUnread) parts.push('is:unread')
    if (config.excludeSpam) parts.push('-in:spam -in:trash')

    // Trigger-specific conditions
    switch (triggerType) {
      case 'senderEmail':
        if (config.senderEmail) parts.push(`from:${config.senderEmail}`)
        break
      case 'subjectContains':
        if (config.subjectKeywords) {
          const keywords = config.subjectKeywords.split(',').map(k => k.trim())
          const subjectQueries = keywords.map(keyword => `subject:"${keyword}"`)
          parts.push(`(${subjectQueries.join(' OR ')})`)
        }
        break
      case 'hasAttachment':
        parts.push('has:attachment')
        break
    }

    setQueryPreview(parts.join(' '))
  }

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const renderTriggerConfig = () => {
    switch (triggerType) {
      case 'senderEmail':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senderEmail">Sender Email Address</Label>
              <Input
                id="senderEmail"
                type="email"
                placeholder="support@company.com"
                value={config.senderEmail}
                onChange={(e) => updateConfig('senderEmail', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Monitor emails from this specific sender
              </p>
            </div>
          </div>
        )

      case 'subjectContains':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subjectKeywords">Subject Keywords</Label>
              <Input
                id="subjectKeywords"
                placeholder="bug, error, urgent, critical"
                value={config.subjectKeywords}
                onChange={(e) => updateConfig('subjectKeywords', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated keywords to look for in email subjects
              </p>
            </div>
          </div>
        )

      case 'hasAttachment':
        return (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This trigger will activate for any email that contains file attachments.
              </AlertDescription>
            </Alert>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Trigger Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Trigger Configuration
          </CardTitle>
          <CardDescription>
            Choose what type of Gmail event should start your workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Trigger Type</Label>
            <Select value={triggerType} onValueChange={setTriggerType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newEmail">Any New Email</SelectItem>
                <SelectItem value="senderEmail">Specific Sender</SelectItem>
                <SelectItem value="subjectContains">Subject Contains Keywords</SelectItem>
                <SelectItem value="hasAttachment">Has Attachments</SelectItem>
                <SelectItem value="labeledEmail">Specific Gmail Label</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderTriggerConfig()}
        </CardContent>
      </Card>

      {/* Processing Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Processing Options
          </CardTitle>
          <CardDescription>
            Configure how emails should be processed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Poll Interval</Label>
              <Select 
                value={config.pollInterval.toString()} 
                onValueChange={(value) => updateConfig('pollInterval', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minute</SelectItem>
                  <SelectItem value="2">2 minutes</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Max Emails per Check</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={config.maxEmails}
                onChange={(e) => updateConfig('maxEmails', parseInt(e.target.value))}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Only Unread Emails</Label>
                <p className="text-xs text-muted-foreground">Only process unread emails</p>
              </div>
              <Switch
                checked={config.onlyUnread}
                onCheckedChange={(checked) => updateConfig('onlyUnread', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Mark as Read</Label>
                <p className="text-xs text-muted-foreground">Mark processed emails as read</p>
              </div>
              <Switch
                checked={config.markAsRead}
                onCheckedChange={(checked) => updateConfig('markAsRead', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Include Attachments</Label>
                <p className="text-xs text-muted-foreground">Include attachment metadata</p>
              </div>
              <Switch
                checked={config.includeAttachments}
                onCheckedChange={(checked) => updateConfig('includeAttachments', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Exclude Spam</Label>
                <p className="text-xs text-muted-foreground">Skip emails in spam folder</p>
              </div>
              <Switch
                checked={config.excludeSpam}
                onCheckedChange={(checked) => updateConfig('excludeSpam', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Query Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Gmail Query Preview
          </CardTitle>
          <CardDescription>
            This is the Gmail search query that will be used
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Generated Query</Label>
            <Textarea
              value={queryPreview}
              readOnly
              rows={2}
              className="font-mono text-sm bg-muted"
            />
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This query will be executed every {config.pollInterval} minutes to find matching emails.
              Up to {config.maxEmails} emails will be processed per check.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Test Query
            </Button>
            <Button variant="outline" size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Validate Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Trigger Settings</h4>
              <ul className="space-y-1">
                <li>Type: <Badge variant="outline">{triggerType}</Badge></li>
                <li>Poll Interval: <Badge variant="outline">{config.pollInterval} minutes</Badge></li>
                <li>Max Emails: <Badge variant="outline">{config.maxEmails}</Badge></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Processing Options</h4>
              <ul className="space-y-1">
                <li>Unread Only: <Badge variant={config.onlyUnread ? "default" : "secondary"}>{config.onlyUnread ? "Yes" : "No"}</Badge></li>
                <li>Mark as Read: <Badge variant={config.markAsRead ? "default" : "secondary"}>{config.markAsRead ? "Yes" : "No"}</Badge></li>
                <li>Include Attachments: <Badge variant={config.includeAttachments ? "default" : "secondary"}>{config.includeAttachments ? "Yes" : "No"}</Badge></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}