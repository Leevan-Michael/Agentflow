// Node Configuration System
// Defines settings and parameters for all workflow node types

export interface NodeParameter {
  id: string
  name: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea' | 'password' | 'url' | 'email' | 'json'
  required?: boolean
  default?: any
  options?: { label: string; value: string }[]
  placeholder?: string
  description?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface NodeConfiguration {
  id: string
  name: string
  description: string
  category: string
  icon: string
  color: string
  parameters: NodeParameter[]
  credentials?: {
    required: boolean
    types: string[]
  }
  inputs: {
    id: string
    name: string
    type: 'trigger' | 'data' | 'condition'
    required?: boolean
  }[]
  outputs: {
    id: string
    name: string
    type: 'trigger' | 'data' | 'condition'
  }[]
}

// Import all node configurations
import { webhookNodeConfig, scheduleNodeConfig, gmailTriggerNodeConfig } from './node-configs/trigger-nodes'
import { httpNodeConfig, emailNodeConfig } from './node-configs/action-nodes'
import { conditionNodeConfig, transformNodeConfig, delayNodeConfig } from './node-configs/logic-nodes'
import { jiraNodeConfig, slackNodeConfig } from './node-configs/integration-nodes'
import { gmailNodeConfig, notionNodeConfig, airtableNodeConfig } from './node-configs/integration-nodes-2'
import { jiraPmNodeConfig, trelloNodeConfig, asanaNodeConfig, mondayNodeConfig } from './node-configs/project-management-nodes'

// Export all node configurations
export const nodeConfigurations: Record<string, NodeConfiguration> = {
  // Triggers
  webhook: webhookNodeConfig,
  schedule: scheduleNodeConfig,
  'gmail-trigger': gmailTriggerNodeConfig,
  
  // Actions
  http: httpNodeConfig,
  email: emailNodeConfig,
  
  // Logic
  condition: conditionNodeConfig,
  transform: transformNodeConfig,
  delay: delayNodeConfig,
  
  // Integrations
  jira: jiraNodeConfig,
  slack: slackNodeConfig,
  gmail: gmailNodeConfig,
  notion: notionNodeConfig,
  airtable: airtableNodeConfig,
  
  // Project Management
  'jira-pm': jiraPmNodeConfig,
  trello: trelloNodeConfig,
  asana: asanaNodeConfig,
  monday: mondayNodeConfig
}

// Helper functions
export function getNodeConfiguration(nodeType: string): NodeConfiguration | undefined {
  return nodeConfigurations[nodeType]
}

export function getNodesByCategory(category: string): NodeConfiguration[] {
  return Object.values(nodeConfigurations).filter(config => config.category === category)
}

export function getAllCategories(): string[] {
  const categories = new Set(Object.values(nodeConfigurations).map(config => config.category))
  return Array.from(categories).sort()
}