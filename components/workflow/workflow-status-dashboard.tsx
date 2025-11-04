"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Ticket,
  Mail,
  Bot,
  ExternalLink,
  Activity,
  TrendingUp,
  Users,
  Calendar
} from "lucide-react"

interface WorkflowStatusDashboardProps {
  workflowId: string
  workflowName?: string
}

interface WorkflowMetrics {
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  totalTicketsCreated: number
  averageExecutionTime: number
  lastExecutionTime?: string
  uptime: number
}

interface RecentTicket {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in-progress' | 'resolved'
  assignee?: string
  createdAt: string
  url?: string
}

export function WorkflowStatusDashboard({ 
  workflowId, 
  workflowName = "Email to Ticket Workflow" 
}: WorkflowStatusDashboardProps) {
  const [metrics, setMetrics] = useState<WorkflowMetrics>({
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    totalTicketsCreated: 0,
    averageExecutionTime: 0,
    uptime: 0
  })
  
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([])
  const [isActive, setIsActive] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<'idle' | 'running' | 'paused'>('idle')

  // Mock data for demonstration
  useEffect(() => {
    const mockMetrics: WorkflowMetrics = {
      totalExecutions: 47,
      successfulExecutions: 43,
      failedExecutions: 4,
      totalTicketsCreated: 38,
      averageExecutionTime: 2.3,
      lastExecutionTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
      uptime: 98.5
    }

    const mockTickets: RecentTicket[] = [
      {
        id: 'PROJ-156',
        title: 'Login page not loading on mobile devices',
        priority: 'high',
        status: 'open',
        assignee: 'John Doe',
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        url: 'https://company.atlassian.net/browse/PROJ-156'
      },
      {
        id: 'PROJ-155',
        title: 'Email notifications not being sent',
        priority: 'critical',
        status: 'in-progress',
        assignee: 'Jane Smith',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        url: 'https://company.atlassian.net/browse/PROJ-155'
      },
      {
        id: 'PROJ-154',
        title: 'Dashboard loading slowly',
        priority: 'medium',
        status: 'resolved',
        assignee: 'Mike Johnson',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        url: 'https://company.atlassian.net/browse/PROJ-154'
      }
    ]

    setMetrics(mockMetrics)
    setRecentTickets(mockTickets)
    setIsActive(true)
  }, [])

  const successRate = metrics.totalExecutions > 0 
    ? (metrics.successfulExecutions / metrics.totalExecutions) * 100 
    : 0

  const ticketCreationRate = metrics.totalExecutions > 0
    ? (metrics.totalTicketsCreated / metrics.totalExecutions) * 100
    : 0

  const getPriorityColor = (priority: RecentTicket['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getStatusColor = (status: RecentTicket['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{workflowName}</h2>
          <p className="text-muted-foreground">Automated ticket creation from emails</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
          <Button
            variant={currentStatus === 'running' ? "secondary" : "default"}
            size="sm"
            onClick={() => setCurrentStatus(
              currentStatus === 'running' ? 'paused' : 'running'
            )}
          >
            {currentStatus === 'running' ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Executions</p>
              <p className="text-2xl font-bold">{metrics.totalExecutions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Ticket className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tickets Created</p>
              <p className="text-2xl font-bold">{metrics.totalTicketsCreated}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold">{successRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Time</p>
              <p className="text-2xl font-bold">{metrics.averageExecutionTime}s</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Success Rate</span>
                <span>{successRate.toFixed(1)}%</span>
              </div>
              <Progress value={successRate} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Ticket Creation Rate</span>
                <span>{ticketCreationRate.toFixed(1)}%</span>
              </div>
              <Progress value={ticketCreationRate} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>System Uptime</span>
                <span>{metrics.uptime}%</span>
              </div>
              <Progress value={metrics.uptime} className="h-2" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Execution Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Successful</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">{metrics.successfulExecutions}</span>
              </div>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Failed</span>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="font-medium">{metrics.failedExecutions}</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Last Execution</span>
              <span className="text-sm">
                {metrics.lastExecutionTime 
                  ? formatTimeAgo(metrics.lastExecutionTime)
                  : 'Never'
                }
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Tickets Created</h3>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
        
        <div className="space-y-3">
          {recentTickets.map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Ticket className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{ticket.id}</span>
                    <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate max-w-md">
                    {ticket.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {ticket.assignee && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{ticket.assignee}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(ticket.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {ticket.url && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={ticket.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}