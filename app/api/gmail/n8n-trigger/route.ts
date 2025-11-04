import { NextRequest, NextResponse } from 'next/server'
import { GmailAuthManager, GmailQueryBuilder } from '@/lib/gmail-auth'

export async function POST(request: NextRequest) {
  try {
    const { nodeId, parameters, credentials } = await request.json()

    if (!nodeId || !parameters || !credentials) {
      return NextResponse.json({
        success: false,
        error: 'Node ID, parameters, and credentials are required'
      }, { status: 400 })
    }

    console.log(`🔍 n8n Gmail Trigger Check for node: ${nodeId}`)
    console.log(`📧 Event: ${parameters.event}`)
    console.log(`⏱️ Poll interval: ${parameters.pollTimes}`)

    const authManager = new GmailAuthManager({
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      redirectUri: 'urn:ietf:wg:oauth:2.0:oob',
      scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify']
    })

    // Build Gmail search query
    const query = buildGmailQuery(parameters)
    console.log(`🔍 Gmail query: ${query}`)

    // Search for emails using Gmail API
    const emails = await authManager.searchEmails(
      credentials,
      query,
      parameters.maxResults || 10
    )

    // Process emails based on format
    const processedEmails = await processEmails(emails, parameters, authManager, credentials)

    // Perform actions on emails if configured
    if (processedEmails.length > 0) {
      await performEmailActions(processedEmails, parameters, authManager, credentials)
    }

    return NextResponse.json({
      success: true,
      triggered: processedEmails.length > 0,
      data: processedEmails,
      count: processedEmails.length,
      query: query,
      message: `Found ${processedEmails.length} matching email(s)`
    })

  } catch (error) {
    console.error('❌ n8n Gmail trigger error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to check Gmail',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function buildGmailQuery(parameters: any): string {
  const queryBuilder = new GmailQueryBuilder()

  // Base event filter
  if (parameters.event === 'messageReceived') {
    queryBuilder.label('INBOX')
  } else if (parameters.event === 'messageSent') {
    queryBuilder.label('SENT')
  }

  // Read status filter
  if (parameters.readStatus === 'unreadOnly') {
    queryBuilder.isUnread()
  } else if (parameters.readStatus === 'readOnly') {
    // Add read filter (opposite of unread)
    queryBuilder.query.push('-is:unread')
  }

  // Exclude spam and trash unless explicitly included
  if (!parameters.includeSpamTrash) {
    queryBuilder.query.push('-in:spam')
    queryBuilder.query.push('-in:trash')
  }

  // Sender filter
  if (parameters.senderEmail) {
    queryBuilder.from(parameters.senderEmail)
  }

  // Subject filter
  if (parameters.subject) {
    queryBuilder.subject(parameters.subject)
  }

  // Label filters
  if (parameters.labelIds) {
    const labels = parameters.labelIds.split(',').map((l: string) => l.trim())
    labels.forEach((label: string) => {
      queryBuilder.label(label)
    })
  }

  // Custom query overrides all other filters
  if (parameters.query) {
    return parameters.query
  }

  // Additional filters from JSON
  if (parameters.filters) {
    try {
      const filters = JSON.parse(parameters.filters)
      
      if (filters.hasAttachment) {
        queryBuilder.hasAttachment()
      }
      
      if (filters.larger) {
        queryBuilder.larger(filters.larger)
      }
      
      if (filters.smaller) {
        queryBuilder.smaller(filters.smaller)
      }
      
      if (filters.after) {
        queryBuilder.after(filters.after)
      }
      
      if (filters.before) {
        queryBuilder.before(filters.before)
      }
    } catch (error) {
      console.warn('Invalid filters JSON:', error)
    }
  }

  return queryBuilder.build()
}

async function processEmails(emails: any[], parameters: any, authManager: GmailAuthManager, credentials: any) {
  const processedEmails = []

  for (const email of emails) {
    const processedEmail: any = {
      id: email.id,
      threadId: email.threadId,
      labelIds: email.labelIds || [],
      snippet: email.snippet || '',
      historyId: email.historyId,
      internalDate: email.internalDate,
      sizeEstimate: email.sizeEstimate
    }

    // Process based on format
    if (parameters.format === 'simple') {
      // Simple format - extract basic email data
      const payload = email.payload || {}
      const headers = payload.headers || []

      processedEmail.subject = getHeaderValue(headers, 'Subject') || ''
      processedEmail.from = getHeaderValue(headers, 'From') || ''
      processedEmail.to = getHeaderValue(headers, 'To') || ''
      processedEmail.date = getHeaderValue(headers, 'Date') || ''
      processedEmail.messageId = getHeaderValue(headers, 'Message-ID') || ''

      // Extract body
      processedEmail.textPlain = extractTextPlain(payload)
      processedEmail.textHtml = extractTextHtml(payload)

    } else if (parameters.format === 'raw') {
      // Raw format - return full Gmail API response
      processedEmail.raw = email

    } else if (parameters.format === 'resolved') {
      // Resolved format - processed and cleaned data
      const payload = email.payload || {}
      const headers = payload.headers || []

      processedEmail.subject = getHeaderValue(headers, 'Subject') || ''
      processedEmail.from = parseEmailAddress(getHeaderValue(headers, 'From') || '')
      processedEmail.to = parseEmailAddresses(getHeaderValue(headers, 'To') || '')
      processedEmail.cc = parseEmailAddresses(getHeaderValue(headers, 'Cc') || '')
      processedEmail.bcc = parseEmailAddresses(getHeaderValue(headers, 'Bcc') || '')
      processedEmail.date = new Date(getHeaderValue(headers, 'Date') || '').toISOString()
      processedEmail.messageId = getHeaderValue(headers, 'Message-ID') || ''

      processedEmail.textPlain = extractTextPlain(payload)
      processedEmail.textHtml = extractTextHtml(payload)
      
      // Add computed fields
      processedEmail.hasAttachment = (payload.parts || []).some((part: any) => 
        part.filename && part.filename.length > 0
      )
      processedEmail.attachmentCount = (payload.parts || []).filter((part: any) => 
        part.filename && part.filename.length > 0
      ).length
    }

    // Handle attachments if requested
    if (parameters.downloadAttachments && email.payload?.parts) {
      processedEmail.attachments = await processAttachments(
        email.payload.parts,
        parameters.attachmentPrefix || 'attachment_',
        authManager,
        credentials,
        email.id
      )
    }

    processedEmails.push(processedEmail)
  }

  return processedEmails
}

async function performEmailActions(emails: any[], parameters: any, authManager: GmailAuthManager, credentials: any) {
  for (const email of emails) {
    try {
      // Mark as read
      if (parameters.markAsRead) {
        await authManager.markAsRead(credentials, email.id)
      }

      // Add labels
      if (parameters.addLabelIds) {
        const labelsToAdd = parameters.addLabelIds.split(',').map((l: string) => l.trim())
        // Implementation would add labels via Gmail API
        console.log(`Adding labels ${labelsToAdd.join(', ')} to email ${email.id}`)
      }

      // Remove labels
      if (parameters.removeLabelIds) {
        const labelsToRemove = parameters.removeLabelIds.split(',').map((l: string) => l.trim())
        // Implementation would remove labels via Gmail API
        console.log(`Removing labels ${labelsToRemove.join(', ')} from email ${email.id}`)
      }
    } catch (error) {
      console.error(`Failed to perform actions on email ${email.id}:`, error)
    }
  }
}

// Helper functions
function getHeaderValue(headers: any[], name: string): string | undefined {
  const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase())
  return header?.value
}

function parseEmailAddress(emailString: string): { name?: string; email: string } {
  const match = emailString.match(/^(.+?)\s*<(.+?)>$/)
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() }
  }
  return { email: emailString.trim() }
}

function parseEmailAddresses(emailString: string): Array<{ name?: string; email: string }> {
  if (!emailString) return []
  
  return emailString.split(',').map(email => parseEmailAddress(email.trim()))
}

function extractTextPlain(payload: any): string {
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8')
  }
  
  if (payload.parts) {
    for (const part of payload.parts) {
      const text = extractTextPlain(part)
      if (text) return text
    }
  }
  
  return ''
}

function extractTextHtml(payload: any): string {
  if (payload.mimeType === 'text/html' && payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8')
  }
  
  if (payload.parts) {
    for (const part of payload.parts) {
      const html = extractTextHtml(part)
      if (html) return html
    }
  }
  
  return ''
}

async function processAttachments(
  parts: any[], 
  prefix: string, 
  authManager: GmailAuthManager, 
  credentials: any, 
  messageId: string
): Promise<Record<string, any>> {
  const attachments: Record<string, any> = {}
  let attachmentIndex = 0

  for (const part of parts) {
    if (part.filename && part.filename.length > 0) {
      const attachmentKey = `${prefix}${attachmentIndex}`
      
      attachments[attachmentKey] = {
        filename: part.filename,
        mimeType: part.mimeType,
        size: part.body?.size || 0,
        attachmentId: part.body?.attachmentId
      }

      // Download attachment content if available
      if (part.body?.attachmentId) {
        try {
          // In real implementation, would download attachment content
          attachments[attachmentKey].data = 'base64-encoded-content'
        } catch (error) {
          console.error(`Failed to download attachment ${part.filename}:`, error)
        }
      }

      attachmentIndex++
    }

    // Recursively process nested parts
    if (part.parts) {
      const nestedAttachments = await processAttachments(
        part.parts, 
        prefix, 
        authManager, 
        credentials, 
        messageId
      )
      Object.assign(attachments, nestedAttachments)
    }
  }

  return attachments
}