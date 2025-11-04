import { NextRequest, NextResponse } from 'next/server'
import { JiraIntegration, testJiraIntegration } from '@/lib/jira-integration'

export async function GET(request: NextRequest) {
  try {
    console.log('Starting Jira integration test...')
    
    // Check if Jira credentials are provided
    const requiredEnvVars = ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN', 'JIRA_PROJECT_KEY']
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing Jira configuration',
        missingVariables: missingVars,
        instructions: {
          message: 'To test Jira integration, add these environment variables to your .env.local file:',
          variables: {
            JIRA_BASE_URL: 'https://yourcompany.atlassian.net',
            JIRA_EMAIL: 'your-email@company.com',
            JIRA_API_TOKEN: 'your-jira-api-token',
            JIRA_PROJECT_KEY: 'YOUR_PROJECT_KEY'
          },
          howToGetApiToken: [
            '1. Go to https://id.atlassian.com/manage-profile/security/api-tokens',
            '2. Click "Create API token"',
            '3. Give it a label like "AgentFlow Integration"',
            '4. Copy the generated token'
          ]
        }
      }, { status: 400 })
    }

    // Run the test
    const testResult = await testJiraIntegration()
    
    return NextResponse.json({
      success: testResult,
      message: testResult ? 'Jira integration test passed!' : 'Jira integration test failed',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Jira test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Jira integration test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()
    
    const config = {
      baseUrl: process.env.JIRA_BASE_URL || '',
      email: process.env.JIRA_EMAIL || '',
      apiToken: process.env.JIRA_API_TOKEN || '',
      projectKey: process.env.JIRA_PROJECT_KEY || ''
    }

    const jira = new JiraIntegration(config)

    switch (action) {
      case 'test-connection':
        const connected = await jira.testConnection()
        return NextResponse.json({
          success: connected,
          message: connected ? 'Connected to Jira successfully' : 'Failed to connect to Jira'
        })

      case 'fetch-issues':
        const issues = await jira.getIssues()
        return NextResponse.json({
          success: true,
          issues,
          count: issues.length
        })

      case 'create-issue':
        const newIssue = await jira.createIssue(data)
        return NextResponse.json({
          success: !!newIssue,
          issue: newIssue,
          message: newIssue ? 'Issue created successfully' : 'Failed to create issue'
        })

      case 'sync-tasks':
        const syncResult = await jira.syncWithJira(data.tasks || [])
        return NextResponse.json({
          success: syncResult.errors.length === 0,
          synced: syncResult.synced,
          errors: syncResult.errors,
          message: `Synced ${syncResult.synced} tasks with ${syncResult.errors.length} errors`
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          availableActions: ['test-connection', 'fetch-issues', 'create-issue', 'sync-tasks']
        }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Jira API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Jira API operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}