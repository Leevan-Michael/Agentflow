"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  Mail,
  Settings,
  Play,
  Pause,
  BarChart3,
  Zap,
  TestTube,
  BookOpen
} from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { EnhancedGmailTriggerNode } from "@/components/workflow/enhanced-gmail-trigger-node"
import { EnhancedGmailTriggerConfig } from "@/components/workflow/enhanced-gmail-trigger-config"
import { LogViewer, generateSampleLogs } from "@/components/workflow/log-viewer"
import { logger } from "@/components/workflow/execution-logs"

export default function GmailTriggerDemoPage() {
  const [activeTab, setActiveTab] = useState("node")
  const [parameters, setParameters] = useState({
    event: 'messageReceived',
    triggerOn: 'senderEmail',
    senderEmail: 'support@company.com',
    pollInterval: 5,
    maxEmails: 10,
    onlyUnread: true,
    markAsRead: false,
    includeAttachments: true,
    downloadAttachments: false,
    excludeSpam: true,
    excludeTrash: true,
    enabled: true
  })

  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [lastExecution] = useState({
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    emailsProcessed: 3,
    success: true
  })

  const handleParameterChange = (key: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const simulateExecution = () => {
    setExecutionStatus('running')
    
    const executionId = `exec-${Date.now()}`
    
    logger.info('Starting Gmail trigger simulation', 'gmail-trigger', { 
      executionId,
      triggerType: parameters.triggerOn,
      pollInterval: parameters.pollInterval 
    })
    
    // Simulate Gmail API check
    setTimeout(() => {
      logger.info('Checking Gmail for new emails', 'gmail-trigger', { 
        query: `${parameters.triggerOn} trigger`,
        maxEmails: parameters.maxEmails,
        executionId 
      })
    }, 500)
    
    setTimeout(() => {
      const isSuccess = Math.random() > 0.2
      
      if (isSuccess) {
        const emailCount = Math.floor(Math.random() * 5) + 1
        logger.success(`Found ${emailCount} matching emails`, 'gmail-trigger', { 
          emailCount,
          triggerType: parameters.triggerOn,
          executionId 
        })
        
        // Simulate processing each email
        for (let i = 0; i < emailCount; i++) {
          setTimeout(() => {
            logger.info(`Processing email ${i + 1}/${emailCount}`, 'gmail-trigger', { 
              emailIndex: i + 1,
              subject: `Sample Email ${i + 1}`,
              from: `user${i + 1}@example.com`,
              executionId 
            })
          }, (i + 1) * 300)
        }
        
        setTimeout(() => {
          logger.success('Gmail trigger execution completed', 'gmail-trigger', { 
            emailsProcessed: emailCount,
            duration: '2.1s',
            executionId 
          })
          setExecutionStatus('success')
        }, emailCount * 300 + 500)
      } else {
        logger.error('Gmail trigger execution failed', 'gmail-trigger', { 
          error: 'Authentication failed',
          executionId 
        })
        setExecutionStatus('error')
      }
      
      setTimeout(() => setExecutionStatus('idle'), 3000)
    }, 2000)
  }

  const presetConfigurations = [
    {
      name: "Support Emails",
      description: "Monitor support emails from customers",
      config: {
        triggerOn: 'senderEmail',
        senderEmail: 'support@company.com',
        onlyUnread: true,
        markAsRead: true,
        includeAttachments: true
      }
    },
    {
      name: "Bug Reports",
      description: "Emails with 'bug' in subject from any sender",
      config: {
        triggerOn: 'subjectContains',
        subjectKeywords: 'bug, error, issue',
        onlyUnread: true,
        includeAttachments: true
      }
    },
    {
      name: "Invoice Processing",
      description: "Emails with PDF attachments from accounting",
      config: {
        triggerOn: 'attachmentType',
        attachmentType: 'pdf',
        senderDomain: 'accounting.company.com',
        downloadAttachments: true
      }
    },
    {
      name: "High Priority",
      description: "Important emails that need immediate attention",
      config: {
        triggerOn: 'labeledEmail',
        labelName: 'Important',
        importance: 'important',
        pollInterval: 1
      }
    },
    {
      name: "Large Attachments",
      description: "Emails with attachments larger than 5MB",
      config: {
        triggerOn: 'emailSize',
        emailSizeCondition: 'larger',
        emailSizeValue: '5M',
        includeAttachments: true,
        downloadAttachments: false
      }
    }
  ]

  const applyPreset = (config: Record<string, any>) => {
    setParameters(prev => ({
      ...prev,
      ...config
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/workflows">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Workflows
                </Button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Gmail Trigger Configuration
            </h1>
            <p className="text-xl text-red-100 mb-8">
              Advanced Gmail trigger configuration with n8n-like features. Set up sophisticated email monitoring 
              with filters, labels, attachments, and custom queries.
            </p>
            <div className="flex items-center gap-4">
              <Button size="lg" className="bg-white text-red-600 hover:bg-red-50" onClick={simulateExecution}>
                <TestTube className="h-5 w-5 mr-2" />
                Test Configuration
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-600" onClick={generateSampleLogs}>
                <BookOpen className="h-5 w-5 mr-2" />
                Generate Sample Logs
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 text-center">
            <Mail className="h-8 w-8 mx-auto mb-3 text-red-500" />
            <h3 className="font-semibold mb-2">Smart Filtering</h3>
            <p className="text-sm text-muted-foreground">
              Filter by sender, subject, labels, attachments, and more
            </p>
          </Card>
          <Card className="p-6 text-center">
            <Zap className="h-8 w-8 mx-auto mb-3 text-blue-500" />
            <h3 className="font-semibold mb-2">Real-time Triggers</h3>
            <p className="text-sm text-muted-foreground">
              Configurable polling intervals from 1 minute to 1 hour
            </p>
          </Card>
          <Card className="p-6 text-center">
            <Settings className="h-8 w-8 mx-auto mb-3 text-green-500" />
            <h3 className="font-semibold mb-2">Advanced Options</h3>
            <p className="text-sm text-muted-foreground">
              Mark as read, add labels, download attachments
            </p>
          </Card>
          <Card className="p-6 text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-3 text-purple-500" />
            <h3 className="font-semibold mb-2">Query Preview</h3>
            <p className="text-sm text-muted-foreground">
              See the Gmail search query before activation
            </p>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="node" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Node View
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="presets" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Presets
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Testing
            </TabsTrigger>
          </TabsList>

          {/* Node View */}
          <TabsContent value="node" className="space-y-6">
            <div className="max-w-md mx-auto">
              <EnhancedGmailTriggerNode
                nodeId="gmail-trigger-demo"
                parameters={parameters}
                onParameterChange={handleParameterChange}
                isSelected={true}
                isExecuting={executionStatus === 'running'}
                executionStatus={executionStatus}
                lastExecution={lastExecution}
              />
            </div>
            
            <div className="text-center">
              <Button onClick={simulateExecution} disabled={executionStatus === 'running'}>
                {executionStatus === 'running' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Simulate Execution
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Configuration */}
          <TabsContent value="config" className="space-y-6">
            <Card className="max-w-4xl mx-auto">
              <EnhancedGmailTriggerConfig
                nodeId="gmail-trigger-demo"
                parameters={parameters}
                onParameterChange={handleParameterChange}
                credentials={{
                  id: 'demo-cred',
                  name: 'Demo Gmail Account',
                  email: 'demo@gmail.com',
                  accessToken: 'demo-token',
                  refreshToken: 'demo-refresh',
                  expiresAt: Date.now() + 3600000
                }}
                onCredentialsChange={() => {}}
              />
            </Card>
          </TabsContent>

          {/* Logs */}
          <TabsContent value="logs" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Execution Logs</h2>
                <p className="text-muted-foreground">
                  Real-time logs showing Gmail trigger execution and status updates
                </p>
                <div className="flex justify-center gap-2 mt-4">
                  <Button onClick={generateSampleLogs} variant="outline">
                    Generate Sample Logs
                  </Button>
                  <Button onClick={simulateExecution}>
                    Simulate Gmail Trigger
                  </Button>
                </div>
              </div>
              
              <LogViewer
                workflowId="gmail-trigger-demo"
                maxHeight="500px"
              />
            </div>
          </TabsContent>

          {/* Presets */}
          <TabsContent value="presets" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Configuration Presets</h2>
                <p className="text-muted-foreground">
                  Quick start with common Gmail trigger configurations
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {presetConfigurations.map((preset, index) => (
                  <Card key={index} className="p-6">
                    <h3 className="font-semibold mb-2">{preset.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {preset.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      {Object.entries(preset.config).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-mono">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => applyPreset(preset.config)}
                    >
                      Apply Preset
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Testing */}
          <TabsContent value="testing" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Test Your Configuration</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Current Configuration</h4>
                    <div className="space-y-1 text-sm">
                      <div>Event: <Badge variant="outline">{parameters.event}</Badge></div>
                      <div>Trigger: <Badge variant="outline">{parameters.triggerOn}</Badge></div>
                      <div>Poll Interval: <Badge variant="outline">{parameters.pollInterval} minutes</Badge></div>
                      <div>Max Emails: <Badge variant="outline">{parameters.maxEmails}</Badge></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="w-full">
                      <TestTube className="h-4 w-4 mr-2" />
                      Test Connection
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Preview Emails
                    </Button>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={simulateExecution}
                    disabled={executionStatus === 'running'}
                  >
                    {executionStatus === 'running' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Running Test...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Full Test
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}