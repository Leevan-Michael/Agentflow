import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { nodeId, parameters, credentials } = await request.json()

    if (!nodeId || !parameters) {
      return NextResponse.json({
        success: false,
        error: 'Node ID and parameters are required'
      }, { status: 400 })
    }

    // Mock Gmail API integration
    console.log(`🔍 Gmail Trigger Check for node: ${nodeId}`)
    console.log(`📧 Trigger type: ${parameters.triggerOn}`)
    console.log(`⏱️ Poll interval: ${parameters.pollInterval} minutes`)

    // Simulate checking Gmail for new emails
    const mockEmails = generateMockEmails(parameters)
    
    // Filter emails based on trigger criteria
    const matchingEmails = filterEmailsByCriteria(mockEmails, parameters)

    if (matchingEmails.length > 0) {
      console.log(`✅ Found ${matchingEmails.length} matching email(s)`)
      
      return NextResponse.json({
        success: true,
        triggered: true,
        emails: matchingEmails,
        message: `Found ${matchingEmails.length} matching email(s)`
      })
    } else {
      console.log(`📭 No matching emails found`)
      
      return NextResponse.json({
        success: true,
        triggered: false,
        emails: [],
        message: 'No matching emails found'
      })
    }

  } catch (error) {
    console.error('❌ Gmail trigger error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to check Gmail',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const nodeId = searchParams.get('nodeId')

  if (!nodeId) {
    return NextResponse.json({
      success: false,
      error: 'Node ID is required'
    }, { status: 400 })
  }

  // Return trigger status
  return NextResponse.json({
    success: true,
    status: {
      nodeId,
      isActive: true,
      lastCheck: new Date().toISOString(),
      nextCheck: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
      emailsProcessed: Math.floor(Math.random() * 10),
      lastTrigger: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    }
  })
}

// Helper function to generate mock emails for testing
function generateMockEmails(parameters: any) {
  const mockSenders = [
    'john.doe@example.com',
    'support@company.com',
    'notifications@service.com',
    'team@startup.com',
    'admin@platform.com'
  ]

  const mockSubjects = [
    'Important: Action Required',
    'Weekly Report Available',
    'New Support Ticket #12345',
    'Invoice #INV-2024-001',
    'Meeting Reminder: Tomorrow 2PM',
    'System Maintenance Notice',
    'Welcome to our platform!',
    'Password Reset Request'
  ]

  const mockLabels = ['Important', 'Work', 'Personal', 'Notifications', 'Invoices']

  const emails = []
  const emailCount = Math.floor(Math.random() * 5) + 1 // 1-5 emails

  for (let i = 0; i < emailCount; i++) {
    emails.push({
      id: `email-${Date.now()}-${i}`,
      subject: mockSubjects[Math.floor(Math.random() * mockSubjects.length)],
      sender: mockSenders[Math.floor(Math.random() * mockSenders.length)],
      body: `This is a mock email body for testing purposes. Email ${i + 1} of ${emailCount}.`,
      receivedAt: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
      labels: [mockLabels[Math.floor(Math.random() * mockLabels.length)]],
      hasAttachment: Math.random() > 0.7,
      isRead: Math.random() > 0.5,
      attachments: Math.random() > 0.7 ? [
        {
          filename: 'document.pdf',
          size: 1024 * 1024,
          mimeType: 'application/pdf'
        }
      ] : []
    })
  }

  return emails
}

// Helper function to filter emails based on trigger criteria
function filterEmailsByCriteria(emails: any[], parameters: any) {
  return emails.filter(email => {
    // Apply base filters
    if (parameters.onlyUnread !== false && email.isRead) return false
    if (parameters.excludeSpam !== false && email.labels.includes('SPAM')) return false
    if (parameters.excludeTrash !== false && email.labels.includes('TRASH')) return false

    // Apply trigger-specific filters
    switch (parameters.triggerOn) {
      case 'newEmail':
        return true // All emails match for "new email" trigger

      case 'labeledEmail':
        if (!parameters.labelName) return false
        return email.labels.some((label: string) => 
          label.toLowerCase().includes(parameters.labelName.toLowerCase())
        )

      case 'senderEmail':
        if (!parameters.senderEmail) return false
        return email.sender.toLowerCase().includes(parameters.senderEmail.toLowerCase())

      case 'recipientEmail':
        if (!parameters.recipientEmail) return false
        return email.recipient?.toLowerCase().includes(parameters.recipientEmail.toLowerCase())

      case 'senderDomain':
        if (!parameters.senderDomain) return false
        const senderDomain = email.sender.split('@')[1]?.toLowerCase()
        return senderDomain === parameters.senderDomain.toLowerCase()

      case 'subjectContains':
        if (!parameters.subjectKeywords) return false
        const subjectKeywords = parameters.subjectKeywords.split(',').map((k: string) => k.trim().toLowerCase())
        return subjectKeywords.some((keyword: string) => 
          email.subject.toLowerCase().includes(keyword)
        )

      case 'bodyContains':
        if (!parameters.bodyKeywords) return false
        const bodyKeywords = parameters.bodyKeywords.split(',').map((k: string) => k.trim().toLowerCase())
        return bodyKeywords.some((keyword: string) => 
          email.body.toLowerCase().includes(keyword)
        )

      case 'hasAttachment':
        return email.hasAttachment

      case 'attachmentType':
        if (!email.hasAttachment) return false
        if (!parameters.attachmentType || parameters.attachmentType === 'any') return true
        
        const typeMap: Record<string, string[]> = {
          pdf: ['pdf'],
          image: ['jpg', 'jpeg', 'png', 'gif'],
          excel: ['xls', 'xlsx'],
          word: ['doc', 'docx'],
          zip: ['zip', 'rar']
        }
        
        const allowedExtensions = typeMap[parameters.attachmentType] || []
        return email.attachments.some((att: any) => 
          allowedExtensions.some(ext => att.filename.toLowerCase().endsWith(`.${ext}`))
        )

      case 'emailSize':
        if (!parameters.emailSizeCondition || !parameters.emailSizeValue) return false
        const sizeValue = parseSizeValue(parameters.emailSizeValue)
        const emailSize = email.size || 0
        
        return parameters.emailSizeCondition === 'larger' 
          ? emailSize > sizeValue 
          : emailSize < sizeValue

      case 'customQuery':
        // For custom queries, we'd need to implement Gmail query parsing
        // For now, return true as the query would be handled by Gmail API directly
        return true

      default:
        return false
    }
  })
}

// Helper function to parse size values like "1M", "500K", "10MB"
function parseSizeValue(sizeStr: string): number {
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*([KMGT]?B?)$/i)
  if (!match) return 0

  const value = parseFloat(match[1])
  const unit = match[2].toUpperCase()

  const multipliers: Record<string, number> = {
    '': 1,
    'B': 1,
    'K': 1024,
    'KB': 1024,
    'M': 1024 * 1024,
    'MB': 1024 * 1024,
    'G': 1024 * 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'T': 1024 * 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024
  }

  return value * (multipliers[unit] || 1)
}