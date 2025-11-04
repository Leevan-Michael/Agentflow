export interface JiraCredentials {
  id: string
  name: string
  baseUrl: string
  email: string
  apiToken: string
  projectKey?: string
  createdAt: string
  updatedAt: string
  userId: string // Owner of the credentials
}

export interface CredentialTestResult {
  success: boolean
  message: string
  details?: {
    serverInfo?: {
      version: string
      serverTitle: string
    }
    user?: {
      displayName: string
      emailAddress: string
    }
    projects?: Array<{
      key: string
      name: string
    }>
  }
  error?: string
}

export interface CredentialsStore {
  jira: JiraCredentials[]
}

export interface CreateCredentialRequest {
  name: string
  type: 'jira'
  config: {
    baseUrl: string
    email: string
    apiToken: string
    projectKey?: string
  }
}