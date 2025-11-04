"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  Terminal,
  Play,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Bug,
  Mail,
  Ticket,
  Bot
} from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { ExecutionLogs, logger } from "@/components/workflow/execution-logs"
import { LogViewer, generateSampleLogs } from "@/components/workflow/log-viewer"

export default function LoggingDemoPage() {
  const [activeTab, setActiveTab] = useState("viewer")

  const generateWorkflowLogs = () => {
    const executionId = `exec-${Date.now()}`
    
    logger.info("Workflow execution started", "workflow", { 
      workflowId: "email-to-ticket", 
      executionId,
      nodeCount: 4 
    })
    
    setTimeout(() => {
      logger.success("Gmail trigger activated", "gmail-trigger", { 
        emails: 2,
        query: "from:support@company.com",
        executionId 
      }, "gmail-trigger-1", executionId)
    }, 500)
    
    setTimeout(() => {
      logger.info("Processing email: Bug Report", "gmail-trigger", { 
        subject: "Critical Bug: Login not working",
        from: "user@example.com",
        executionId 
      }, "gmail-trigger-1", executionId)
    }, 1000)
    
    setTimeout(() => {
      logger.success("AI analysis completed", "openai", { 
        classification: "bug",
        priority: "critical",
        confidence: 0.95,
        executionId 
      }, "ai-analysis-1", executionId)
    }, 1500)
    
    setTimeout(() => {
      logger.info("Creating JIRA ticket", "jira", { 
        project: "SUPPORT",
        issueType: "Bug",
        executionId 
      }, "jira-create-1", executionId)
    }, 2000)
    
    setTimeout(() => {
      logger.success("JIRA ticket created: SUPPORT-156", "jira", { 
        ticketId: "SUPPORT-156",
        url: "https://company.atlassian.net/browse/SUPPORT-156",
        executionId 
      }, "jira-create-1", executionId)
    }, 2500)
    
    setTimeout(() => {
      logger.success("Confirmation email sent", "email", { 
        to: "user@example.com",
        subject: "Ticket Created: SUPPORT-156",
        executionId 
      }, "email-notify-1", executionId)
    }, 3000)
    
    setTimeout(() => {
      logger.success("Workflow execution completed", "workflow", { 
        executionId,
        duration: "3.2s",
        ticketsCreated: 1,
        emailsProcessed: 2
      })
    }, 3500)
  }

  const generateErrorLogs = () => {
    const executionId = `exec-${Date.now()}`
    
    logger.info("Workflow execution started", "workflow", { 
      workflowId: "email-to-ticket", 
      executionId 
    })
    
    setTimeout(() => {
      logger.success("Gmail trigger activated", "gmail-trigger", { 
        emails: 1,
        executionId 
      }, "gmail-trigger-1", executionId)
    }, 500)
    
    setTimeout(() => {
      logger.error("AI analysis failed", "openai", { 
        error: "API rate limit exceeded",
        retryAfter: "60s",
        executionId 
      }, "ai-analysis-1", executionId)
    }, 1000)
    
    setTimeout(() => {
      logger.warning("Retrying AI analysis", "openai", { 
        attempt: 2,
        maxRetries: 3,
        executionId 
      }, "ai-analysis-1", executionId)
    }, 1500)
    
    setTimeout(() => {
      logger.error("Workflow execution failed", "workflow", { 
        executionId,
        error: "Maximum retries exceeded",
        failedNode: "ai-analysis-1"
      })
    }, 2000)
  }

  const generateDebugLogs = () => {
    const executionId = `exec-${Date.now()}`
    
    logger.debug("Loading workflow configuration", "workflow", { 
      workflowId: "email-to-ticket",
      configVersion: "1.2.3",
      executionId 
    })
    
    logger.debug("Initializing Gmail connection", "gmail-trigger", { 
      credentials: "gmail-oauth-123",
      scopes: ["gmail.readonly"],
      executionId 
    }, "gmail-trigger-1", executionId)
    
    logger.debug("Parsing email content", "gmail-trigger", { 
      messageId: "18c2f1234567890a",
      contentType: "text/html",
      attachments: 2,
      executionId 
    }, "gmail-trigger-1", executionId)
    
    logger.debug("OpenAI API request", "openai", { 
      model: "gpt-4",
      tokens: 1250,
      temperature: 0.7,
      executionId 
    }, "ai-analysis-1", executionId)
    
    logger.debug("JIRA API authentication", "jira", { 
      baseUrl: "https://company.atlassian.net",
      user: "automation@company.com",
      executionId 
    }, "jira-create-1", executionId)
  }

  const logExamples = [
    {
      title: "Successful Workflow",
      description: "Complete email-to-ticket workflow execution",
      action: generateWorkflowLogs,
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      color: "border-green-200 bg-green-50"
    },
    {
      title: "Error Handling",
      description: "Workflow with failures and retry logic",
      action: generateErrorLogs,
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      color: "border-red-200 bg-red-50"
    },
    {
      title: "Debug Information",
      description: "Detailed debug logs for troubleshooting",
      action: generateDebugLogs,
      icon: <Bug className="h-5 w-5 text-purple-500" />,
      color: "border-purple-200 bg-purple-50"
    },
    {
      title: "Sample Data",
      description: "Mixed log levels and categories",
      action: generateSampleLogs,
      icon: <Terminal className="h-5 w-5 text-blue-500" />,
      color: "border-blue-200 bg-blue-50"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
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
              Frontend Logging System
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Real-time workflow execution logs displayed directly in the UI. 
              Track success, errors, and debug information without opening browser console.
            </p>
            <div className="flex items-center gap-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50" onClick={generateWorkflowLogs}>
                <Play className="h-5 w-5 mr-2" />
                Generate Sample Logs
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Terminal className="h-5 w-5 mr-2" />
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 text-center">
            <Terminal className="h-8 w-8 mx-auto mb-3 text-blue-500" />
            <h3 className="font-semibold mb-2">Real-time Logs</h3>
            <p className="text-sm text-muted-foreground">
              Live log streaming with automatic updates
            </p>
          </Card>
          <Card className="p-6 text-center">
            <Zap className="h-8 w-8 mx-auto mb-3 text-yellow-500" />
            <h3 className="font-semibold mb-2">Multiple Levels</h3>
            <p className="text-sm text-muted-foreground">
              Info, Success, Warning, Error, and Debug levels
            </p>
          </Card>
          <Card className="p-6 text-center">
            <Info className="h-8 w-8 mx-auto mb-3 text-green-500" />
            <h3 className="font-semibold mb-2">Rich Context</h3>
            <p className="text-sm text-muted-foreground">
              Detailed metadata and execution context
            </p>
          </Card>
          <Card className="p-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-3 text-purple-500" />
            <h3 className="font-semibold mb-2">Export & Filter</h3>
            <p className="text-sm text-muted-foreground">
              Search, filter, and export logs for analysis
            </p>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="viewer" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Log Viewer
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Examples
            </TabsTrigger>
            <TabsTrigger value="full" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Full Logs
            </TabsTrigger>
          </TabsList>

          {/* Compact Log Viewer */}
          <TabsContent value="viewer" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Compact Log Viewer</h2>
                <p className="text-muted-foreground">
                  Streamlined log display perfect for workflow editors and dashboards
                </p>
              </div>
              
              <LogViewer
                workflowId="logging-demo"
                maxHeight="400px"
              />
              
              <div className="flex justify-center gap-2 mt-6">
                <Button onClick={generateWorkflowLogs} variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Success Flow
                </Button>
                <Button onClick={generateErrorLogs} variant="outline">
                  <XCircle className="h-4 w-4 mr-2" />
                  Error Flow
                </Button>
                <Button onClick={generateDebugLogs} variant="outline">
                  <Bug className="h-4 w-4 mr-2" />
                  Debug Flow
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Examples */}
          <TabsContent value="examples" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Log Examples</h2>
                <p className="text-muted-foreground">
                  Try different logging scenarios to see how they appear in the UI
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {logExamples.map((example, index) => (
                  <Card key={index} className={`p-6 cursor-pointer hover:shadow-lg transition-shadow ${example.color}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {example.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{example.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {example.description}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={example.action}
                          className="w-full"
                        >
                          <Play className="h-3 w-3 mr-2" />
                          Generate Logs
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Full Execution Logs */}
          <TabsContent value="full" className="space-y-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Full Execution Logs</h2>
                <p className="text-muted-foreground">
                  Complete logging interface with filtering, search, and export capabilities
                </p>
              </div>
              
              <ExecutionLogs
                workflowId="logging-demo"
                maxEntries={200}
                showFilters={true}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Log Categories */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Log Categories & Levels</h2>
            <p className="text-muted-foreground">
              Understanding the different types of logs and their purposes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <h3 className="font-semibold">Success Logs</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Successful operations and completions
              </p>
              <div className="space-y-2">
                <Badge variant="default" className="bg-green-100 text-green-800">workflow</Badge>
                <Badge variant="default" className="bg-green-100 text-green-800">jira</Badge>
                <Badge variant="default" className="bg-green-100 text-green-800">email</Badge>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="h-6 w-6 text-red-500" />
                <h3 className="font-semibold">Error Logs</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Failures, exceptions, and critical issues
              </p>
              <div className="space-y-2">
                <Badge variant="destructive">authentication</Badge>
                <Badge variant="destructive">api-error</Badge>
                <Badge variant="destructive">validation</Badge>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                <h3 className="font-semibold">Warning Logs</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Potential issues and retry attempts
              </p>
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">retry</Badge>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">rate-limit</Badge>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">timeout</Badge>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Info className="h-6 w-6 text-blue-500" />
                <h3 className="font-semibold">Info Logs</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                General information and status updates
              </p>
              <div className="space-y-2">
                <Badge variant="outline">gmail-trigger</Badge>
                <Badge variant="outline">openai</Badge>
                <Badge variant="outline">processing</Badge>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bug className="h-6 w-6 text-purple-500" />
                <h3 className="font-semibold">Debug Logs</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Detailed technical information for troubleshooting
              </p>
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">config</Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">api-request</Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">parsing</Badge>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Terminal className="h-6 w-6 text-gray-500" />
                <h3 className="font-semibold">System Logs</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                System-level events and monitoring
              </p>
              <div className="space-y-2">
                <Badge variant="outline">startup</Badge>
                <Badge variant="outline">health-check</Badge>
                <Badge variant="outline">metrics</Badge>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}