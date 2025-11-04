"use client"

import React, { useState } from 'react'
import { Project, ProjectStatus } from '@/lib/types/project-management'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, X, Lightbulb } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectCreate: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'tasks'>) => void
}

const colors = [
  { name: "gray", class: "bg-gray-500", value: "gray" },
  { name: "red", class: "bg-red-500", value: "red" },
  { name: "orange", class: "bg-orange-500", value: "orange" },
  { name: "yellow", class: "bg-yellow-500", value: "yellow" },
  { name: "green", class: "bg-green-500", value: "green" },
  { name: "blue", class: "bg-blue-500", value: "blue" },
  { name: "indigo", class: "bg-indigo-500", value: "indigo" },
  { name: "purple", class: "bg-purple-500", value: "purple" },
]

// Mock users for team members
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
  },
  {
    id: 'user-3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
  }
]

export function CreateProjectModal({ open, onOpenChange, onProjectCreate }: CreateProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('planning')
  const [color, setColor] = useState('blue')
  const [dueDate, setDueDate] = useState<Date>()
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>(['user-1']) // Default to current user

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) return

    const members = mockUsers.filter(user => selectedMembers.includes(user.id))

    onProjectCreate({
      name: name.trim(),
      description: description.trim(),
      status,
      color,
      ownerId: 'user-1', // In real app, get from auth
      owner: mockUsers[0],
      members,
      dueDate: dueDate?.toISOString(),
      tags
    })

    // Reset form
    setName('')
    setDescription('')
    setStatus('planning')
    setColor('blue')
    setDueDate(undefined)
    setTags([])
    setTagInput('')
    setSelectedMembers(['user-1'])
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const toggleMember = (userId: string) => {
    if (userId === 'user-1') return // Can't remove owner
    
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info Section */}
          <div className="flex gap-3 rounded-lg bg-blue-50 p-4">
            <Lightbulb className="h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">What are projects?</p>
              <p className="mt-1 text-sm text-blue-700">
                Projects help you organize tasks, collaborate with team members, and track progress towards your goals.
              </p>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q1 Marketing Campaign"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the project..."
                rows={3}
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(value: ProjectStatus) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <Label>Project Color</Label>
            <div className="mt-2 flex gap-2">
              {colors.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`h-10 w-10 rounded-full ${colorOption.class} ${
                    color === colorOption.value
                      ? "ring-2 ring-offset-2 ring-blue-500"
                      : "hover:ring-2 hover:ring-offset-2 hover:ring-gray-300"
                  } transition-all`}
                  aria-label={`Select ${colorOption.name} color`}
                />
              ))}
            </div>
          </div>

          {/* Team Members */}
          <div>
            <Label>Team Members</Label>
            <div className="mt-2 space-y-2">
              {mockUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(user.id)}
                    onChange={() => toggleMember(user.id)}
                    disabled={user.id === 'user-1'} // Owner can't be removed
                    className="rounded"
                  />
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  {user.id === 'user-1' && (
                    <Badge variant="secondary" className="text-xs">Owner</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="space-y-2">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type a tag and press Enter..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}