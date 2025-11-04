"use client"

import React from 'react'
import { Project, ProjectStatus } from '@/lib/types/project-management'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar, 
  Users, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Archive,
  Play,
  Pause,
  CheckCircle2
} from 'lucide-react'
import { format, isAfter, isToday, isTomorrow } from 'date-fns'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  project: Project
  isSelected: boolean
  onClick: () => void
  onDelete: () => void
}

const statusColors: Record<ProjectStatus, string> = {
  planning: 'bg-gray-100 text-gray-800',
  active: 'bg-blue-100 text-blue-800',
  'on-hold': 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-600'
}

const statusIcons: Record<ProjectStatus, React.ReactNode> = {
  planning: <Edit className="h-3 w-3" />,
  active: <Play className="h-3 w-3" />,
  'on-hold': <Pause className="h-3 w-3" />,
  completed: <CheckCircle2 className="h-3 w-3" />,
  archived: <Archive className="h-3 w-3" />
}

export function ProjectCard({ project, isSelected, onClick, onDelete }: ProjectCardProps) {
  const isOverdue = project.dueDate && isAfter(new Date(), new Date(project.dueDate)) && project.status !== 'completed'
  const isDueToday = project.dueDate && isToday(new Date(project.dueDate))
  const isDueTomorrow = project.dueDate && isTomorrow(new Date(project.dueDate))

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM d')
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary bg-primary/5",
        isOverdue && "border-red-200 bg-red-50"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full bg-${project.color}-500`} />
            <Badge className={cn("text-xs", statusColors[project.status])}>
              {statusIcons[project.status]}
              {project.status.replace('-', ' ')}
            </Badge>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={handleMenuClick}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title and Description */}
        <div className="mb-3">
          <h3 className="font-medium text-foreground mb-1 line-clamp-1">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs text-muted-foreground">{Math.round(project.progress)}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{project.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Due Date */}
            {project.dueDate && (
              <div className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue && "text-red-600",
                isDueToday && "text-orange-600",
                isDueTomorrow && "text-yellow-600",
                !isOverdue && !isDueToday && !isDueTomorrow && "text-muted-foreground"
              )}>
                <Calendar className="h-3 w-3" />
                {formatDueDate(project.dueDate)}
              </div>
            )}

            {/* Team Size */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {project.members.length}
            </div>
          </div>

          {/* Team Avatars */}
          <div className="flex -space-x-2">
            {project.members.slice(0, 3).map((member) => (
              <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="text-xs">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.members.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-xs text-muted-foreground">
                  +{project.members.length - 3}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}