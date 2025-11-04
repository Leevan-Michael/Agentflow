"use client"

import React from 'react'
import { Project, Task } from '@/lib/types/project-management'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users, 
  Calendar,
  BarChart3,
  TrendingUp,
  Target
} from 'lucide-react'
import { format, isAfter, differenceInDays } from 'date-fns'
import { cn } from '@/lib/utils'

interface ProjectStatsProps {
  project: Project
  tasks: Task[]
}

export function ProjectStats({ project, tasks }: ProjectStatsProps) {
  // Calculate statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === 'done').length
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length
  const todoTasks = tasks.filter(task => task.status === 'todo').length
  const reviewTasks = tasks.filter(task => task.status === 'review').length
  
  const overdueTasks = tasks.filter(task => 
    task.dueDate && isAfter(new Date(), new Date(task.dueDate)) && task.status !== 'done'
  )
  
  const highPriorityTasks = tasks.filter(task => 
    task.priority === 'high' || task.priority === 'urgent'
  )
  
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  
  const totalEstimatedHours = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)
  const totalActualHours = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0)
  
  // Recent activity (last 5 completed tasks)
  const recentCompletedTasks = tasks
    .filter(task => task.status === 'done')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
  
  // Upcoming deadlines (next 7 days)
  const upcomingDeadlines = tasks
    .filter(task => 
      task.dueDate && 
      task.status !== 'done' &&
      differenceInDays(new Date(task.dueDate), new Date()) <= 7 &&
      differenceInDays(new Date(task.dueDate), new Date()) >= 0
    )
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5)

  const daysUntilDue = project.dueDate ? differenceInDays(new Date(project.dueDate), new Date()) : null
  const isProjectOverdue = project.dueDate && isAfter(new Date(), new Date(project.dueDate))

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Project Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overall Completion</span>
                <span className="text-sm font-medium">{Math.round(completionRate)}%</span>
              </div>
              <Progress value={completionRate} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Completed</div>
                <div className="font-medium text-green-600">{completedTasks}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Remaining</div>
                <div className="font-medium">{totalTasks - completedTasks}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Task Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-sm">To Do</span>
              </div>
              <span className="text-sm font-medium">{todoTasks}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span className="text-sm">In Progress</span>
              </div>
              <span className="text-sm font-medium">{inProgressTasks}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="text-sm">Review</span>
              </div>
              <span className="text-sm font-medium">{reviewTasks}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-sm">Done</span>
              </div>
              <span className="text-sm font-medium">{completedTasks}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Project Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{project.members.length} team members</span>
            </div>
            
            {project.dueDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className={cn(
                  isProjectOverdue && "text-red-600",
                  daysUntilDue !== null && daysUntilDue <= 7 && daysUntilDue > 0 && "text-orange-600"
                )}>
                  Due {format(new Date(project.dueDate), 'MMM d, yyyy')}
                  {daysUntilDue !== null && (
                    <span className="ml-1">
                      ({isProjectOverdue ? 'Overdue' : `${daysUntilDue} days left`})
                    </span>
                  )}
                </span>
              </div>
            )}
            
            {totalEstimatedHours > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{totalEstimatedHours}h estimated</span>
                {totalActualHours > 0 && (
                  <span className="text-muted-foreground">
                    ({totalActualHours}h actual)
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Warnings */}
      {(overdueTasks.length > 0 || highPriorityTasks.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overdueTasks.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Overdue Tasks ({overdueTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {overdueTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{task.title}</span>
                    <span className="text-red-600">
                      {format(new Date(task.dueDate!), 'MMM d')}
                    </span>
                  </div>
                ))}
                {overdueTasks.length > 3 && (
                  <div className="text-sm text-red-600">
                    +{overdueTasks.length - 3} more overdue tasks
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {highPriorityTasks.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  High Priority Tasks ({highPriorityTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {highPriorityTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{task.title}</span>
                    <Badge className={cn(
                      task.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                    )}>
                      {task.priority}
                    </Badge>
                  </div>
                ))}
                {highPriorityTasks.length > 3 && (
                  <div className="text-sm text-orange-600">
                    +{highPriorityTasks.length - 3} more high priority tasks
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Activity and Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentCompletedTasks.length > 0 ? (
              <div className="space-y-3">
                {recentCompletedTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{task.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Completed {format(new Date(task.updatedAt), 'MMM d')}
                      </div>
                    </div>
                    {task.assignee && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                        <AvatarFallback className="text-xs">
                          {task.assignee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No completed tasks yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {upcomingDeadlines.map((task) => {
                  const daysLeft = differenceInDays(new Date(task.dueDate!), new Date())
                  return (
                    <div key={task.id} className="flex items-center gap-3">
                      <Clock className={cn(
                        "h-4 w-4 flex-shrink-0",
                        daysLeft <= 1 ? "text-red-600" : daysLeft <= 3 ? "text-orange-600" : "text-muted-foreground"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{task.title}</div>
                        <div className={cn(
                          "text-sm",
                          daysLeft <= 1 ? "text-red-600" : daysLeft <= 3 ? "text-orange-600" : "text-muted-foreground"
                        )}>
                          {daysLeft === 0 ? 'Due today' : 
                           daysLeft === 1 ? 'Due tomorrow' : 
                           `Due in ${daysLeft} days`}
                        </div>
                      </div>
                      {task.assignee && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                          <AvatarFallback className="text-xs">
                            {task.assignee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No upcoming deadlines</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({project.members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.members.map((member) => {
              const memberTasks = tasks.filter(task => task.assigneeId === member.id)
              const memberCompletedTasks = memberTasks.filter(task => task.status === 'done')
              const memberProgress = memberTasks.length > 0 ? (memberCompletedTasks.length / memberTasks.length) * 100 : 0
              
              return (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{member.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {memberTasks.length} tasks ({memberCompletedTasks.length} done)
                    </div>
                    {memberTasks.length > 0 && (
                      <div className="mt-1">
                        <Progress value={memberProgress} className="h-1" />
                      </div>
                    )}
                  </div>
                  {member.id === project.ownerId && (
                    <Badge variant="secondary" className="text-xs">Owner</Badge>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}