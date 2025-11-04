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
import { Separator } from '@/components/ui/separator'
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
  Search,
  Tag,
  User,
  Calendar,
  Paperclip,
  Database,
  Eye,
  EyeOff,
  RefreshCw,
  TestTube,
  Play,
  Zap
} from 'lucide-react'
import { GmailCredentialsModal } from './gmail-credentials-modal'
import { GmailCredentials, gmailCredentialsStore, getDefaultCredentials } from '@/lib/gmail-credentials-store'

interface EnhancedGmailTriggerConfigProps {
  nodeId: string
  parameters: Record<string, any>
  onParameterChange: (key: string, value: any) => void
  credentials?: GmailCredentials | null
  onCredentialsChange: (credentials: GmailCredentials) => void
}

interface GmailLabel {
  id: string
  name: string
  type: 'system' | 'user'
  messagesTotal: number
  messagesUnread: number
}

export function EnhancedGmailTriggerConfig({
  nodeId,
  parameters,
  onParameterChange,
  credentials,
  onCredentialsChange
}: EnhancedGmailTriggerConfigProps) {
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [availableLabels, setAvailableLabels] = useState<GmailLabel[]>([])
  const [queryPreview, setQueryPreview] = useState('')
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoadingLabels, setIsLoadingLabels] = useState(false)

  const triggerOn = parameters.triggerOn || 'newEmail'
  const event = parameters.event || 'messageReceived'

  useEffect(() => {
    generateQueryPreview()
  }, [parameters])

  useEffect(() => {
    // Load default credentials if none provided
    if (!credentials) {
      const defaultCreds = getDefaultCredentials()
      if (defaultCreds) {
        onCredentialsChange(defaultCreds)
      }
    }
  }, [])

  useEffect(() => {
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

    // Event-specific conditions
    if (event === 'messageSent') {
      parts.push('in:sent')
    } else {
      parts.push('in:inbox')
    }

    // Trigger-specific conditions
    switch (triggerOn) {
      case 'labeledEmail':
        if (parameters.labelName) {
          parts.push(`label:"${parameters.labelName}"`)
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
          const subjectQueries = keywords.map(keyword => `subject:"${keyword}"`)
          parts.push(`(${subjectQueries.join(' OR ')})`)
        }
        break
      case 'bodyContains':
        if (parameters.bodyKeywords) {
          const keywords = parameters.bodyKeywords.split(',').map((k: string) => k.trim())
          const bodyQueries = keywords.map(keyword => `"${keyword}"`)
          parts.push(`(${bodyQueries.join(' OR ')})`)
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
            image: '(filename:jpg OR filename:png OR filename:jpeg OR filename:gif)',
            excel: '(filename:xls OR filename:xlsx)',
            word: '(filename:doc OR filename:docx)',
            zip: '(filename:zip OR filename:rar)',
            text: '(filename:txt OR filename:csv)',
            presentation: '(filename:ppt OR filename:pptx)'
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

    // Priority/importance
    if (parameters.importance && parameters.importance !== 'any') {
      if (parameters.importance === 'important') {
        parts.push('is:important')
      }
    }

    // Category filters
    if (parameters.category && parameters.category !== 'any') {
      parts.push(`category:${parameters.category}`)
    }

    setQueryPreview(parts.join(' '))
  }

  const loadGmailLabels = async () => {
    if (!credentials) return

    setIsLoadingLabels(true)
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
    } finally {
      setIsLoadingLabels(false)
    }
  }

  const testConnection = async () => {
    if (!credentials) return

    setIsTestingConnection(true)
    try {
      const response = await fetch('/api/gmail/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentials,
          query: queryPreview,
          maxResults: 1
        })
      })

      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({ success: false, error: 'Connection test failed' })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const renderTriggerSpecificFields = () => {
    switch (triggerOn) {
      case 'labeledEmail':
        return (
          <div className="space-y-4">
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
                    <div className="p-2">
                      <div className="text-xs font-medium text-muted-foreground mb-2">System Labels</div>
                      {availableLabels
                        .filter(label => label.type === 'system')
                        .map(label => (
                          <SelectItem key={label.id} value={label.name}>
                            <div className="flex items-center justify-between w-full">
                              <span>{label.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {label.messagesUnread}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      <Separator className="my-2" />
                      <div className="text-xs font-medium text-muted-foreground mb-2">Custom Labels</div>
                      {availableLabels
                        .filter(label => label.type === 'user')
                        .map(label => (
                          <SelectItem key={label.id} value={label.name}>
                            <div className="flex items-center justify-between w-full">
                              <span>{label.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {label.messagesUnread}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                    </div>
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="Important, Work, etc."
                    value={parameters.labelName || ''}
                    onChange={(e) => onParameterChange('labelName', e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadGmailLabels}
                    disabled={!credentials || isLoadingLabels}
                  >
                    {isLoadingLabels ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Load Labels
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )

      case 'senderEmail':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sender Email Address</Label>
              <Input
                type="email"
                placeholder="sender@example.com"
                value={parameters.senderEmail || ''}
                onChange={(e) => onParameterChange('senderEmail', e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="exact-match"
                checked={parameters.exactSenderMatch || false}
                onCheckedChange={(checked) => onParameterChange('exactSenderMatch', checked)}
              />
              <Label htmlFor="exact-match" className="text-sm">
                Exact match only (no aliases or display names)
              </Label>
            </div>
          </div>
        )

      case 'recipientEmail':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Recipient Email Address</Label>
              <Input
                type="email"
                placeholder="recipient@example.com"
                value={parameters.recipientEmail || ''}
                onChange={(e) => onParameterChange('recipientEmail', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Recipient Type</Label>
              <Select
                value={parameters.recipientType || 'to'}
                onValueChange={(value) => onParameterChange('recipientType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="to">To (Primary recipient)</SelectItem>
                  <SelectItem value="cc">CC (Carbon copy)</SelectItem>
                  <SelectItem value="bcc">BCC (Blind carbon copy)</SelectItem>
                  <SelectItem value="any">Any recipient type</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 'senderDomain':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sender Domain</Label>
              <Input
                placeholder="company.com"
                value={parameters.senderDomain || ''}
                onChange={(e) => onParameterChange('senderDomain', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Will match any email from this domain (e.g., *@company.com)
              </p>
            </div>
            <div className="space-y-2">
              <Label>Domain List</Label>
              <Textarea
                placeholder="company.com&#10;partner.org&#10;client.net"
                value={parameters.domainList || ''}
                onChange={(e) => onParameterChange('domainList', e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                One domain per line. Will match emails from any of these domains.
              </p>
            </div>
          </div>
        )

      case 'subjectContains':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject Keywords</Label>
              <Input
                placeholder="urgent, invoice, support"
                value={parameters.subjectKeywords || ''}
                onChange={(e) => onParameterChange('subjectKeywords', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated keywords. Email will trigger if subject contains any of these.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="case-sensitive"
                checked={parameters.caseSensitive || false}
                onCheckedChange={(checked) => onParameterChange('caseSensitive', checked)}
              />
              <Label htmlFor="case-sensitive" className="text-sm">
                Case sensitive matching
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="whole-words"
                checked={parameters.wholeWordsOnly || false}
                onCheckedChange={(checked) => onParameterChange('wholeWordsOnly', checked)}
              />
              <Label htmlFor="whole-words" className="text-sm">
                Match whole words only
              </Label>
            </div>
          </div>
        )

      case 'bodyContains':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Body Keywords</Label>
              <Textarea
                placeholder="action required&#10;deadline&#10;important"
                value={parameters.bodyKeywords || ''}
                onChange={(e) => onParameterChange('bodyKeywords', e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                One keyword per line or comma-separated. Email will trigger if body contains any of these.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="include-html"
                checked={parameters.includeHtmlContent || true}
                onCheckedChange={(checked) => onParameterChange('includeHtmlContent', checked)}
              />
              <Label htmlFor="include-html" className="text-sm">
                Search in HTML content
              </Label>
            </div>
          </div>
        )

      case 'attachmentType':
        return (
          <div className="space-y-4">
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
                  <SelectItem value="image">Images (JPG, PNG, GIF)</SelectItem>
                  <SelectItem value="excel">Excel Files (XLS, XLSX)</SelectItem>
                  <SelectItem value="word">Word Documents (DOC, DOCX)</SelectItem>
                  <SelectItem value="presentation">Presentations (PPT, PPTX)</SelectItem>
                  <SelectItem value="text">Text Files (TXT, CSV)</SelectItem>
                  <SelectItem value="zip">Archives (ZIP, RAR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Minimum Attachment Size</Label>
              <Input
                placeholder="1MB, 500KB, etc."
                value={parameters.minAttachmentSize || ''}
                onChange={(e) => onParameterChange('minAttachmentSize', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Attachment Count</Label>
              <Select
                value={parameters.attachmentCount || 'any'}
                onValueChange={(value) => onParameterChange('attachmentCount', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any number</SelectItem>
                  <SelectItem value="exactly-1">Exactly 1</SelectItem>
                  <SelectItem value="more-than-1">More than 1</SelectItem>
                  <SelectItem value="less-than-5">Less than 5</SelectItem>
                  <SelectItem value="more-than-5">More than 5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 'emailSize':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Examples: 1M (1MB), 500K (500KB), 10MB. Include attachments in size calculation.
            </p>
          </div>
        )

      case 'customQuery':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Custom Gmail Query</Label>
              <Textarea
                placeholder="from:support@company.com has:attachment larger:1M -label:processed"
                value={parameters.customQuery || ''}
                onChange={(e) => onParameterChange('customQuery', e.target.value)}
                rows={4}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Use Gmail's advanced search syntax.
                </p>
                <a 
                  href="https://support.google.com/mail/answer/7190?hl=en" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Gmail search operators guide
                </a>
              </div>
            </div>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Custom query overrides all other filter settings. Use this for advanced filtering scenarios.
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
      {/* Credentials Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Key className="h-4 w-4" />
            Gmail Account
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
                  <p className="text-xs text-muted-foreground">{credentials.email}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">No Gmail account connected</span>
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
                  {isTestingConnection ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-3 w-3 mr-1" />
                      Test
                    </>
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCredentialsModal(true)}
              >
                {credentials ? 'Change' : 'Connect'}
              </Button>
            </div>
          </div>
          
          {testResult && (
            <Alert className={`mt-3 ${testResult.success ? 'border-green-200' : 'border-red-200'}`}>
              <AlertDescription className="text-xs">
                {testResult.success 
                  ? `✅ Connection successful. Found ${testResult.emailCount || 0} matching emails.`
                  : `❌ ${testResult.error || 'Connection failed'}`
                }
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      <Tabs defaultValue="trigger" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trigger" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Trigger
          </TabsTrigger>
          <TabsTrigger value="filters" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
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
        <TabsContent value="trigger" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Event Type</CardTitle>
              <CardDescription>Choose what Gmail event should trigger this workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Gmail Event</Label>
                <Select
                  value={event}
                  onValueChange={(value) => onParameterChange('event', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="messageReceived">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <div>
                          <div>Message Received</div>
                          <div className="text-xs text-muted-foreground">Trigger when new emails arrive</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="messageSent">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <div>
                          <div>Message Sent</div>
                          <div className="text-xs text-muted-foreground">Trigger when emails are sent</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                    <SelectItem value="newEmail">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Any New Email
                      </div>
                    </SelectItem>
                    <SelectItem value="labeledEmail">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Email with Specific Label
                      </div>
                    </SelectItem>
                    <SelectItem value="senderEmail">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Email from Specific Sender
                      </div>
                    </SelectItem>
                    <SelectItem value="recipientEmail">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Email to Specific Recipient
                      </div>
                    </SelectItem>
                    <SelectItem value="senderDomain">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Email from Domain
                      </div>
                    </SelectItem>
                    <SelectItem value="subjectContains">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Subject Contains Keywords
                      </div>
                    </SelectItem>
                    <SelectItem value="bodyContains">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Body Contains Keywords
                      </div>
                    </SelectItem>
                    <SelectItem value="hasAttachment">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4" />
                        Email with Attachment
                      </div>
                    </SelectItem>
                    <SelectItem value="attachmentType">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4" />
                        Specific Attachment Type
                      </div>
                    </SelectItem>
                    <SelectItem value="emailSize">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Email Size Condition
                      </div>
                    </SelectItem>
                    <SelectItem value="customQuery">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Advanced Query
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {renderTriggerSpecificFields()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Filters Configuration */}
        <TabsContent value="filters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Filters</CardTitle>
              <CardDescription>Apply additional filters to narrow down the emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label>Importance</Label>
                  <Select
                    value={parameters.importance || 'any'}
                    onValueChange={(value) => onParameterChange('importance', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any importance</SelectItem>
                      <SelectItem value="important">Important only</SelectItem>
                      <SelectItem value="not-important">Not important</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={parameters.category || 'any'}
                  onValueChange={(value) => onParameterChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any category</SelectItem>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="promotions">Promotions</SelectItem>
                    <SelectItem value="updates">Updates</SelectItem>
                    <SelectItem value="forums">Forums</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Options Configuration */}
        <TabsContent value="options" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Polling & Processing</CardTitle>
              <CardDescription>Configure how often to check for emails and how to process them</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                      <SelectItem value="2">2 minutes</SelectItem>
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

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Only Unread Emails</Label>
                    <p className="text-xs text-muted-foreground">Only trigger on unread emails</p>
                  </div>
                  <Switch
                    checked={parameters.onlyUnread !== false}
                    onCheckedChange={(checked) => onParameterChange('onlyUnread', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mark as Read</Label>
                    <p className="text-xs text-muted-foreground">Mark processed emails as read</p>
                  </div>
                  <Switch
                    checked={parameters.markAsRead || false}
                    onCheckedChange={(checked) => onParameterChange('markAsRead', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Include Attachments</Label>
                    <p className="text-xs text-muted-foreground">Include attachment metadata</p>
                  </div>
                  <Switch
                    checked={parameters.includeAttachments || false}
                    onCheckedChange={(checked) => onParameterChange('includeAttachments', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Download Attachments</Label>
                    <p className="text-xs text-muted-foreground">Download attachment content</p>
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
                    <p className="text-xs text-muted-foreground">Exclude spam emails</p>
                  </div>
                  <Switch
                    checked={parameters.excludeSpam !== false}
                    onCheckedChange={(checked) => onParameterChange('excludeSpam', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Exclude Trash</Label>
                    <p className="text-xs text-muted-foreground">Exclude deleted emails</p>
                  </div>
                  <Switch
                    checked={parameters.excludeTrash !== false}
                    onCheckedChange={(checked) => onParameterChange('excludeTrash', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Processing</CardTitle>
              <CardDescription>Configure how emails are processed after triggering</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Add Labels (after processing)</Label>
                <Input
                  placeholder="processed, automated"
                  value={parameters.addLabels || ''}
                  onChange={(e) => onParameterChange('addLabels', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated list of labels to add to processed emails
                </p>
              </div>

              <div className="space-y-2">
                <Label>Remove Labels (after processing)</Label>
                <Input
                  placeholder="unread, inbox"
                  value={parameters.removeLabels || ''}
                  onChange={(e) => onParameterChange('removeLabels', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated list of labels to remove from processed emails
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Query Preview */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gmail Search Query</CardTitle>
              <CardDescription>Preview of the Gmail search query that will be used</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Generated Query</Label>
                <Textarea
                  value={queryPreview}
                  readOnly
                  rows={4}
                  className="font-mono text-sm bg-muted"
                />
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This query will be executed every {parameters.pollInterval || 5} minutes to find matching emails.
                  Up to {parameters.maxEmails || 10} emails will be processed per check.
                </AlertDescription>
              </Alert>

              {credentials && (
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Test this query against your Gmail account
                  </p>
                  <Button
                    variant="outline"
                    onClick={testConnection}
                    disabled={isTestingConnection}
                  >
                    {isTestingConnection ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Test Query
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
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