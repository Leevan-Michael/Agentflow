"use client"

import React, { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Task, TaskStatus, KanbanColumn } from '@/lib/types/project-management'
import { KanbanColumn as KanbanColumnComponent } from './kanban-column'
import { TaskCard } from './task-card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CreateTaskModal } from './create-task-modal'

interface KanbanBoardProps {
  projectId: string
  tasks: Task[]
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks' | 'comments' | 'attachments'>) => void
}

const columns: KanbanColumn[] = [
  {
    id: 'todo',
    title: 'To Do',
    tasks: [],
    color: 'bg-gray-100'
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tasks: [],
    color: 'bg-blue-100'
  },
  {
    id: 'review',
    title: 'Review',
    tasks: [],
    color: 'bg-yellow-100'
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [],
    color: 'bg-green-100'
  }
]

export function KanbanBoard({ projectId, tasks, onTaskUpdate, onTaskCreate }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createModalColumn, setCreateModalColumn] = useState<TaskStatus>('todo')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Group tasks by status
  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = []
    }
    acc[task.status].push(task)
    return acc
  }, {} as Record<TaskStatus, Task[]>)

  // Populate columns with tasks
  const populatedColumns = columns.map(column => ({
    ...column,
    tasks: tasksByStatus[column.id] || []
  }))

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find(t => t.id === active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeTask = tasks.find(t => t.id === active.id)
    if (!activeTask) return

    const overId = over.id as string
    
    // Check if dropped on a column
    const targetColumn = columns.find(col => col.id === overId)
    if (targetColumn && activeTask.status !== targetColumn.id) {
      onTaskUpdate(activeTask.id, { status: targetColumn.id })
      return
    }

    // Handle reordering within the same column or moving between columns
    const overTask = tasks.find(t => t.id === overId)
    if (overTask && activeTask.status !== overTask.status) {
      onTaskUpdate(activeTask.id, { status: overTask.status })
    }
  }

  const handleCreateTask = (columnId: TaskStatus) => {
    setCreateModalColumn(columnId)
    setShowCreateModal(true)
  }

  const handleTaskCreated = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks' | 'comments' | 'attachments'>) => {
    onTaskCreate({
      ...taskData,
      status: createModalColumn,
      projectId
    })
    setShowCreateModal(false)
  }

  return (
    <div className="h-full flex flex-col">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-6 overflow-x-auto pb-6">
          {populatedColumns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{column.title}</h3>
                  <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {column.tasks.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCreateTask(column.id)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <SortableContext
                items={column.tasks.map(task => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <KanbanColumnComponent
                  column={column}
                  onTaskUpdate={onTaskUpdate}
                />
              </SortableContext>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              onTaskUpdate={onTaskUpdate}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <CreateTaskModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onTaskCreate={handleTaskCreated}
        defaultStatus={createModalColumn}
        projectId={projectId}
      />
    </div>
  )
}