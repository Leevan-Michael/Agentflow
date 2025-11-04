"use client"

import React, { useState } from 'react'
import { Task, TaskStatus, TaskPriority, SubTask, Comment } from '@/lib/types/project-management'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  Plus, 
  MessageSquare,
  Trash2,
  Edit3
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'

interface TaskDetailModalProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
}

export function TaskDetailModal({ task, open, onOpenChange, onTaskUpdate }: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(task.title)
  const [editedDescription, setEditedDescription] = useState(task.description || '')
  const [newSubtask, setNewSubtask] = useState('')
  const [newComment, setNewComment] = useState('')

  const handleSave = () => {
    onTaskUpdate(task.id, {
      title: editedTitle,
      description: editedDescription
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedTitle(task.title)
    setEditedDescription(task.description || '')
    setIsEditing(false)
  }

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return

    const subtask: SubTask = {
      id: uuidv4(),
      title: newSubtask.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    }

    onTaskUpdate(task.id, {
      subtasks: [...task.subtasks, subtask]
    })
    setNewSubtask('')
  }

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map(subtask =>
      subtask.id === subtaskId
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    )
    onTaskUpdate(task.id, { subtasks: updatedSubtasks })
  }

  const handleDeleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.filter(subtask => subtask.id !== subtaskId)
    onTaskUpdate(task.id, { subtasks: updatedSubtasks })
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: uuidv4(),
      content: newComment.trim(),
      authorId: 'user-1', // In real app, get from auth
      author: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onTaskUpdate(task.id, {
      comments: [...task.comments, comment]
    })
    setNewComment('')
  }

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
    }
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'done': return 'bg-green-100 text-green-800'
    }
  }

  const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length
  const totalSubtasks = task.subtasks.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Task Details</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title and Description */}
          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave}>Save</Button>
                  <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">{task.title}</h2>
                {task.description && (
                  <p className="text-muted-foreground">{task.description}</p>
                )}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Badge className={getStatusColor(task.status)}>
                {task.status.replace('-', ' ')}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Priority</Label>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
            </div>

            {task.assignee && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Assignee</Label>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                    <AvatarFallback className="text-xs">
                      {task.assignee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{task.assignee.name}</span>
                </div>
              </div>
            )}

            {task.dueDate && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Due Date</Label>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Time Tracking */}
          {(task.estimatedHours || task.actualHours) && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Time Tracking</Label>
              <div className="flex gap-4 text-sm">
                {task.estimatedHours && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Estimated: {task.estimatedHours}h</span>
                  </div>
                )}
                {task.actualHours && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Actual: {task.actualHours}h</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Subtasks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Subtasks ({completedSubtasks}/{totalSubtasks})
              </Label>
              {totalSubtasks > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round((completedSubtasks / totalSubtasks) * 100)}%
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {task.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() => handleToggleSubtask(subtask.id)}
                  />
                  <span className={cn(
                    "flex-1 text-sm",
                    subtask.completed && "line-through text-muted-foreground"
                  )}>
                    {subtask.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              <div className="flex gap-2">
                <Input
                  placeholder="Add a subtask..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                />
                <Button onClick={handleAddSubtask} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Comments */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              Comments ({task.comments.length})
            </Label>

            <div className="space-y-4">
              {task.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                    <AvatarFallback className="text-xs">
                      {comment.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{comment.author.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.createdAt), 'MMM d, yyyy at h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                />
                <Button onClick={handleAddComment} size="sm">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}