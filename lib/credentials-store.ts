import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { JiraCredentials, CredentialTestResult } from './types/credentials'
import { v4 as uuidv4 } from 'uuid'

interface CredentialsState {
  jiraCredentials: JiraCredentials[]
  
  // Jira credentials actions
  addJiraCredentials: (credentials: Omit<JiraCredentials, 'id' | 'createdAt' | 'updatedAt'>) => JiraCredentials
  updateJiraCredentials: (id: string, updates: Partial<JiraCredentials>) => void
  deleteJiraCredentials: (id: string) => void
  getJiraCredentials: (id: string) => JiraCredentials | undefined
  getAllJiraCredentials: (userId?: string) => JiraCredentials[]
  testJiraCredentials: (credentials: Omit<JiraCredentials, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CredentialTestResult>
}

export const useCredentialsStore = create<CredentialsState>()(
  persist(
    (set, get) => ({
      jiraCredentials: [],

      addJiraCredentials: (credentialsData) => {
        const credentials: JiraCredentials = {
          ...credentialsData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        set((state) => ({
          jiraCredentials: [...state.jiraCredentials, credentials]
        }))
        
        return credentials
      },

      updateJiraCredentials: (id, updates) => {
        set((state) => ({
          jiraCredentials: state.jiraCredentials.map((cred) =>
            cred.id === id
              ? { ...cred, ...updates, updatedAt: new Date().toISOString() }
              : cred
          )
        }))
      },

      deleteJiraCredentials: (id) => {
        set((state) => ({
          jiraCredentials: state.jiraCredentials.filter((cred) => cred.id !== id)
        }))
      },

      getJiraCredentials: (id) => {
        return get().jiraCredentials.find((cred) => cred.id === id)
      },

      getAllJiraCredentials: (userId) => {
        const credentials = get().jiraCredentials
        return userId ? credentials.filter((cred) => cred.userId === userId) : credentials
      },

      testJiraCredentials: async (credentials) => {
        try {
          const auth = btoa(`${credentials.email}:${credentials.apiToken}`)
          
          // Test basic connection
          const response = await fetch(`${credentials.baseUrl}/rest/api/3/myself`, {
            headers: {
              'Authorization': `Basic ${auth}`,
              'Accept': 'application/json'
            }
          })

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          const userInfo = await response.json()

          // Get server info
          const serverResponse = await fetch(`${credentials.baseUrl}/rest/api/3/serverInfo`, {
            headers: {
              'Authorization': `Basic ${auth}`,
              'Accept': 'application/json'
            }
          })

          let serverInfo = null
          if (serverResponse.ok) {
            serverInfo = await serverResponse.json()
          }

          // Get projects if projectKey is specified
          let projects = null
          if (credentials.projectKey) {
            const projectResponse = await fetch(
              `${credentials.baseUrl}/rest/api/3/project/${credentials.projectKey}`,
              {
                headers: {
                  'Authorization': `Basic ${auth}`,
                  'Accept': 'application/json'
                }
              }
            )
            
            if (projectResponse.ok) {
              const project = await projectResponse.json()
              projects = [{ key: project.key, name: project.name }]
            }
          } else {
            // Get all accessible projects
            const projectsResponse = await fetch(
              `${credentials.baseUrl}/rest/api/3/project/search?maxResults=10`,
              {
                headers: {
                  'Authorization': `Basic ${auth}`,
                  'Accept': 'application/json'
                }
              }
            )
            
            if (projectsResponse.ok) {
              const projectsData = await projectsResponse.json()
              projects = projectsData.values?.map((p: any) => ({
                key: p.key,
                name: p.name
              })) || []
            }
          }

          return {
            success: true,
            message: 'Successfully connected to Jira',
            details: {
              serverInfo: serverInfo ? {
                version: serverInfo.version,
                serverTitle: serverInfo.serverTitle
              } : undefined,
              user: {
                displayName: userInfo.displayName,
                emailAddress: userInfo.emailAddress
              },
              projects: projects || []
            }
          }
        } catch (error) {
          return {
            success: false,
            message: 'Failed to connect to Jira',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }
    }),
    {
      name: 'credentials-store'
    }
  )
)