// Workflow Management System - Save, Load, Import, Export workflows
import { WorkflowNode, Connection } from '@/components/workflow/workflow-canvas'

export interface WorkflowDefinition {
  id: string
  name: string
  description?: string
  version: string
  createdAt: string
  updatedAt: string
  createdBy: string
  tags: string[]
  nodes: WorkflowNode[]
  connections: Connection[]
  settings: WorkflowSettings
  variables: Record<string, any>
  metadata: WorkflowMetadata
}

export interface WorkflowSettings {
  timezone: string
  errorHandling: 'stop' | 'continue' | 'retry'
  retryAttempts: number
  retryDelay: number
  timeout: number
  saveExecutionProgress: boolean
  saveDataOnError: boolean
  saveDataOnSuccess: boolean
  saveManualExecutions: boolean
}

export interface WorkflowMetadata {
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedRunTime: number
  nodeCount: number
  connectionCount: number
  lastExecuted?: string
  executionCount: number
  successRate: number
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  workflow: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>
  preview: string // Base64 encoded image
  usageCount: number
  rating: number
}

export class WorkflowManager {
  private static instance: WorkflowManager
  private workflows: Map<string, WorkflowDefinition> = new Map()
  private templates: Map<string, WorkflowTemplate> = new Map()

  static getInstance(): WorkflowManager {
    if (!WorkflowManager.instance) {
      WorkflowManager.instance = new WorkflowManager()
    }
    return WorkflowManager.instance
  }

  // Workflow CRUD Operations
  async saveWorkflow(workflow: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
    const now = new Date().toISOString()
    const workflowId = workflow.id || `workflow-${Date.now()}`
    
    const fullWorkflow: WorkflowDefinition = {
      id: workflowId,
      name: workflow.name || 'Untitled Workflow',
      description: workflow.description || '',
      version: workflow.version || '1.0.0',
      createdAt: workflow.createdAt || now,
      updatedAt: now,
      createdBy: workflow.createdBy || 'current-user',
      tags: workflow.tags || [],
      nodes: workflow.nodes || [],
      connections: workflow.connections || [],
      settings: workflow.settings || this.getDefaultSettings(),
      variables: workflow.variables || {},
      metadata: workflow.metadata || this.generateMetadata(workflow.nodes || [], workflow.connections || [])
    }

    // Save to storage
    await this.persistWorkflow(fullWorkflow)
    this.workflows.set(workflowId, fullWorkflow)

    return fullWorkflow
  }

  async loadWorkflow(workflowId: string): Promise<WorkflowDefinition | null> {
    // Try memory first
    if (this.workflows.has(workflowId)) {
      return this.workflows.get(workflowId)!
    }

    // Load from storage
    const workflow = await this.loadWorkflowFromStorage(workflowId)
    if (workflow) {
      this.workflows.set(workflowId, workflow)
    }

    return workflow
  }

  async deleteWorkflow(workflowId: string): Promise<boolean> {
    try {
      await this.deleteWorkflowFromStorage(workflowId)
      this.workflows.delete(workflowId)
      return true
    } catch (error) {
      console.error('Failed to delete workflow:', error)
      return false
    }
  }

  async listWorkflows(filters?: {
    tags?: string[]
    category?: string
    createdBy?: string
    search?: string
  }): Promise<WorkflowDefinition[]> {
    const allWorkflows = await this.loadAllWorkflows()
    
    if (!filters) return allWorkflows

    return allWorkflows.filter(workflow => {
      if (filters.tags && !filters.tags.some(tag => workflow.tags.includes(tag))) {
        return false
      }
      
      if (filters.category && workflow.metadata.category !== filters.category) {
        return false
      }
      
      if (filters.createdBy && workflow.createdBy !== filters.createdBy) {
        return false
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesName = workflow.name.toLowerCase().includes(searchLower)
        const matchesDescription = workflow.description?.toLowerCase().includes(searchLower)
        const matchesTags = workflow.tags.some(tag => tag.toLowerCase().includes(searchLower))
        
        if (!matchesName && !matchesDescription && !matchesTags) {
          return false
        }
      }
      
      return true
    })
  }

  async duplicateWorkflow(workflowId: string, newName?: string): Promise<WorkflowDefinition | null> {
    const originalWorkflow = await this.loadWorkflow(workflowId)
    if (!originalWorkflow) return null

    const duplicatedWorkflow: Partial<WorkflowDefinition> = {
      ...originalWorkflow,
      id: undefined, // Will be generated
      name: newName || `${originalWorkflow.name} (Copy)`,
      createdAt: undefined, // Will be set to now
      updatedAt: undefined, // Will be set to now
      nodes: originalWorkflow.nodes.map(node => ({
        ...node,
        id: `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      })),
      connections: originalWorkflow.connections.map(conn => ({
        ...conn,
        id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }))
    }

    return await this.saveWorkflow(duplicatedWorkflow)
  }

  // Import/Export Operations
  async exportWorkflow(workflowId: string, format: 'json' | 'yaml' = 'json'): Promise<string> {
    const workflow = await this.loadWorkflow(workflowId)
    if (!workflow) throw new Error('Workflow not found')

    if (format === 'json') {
      return JSON.stringify(workflow, null, 2)
    } else {
      // Convert to YAML (simplified)
      return this.convertToYaml(workflow)
    }
  }

  async importWorkflow(data: string, format: 'json' | 'yaml' = 'json'): Promise<WorkflowDefinition> {
    let workflowData: any

    try {
      if (format === 'json') {
        workflowData = JSON.parse(data)
      } else {
        workflowData = this.parseYaml(data)
      }
    } catch (error) {
      throw new Error(`Invalid ${format.toUpperCase()} format`)
    }

    // Validate workflow structure
    this.validateWorkflowStructure(workflowData)

    // Generate new IDs to avoid conflicts
    workflowData.id = `workflow-${Date.now()}`
    workflowData.nodes = workflowData.nodes.map((node: any) => ({
      ...node,
      id: `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }))
    workflowData.connections = workflowData.connections.map((conn: any) => ({
      ...conn,
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }))

    return await this.saveWorkflow(workflowData)
  }

  // Template Operations
  async saveAsTemplate(workflowId: string, templateData: Partial<WorkflowTemplate>): Promise<WorkflowTemplate> {
    const workflow = await this.loadWorkflow(workflowId)
    if (!workflow) throw new Error('Workflow not found')

    const template: WorkflowTemplate = {
      id: `template-${Date.now()}`,
      name: templateData.name || workflow.name,
      description: templateData.description || workflow.description || '',
      category: templateData.category || workflow.metadata.category,
      tags: templateData.tags || workflow.tags,
      difficulty: templateData.difficulty || workflow.metadata.difficulty,
      workflow: {
        name: workflow.name,
        description: workflow.description,
        version: workflow.version,
        tags: workflow.tags,
        nodes: workflow.nodes,
        connections: workflow.connections,
        settings: workflow.settings,
        variables: workflow.variables,
        metadata: workflow.metadata
      },
      preview: templateData.preview || '',
      usageCount: 0,
      rating: 0
    }

    await this.persistTemplate(template)
    this.templates.set(template.id, template)

    return template
  }

  async loadTemplate(templateId: string): Promise<WorkflowTemplate | null> {
    if (this.templates.has(templateId)) {
      return this.templates.get(templateId)!
    }

    const template = await this.loadTemplateFromStorage(templateId)
    if (template) {
      this.templates.set(templateId, template)
    }

    return template
  }

  async createWorkflowFromTemplate(templateId: string, workflowName?: string): Promise<WorkflowDefinition> {
    const template = await this.loadTemplate(templateId)
    if (!template) throw new Error('Template not found')

    const workflowData: Partial<WorkflowDefinition> = {
      ...template.workflow,
      name: workflowName || `${template.name} - ${new Date().toLocaleDateString()}`,
      nodes: template.workflow.nodes.map(node => ({
        ...node,
        id: `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      })),
      connections: template.workflow.connections.map(conn => ({
        ...conn,
        id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }))
    }

    // Increment usage count
    template.usageCount++
    await this.persistTemplate(template)

    return await this.saveWorkflow(workflowData)
  }

  // Utility Methods
  private getDefaultSettings(): WorkflowSettings {
    return {
      timezone: 'UTC',
      errorHandling: 'stop',
      retryAttempts: 3,
      retryDelay: 1000,
      timeout: 300000, // 5 minutes
      saveExecutionProgress: true,
      saveDataOnError: true,
      saveDataOnSuccess: false,
      saveManualExecutions: true
    }
  }

  private generateMetadata(nodes: WorkflowNode[], connections: Connection[]): WorkflowMetadata {
    return {
      category: 'general',
      difficulty: nodes.length > 10 ? 'advanced' : nodes.length > 5 ? 'intermediate' : 'beginner',
      estimatedRunTime: nodes.length * 2000, // 2 seconds per node estimate
      nodeCount: nodes.length,
      connectionCount: connections.length,
      executionCount: 0,
      successRate: 0
    }
  }

  private validateWorkflowStructure(workflow: any): void {
    const required = ['name', 'nodes', 'connections']
    for (const field of required) {
      if (!workflow[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    if (!Array.isArray(workflow.nodes)) {
      throw new Error('Nodes must be an array')
    }

    if (!Array.isArray(workflow.connections)) {
      throw new Error('Connections must be an array')
    }
  }

  // Storage Operations (to be implemented with actual storage backend)
  private async persistWorkflow(workflow: WorkflowDefinition): Promise<void> {
    // In a real implementation, this would save to database
    localStorage.setItem(`workflow-${workflow.id}`, JSON.stringify(workflow))
  }

  private async loadWorkflowFromStorage(workflowId: string): Promise<WorkflowDefinition | null> {
    const data = localStorage.getItem(`workflow-${workflowId}`)
    return data ? JSON.parse(data) : null
  }

  private async deleteWorkflowFromStorage(workflowId: string): Promise<void> {
    localStorage.removeItem(`workflow-${workflowId}`)
  }

  private async loadAllWorkflows(): Promise<WorkflowDefinition[]> {
    const workflows: WorkflowDefinition[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('workflow-')) {
        const data = localStorage.getItem(key)
        if (data) {
          try {
            workflows.push(JSON.parse(data))
          } catch (error) {
            console.error(`Failed to parse workflow ${key}:`, error)
          }
        }
      }
    }
    
    return workflows
  }

  private async persistTemplate(template: WorkflowTemplate): Promise<void> {
    localStorage.setItem(`template-${template.id}`, JSON.stringify(template))
  }

  private async loadTemplateFromStorage(templateId: string): Promise<WorkflowTemplate | null> {
    const data = localStorage.getItem(`template-${templateId}`)
    return data ? JSON.parse(data) : null
  }

  // Format conversion utilities
  private convertToYaml(workflow: WorkflowDefinition): string {
    // Simplified YAML conversion
    return `# Workflow: ${workflow.name}
name: "${workflow.name}"
description: "${workflow.description}"
version: "${workflow.version}"
nodes:
${workflow.nodes.map(node => `  - id: "${node.id}"
    type: "${node.type}"
    name: "${node.name}"
    position:
      x: ${node.position.x}
      y: ${node.position.y}
    parameters: ${JSON.stringify(node.parameters)}`).join('\n')}
connections:
${workflow.connections.map(conn => `  - id: "${conn.id}"
    source: "${conn.sourceNodeId}"
    target: "${conn.targetNodeId}"`).join('\n')}`
  }

  private parseYaml(yamlString: string): any {
    // Simplified YAML parsing - in production, use a proper YAML parser
    throw new Error('YAML parsing not implemented - use JSON format')
  }
}