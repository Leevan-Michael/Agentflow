import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { credentials, query, maxResults = 1, accessToken, refreshToken } = body

    // Support both old and new credential formats
    const token = accessToken || credentials?.accessToken
    const refresh = refreshToken || credentials?.refreshToken

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Gmail access token required'
      }, { status: 400 })
    }

    // Mock Gmail API test
    // In production, this would use the Gmail API to test the query
    console.log('Testing Gmail connection with token:', token.substring(0, 20) + '...')
    console.log('Testing Gmail query:', query)
    console.log('Max results:', maxResults)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock test results based on query complexity
    const mockResults = {
      simple: {
        success: true,
        emailCount: Math.floor(Math.random() * 50) + 1,
        sampleEmails: [
          {
            id: '18c2f1234567890a',
            subject: 'Support Request: Login Issue',
            from: 'user@example.com',
            date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            snippet: 'I am having trouble logging into my account...'
          }
        ]
      },
      complex: {
        success: true,
        emailCount: Math.floor(Math.random() * 20) + 1,
        sampleEmails: [
          {
            id: '18c2f1234567890b',
            subject: 'Bug Report: Dashboard not loading',
            from: 'support@company.com',
            date: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            snippet: 'The dashboard page is showing a blank screen...'
          }
        ]
      },
      noResults: {
        success: true,
        emailCount: 0,
        sampleEmails: []
      }
    }

    // Determine result type based on query
    let resultType = 'simple'
    if (!query || query.trim() === '') {
      resultType = 'simple'
    } else if (query.includes('has:attachment') || query.includes('larger:') || query.includes('from:')) {
      resultType = 'complex'
    } else if (query.includes('nonexistent') || query.includes('impossible')) {
      resultType = 'noResults'
    }

    const result = mockResults[resultType as keyof typeof mockResults]

    return NextResponse.json(result)

  } catch (error) {
    console.error('Gmail test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Gmail connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'POST method required'
  }, { status: 405 })
}