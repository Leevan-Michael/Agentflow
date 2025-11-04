export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'archived'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId?: string
  assignee?: User
  projectId: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  tags: string[]
  subtasks: SubTask[]
  comments: Comment[]
  attachments: Attachment[]
  estimatedHours?: number
  actualHours?: number
}

export interface SubTask {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

export interface Comment {
  id: string
  content: string
  authorId: string
  author: User
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedBy: string
  uploadedAt: string
}

export interface Project {
  id: string
  name: string
  description?: string
  status: ProjectStatus
  color: string
  ownerId: string
  owner: User
  members: User[]
  tasks: Task[]
  createdAt: string
  updatedAt: string
  dueDate?: string
  progress: number
  tags: string[]
}

export interface ProjectStats {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  totalHours: number
  completionRate: number
}

export interface KanbanColumn {
  id: TaskStatus
  title: string
  tasks: Task[]
  color: string
}

export interface ProjectFilter {
  status?: ProjectStatus[]
  members?: string[]
  tags?: string[]
  dateRange?: {
    start: string
    end: string
  }
}

export interface TaskFilter {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  assignee?: string[]
  tags?: string[]
  dateRange?: {
    start: string
    end: string
  }
}