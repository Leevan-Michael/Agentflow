"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  Settings,
  Play,
  Pause,
  BarChart3,
  Workflow,
  Mail,
  Ticket
} from "lucide-react"
import Link from "next/link"
import { WorkflowStatusDashboard } from "@/components/workflow/workflow-status-dashboard"
import { TicketStatusTracker } from "@/components/workflow/ticket-status-tracker"
import { EnhancedWorkflowEditor } from "@/components/workflow/enhanced-workflow-editor"

export default function TicketAutomationPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  // Mock workflow definition for email to ticket automation
  const mockWorkflow = {
    id: "email-to-ticket-workflow",
    name: "Email to Ticket Automation",
    description: "Automatically create JIRA tickets from support emails",
    nodes: [
      {
        id: "gmail-trigger-1",
        type: "gmail-trigger",
        name: "Gmail Trigger",
        position: { x: 100, y: 100 },
        parameters: {
          folder: "INBOX",
          filter: "from:support@company.com OR subject:bug OR subject:issue"
        },
        inputs: [],
        outputs: [
          { id: "email", name: "Email Data", type: "data" }
        ]
      },
      {
        id: "ai-analysis-1",
        type: "openai",
        name: "AI Content Analysis",
        position: { x: 400, y: 100 },
        parameters: {
          operation: "chat",
          model: "gpt-4",
          prompt: "Analyze this email and extract: 1) Issue type (bug/feature/question), 2) Priority (low/medium/high/critical), 3) Summary, 4) Description. Format as JSON.",
          systemMessage: "You are a technical support analyst. Classify support emails accurately."
        },
        inputs: [
          { id: "trigger", name: "Trigger", type: "trigger" }
        ],
        outputs: [
          { id: "analysis", name: "Analysis Result", type: "data" }
        ]
      },
      {
        id: "jira-create-1",
        type: "jira",
        name: "Create JIRA Ticket",
        position: { x: 700, y: 100 },
        parameters: {
          operation: "createIssue",
          project: "SUPPORT",
          issueType: "{{ $json.analysis.issueType }}",
          priority: "{{ $json.analysis.priority }}",
          summary: "{{ $json.analysis.summary }}",
          description: "{{ $json.analysis.description }}\n\nOriginal Email:\n{{ $json.email.body }}"
        },
        inputs: [
          { id: "trigger", name: "Trigger", type: "trigger" }
        ],
        outputs: [
          { id: "ticket", name: "Created Ticket", type: "data" }
        ],
        ticketStatus: "idle"
      },
      {
        id: "email-notify-1",
        type: "email",
        name: "Send Confirmation",
        position: { x: 1000, y: 100 },
        parameters: {
          to: "{{ $json.email.from }}",
          subject: "Ticket Created: {{ $json.ticket.key }}",
          body: "Your support request has been received and ticket {{ $json.ticket.key }} has been created. We'll get back to you soon!"
        },
        inputs: [
          { id: "trigger", name: "Trigger", type: "trigger" }
        ],
        outputs: [
          { id: "sent", name: "Email Sent", type: "data" }
        ]
      }
    ],
    connections: [
      {
        id: "conn-1",
        sourceNodeId: "gmail-trigger-1",
        sourcePortId: "email",
        targetNodeId: "ai-analysis-1",
        targetPortId: "trigger"
      },
      {
        id: "conn-2",
        sourceNodeId: "ai-analysis-1",
        sourcePortId: "analysis",
        targetNodeId: "jira-create-1",
        targetPortId: "trigger"
      },
      {
        id: "conn-3",
        sourceNodeId: "jira-create-1",
        sourcePortId: "ticket",
        targetNodeId: "email-notify-1",
        targetPortId: "trigger"
      }
    ]
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/workflows">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Workflows
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Email to Ticket Automation</h1>
                <p className="text-muted-foreground">
                  Automatically create JIRA tickets from support emails using AI analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-100 text-green-800">
                Active
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Ticket Status
            </TabsTrigger>
            <TabsTrigger value="workflow" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              Workflow Editor
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Execution Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <WorkflowStatusDashboard 
              workflowId="email-to-ticket-workflow"
              workflowName="Email to Ticket Automation"
            />
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TicketStatusTracker 
                workflowId="email-to-ticket-workflow"
              />
              
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Workflow Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Email Monitoring</div>
                      <div className="text-sm text-muted-foreground">
                        Watching support@company.com inbox
                      </div>
                    </div>
                    <Badge variant="default" className="ml-auto">Active</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-5 h-5 bg-purple-600 rounded text-white text-xs flex items-center justify-center font-bold">AI</div>
                    <div>
                      <div className="font-medium">AI Analysis</div>
                      <div className="text-sm text-muted-foreground">
                        GPT-4 powered content classification
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-auto">Ready</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Ticket className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">JIRA Integration</div>
                      <div className="text-sm text-muted-foreground">
                        Creating tickets in SUPPORT project
                      </div>
                    </div>
                    <Badge variant="default" className="ml-auto">Connected</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workflow" className="space-y-6">
            <Card className="p-1">
              <EnhancedWorkflowEditor
                workflowId="email-to-ticket-workflow"
                initialWorkflow={mockWorkflow}
              />
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Recent Executions</h3>
              <div className="space-y-3">
                {[
                  {
                    id: "exec-001",
                    timestamp: "2024-01-15 14:30:22",
                    status: "success",
                    email: "user@example.com",
                    ticket: "SUPPORT-156",
                    duration: "2.3s"
                  },
                  {
                    id: "exec-002", 
                    timestamp: "2024-01-15 14:15:18",
                    status: "success",
                    email: "customer@company.com",
                    ticket: "SUPPORT-155",
                    duration: "1.8s"
                  },
                  {
                    id: "exec-003",
                    timestamp: "2024-01-15 13:45:12",
                    status: "error",
                    email: "support@external.com",
                    ticket: null,
                    duration: "0.5s",
                    error: "JIRA authentication failed"
                  }
                ].map((execution) => (
                  <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {execution.status === "success" ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      ) : (
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                      )}
                      <div>
                        <div className="font-medium text-sm">{execution.id}</div>
                        <div className="text-xs text-muted-foreground">
                          {execution.timestamp}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">From:</span> {execution.email}
                      </div>
                      {execution.ticket && (
                        <div>
                          <span className="text-muted-foreground">Ticket:</span> {execution.ticket}
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Duration:</span> {execution.duration}
                      </div>
                      {execution.error && (
                        <Badge variant="destructive" className="text-xs">
                          {execution.error}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}