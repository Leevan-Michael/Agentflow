"use client"

import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task, TaskPriority } from '@/lib/types/project-management'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  Paperclip, 
  MoreHorizontal,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format, isAfter, isToday, isTomorrow } from 'date-fns'
import { cn } from '@/lib/utils'
import { TaskDetailModal } from './task-detail-modal'

interface TaskCardProps {
  task: Task
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  isDragging?: boolean
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
}

const priorityIcons: Record<TaskPriority, React.ReactNode> = {
  low: <CheckCircle2 className="h-3 w-3" />,
  medium: <Clock className="h-3 w-3" />,
  high: <AlertCircle className="h-3 w-3" />,
  urgent: <AlertCircle className="h-3 w-3" />
}

export function TaskCard({ task, onTaskUpdate, isDragging = false }: TaskCardProps) {
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isOverdue = task.dueDate && isAfter(new Date(), new Date(task.dueDate)) && task.status !== 'done'
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate))
  const isDueTomorrow = task.dueDate && isTomorrow(new Date(task.dueDate))

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM d')
  }

  const handleStatusChange = (newStatus: Task['status']) => {
    onTaskUpdate(task.id, { status: newStatus })
  }

  const handlePriorityChange = (newPriority: TaskPriority) => {
    onTaskUpdate(task.id, { priority: newPriority })
  }

  const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length
  const totalSubtasks = task.subtasks.length

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          "cursor-grab active:cursor-grabbing transition-all hover:shadow-md",
          isDragging && "opacity-50",
          isSortableDragging && "shadow-lg rotate-3",
          isOverdue && "border-red-200 bg-red-50"
        )}
        onClick={() => setShowDetailModal(true)}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn("text-xs", priorityColors[task.priority])}
              >
                {priorityIcons[task.priority]}
                {task.priority}
              </Badge>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStatusChange('todo')}>
                  Move to To Do
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('in-progress')}>
                  Move to In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('review')}>
                  Move to Review
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('done')}>
                  Move to Done
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handlePriorityChange('low')}>
                  Set Low Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityChange('medium')}>
                  Set Medium Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityChange('high')}>
                  Set High Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityChange('urgent')}>
                  Set Urgent Priority
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title */}
          <h4 className="font-medium text-foreground mb-2 line-clamp-2">
            {task.title}
          </h4>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{task.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Subtasks Progress */}
          {totalSubtasks > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Due Date */}
              {task.dueDate && (
                <div className={cn(
                  "flex items-center gap-1 text-xs",
                  isOverdue && "text-red-600",
                  isDueToday && "text-orange-600",
                  isDueTomorrow && "text-yellow-600",
                  !isOverdue && !isDueToday && !isDueTomorrow && "text-muted-foreground"
                )}>
                  <Calendar className="h-3 w-3" />
                  {formatDueDate(task.dueDate)}
                </div>
              )}

              {/* Comments */}
              {task.comments.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  {task.comments.length}
                </div>
              )}

              {/* Attachments */}
              {task.attachments.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Paperclip className="h-3 w-3" />
                  {task.attachments.length}
                </div>
              )}
            </div>

            {/* Assignee */}
            {task.assignee && (
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                <AvatarFallback className="text-xs">
                  {task.assignee.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </CardContent>
      </Card>

      <TaskDetailModal
        task={task}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        onTaskUpdate={onTaskUpdate}
      />
    </>
  )
}