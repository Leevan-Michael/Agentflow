import { NextRequest, NextResponse } from 'next/server'
import { GmailAuthManager, GMAIL_SCOPES } from '@/lib/gmail-auth'

export async function POST(request: NextRequest) {
  try {
    const credentials = await request.json()

    if (!credentials.accessToken || !credentials.refreshToken || !credentials.clientId || !credentials.clientSecret) {
      return NextResponse.json({
        success: false,
        error: 'Access token, refresh token, client ID, and client secret are required'
      }, { status: 400 })
    }

    const authManager = new GmailAuthManager({
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      redirectUri: 'urn:ietf:wg:oauth:2.0:oob',
      scopes: GMAIL_SCOPES
    })

    // Test credentials validity
    const isValid = await authManager.validateCredentials(credentials)
    
    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials or expired tokens'
      }, { status: 401 })
    }

    // Get user profile
    const profile = await authManager.getUserProfile(credentials)

    // Get available labels
    const labels = await authManager.getLabels(credentials)

    return NextResponse.json({
      success: true,
      profile,
      labels: labels.slice(0, 10), // Return first 10 labels
      message: 'Credentials validated successfully'
    })

  } catch (error) {
    console.error('❌ Gmail credentials test error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to test Gmail credentials',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}