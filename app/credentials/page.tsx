"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft,
  Mail,
  Key,
  Plus,
  Trash2,
  TestTube,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings
} from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { GmailCredentialsModal } from "@/components/workflow/gmail-credentials-modal"
import { GmailCredentials, gmailCredentialsStore, createMockCredentials } from "@/lib/gmail-credentials-store"

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState<GmailCredentials[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedCredential, setSelectedCredential] = useState<GmailCredentials | null>(null)
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadCredentials()
    
    // Subscribe to credential changes
    const unsubscribe = gmailCredentialsStore.subscribe((newCredentials) => {
      setCredentials(newCredentials)
    })

    return unsubscribe
  }, [])

  const loadCredentials = () => {
    const allCredentials = gmailCredentialsStore.getAllCredentials()
    setCredentials(allCredentials)
  }

  const handleTestCredentials = async (cred: GmailCredentials) => {
    setIsLoading(true)
    try {
      const isValid = await gmailCredentialsStore.testCredentials(cred)
      setTestResults(prev => ({ ...prev, [cred.id]: isValid }))
      
      if (isValid) {
        gmailCredentialsStore.updateCredentials(cred.id, { isValid: true })
      }
    } catch (error) {
      console.error('Test failed:', error)
      setTestResults(prev => ({ ...prev, [cred.id]: false }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCredentials = (id: string) => {
    gmailCredentialsStore.deleteCredentials(id)
  }

  const handleCreateDemo = () => {
    createMockCredentials()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isExpired = (cred: GmailCredentials) => {
    return Date.now() > cred.expiresAt
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/workflows">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Workflows
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold mb-4">
              Credentials Management
            </h1>
            <p className="text-lg text-purple-100 mb-6">
              Manage API credentials for Gmail, JIRA, and other integrations used in your workflows.
            </p>
            <div className="flex items-center gap-4">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50" onClick={() => setShowModal(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Add Credentials
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600" onClick={handleCreateDemo}>
                <TestTube className="h-5 w-5 mr-2" />
                Create Demo Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{credentials.length}</div>
            <div className="text-sm text-muted-foreground">Total Credentials</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {credentials.filter(c => c.isValid && !isExpired(c)).length}
            </div>
            <div className="text-sm text-muted-foreground">Valid & Active</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {credentials.filter(c => isExpired(c)).length}
            </div>
            <div className="text-sm text-muted-foreground">Expired</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {credentials.filter(c => !c.isValid).length}
            </div>
            <div className="text-sm text-muted-foreground">Invalid</div>
          </Card>
        </div>

        {/* Gmail Credentials */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Gmail Credentials
                </CardTitle>
                <CardDescription>
                  Manage Gmail API credentials for email automation workflows
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={loadCredentials} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={() => setShowModal(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Gmail Account
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {credentials.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Gmail Credentials</h3>
                <p className="text-muted-foreground mb-6">
                  Add Gmail credentials to enable email-based workflow triggers and actions.
                </p>
                <div className="flex justify-center gap-4">
                  <Button onClick={() => setShowModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Gmail Account
                  </Button>
                  <Button onClick={handleCreateDemo} variant="outline">
                    <TestTube className="h-4 w-4 mr-2" />
                    Create Demo Account
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {credentials.map((cred) => (
                  <div key={cred.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Mail className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{cred.name}</h3>
                          <p className="text-sm text-muted-foreground">{cred.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={cred.isValid ? "default" : "secondary"}>
                              {cred.isValid ? "Valid" : "Invalid"}
                            </Badge>
                            {isExpired(cred) && (
                              <Badge variant="destructive">Expired</Badge>
                            )}
                            {testResults[cred.id] !== undefined && (
                              <Badge variant={testResults[cred.id] ? "default" : "destructive"}>
                                {testResults[cred.id] ? "Test Passed" : "Test Failed"}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              Created: {formatDate(cred.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleTestCredentials(cred)}
                          variant="outline"
                          size="sm"
                          disabled={isLoading}
                        >
                          <TestTube className="h-4 w-4 mr-2" />
                          Test
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedCredential(cred)
                            setShowModal(true)
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteCredentials(cred.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Credential Details */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <div className="flex items-center gap-1 mt-1">
                            {cred.isValid && !isExpired(cred) ? (
                              <>
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-green-600">Active</span>
                              </>
                            ) : isExpired(cred) ? (
                              <>
                                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                <span className="text-yellow-600">Expired</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 text-red-500" />
                                <span className="text-red-600">Invalid</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Expires:</span>
                          <div className="mt-1">
                            {new Date(cred.expiresAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Updated:</span>
                          <div className="mt-1">
                            {formatDate(cred.updatedAt)}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Token:</span>
                          <div className="mt-1 font-mono text-xs">
                            {cred.accessToken.substring(0, 12)}...
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Other Credential Types (Future) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                JIRA Credentials
              </CardTitle>
              <CardDescription>
                Manage JIRA API credentials (Coming Soon)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                JIRA credential management will be available in a future update.
              </p>
            </CardContent>
          </Card>

          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Slack Credentials
              </CardTitle>
              <CardDescription>
                Manage Slack API credentials (Coming Soon)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Slack credential management will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Credentials Modal */}
      <GmailCredentialsModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedCredential(null)
        }}
        onSave={(credentials) => {
          console.log('Credentials saved:', credentials)
        }}
        existingCredentials={selectedCredential}
      />
    </div>
  )
}