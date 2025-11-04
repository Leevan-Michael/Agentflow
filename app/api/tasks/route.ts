import { NextRequest, NextResponse } from 'next/server'
import { Task, TaskStatus, TaskPriority } from '@/lib/types/project-management'
import { v4 as uuidv4 } from 'uuid'

// In-memory storage for demo (in production, use a database)
const tasks = new Map<string, Task>()

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
    const taskId = searchParams.get('id')
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status') as TaskStatus
    const assigneeId = searchParams.get('assigneeId')

    if (taskId) {
      const task = tasks.get(taskId)
      if (!task) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, task })
    }

    // Return filtered tasks
    let filteredTasks = Array.from(tasks.values())
    
    if (projectId) {
      filteredTasks = filteredTasks.filter(task => task.projectId === projectId)
    }
    
    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status)
    }
    
    if (assigneeId) {
      filteredTasks = filteredTasks.filter(task => task.assigneeId === assigneeId)
    }

    return NextResponse.json({
      success: true,
      tasks: filteredTasks
    })
  } catch (error) {
    console.error('[API] Failed to get tasks:', error)
    return NextResponse.json(
      { error: 'Failed to get tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      title, 
      description, 
      status, 
      priority, 
      assigneeId, 
      projectId, 
      dueDate, 
      tags, 
      estimatedHours 
    } = body

    if (!title || !projectId) {
      return NextResponse.json(
        { error: 'Title and project ID are required' },
        { status: 400 }
      )
    }

    const assignee = assigneeId ? mockUsers.find(user => user.id === assigneeId) : undefined

    const task: Task = {
      id: uuidv4(),
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      assigneeId,
      assignee,
      projectId,
      dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: tags || [],
      subtasks: [],
      comments: [],
      attachments: [],
      estimatedHours,
      actualHours: 0
    }

    tasks.set(task.id, task)

    console.log(`[API] Created task ${task.id}: ${title}`)

    return NextResponse.json({
      success: true,
      task
    })
  } catch (error) {
    console.error('[API] Failed to create task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id, 
      title, 
      description, 
      status, 
      priority, 
      assigneeId, 
      dueDate, 
      tags, 
      estimatedHours, 
      actualHours 
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    const existingTask = tasks.get(id)
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    const assignee = assigneeId ? mockUsers.find(user => user.id === assigneeId) : existingTask.assignee

    const updatedTask: Task = {
      ...existingTask,
      title: title || existingTask.title,
      description: description !== undefined ? description : existingTask.description,
      status: status || existingTask.status,
      priority: priority || existingTask.priority,
      assigneeId: assigneeId !== undefined ? assigneeId : existingTask.assigneeId,
      assignee,
      dueDate: dueDate !== undefined ? dueDate : existingTask.dueDate,
      tags: tags || existingTask.tags,
      estimatedHours: estimatedHours !== undefined ? estimatedHours : existingTask.estimatedHours,
      actualHours: actualHours !== undefined ? actualHours : existingTask.actualHours,
      updatedAt: new Date().toISOString()
    }

    tasks.set(id, updatedTask)

    console.log(`[API] Updated task ${id}`)

    return NextResponse.json({
      success: true,
      task: updatedTask
    })
  } catch (error) {
    console.error('[API] Failed to update task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('id')

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    const deleted = tasks.delete(taskId)
    if (!deleted) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    console.log(`[API] Deleted task ${taskId}`)

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    console.error('[API] Failed to delete task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}