"use client"

import React, { useState, useEffect } from 'react'
import { Project, Task, ProjectStats } from '@/lib/types/project-management'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  Kanban,
  List,
  Grid3X3
} from 'lucide-react'
import { CreateProjectModal } from './create-project-modal'
import { ProjectCard } from './project-card'
import { KanbanBoard } from './kanban-board'
import { TaskList } from './task-list'
import { ProjectStats as ProjectStatsComponent } from './project-stats'
import { JiraIntegrationTest } from './jira-integration-test'

export function ProjectManagementDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [view, setView] = useState<'overview' | 'kanban' | 'list' | 'jira'>('overview')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  // Fetch projects and tasks
  useEffect(() => {
    fetchProjects()
    fetchTasks()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      if (data.success) {
        setProjects(data.projects)
        if (data.projects.length > 0 && !selectedProject) {
          setSelectedProject(data.projects[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      const data = await response.json()
      if (data.success) {
        setTasks(data.tasks)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    }
  }

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'tasks'>) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      })
      const data = await response.json()
      if (data.success) {
        setProjects([...projects, data.project])
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks' | 'comments' | 'attachments'>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })
      const data = await response.json()
      if (data.success) {
        setTasks([...tasks, data.task])
      }
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, ...updates })
      })
      const data = await response.json()
      if (data.success) {
        setTasks(tasks.map(task => task.id === taskId ? data.task : task))
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        setProjects(projects.filter(p => p.id !== projectId))
        setTasks(tasks.filter(t => t.projectId !== projectId))
        if (selectedProject?.id === projectId) {
          setSelectedProject(projects.find(p => p.id !== projectId) || null)
        }
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  // Filter projects based on search and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Get tasks for selected project
  const projectTasks = selectedProject ? tasks.filter(task => task.projectId === selectedProject.id) : []

  // Calculate overall stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === 'done').length
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length
  const overdueTasks = tasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
  ).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Project Management</h1>
          <p className="text-muted-foreground">Manage your projects and tasks efficiently</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Grid3X3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks} completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6">
        {/* Projects Sidebar */}
        <div className="w-80 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isSelected={selectedProject?.id === project.id}
                onClick={() => setSelectedProject(project)}
                onDelete={() => handleDeleteProject(project.id)}
              />
            ))}
            
            {filteredProjects.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No projects found</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setShowCreateModal(true)}
                >
                  Create your first project
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {selectedProject ? (
            <>
              {/* Project Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full bg-${selectedProject.color}-500`} />
                  <div>
                    <h2 className="text-xl font-semibold">{selectedProject.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Tabs value={view} onValueChange={(value: any) => setView(value)}>
                    <TabsList>
                      <TabsTrigger value="overview">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="kanban">
                        <Kanban className="h-4 w-4 mr-2" />
                        Kanban
                      </TabsTrigger>
                      <TabsTrigger value="list">
                        <List className="h-4 w-4 mr-2" />
                        List
                      </TabsTrigger>
                      <TabsTrigger value="jira">
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.97 4.35 4.35 4.35V2.84c0-.46-.37-.84-.84-.84H11.53zM6.77 6.8c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.97 4.35 4.35 4.35V7.64c0-.46-.37-.84-.84-.84H6.77zM2 11.6c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.97 4.35 4.35 4.35v-9.56c0-.46-.37-.84-.84-.84H2z"/>
                        </svg>
                        Jira Test
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {/* Content based on view */}
              {view === 'overview' && (
                <ProjectStatsComponent 
                  project={selectedProject} 
                  tasks={projectTasks}
                />
              )}
              
              {view === 'kanban' && (
                <KanbanBoard
                  projectId={selectedProject.id}
                  tasks={projectTasks}
                  onTaskUpdate={handleUpdateTask}
                  onTaskCreate={handleCreateTask}
                />
              )}
              
              {view === 'list' && (
                <TaskList
                  projectId={selectedProject.id}
                  tasks={projectTasks}
                  onTaskUpdate={handleUpdateTask}
                  onTaskCreate={handleCreateTask}
                />
              )}
              
              {view === 'jira' && (
                <JiraIntegrationTest />
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Grid3X3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a project</h3>
                <p className="text-muted-foreground mb-4">
                  Choose a project from the sidebar to view its details and tasks
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Project
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateProjectModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onProjectCreate={handleCreateProject}
      />
    </div>
  )
}