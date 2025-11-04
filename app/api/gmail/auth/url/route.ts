import { NextRequest, NextResponse } from 'next/server'
import { GmailAuthManager, GMAIL_SCOPES } from '@/lib/gmail-auth'

export async function POST(request: NextRequest) {
  try {
    const { clientId, clientSecret } = await request.json()

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        error: 'Client ID and Client Secret are required'
      }, { status: 400 })
    }

    const authManager = new GmailAuthManager({
      clientId,
      clientSecret,
      redirectUri: 'urn:ietf:wg:oauth:2.0:oob', // For installed applications
      scopes: GMAIL_SCOPES
    })

    const authUrl = authManager.generateAuthUrl()

    return NextResponse.json({
      success: true,
      authUrl,
      scopes: GMAIL_SCOPES
    })

  } catch (error) {
    console.error('❌ Gmail auth URL generation error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate authorization URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}