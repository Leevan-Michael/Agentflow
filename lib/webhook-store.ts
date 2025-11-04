import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WebhookTrigger, WebhookExecution } from './types/webhook'
import { v4 as uuidv4 } from 'uuid'

interface WebhookState {
  webhooks: WebhookTrigger[]
  executions: WebhookExecution[]
  
  // Webhook management
  createWebhook: (webhook: Omit<WebhookTrigger, 'id' | 'createdAt' | 'updatedAt'>) => WebhookTrigger
  updateWebhook: (id: string, updates: Partial<WebhookTrigger>) => void
  deleteWebhook: (id: string) => void
  getWebhook: (id: string) => WebhookTrigger | undefined
  getWebhookByPath: (path: string, method: string) => WebhookTrigger | undefined
  getWebhooksByWorkflow: (workflowId: string) => WebhookTrigger[]
  
  // Execution tracking
  addExecution: (execution: Omit<WebhookExecution, 'id' | 'createdAt'>) => WebhookExecution
  getExecutions: (webhookId?: string) => WebhookExecution[]
  clearExecutions: (webhookId?: string) => void
}

export const useWebhookStore = create<WebhookState>()(
  persist(
    (set, get) => ({
      webhooks: [],
      executions: [],

      createWebhook: (webhookData) => {
        const webhook: WebhookTrigger = {
          ...webhookData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        set((state) => ({
          webhooks: [...state.webhooks, webhook]
        }))
        
        return webhook
      },

      updateWebhook: (id, updates) => {
        set((state) => ({
          webhooks: state.webhooks.map((webhook) =>
            webhook.id === id
              ? { ...webhook, ...updates, updatedAt: new Date().toISOString() }
              : webhook
          )
        }))
      },

      deleteWebhook: (id) => {
        set((state) => ({
          webhooks: state.webhooks.filter((webhook) => webhook.id !== id),
          executions: state.executions.filter((execution) => execution.webhookId !== id)
        }))
      },

      getWebhook: (id) => {
        return get().webhooks.find((webhook) => webhook.id === id)
      },

      getWebhookByPath: (path, method) => {
        return get().webhooks.find((webhook) => 
          webhook.path === path && 
          webhook.method === method && 
          webhook.isActive
        )
      },

      getWebhooksByWorkflow: (workflowId) => {
        return get().webhooks.filter((webhook) => webhook.workflowId === workflowId)
      },

      addExecution: (executionData) => {
        const execution: WebhookExecution = {
          ...executionData,
          id: uuidv4(),
          createdAt: new Date().toISOString()
        }
        
        set((state) => ({
          executions: [execution, ...state.executions].slice(0, 1000) // Keep last 1000 executions
        }))
        
        return execution
      },

      getExecutions: (webhookId) => {
        const executions = get().executions
        return webhookId 
          ? executions.filter((execution) => execution.webhookId === webhookId)
          : executions
      },

      clearExecutions: (webhookId) => {
        set((state) => ({
          executions: webhookId
            ? state.executions.filter((execution) => execution.webhookId !== webhookId)
            : []
        }))
      }
    }),
    {
      name: 'webhook-store'
    }
  )
)