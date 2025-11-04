// Jira Integration for Testing
// This allows you to sync data with a real Jira instance

interface JiraConfig {
  baseUrl: string // e.g., 'https://yourcompany.atlassian.net'
  email: string
  apiToken: string
  projectKey: string
}

interface JiraIssue {
  id: string
  key: string
  summary: string
  description?: string
  status: {
    name: string
    id: string
  }
  priority: {
    name: string
    id: string
  }
  assignee?: {
    displayName: string
    emailAddress: string
  }
  duedate?: string
  created: string
  updated: string
}

export class JiraIntegration {
  private config: JiraConfig
  private baseHeaders: HeadersInit

  constructor(config: JiraConfig) {
    this.config = config
    this.baseHeaders = {
      'Authorization': `Basic ${btoa(`${config.email}:${config.apiToken}`)}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }

  // Test connection to Jira
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/rest/api/3/myself`, {
        headers: this.baseHeaders
      })
      return response.ok
    } catch (error) {
      console.error('Jira connection test failed:', error)
      return false
    }
  }

  // Get all issues from a Jira project
  async getIssues(): Promise<JiraIssue[]> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/rest/api/3/search?jql=project=${this.config.projectKey}`,
        { headers: this.baseHeaders }
      )
      
      if (!response.ok) {
        throw new Error(`Jira API error: ${response.status}`)
      }
      
      const data = await response.json()
      return data.issues.map(this.transformJiraIssue)
    } catch (error) {
      console.error('Failed to fetch Jira issues:', error)
      return []
    }
  }

  // Create a new issue in Jira
  async createIssue(issue: {
    summary: string
    description?: string
    issueType: string
    priority?: string
  }): Promise<JiraIssue | null> {
    try {
      const response = await fetch(`${this.config.baseUrl}/rest/api/3/issue`, {
        method: 'POST',
        headers: this.baseHeaders,
        body: JSON.stringify({
          fields: {
            project: { key: this.config.projectKey },
            summary: issue.summary,
            description: issue.description ? {
              type: 'doc',
              version: 1,
              content: [{
                type: 'paragraph',
                content: [{ type: 'text', text: issue.description }]
              }]
            } : undefined,
            issuetype: { name: issue.issueType },
            priority: issue.priority ? { name: issue.priority } : undefined
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create Jira issue: ${response.status}`)
      }

      const data = await response.json()
      return this.transformJiraIssue(data)
    } catch (error) {
      console.error('Failed to create Jira issue:', error)
      return null
    }
  }

  // Update an existing issue
  async updateIssue(issueKey: string, updates: {
    summary?: string
    description?: string
    status?: string
    priority?: string
    assignee?: string
  }): Promise<boolean> {
    try {
      const fields: any = {}
      
      if (updates.summary) fields.summary = updates.summary
      if (updates.description) {
        fields.description = {
          type: 'doc',
          version: 1,
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: updates.description }]
          }]
        }
      }
      if (updates.priority) fields.priority = { name: updates.priority }
      if (updates.assignee) fields.assignee = { name: updates.assignee }

      const response = await fetch(`${this.config.baseUrl}/rest/api/3/issue/${issueKey}`, {
        method: 'PUT',
        headers: this.baseHeaders,
        body: JSON.stringify({ fields })
      })

      return response.ok
    } catch (error) {
      console.error('Failed to update Jira issue:', error)
      return false
    }
  }

  // Transform Jira issue to our format
  private transformJiraIssue(jiraIssue: any): JiraIssue {
    return {
      id: jiraIssue.id,
      key: jiraIssue.key,
      summary: jiraIssue.fields.summary,
      description: jiraIssue.fields.description?.content?.[0]?.content?.[0]?.text,
      status: {
        name: jiraIssue.fields.status.name,
        id: jiraIssue.fields.status.id
      },
      priority: {
        name: jiraIssue.fields.priority?.name || 'Medium',
        id: jiraIssue.fields.priority?.id || '3'
      },
      assignee: jiraIssue.fields.assignee ? {
        displayName: jiraIssue.fields.assignee.displayName,
        emailAddress: jiraIssue.fields.assignee.emailAddress
      } : undefined,
      duedate: jiraIssue.fields.duedate,
      created: jiraIssue.fields.created,
      updated: jiraIssue.fields.updated
    }
  }

  // Sync our tasks with Jira issues
  async syncWithJira(ourTasks: any[]): Promise<{
    synced: number
    errors: string[]
  }> {
    const errors: string[] = []
    let synced = 0

    for (const task of ourTasks) {
      try {
        // Check if task exists in Jira (by external ID or key)
        if (task.jiraKey) {
          // Update existing Jira issue
          const success = await this.updateIssue(task.jiraKey, {
            summary: task.title,
            description: task.description,
            priority: this.mapPriorityToJira(task.priority)
          })
          if (success) synced++
          else errors.push(`Failed to update ${task.jiraKey}`)
        } else {
          // Create new Jira issue
          const jiraIssue = await this.createIssue({
            summary: task.title,
            description: task.description,
            issueType: 'Task',
            priority: this.mapPriorityToJira(task.priority)
          })
          if (jiraIssue) {
            synced++
            // You would update your task with the Jira key here
            // task.jiraKey = jiraIssue.key
          } else {
            errors.push(`Failed to create issue for task: ${task.title}`)
          }
        }
      } catch (error) {
        errors.push(`Error syncing task ${task.title}: ${error}`)
      }
    }

    return { synced, errors }
  }

  private mapPriorityToJira(priority: string): string {
    const priorityMap: Record<string, string> = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'urgent': 'Highest'
    }
    return priorityMap[priority] || 'Medium'
  }
}

// Usage example and testing functions
export async function testJiraIntegration() {
  // You would get these from environment variables
  const config: JiraConfig = {
    baseUrl: process.env.JIRA_BASE_URL || '',
    email: process.env.JIRA_EMAIL || '',
    apiToken: process.env.JIRA_API_TOKEN || '',
    projectKey: process.env.JIRA_PROJECT_KEY || ''
  }

  const jira = new JiraIntegration(config)

  console.log('Testing Jira connection...')
  const connected = await jira.testConnection()
  
  if (!connected) {
    console.error('❌ Failed to connect to Jira')
    return false
  }

  console.log('✅ Connected to Jira successfully')

  // Test fetching issues
  console.log('Fetching Jira issues...')
  const issues = await jira.getIssues()
  console.log(`✅ Found ${issues.length} issues`)

  // Test creating an issue
  console.log('Creating test issue...')
  const newIssue = await jira.createIssue({
    summary: 'Test Issue from AgentFlow',
    description: 'This is a test issue created from our project management system',
    issueType: 'Task',
    priority: 'Medium'
  })

  if (newIssue) {
    console.log(`✅ Created issue: ${newIssue.key}`)
  } else {
    console.log('❌ Failed to create test issue')
  }

  return true
}