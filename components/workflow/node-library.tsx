"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, X, Zap, Globe, Mail, Database, GitBranch, RotateCcw, Settings } from "lucide-react"

interface NodeType {
  id: string
  name: string
  description: string
  category: string
  icon: React.ReactNode
  color: string
}

const nodeTypes: NodeType[] = [
  {
    id: 'webhook',
    name: 'Webhook',
    description: 'Trigger workflows via HTTP requests',
    category: 'Triggers',
    icon: <Globe className="h-5 w-5" />,
    color: 'bg-blue-500'
  },
  {
    id: 'schedule',
    name: 'Schedule',
    description: 'Run workflows on a schedule using cron expressions',
    category: 'Triggers',
    icon: <Settings className="h-5 w-5" />,
    color: 'bg-purple-500'
  },
  {
    id: 'gmail-trigger',
    name: 'Gmail Trigger',
    description: 'Trigger workflows when new emails are received in Gmail',
    category: 'Triggers',
    icon: <div className="w-5 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">📬</div>,
    color: 'bg-red-500'
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Create, update, and manage Jira issues',
    category: 'Integrations',
    icon: <Globe className="h-5 w-5" />,
    color: 'bg-blue-600'
  },
  {
    id: 'http',
    name: 'HTTP Request',
    description: 'Make HTTP requests to APIs and web services',
    category: 'Actions',
    icon: <Globe className="h-5 w-5" />,
    color: 'bg-green-500'
  },
  {
    id: 'email',
    name: 'Send Email',
    description: 'Send emails via SMTP or email service providers',
    category: 'Actions',
    icon: <Mail className="h-5 w-5" />,
    color: 'bg-red-500'
  },
  {
    id: 'condition',
    name: 'IF Condition',
    description: 'Branch your workflow based on conditions',
    category: 'Logic',
    icon: <GitBranch className="h-5 w-5" />,
    color: 'bg-orange-500'
  },
  {
    id: 'transform',
    name: 'Transform Data',
    description: 'Transform and manipulate data between nodes',
    category: 'Logic',
    icon: <RotateCcw className="h-5 w-5" />,
    color: 'bg-teal-500'
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send messages and interact with Slack',
    category: 'Integrations',
    icon: <div className="w-5 h-5 bg-purple-600 rounded text-white text-xs flex items-center justify-center font-bold">S</div>,
    color: 'bg-purple-600'
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Send and receive emails via Gmail',
    category: 'Integrations',
    icon: <div className="w-5 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">G</div>,
    color: 'bg-red-500'
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Create and update Notion pages and databases',
    category: 'Integrations',
    icon: <div className="w-5 h-5 bg-black rounded text-white text-xs flex items-center justify-center font-bold">N</div>,
    color: 'bg-black'
  },
  {
    id: 'airtable',
    name: 'Airtable',
    description: 'Manage Airtable records and bases',
    category: 'Integrations',
    icon: <div className="w-5 h-5 bg-yellow-500 rounded text-white text-xs flex items-center justify-center font-bold">A</div>,
    color: 'bg-yellow-500'
  },
  {
    id: 'jira-pm',
    name: 'Jira Project Management',
    description: 'Create, update, and manage Jira issues and projects',
    category: 'Project Management',
    icon: <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">J</div>,
    color: 'bg-blue-600'
  },
  {
    id: 'trello',
    name: 'Trello',
    description: 'Manage Trello boards, lists, and cards',
    category: 'Project Management',
    icon: <div className="w-5 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">T</div>,
    color: 'bg-blue-500'
  },
  {
    id: 'asana',
    name: 'Asana',
    description: 'Create and manage Asana tasks and projects',
    category: 'Project Management',
    icon: <div className="w-5 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">A</div>,
    color: 'bg-red-500'
  },
  {
    id: 'monday',
    name: 'Monday.com',
    description: 'Manage Monday.com boards, items, and updates',
    category: 'Project Management',
    icon: <div className="w-5 h-5 bg-purple-600 rounded text-white text-xs flex items-center justify-center font-bold">M</div>,
    color: 'bg-purple-600'
  }
]

const categories = ['All', 'Triggers', 'Actions', 'Logic', 'Project Management', 'Integrations']

interface NodeLibraryProps {
  onAddNode: (nodeType: string) => void
  onClose: () => void
}

export function NodeLibrary({ onAddNode, onClose }: NodeLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredNodes = nodeTypes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         node.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || node.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleNodeClick = (nodeType: string) => {
    onAddNode(nodeType)
  }

  return (
    <div className="h-full flex flex-col bg-background border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Node Library</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredNodes.map(node => (
            <Card
              key={node.id}
              className="p-3 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/50"
              onClick={() => handleNodeClick(node.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${node.color} text-white flex-shrink-0`}>
                  {node.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{node.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {node.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {node.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredNodes.length === 0 && (
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-2">No nodes found</div>
            <div className="text-sm text-muted-foreground">
              Try adjusting your search or category filter
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          Drag nodes to the canvas or click to add
        </div>
      </div>
    </div>
  )
}