import { NextRequest, NextResponse } from 'next/server'
import { GmailAuthManager, GMAIL_SCOPES } from '@/lib/gmail-auth'

export async function POST(request: NextRequest) {
  try {
    const { code, clientId, clientSecret } = await request.json()

    if (!code || !clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        error: 'Authorization code, Client ID, and Client Secret are required'
      }, { status: 400 })
    }

    const authManager = new GmailAuthManager({
      clientId,
      clientSecret,
      redirectUri: 'urn:ietf:wg:oauth:2.0:oob',
      scopes: GMAIL_SCOPES
    })

    const tokens = await authManager.getTokensFromCode(code)

    return NextResponse.json({
      success: true,
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date
      }
    })

  } catch (error) {
    console.error('❌ Gmail token exchange error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to exchange authorization code for tokens',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}