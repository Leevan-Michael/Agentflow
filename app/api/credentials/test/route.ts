import { NextRequest, NextResponse } from 'next/server'
import { CredentialTestResult } from '@/lib/types/credentials'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { baseUrl, email, apiToken, projectKey } = body

    if (!baseUrl || !email || !apiToken) {
      return NextResponse.json(
        { error: 'Missing required fields: baseUrl, email, apiToken' },
        { status: 400 }
      )
    }

    const cleanBaseUrl = baseUrl.replace(/\/$/, '')
    const auth = btoa(`${email}:${apiToken}`)

    try {
      // Test basic connection by getting user info
      const userResponse = await fetch(`${cleanBaseUrl}/rest/api/3/myself`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      })

      if (!userResponse.ok) {
        const errorText = await userResponse.text()
        throw new Error(`HTTP ${userResponse.status}: ${errorText}`)
      }

      const userInfo = await userResponse.json()

      // Get server info
      let serverInfo = null
      try {
        const serverResponse = await fetch(`${cleanBaseUrl}/rest/api/3/serverInfo`, {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json'
          }
        })

        if (serverResponse.ok) {
          serverInfo = await serverResponse.json()
        }
      } catch (error) {
        console.warn('Could not fetch server info:', error)
      }

      // Get projects
      let projects = []
      try {
        if (projectKey) {
          // Test specific project
          const projectResponse = await fetch(
            `${cleanBaseUrl}/rest/api/3/project/${projectKey}`,
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
          } else {
            console.warn(`Project ${projectKey} not accessible or not found`)
          }
        } else {
          // Get accessible projects
          const projectsResponse = await fetch(
            `${cleanBaseUrl}/rest/api/3/project/search?maxResults=10`,
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
      } catch (error) {
        console.warn('Could not fetch projects:', error)
      }

      const result: CredentialTestResult = {
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
          projects
        }
      }

      return NextResponse.json(result)

    } catch (error) {
      const result: CredentialTestResult = {
        success: false,
        message: 'Failed to connect to Jira',
        error: error instanceof Error ? error.message : 'Unknown error'
      }

      return NextResponse.json(result)
    }

  } catch (error) {
    console.error('[API] Credential test error:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to test credentials',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}