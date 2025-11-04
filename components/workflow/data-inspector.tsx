"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Database, 
  Search, 
  Copy, 
  Download, 
  Filter,
  ChevronDown,
  ChevronRight,
  Eye,
  Code,
  Table,
  FileText
} from 'lucide-react'
import { WorkflowNode } from './workflow-canvas'

interface DataInspectorProps {
  nodes: WorkflowNode[]
  selectedNodeId?: string
  executionData?: Record<string, any>
  onNodeSelect?: (nodeId: string) => void
}

interface DataViewProps {
  data: any
  path?: string
  level?: number
}

function DataView({ data, path = '', level = 0 }: DataViewProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  
  const toggleExpanded = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const copyToClipboard = (value: any) => {
    navigator.clipboard.writeText(JSON.stringify(value, null, 2))
  }

  const renderValue = (key: string, value: any, currentPath: string) => {
    const fullPath = currentPath ? `${currentPath}.${key}` : key
    const isExpanded = expanded[fullPath]

    if (value === null) {
      return <span className="text-gray-400 italic">null</span>
    }

    if (value === undefined) {
      return <span className="text-gray-400 italic">undefined</span>
    }

    if (typeof value === 'boolean') {
      return <span className={`font-medium ${value ? 'text-green-600' : 'text-red-600'}`}>{String(value)}</span>
    }

    if (typeof value === 'number') {
      return <span className="text-blue-600 font-mono">{value}</span>
    }

    if (typeof value === 'string') {
      if (value.length > 100) {
        return (
          <div className="space-y-1">
            <span className="text-green-600 font-mono">
              "{isExpanded ? value : `${value.substring(0, 100)}...`}"
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpanded(fullPath)}
              className="h-5 text-xs"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </Button>
          </div>
        )
      }
      return <span className="text-green-600 font-mono">"{value}"</span>
    }

    if (Array.isArray(value)) {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpanded(fullPath)}
              className="h-5 w-5 p-0"
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
            <Badge variant="outline" className="text-xs">Array[{value.length}]</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(value)}
              className="h-5 w-5 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          {isExpanded && (
            <div className="ml-4 space-y-1">
              {value.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-gray-500 font-mono text-xs min-w-[20px]">[{index}]</span>
                  <div className="flex-1">
                    {renderValue(String(index), item, `${fullPath}[${index}]`)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value)
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpanded(fullPath)}
              className="h-5 w-5 p-0"
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
            <Badge variant="outline" className="text-xs">Object{keys.length > 0 ? `[${keys.length}]` : ''}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(value)}
              className="h-5 w-5 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          {isExpanded && (
            <div className="ml-4 space-y-1">
              {keys.map(objKey => (
                <div key={objKey} className="flex items-start gap-2">
                  <span className="text-gray-700 font-mono text-xs min-w-[80px]">{objKey}:</span>
                  <div className="flex-1">
                    {renderValue(objKey, value[objKey], fullPath)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return <span className="font-mono text-xs">{String(value)}</span>
  }

  return (
    <div className="space-y-1">
      {typeof data === 'object' && data !== null ? (
        Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex items-start gap-2 py-1">
            <span className="text-gray-700 font-medium text-sm min-w-[100px]">{key}:</span>
            <div className="flex-1">
              {renderValue(key, value, path)}
            </div>
          </div>
        ))
      ) : (
        <div>{renderValue('root', data, path)}</div>
      )}
    </div>
  )
}

export function DataInspector({ 
  nodes, 
  selectedNodeId, 
  executionData = {},
  onNodeSelect 
}: DataInspectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'tree' | 'json' | 'table'>('tree')

  const selectedNode = nodes.find(node => node.id === selectedNodeId)
  const nodeData = selectedNodeId ? executionData[selectedNodeId] : null

  // Generate mock data if no execution data available
  const getMockData = (node: WorkflowNode) => {
    switch (node.type) {
      case 'webhook':
        return {
          headers: {
            'content-type': 'application/json',
            'user-agent': 'Mozilla/5.0...',
            'x-forwarded-for': '192.168.1.1'
          },
          body: {
            name: 'John Doe',
            email: 'john@example.com',
            message: 'Hello from webhook'
          },
          query: {
            source: 'web',
            campaign: 'newsletter'
          }
        }
      case 'http':
        return {
          statusCode: 200,
          headers: {
            'content-type': 'application/json',
            'server': 'nginx/1.18.0'
          },
          body: {
            success: true,
            data: {
              id: 12345,
              name: 'API Response',
              items: [
                { id: 1, title: 'Item 1', active: true },
                { id: 2, title: 'Item 2', active: false }
              ]
            },
            timestamp: new Date().toISOString()
          }
        }
      case 'gmail-trigger':
        return {
          id: 'email-123456',
          subject: 'Important: Action Required',
          sender: 'support@company.com',
          recipient: 'user@example.com',
          body: {
            text: 'Please review the attached document and provide feedback.',
            html: '<p>Please review the attached document and provide feedback.</p>'
          },
          attachments: [
            {
              filename: 'document.pdf',
              size: 1048576,
              mimeType: 'application/pdf'
            }
          ],
          labels: ['Important', 'Work'],
          receivedAt: new Date().toISOString(),
          isRead: false
        }
      case 'jira':
        return {
          key: 'PROJ-123',
          summary: 'Fix login issue',
          description: 'Users are unable to login with their credentials',
          status: {
            name: 'Open',
            category: 'To Do'
          },
          assignee: {
            displayName: 'John Developer',
            emailAddress: 'john@company.com'
          },
          priority: {
            name: 'High',
            id: '2'
          },
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        }
      default:
        return {
          result: 'success',
          message: 'Node executed successfully',
          timestamp: new Date().toISOString(),
          data: {
            processed: true,
            count: 1
          }
        }
    }
  }

  const displayData = nodeData || (selectedNode ? getMockData(selectedNode) : null)

  const filterData = (data: any, query: string): any => {
    if (!query) return data
    
    const searchLower = query.toLowerCase()
    
    if (typeof data === 'string') {
      return data.toLowerCase().includes(searchLower) ? data : null
    }
    
    if (Array.isArray(data)) {
      const filtered = data.map(item => filterData(item, query)).filter(item => item !== null)
      return filtered.length > 0 ? filtered : null
    }
    
    if (typeof data === 'object' && data !== null) {
      const filtered: any = {}
      let hasMatch = false
      
      Object.entries(data).forEach(([key, value]) => {
        if (key.toLowerCase().includes(searchLower)) {
          filtered[key] = value
          hasMatch = true
        } else {
          const filteredValue = filterData(value, query)
          if (filteredValue !== null) {
            filtered[key] = filteredValue
            hasMatch = true
          }
        }
      })
      
      return hasMatch ? filtered : null
    }
    
    return data
  }

  const filteredData = displayData ? filterData(displayData, searchQuery) : null

  const downloadData = () => {
    if (!displayData) return
    
    const dataStr = JSON.stringify(displayData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${selectedNode?.name || 'node'}-data.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="h-4 w-4" />
          Data Inspector
        </CardTitle>
        <CardDescription className="text-xs">
          {selectedNode ? `Viewing data from: ${selectedNode.name}` : 'Select a node to view its data'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Node Selection */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {nodes.map(node => (
              <Button
                key={node.id}
                variant={selectedNodeId === node.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => onNodeSelect?.(node.id)}
                className="text-xs h-7"
              >
                {node.name}
              </Button>
            ))}
          </div>
        </div>

        {selectedNode && (
          <>
            {/* Search and Controls */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input
                  placeholder="Search data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 h-8 text-xs"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadData}
                className="h-8"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>

            {/* View Mode Tabs */}
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tree" className="text-xs">
                  <Eye className="h-3 w-3 mr-1" />
                  Tree
                </TabsTrigger>
                <TabsTrigger value="json" className="text-xs">
                  <Code className="h-3 w-3 mr-1" />
                  JSON
                </TabsTrigger>
                <TabsTrigger value="table" className="text-xs">
                  <Table className="h-3 w-3 mr-1" />
                  Table
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tree" className="mt-3">
                <ScrollArea className="h-64">
                  {filteredData ? (
                    <DataView data={filteredData} />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No data available</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="json" className="mt-3">
                <ScrollArea className="h-64">
                  <pre className="text-xs font-mono bg-gray-50 p-3 rounded">
                    {filteredData ? JSON.stringify(filteredData, null, 2) : 'No data available'}
                  </pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="table" className="mt-3">
                <ScrollArea className="h-64">
                  {filteredData && typeof filteredData === 'object' ? (
                    <div className="space-y-2">
                      {Object.entries(filteredData).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-2 gap-2 py-1 border-b text-xs">
                          <div className="font-medium">{key}</div>
                          <div className="font-mono">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Table className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No tabular data available</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  )
}