"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Key, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  Copy,
  RefreshCw,
  Shield,
  Info,
  Plus,
  Trash2,
  TestTube
} from 'lucide-react'
import { GmailCredentials, gmailCredentialsStore, createMockCredentials } from '@/lib/gmail-credentials-store'

interface GmailCredentialsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (credentials: GmailCredentials) => void
  existingCredentials?: GmailCredentials | null
}

export function GmailCredentialsModal({
  isOpen,
  onClose,
  onSave,
  existingCredentials
}: GmailCredentialsModalProps) {
  const [activeTab, setActiveTab] = useState('existing')
  const [availableCredentials, setAvailableCredentials] = useState<GmailCredentials[]>([])
  const [selectedCredential, setSelectedCredential] = useState<GmailCredentials | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})

  // New credential form
  const [newCredential, setNewCredential] = useState({
    name: '',
    email: '',
    accessToken: '',
    refreshToken: '',
    clientId: '',
    clientSecret: ''
  })

  useEffect(() => {
    if (isOpen) {
      loadCredentials()
      setSelectedCredential(existingCredentials || null)
    }
  }, [isOpen, existingCredentials])

  const loadCredentials = () => {
    const credentials = gmailCredentialsStore.getAllCredentials()
    setAvailableCredentials(credentials)
  }

  const handleCreateMockCredentials = () => {
    const mockCreds = createMockCredentials()
    loadCredentials()
    setSelectedCredential(mockCreds)
    setActiveTab('existing')
  }

  const handleTestCredentials = async (credentials: GmailCredentials) => {
    setIsLoading(true)
    try {
      const isValid = await gmailCredentialsStore.testCredentials(credentials)
      setTestResults(prev => ({ ...prev, [credentials.id]: isValid }))
      
      if (isValid) {
        gmailCredentialsStore.updateCredentials(credentials.id, { isValid: true })
        loadCredentials()
      }
    } catch (error) {
      console.error('Test failed:', error)
      setTestResults(prev => ({ ...prev, [credentials.id]: false }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCredentials = (id: string) => {
    gmailCredentialsStore.deleteCredentials(id)
    loadCredentials()
    if (selectedCredential?.id === id) {
      setSelectedCredential(null)
    }
  }

  const handleSaveNewCredentials = () => {
    if (!newCredential.name || !newCredential.email) {
      setError('Name and email are required')
      return
    }

    const credentials = gmailCredentialsStore.addCredentials({
      name: newCredential.name,
      email: newCredential.email,
      accessToken: newCredential.accessToken || 'mock-token-' + Date.now(),
      refreshToken: newCredential.refreshToken || 'mock-refresh-' + Date.now(),
      clientId: newCredential.clientId,
      clientSecret: newCredential.clientSecret,
      expiresAt: Date.now() + (3600 * 1000), // 1 hour
      isValid: true
    })

    loadCredentials()
    setSelectedCredential(credentials)
    setActiveTab('existing')
    setNewCredential({
      name: '',
      email: '',
      accessToken: '',
      refreshToken: '',
      clientId: '',
      clientSecret: ''
    })
  }

  const handleSave = () => {
    if (selectedCredential) {
      onSave(selectedCredential)
      onClose()
    } else {
      setError('Please select or create Gmail credentials')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Gmail Credentials
          </DialogTitle>
          <DialogDescription>
            Manage Gmail API credentials for workflow automation
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="existing">Existing Credentials</TabsTrigger>
            <TabsTrigger value="new">Add New</TabsTrigger>
            <TabsTrigger value="help">Setup Help</TabsTrigger>
          </TabsList>

          {/* Existing Credentials */}
          <TabsContent value="existing" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Available Gmail Accounts</h3>
              <div className="flex gap-2">
                <Button onClick={handleCreateMockCredentials} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Demo Account
                </Button>
                <Button onClick={loadCredentials} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {availableCredentials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <h3 className="font-semibold mb-2">No Gmail Credentials</h3>
                <p className="text-sm mb-4">
                  You need to add Gmail credentials to use Gmail triggers
                </p>
                <Button onClick={handleCreateMockCredentials}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Demo Account
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {availableCredentials.map((cred) => (
                  <div
                    key={cred.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCredential?.id === cred.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedCredential(cred)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{cred.name}</div>
                          <div className="text-sm text-muted-foreground">{cred.email}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={cred.isValid ? "default" : "secondary"}>
                              {cred.isValid ? "Valid" : "Invalid"}
                            </Badge>
                            {cred.expiresAt < Date.now() && (
                              <Badge variant="destructive">Expired</Badge>
                            )}
                            {testResults[cred.id] !== undefined && (
                              <Badge variant={testResults[cred.id] ? "default" : "destructive"}>
                                {testResults[cred.id] ? "Test Passed" : "Test Failed"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTestCredentials(cred)
                          }}
                          variant="outline"
                          size="sm"
                          disabled={isLoading}
                        >
                          <TestTube className="h-3 w-3 mr-1" />
                          Test
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteCredentials(cred.id)
                          }}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Add New Credentials */}
          <TabsContent value="new" className="space-y-4">
            <h3 className="font-semibold">Add New Gmail Account</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Account Name *</Label>
                <Input
                  id="name"
                  placeholder="My Gmail Account"
                  value={newCredential.name}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@gmail.com"
                  value={newCredential.email}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">OAuth2 Credentials (Optional for Demo)</h4>
              <p className="text-sm text-muted-foreground">
                For production use, you'll need real OAuth2 credentials from Google Cloud Console.
                For testing, you can leave these empty and we'll create mock credentials.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    placeholder="your-client-id.googleusercontent.com"
                    value={newCredential.clientId}
                    onChange={(e) => setNewCredential(prev => ({ ...prev, clientId: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clientSecret">Client Secret</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    placeholder="your-client-secret"
                    value={newCredential.clientSecret}
                    onChange={(e) => setNewCredential(prev => ({ ...prev, clientSecret: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accessToken">Access Token</Label>
                  <Input
                    id="accessToken"
                    placeholder="Leave empty for mock token"
                    value={newCredential.accessToken}
                    onChange={(e) => setNewCredential(prev => ({ ...prev, accessToken: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="refreshToken">Refresh Token</Label>
                  <Input
                    id="refreshToken"
                    placeholder="Leave empty for mock token"
                    value={newCredential.refreshToken}
                    onChange={(e) => setNewCredential(prev => ({ ...prev, refreshToken: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleSaveNewCredentials} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Gmail Account
            </Button>
          </TabsContent>

          {/* Setup Help */}
          <TabsContent value="help" className="space-y-4">
            <h3 className="font-semibold">Gmail API Setup Guide</h3>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                For production use, you'll need to set up Gmail API credentials in Google Cloud Console.
                For testing and demos, you can use the mock credentials.
              </AlertDescription>
            </Alert>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">1. Google Cloud Console Setup</h4>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• Create a new project in Google Cloud Console</li>
                  <li>• Enable the Gmail API</li>
                  <li>• Create OAuth2 credentials</li>
                  <li>• Configure authorized redirect URIs</li>
                </ul>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open Google Cloud Console
                  </a>
                </Button>
              </div>

              <div>
                <h4 className="font-medium mb-2">2. Required Scopes</h4>
                <div className="bg-muted p-3 rounded text-sm font-mono">
                  https://www.googleapis.com/auth/gmail.readonly<br/>
                  https://www.googleapis.com/auth/gmail.modify<br/>
                  https://www.googleapis.com/auth/gmail.send
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">3. For Testing</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  You can create demo credentials that simulate Gmail API access for testing workflows:
                </p>
                <Button onClick={handleCreateMockCredentials} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Demo Credentials
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!selectedCredential}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Use Selected Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
  const [testResult, setTestResult] = useState<any>(null)

  useEffect(() => {
    if (existingCredentials) {
      setCredentials(existingCredentials)
      setStep('test')
    }
  }, [existingCredentials])

  const handleGenerateAuthUrl = async () => {
    if (!credentials.clientId || !credentials.clientSecret) {
      setError('Client ID and Client Secret are required')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/gmail/auth/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setAuthUrl(data.authUrl)
        setStep('oauth')
      } else {
        setError(data.error || 'Failed to generate auth URL')
      }
    } catch (err) {
      setError('Failed to generate auth URL')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExchangeCode = async () => {
    if (!authCode) {
      setError('Authorization code is required')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/gmail/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: authCode,
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setCredentials(prev => ({
          ...prev,
          accessToken: data.tokens.access_token,
          refreshToken: data.tokens.refresh_token
        }))
        setStep('tokens')
      } else {
        setError(data.error || 'Failed to exchange authorization code')
      }
    } catch (err) {
      setError('Failed to exchange authorization code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestCredentials = async () => {
    setIsLoading(true)
    setError('')
    setTestResult(null)

    try {
      const response = await fetch('/api/gmail/auth/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      const data = await response.json()
      
      if (data.success) {
        setTestResult(data.profile)
        setCredentials(prev => ({ ...prev, email: data.profile.email }))
      } else {
        setError(data.error || 'Credentials test failed')
      }
    } catch (err) {
      setError('Failed to test credentials')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = () => {
    if (!credentials.name || !credentials.email || !credentials.accessToken || !credentials.refreshToken) {
      setError('All fields are required')
      return
    }

    const gmailCredentials: GmailCredentials = {
      id: existingCredentials?.id || `gmail-${Date.now()}`,
      name: credentials.name!,
      email: credentials.email!,
      accessToken: credentials.accessToken!,
      refreshToken: credentials.refreshToken!,
      clientId: credentials.clientId!,
      clientSecret: credentials.clientSecret!,
      createdAt: existingCredentials?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isValid: testResult !== null
    }

    onSave(gmailCredentials)
    onClose()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-red-500" />
            Gmail Credentials Setup
          </DialogTitle>
          <DialogDescription>
            Configure Gmail API credentials to enable email monitoring
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {['setup', 'oauth', 'tokens', 'test'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepName ? 'bg-blue-500 text-white' :
                  ['setup', 'oauth', 'tokens', 'test'].indexOf(step) > index ? 'bg-green-500 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {['setup', 'oauth', 'tokens', 'test'].indexOf(step) > index ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 3 && <div className="w-12 h-0.5 bg-gray-200 mx-2" />}
              </div>
            ))}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Basic Setup */}
          {step === 'setup' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Credential Name</Label>
                <Input
                  placeholder="My Gmail Account"
                  value={credentials.name || ''}
                  onChange={(e) => setCredentials(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You need to create a Google Cloud Project and enable the Gmail API. 
                  <a 
                    href="https://console.cloud.google.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-1"
                  >
                    Open Google Cloud Console <ExternalLink className="h-3 w-3 inline" />
                  </a>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Client ID</Label>
                <Input
                  placeholder="your-client-id.googleusercontent.com"
                  value={credentials.clientId || ''}
                  onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Client Secret</Label>
                <Input
                  type="password"
                  placeholder="Your client secret"
                  value={credentials.clientSecret || ''}
                  onChange={(e) => setCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
                />
              </div>

              <Button 
                onClick={handleGenerateAuthUrl} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Key className="h-4 w-4 mr-2" />
                )}
                Generate Authorization URL
              </Button>
            </div>
          )}

          {/* Step 2: OAuth Authorization */}
          {step === 'oauth' && (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Click the link below to authorize Gmail access. You'll be redirected to Google's authorization page.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Authorization URL</Label>
                <div className="flex gap-2">
                  <Input value={authUrl} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(authUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(authUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Authorization Code</Label>
                <Textarea
                  placeholder="Paste the authorization code from Google here..."
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleExchangeCode} 
                disabled={isLoading || !authCode}
                className="w-full"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Key className="h-4 w-4 mr-2" />
                )}
                Exchange for Tokens
              </Button>
            </div>
          )}

          {/* Step 3: Token Display */}
          {step === 'tokens' && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Successfully obtained access tokens! These will be used to authenticate with Gmail.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Access Token</Label>
                <Input 
                  value={credentials.accessToken || ''} 
                  readOnly 
                  className="font-mono text-sm"
                  type="password"
                />
              </div>

              <div className="space-y-2">
                <Label>Refresh Token</Label>
                <Input 
                  value={credentials.refreshToken || ''} 
                  readOnly 
                  className="font-mono text-sm"
                  type="password"
                />
              </div>

              <Button 
                onClick={() => setStep('test')} 
                className="w-full"
              >
                Continue to Test
              </Button>
            </div>
          )}

          {/* Step 4: Test Credentials */}
          {step === 'test' && (
            <div className="space-y-4">
              <Button 
                onClick={handleTestCredentials} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Test Gmail Connection
              </Button>

              {testResult && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div><strong>Email:</strong> {testResult.email}</div>
                      <div><strong>Total Messages:</strong> {testResult.messagesTotal}</div>
                      <div><strong>Total Threads:</strong> {testResult.threadsTotal}</div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {testResult && (
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1">
                    Save Credentials
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}