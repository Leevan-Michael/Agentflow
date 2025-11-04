import { NextRequest, NextResponse } from 'next/server'
import { Project, ProjectStatus } from '@/lib/types/project-management'
import { v4 as uuidv4 } from 'uuid'

// In-memory storage for demo (in production, use a database)
const projects = new Map<string, Project>()
const tasks = new Map<string, any>()

// Mock users
const mockUsers = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('id')
    const status = searchParams.get('status') as ProjectStatus

    if (projectId) {
      const project = projects.get(projectId)
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }
      
      // Add tasks to project
      const projectTasks = Array.from(tasks.values()).filter(task => task.projectId === projectId)
      const projectWithTasks = { ...project, tasks: projectTasks }
      
      return NextResponse.json({ success: true, project: projectWithTasks })
    }

    // Return all projects with optional status filter
    let allProjects = Array.from(projects.values())
    
    if (status) {
      allProjects = allProjects.filter(project => project.status === status)
    }

    // Add task counts to each project
    const projectsWithStats = allProjects.map(project => {
      const projectTasks = Array.from(tasks.values()).filter(task => task.projectId === project.id)
      const completedTasks = projectTasks.filter(task => task.status === 'done').length
      const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0
      
      return {
        ...project,
        tasks: projectTasks,
        progress: Math.round(progress)
      }
    })

    return NextResponse.json({
      success: true,
      projects: projectsWithStats
    })
  } catch (error) {
    console.error('[API] Failed to get projects:', error)
    return NextResponse.json(
      { error: 'Failed to get projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color, status, dueDate, members, tags } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    const project: Project = {
      id: uuidv4(),
      name,
      description: description || '',
      status: status || 'planning',
      color: color || 'blue',
      ownerId: 'user-1', // In real app, get from auth
      owner: mockUsers[0],
      members: members || [mockUsers[0]],
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate,
      progress: 0,
      tags: tags || []
    }

    projects.set(project.id, project)

    console.log(`[API] Created project ${project.id}: ${name}`)

    return NextResponse.json({
      success: true,
      project
    })
  } catch (error) {
    console.error('[API] Failed to create project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, status, color, dueDate, members, tags } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const existingProject = projects.get(id)
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const updatedProject: Project = {
      ...existingProject,
      name: name || existingProject.name,
      description: description !== undefined ? description : existingProject.description,
      status: status || existingProject.status,
      color: color || existingProject.color,
      dueDate: dueDate !== undefined ? dueDate : existingProject.dueDate,
      members: members || existingProject.members,
      tags: tags || existingProject.tags,
      updatedAt: new Date().toISOString()
    }

    projects.set(id, updatedProject)

    console.log(`[API] Updated project ${id}`)

    return NextResponse.json({
      success: true,
      project: updatedProject
    })
  } catch (error) {
    console.error('[API] Failed to update project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('id')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const deleted = projects.delete(projectId)
    if (!deleted) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Delete associated tasks
    const projectTasks = Array.from(tasks.entries()).filter(([_, task]) => task.projectId === projectId)
    projectTasks.forEach(([taskId]) => tasks.delete(taskId))

    console.log(`[API] Deleted project ${projectId} and ${projectTasks.length} tasks`)

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    console.error('[API] Failed to delete project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}