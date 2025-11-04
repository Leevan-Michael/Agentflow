import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Project, Task, User, ProjectStats, TaskStatus, TaskPriority } from './types/project-management'
import { v4 as uuidv4 } from 'uuid'

interface ProjectManagementState {
  projects: Project[]
  tasks: Task[]
  users: User[]
  currentProject: Project | null
  
  // Project actions
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'tasks'>) => Project
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  setCurrentProject: (project: Project | null) => void
  getProjectById: (id: string) => Project | undefined
  getProjectStats: (projectId: string) => ProjectStats
  
  // Task actions
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks' | 'comments' | 'attachments'>) => Task
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  moveTask: (taskId: string, newStatus: TaskStatus) => void
  assignTask: (taskId: string, assigneeId: string) => void
  getTasksByProject: (projectId: string) => Task[]
  getTasksByStatus: (projectId: string, status: TaskStatus) => Task[]
  
  // User actions
  addUser: (user: User) => void
  updateUser: (id: string, updates: Partial<User>) => void
  getUserById: (id: string) => User | undefined
}

// Mock users for demo
const mockUsers: User[] = [
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
  },
  {
    id: 'user-3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
  }
]

export const useProjectManagementStore = create<ProjectManagementState>()(
  persist(
    (set, get) => ({
      projects: [],
      tasks: [],
      users: mockUsers,
      currentProject: null,

      createProject: (projectData) => {
        const project: Project = {
          ...projectData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          progress: 0,
          tasks: []
        }
        
        set((state) => ({
          projects: [...state.projects, project]
        }))
        
        return project
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? { ...project, ...updates, updatedAt: new Date().toISOString() }
              : project
          )
        }))
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
          tasks: state.tasks.filter((task) => task.projectId !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject
        }))
      },

      setCurrentProject: (project) => {
        set({ currentProject: project })
      },

      getProjectById: (id) => {
        return get().projects.find((project) => project.id === id)
      },

      getProjectStats: (projectId) => {
        const tasks = get().tasks.filter((task) => task.projectId === projectId)
        const totalTasks = tasks.length
        const completedTasks = tasks.filter((task) => task.status === 'done').length
        const inProgressTasks = tasks.filter((task) => task.status === 'in-progress').length
        const overdueTasks = tasks.filter((task) => 
          task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
        ).length
        const totalHours = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0)
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

        return {
          totalTasks,
          completedTasks,
          inProgressTasks,
          overdueTasks,
          totalHours,
          completionRate
        }
      },

      createTask: (taskData) => {
        const task: Task = {
          ...taskData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subtasks: [],
          comments: [],
          attachments: []
        }
        
        set((state) => ({
          tasks: [...state.tasks, task]
        }))
        
        // Update project progress
        const projectTasks = get().tasks.filter((t) => t.projectId === taskData.projectId)
        const completedTasks = projectTasks.filter((t) => t.status === 'done').length
        const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0
        
        get().updateProject(taskData.projectId, { progress })
        
        return task
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          )
        }))
        
        // Update project progress if status changed
        if (updates.status) {
          const task = get().tasks.find((t) => t.id === id)
          if (task) {
            const projectTasks = get().tasks.filter((t) => t.projectId === task.projectId)
            const completedTasks = projectTasks.filter((t) => t.status === 'done').length
            const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0
            get().updateProject(task.projectId, { progress })
          }
        }
      },

      deleteTask: (id) => {
        const task = get().tasks.find((t) => t.id === id)
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id)
        }))
        
        // Update project progress
        if (task) {
          const projectTasks = get().tasks.filter((t) => t.projectId === task.projectId)
          const completedTasks = projectTasks.filter((t) => t.status === 'done').length
          const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0
          get().updateProject(task.projectId, { progress })
        }
      },

      moveTask: (taskId, newStatus) => {
        get().updateTask(taskId, { status: newStatus })
      },

      assignTask: (taskId, assigneeId) => {
        const assignee = get().users.find((user) => user.id === assigneeId)
        get().updateTask(taskId, { assigneeId, assignee })
      },

      getTasksByProject: (projectId) => {
        return get().tasks.filter((task) => task.projectId === projectId)
      },

      getTasksByStatus: (projectId, status) => {
        return get().tasks.filter((task) => task.projectId === projectId && task.status === status)
      },

      addUser: (user) => {
        set((state) => ({
          users: [...state.users, user]
        }))
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...updates } : user
          )
        }))
      },

      getUserById: (id) => {
        return get().users.find((user) => user.id === id)
      }
    }),
    {
      name: 'project-management-store'
    }
  )
)