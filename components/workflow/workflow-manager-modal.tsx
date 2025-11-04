"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Save, 
  Upload, 
  Download, 
  Copy, 
  Trash2,
  Search,
  Filter,
  Star,
  Clock,
  User,
  Tag,
  FileText,
  Workflow,
  Template,
  Import,
  Export
} from 'lucide-react'
import { WorkflowManager, WorkflowDefinition, WorkflowTemplate } from '@/lib/workflow-manager'

interface WorkflowManagerModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'save' | 'load' | 'templates' | 'import' | 'export'
  currentWorkflow?: {
    nodes: any[]
    connections: any[]
    name?: string
    description?: string
  }
  onWorkflowLoad?: (workflow: WorkflowDefinition) => void
  onTemplateLoad?: (template: WorkflowTemplate) => void
}

export function WorkflowManagerModal({
  isOpen,
  onClose,
  mode,
  currentWorkflow,
  onWorkflowLoad,
  onTemplateLoad
}: WorkflowManagerModalProps) {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([])
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Save workflow state
  const [workflowName, setWorkflowName] = useState('')
  const [workflowDescription, setWorkflowDescription] = useState('')
  const [workflowTags, setWorkflowTags] = useState('')

  // Import/Export state
  const [importData, setImportData] = useState('')
  const [exportFormat, setExportFormat] = useState<'json' | 'yaml'>('json')
  const [exportData, setExportData] = useState('')

  const workflowManager = WorkflowManager.getInstance()

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, mode])

  useEffect(() => {
    if (currentWorkflow) {
      setWorkflowName(currentWorkflow.name || '')
      setWorkflowDescription(currentWorkflow.description || '')
    }
  }, [currentWorkflow])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (mode === 'load' || mode === 'save') {
        const workflowList = await workflowManager.listWorkflows()
        setWorkflows(workflowList)
      } else if (mode === 'templates') {
        // Load templates (mock data for now)
        const mockTemplates: WorkflowTemplate[] = [
          {
            id: 'template-1',
            name: 'Email to Slack Notification',
            description: 'Forward important emails to Slack channels',
            category: 'Communication',
            tags: ['email', 'slack', 'notifications'],
            difficulty: 'beginner',
            workflow: {
              name: 'Email to Slack',
              description: 'Forward emails to Slack',
              version: '1.0.0',
              tags: ['email', 'slack'],
              nodes: [],
              connections: [],
              settings: workflowManager['getDefaultSettings'](),
              variables: {},
              metadata: {
                category: 'Communication',
                difficulty: 'beginner',
                estimatedRunTime: 5000,
                nodeCount: 3,
                connectionCount: 2,
                executionCount: 0,
                successRate: 0
              }
            },
            preview: '',
            usageCount: 45,
            rating: 4.5
          },
          {
            id: 'template-2',
            name: 'Jira Issue Automation',
            description: 'Automatically create and manage Jira issues',
            category: 'Project Management',
            tags: ['jira', 'automation', 'issues'],
            difficulty: 'intermediate',
            workflow: {
              name: 'Jira Automation',
              description: 'Automate Jira workflows',
              version: '1.0.0',
              tags: ['jira', 'automation'],
              nodes: [],
              connections: [],
              settings: workflowManager['getDefaultSettings'](),
              variables: {},
              metadata: {
                category: 'Project Management',
                difficulty: 'intermediate',
                estimatedRunTime: 8000,
                nodeCount: 5,
                connectionCount: 4,
                executionCount: 0,
                successRate: 0
              }
            },
            preview: '',
            usageCount: 32,
            rating: 4.2
          }
        ]
        setTemplates(mockTemplates)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveWorkflow = async () => {
    if (!currentWorkflow || !workflowName.trim()) {
      setError('Workflow name is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const workflowData = {
        name: workflowName,
        description: workflowDescription,
        tags: workflowTags.split(',').map(tag => tag.trim()).filter(Boolean),
        nodes: currentWorkflow.nodes,
        connections: currentWorkflow.connections
      }

      await workflowManager.saveWorkflow(workflowData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workflow')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadWorkflow = async (workflowId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const workflow = await workflowManager.loadWorkflow(workflowId)
      if (workflow && onWorkflowLoad) {
        onWorkflowLoad(workflow)
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return

    setIsLoading(true)
    try {
      await workflowManager.deleteWorkflow(workflowId)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workflow')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDuplicateWorkflow = async (workflowId: string) => {
    setIsLoading(true)
    try {
      await workflowManager.duplicateWorkflow(workflowId)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate workflow')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportWorkflow = async () => {
    if (!importData.trim()) {
      setError('Import data is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const workflow = await workflowManager.importWorkflow(importData, 'json')
      if (onWorkflowLoad) {
        onWorkflowLoad(workflow)
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import workflow')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportWorkflow = async (workflowId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const exportedData = await workflowManager.exportWorkflow(workflowId, exportFormat)
      setExportData(exportedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export workflow')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseTemplate = async (templateId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const workflow = await workflowManager.createWorkflowFromTemplate(templateId)
      if (onWorkflowLoad) {
        onWorkflowLoad(workflow)
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to use template')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = !searchQuery || 
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || 
      workflow.metadata.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || 
      template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const getModalTitle = () => {
    switch (mode) {
      case 'save': return 'Save Workflow'
      case 'load': return 'Load Workflow'
      case 'templates': return 'Workflow Templates'
      case 'import': return 'Import Workflow'
      case 'export': return 'Export Workflow'
      default: return 'Workflow Manager'
    }
  }

  const getModalIcon = () => {
    switch (mode) {
      case 'save': return <Save className="h-5 w-5" />
      case 'load': return <Upload className="h-5 w-5" />
      case 'templates': return <Template className="h-5 w-5" />
      case 'import': return <Import className="h-5 w-5" />
      case 'export': return <Export className="h-5 w-5" />
      default: return <Workflow className="h-5 w-5" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getModalIcon()}
            {getModalTitle()}
          </DialogTitle>
          <DialogDescription>
            {mode === 'save' && 'Save your current workflow for future use'}
            {mode === 'load' && 'Load a previously saved workflow'}
            {mode === 'templates' && 'Choose from pre-built workflow templates'}
            {mode === 'import' && 'Import a workflow from JSON data'}
            {mode === 'export' && 'Export workflows to JSON format'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Save Workflow */}
          {mode === 'save' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Workflow Name *</Label>
                <Input
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="Enter workflow name"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Describe what this workflow does"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <Input
                  value={workflowTags}
                  onChange={(e) => setWorkflowTags(e.target.value)}
                  placeholder="automation, email, slack (comma-separated)"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSaveWorkflow} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Workflow'}
                </Button>
              </div>
            </div>
          )}

          {/* Load Workflow & Templates */}
          {(mode === 'load' || mode === 'templates') && (
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={`Search ${mode === 'templates' ? 'templates' : 'workflows'}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Communication">Communication</SelectItem>
                    <SelectItem value="Project Management">Project Management</SelectItem>
                    <SelectItem value="Data Processing">Data Processing</SelectItem>
                    <SelectItem value="Automation">Automation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Workflow/Template List */}
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {mode === 'load' && filteredWorkflows.map(workflow => (
                    <div key={workflow.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{workflow.name}</h3>
                            <Badge variant="outline">{workflow.metadata.category}</Badge>
                            <Badge variant="secondary">{workflow.metadata.difficulty}</Badge>
                          </div>
                          
                          {workflow.description && (
                            <p className="text-sm text-gray-600 mb-2">{workflow.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {workflow.createdBy}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(workflow.updatedAt).toLocaleDateString()}
                            </span>
                            <span>{workflow.metadata.nodeCount} nodes</span>
                          </div>
                          
                          {workflow.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {workflow.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLoadWorkflow(workflow.id)}
                          >
                            Load
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicateWorkflow(workflow.id)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteWorkflow(workflow.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {mode === 'templates' && filteredTemplates.map(template => (
                    <div key={template.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{template.name}</h3>
                            <Badge variant="outline">{template.category}</Badge>
                            <Badge variant="secondary">{template.difficulty}</Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs">{template.rating}</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{template.usageCount} uses</span>
                            <span>{template.workflow.metadata.nodeCount} nodes</span>
                            <span>~{Math.round(template.workflow.metadata.estimatedRunTime / 1000)}s runtime</span>
                          </div>
                          
                          <div className="flex gap-1 mt-2">
                            {template.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUseTemplate(template.id)}
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Import Workflow */}
          {mode === 'import' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Workflow JSON Data</Label>
                <Textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste your workflow JSON data here..."
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleImportWorkflow} disabled={isLoading}>
                  {isLoading ? 'Importing...' : 'Import Workflow'}
                </Button>
              </div>
            </div>
          )}

          {/* Export Workflow */}
          {mode === 'export' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Workflow to Export</Label>
                <ScrollArea className="h-48 border rounded">
                  <div className="p-2 space-y-2">
                    {workflows.map(workflow => (
                      <div
                        key={workflow.id}
                        className="p-2 hover:bg-gray-50 rounded cursor-pointer flex items-center justify-between"
                        onClick={() => handleExportWorkflow(workflow.id)}
                      >
                        <div>
                          <div className="font-medium text-sm">{workflow.name}</div>
                          <div className="text-xs text-gray-500">
                            {workflow.metadata.nodeCount} nodes • {new Date(workflow.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Download className="h-4 w-4" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {exportData && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Exported Data</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(exportData)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={exportData}
                    readOnly
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}