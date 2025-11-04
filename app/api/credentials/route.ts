import { NextRequest, NextResponse } from 'next/server'
import { JiraCredentials, CredentialTestResult } from '@/lib/types/credentials'
import { v4 as uuidv4 } from 'uuid'

// In-memory storage for demo (in production, use encrypted database storage)
const credentials = new Map<string, JiraCredentials>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const credentialId = searchParams.get('id')
    const userId = searchParams.get('userId') || 'current-user'

    if (credentialId) {
      const credential = credentials.get(credentialId)
      if (!credential || credential.userId !== userId) {
        return NextResponse.json(
          { error: 'Credential not found' },
          { status: 404 }
        )
      }
      
      // Don't return sensitive data in API responses
      const safeCredential = {
        ...credential,
        apiToken: '***masked***'
      }
      
      return NextResponse.json({ success: true, credential: safeCredential })
    }

    // Return all credentials for user (with masked tokens)
    const userCredentials = Array.from(credentials.values())
      .filter(cred => cred.userId === userId)
      .map(cred => ({
        ...cred,
        apiToken: '***masked***'
      }))

    return NextResponse.json({
      success: true,
      credentials: userCredentials
    })
  } catch (error) {
    console.error('[API] Failed to get credentials:', error)
    return NextResponse.json(
      { error: 'Failed to get credentials' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, baseUrl, email, apiToken, projectKey, userId = 'current-user' } = body

    if (!name || !baseUrl || !email || !apiToken) {
      return NextResponse.json(
        { error: 'Missing required fields: name, baseUrl, email, apiToken' },
        { status: 400 }
      )
    }

    const credential: JiraCredentials = {
      id: uuidv4(),
      name,
      baseUrl: baseUrl.replace(/\/$/, ''), // Remove trailing slash
      email,
      apiToken,
      projectKey: projectKey || undefined,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    credentials.set(credential.id, credential)

    console.log(`[API] Created Jira credential ${credential.id} for user ${userId}`)

    // Return credential without sensitive data
    const safeCredential = {
      ...credential,
      apiToken: '***masked***'
    }

    return NextResponse.json({
      success: true,
      credential: safeCredential
    })
  } catch (error) {
    console.error('[API] Failed to create credential:', error)
    return NextResponse.json(
      { error: 'Failed to create credential' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, baseUrl, email, apiToken, projectKey, userId = 'current-user' } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Credential ID is required' },
        { status: 400 }
      )
    }

    const existingCredential = credentials.get(id)
    if (!existingCredential || existingCredential.userId !== userId) {
      return NextResponse.json(
        { error: 'Credential not found' },
        { status: 404 }
      )
    }

    const updatedCredential: JiraCredentials = {
      ...existingCredential,
      name: name || existingCredential.name,
      baseUrl: baseUrl ? baseUrl.replace(/\/$/, '') : existingCredential.baseUrl,
      email: email || existingCredential.email,
      apiToken: apiToken || existingCredential.apiToken,
      projectKey: projectKey !== undefined ? projectKey : existingCredential.projectKey,
      updatedAt: new Date().toISOString()
    }

    credentials.set(id, updatedCredential)

    console.log(`[API] Updated Jira credential ${id}`)

    // Return credential without sensitive data
    const safeCredential = {
      ...updatedCredential,
      apiToken: '***masked***'
    }

    return NextResponse.json({
      success: true,
      credential: safeCredential
    })
  } catch (error) {
    console.error('[API] Failed to update credential:', error)
    return NextResponse.json(
      { error: 'Failed to update credential' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const credentialId = searchParams.get('id')
    const userId = searchParams.get('userId') || 'current-user'

    if (!credentialId) {
      return NextResponse.json(
        { error: 'Credential ID is required' },
        { status: 400 }
      )
    }

    const credential = credentials.get(credentialId)
    if (!credential || credential.userId !== userId) {
      return NextResponse.json(
        { error: 'Credential not found' },
        { status: 404 }
      )
    }

    credentials.delete(credentialId)

    console.log(`[API] Deleted Jira credential ${credentialId}`)

    return NextResponse.json({
      success: true,
      message: 'Credential deleted successfully'
    })
  } catch (error) {
    console.error('[API] Failed to delete credential:', error)
    return NextResponse.json(
      { error: 'Failed to delete credential' },
      { status: 500 }
    )
  }
}