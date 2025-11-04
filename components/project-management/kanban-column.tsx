"use client"

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanColumn as KanbanColumnType, Task } from '@/lib/types/project-management'
import { TaskCard } from './task-card'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  column: KanbanColumnType
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
}

export function KanbanColumn({ column, onTaskUpdate }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[500px] rounded-lg border-2 border-dashed border-transparent p-4 transition-colors",
        isOver && "border-primary bg-primary/5",
        column.color
      )}
    >
      <div className="space-y-3">
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onTaskUpdate={onTaskUpdate}
          />
        ))}
        
        {column.tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  )
}