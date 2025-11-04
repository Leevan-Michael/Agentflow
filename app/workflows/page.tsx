"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus,
  Workflow,
  Mail,
  Ticket,
  Bot,
  Clock,
  CheckCircle,
  Users,
  ArrowRight,
  Play,
  Settings,
  BarChart3
} from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"

export default function WorkflowsPage() {
  const workflows = [
    {
      id: "email-to-ticket",
      name: "Email to Ticket Automation",
      description: "Automatically create JIRA tickets from support emails using AI analysis",
      status: "active",
      category: "Support Automation",
      triggers: ["Gmail", "Email"],
      actions: ["JIRA", "AI Analysis", "Email"],
      executions: 47,
      successRate: 91.5,
      lastRun: "15 minutes ago",
      icon: <Mail className="h-6 w-6" />,
      color: "bg-blue-500",
      href: "/workflows/ticket-automation"
    },
    {
      id: "slack-notifications",
      name: "Slack Alert System",
      description: "Send Slack notifications for critical system events and errors",
      status: "active",
      category: "Monitoring",
      triggers: ["Webhook", "Schedule"],
      actions: ["Slack", "Email"],
      executions: 23,
      successRate: 100,
      lastRun: "2 hours ago",
      icon: <div className="w-6 h-6 bg-purple-600 rounded text-white text-xs flex items-center justify-center font-bold">#</div>,
      color: "bg-purple-500",
      href: "#"
    },
    {
      id: "data-sync",
      name: "CRM Data Synchronization",
      description: "Sync customer data between Salesforce and internal databases",
      status: "paused",
      category: "Data Integration",
      triggers: ["Schedule", "Webhook"],
      actions: ["Database", "Salesforce", "Transform"],
      executions: 156,
      successRate: 98.7,
      lastRun: "1 day ago",
      icon: <div className="w-6 h-6 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">DB</div>,
      color: "bg-green-500",
      href: "#"
    }
  ]

  const templates = [
    {
      name: "Bug Report Automation",
      description: "Auto-create tickets from bug reports with AI classification",
      category: "Support",
      icon: <Ticket className="h-5 w-5" />
    },
    {
      name: "Customer Onboarding",
      description: "Automated welcome sequence for new customers",
      category: "Marketing",
      icon: <Users className="h-5 w-5" />
    },
    {
      name: "Invoice Processing",
      description: "Extract data from invoices and update accounting system",
      category: "Finance",
      icon: <div className="w-5 h-5 bg-orange-600 rounded text-white text-xs flex items-center justify-center font-bold">$</div>
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">
              Workflow Automation Platform
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Build powerful automations that connect your tools and streamline your processes. 
              Create tickets, sync data, send notifications, and more with our visual workflow builder.
            </p>
            <div className="flex items-center gap-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                <Plus className="h-5 w-5 mr-2" />
                Create Workflow
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                View Templates
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
            <div className="text-sm text-muted-foreground">Active Workflows</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">226</div>
            <div className="text-sm text-muted-foreground">Total Executions</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">96.8%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">2.1s</div>
            <div className="text-sm text-muted-foreground">Avg. Runtime</div>
          </Card>
        </div>

        {/* Active Workflows */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Workflows</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Workflow
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${workflow.color} text-white`}>
                      {workflow.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{workflow.name}</h3>
                      <Badge className={`text-xs ${getStatusColor(workflow.status)}`}>
                        {workflow.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {workflow.description}
                </p>

                <div className="space-y-3 mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Triggers</div>
                    <div className="flex flex-wrap gap-1">
                      {workflow.triggers.map((trigger) => (
                        <Badge key={trigger} variant="outline" className="text-xs">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Actions</div>
                    <div className="flex flex-wrap gap-1">
                      {workflow.actions.map((action) => (
                        <Badge key={action} variant="secondary" className="text-xs">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Executions</div>
                    <div className="font-semibold">{workflow.executions}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Success Rate</div>
                    <div className="font-semibold">{workflow.successRate}%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Last run: {workflow.lastRun}
                  </div>
                  <Link href={workflow.href}>
                    <Button variant="outline" size="sm">
                      View Details
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Templates */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Workflow Templates</h2>
            <Button variant="outline">
              Browse All Templates
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {template.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{template.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {template.description}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Use Template
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}