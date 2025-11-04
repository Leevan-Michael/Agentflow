// Gmail Authentication and API Integration
import { google } from 'googleapis'

export interface GmailCredentials {
  id: string
  name: string
  email: string
  accessToken: string
  refreshToken: string
  clientId: string
  clientSecret: string
  createdAt: string
  updatedAt: string
  isValid: boolean
}

export interface GmailAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

export class GmailAuthManager {
  private oauth2Client: any
  private config: GmailAuthConfig

  constructor(config: GmailAuthConfig) {
    this.config = config
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    )
  }

  // Generate OAuth URL for user authorization
  generateAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.config.scopes,
      prompt: 'consent'
    })
  }

  // Exchange authorization code for tokens
  async getTokensFromCode(code: string): Promise<{
    access_token: string
    refresh_token: string
    expiry_date: number
  }> {
    const { tokens } = await this.oauth2Client.getToken(code)
    return tokens
  }

  // Refresh access token using refresh token
  async refreshAccessToken(refreshToken: string): Promise<string> {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken
    })

    const { credentials } = await this.oauth2Client.refreshAccessToken()
    return credentials.access_token
  }

  // Validate credentials by making a test API call
  async validateCredentials(credentials: GmailCredentials): Promise<boolean> {
    try {
      this.oauth2Client.setCredentials({
        access_token: credentials.accessToken,
        refresh_token: credentials.refreshToken
      })

      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })
      await gmail.users.getProfile({ userId: 'me' })
      return true
    } catch (error) {
      console.error('Gmail credentials validation failed:', error)
      return false
    }
  }

  // Get user profile information
  async getUserProfile(credentials: GmailCredentials): Promise<{
    email: string
    messagesTotal: number
    threadsTotal: number
  }> {
    this.oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken
    })

    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })
    const profile = await gmail.users.getProfile({ userId: 'me' })

    return {
      email: profile.data.emailAddress || '',
      messagesTotal: profile.data.messagesTotal || 0,
      threadsTotal: profile.data.threadsTotal || 0
    }
  }

  // Get Gmail labels
  async getLabels(credentials: GmailCredentials): Promise<Array<{
    id: string
    name: string
    type: string
  }>> {
    this.oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken
    })

    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })
    const response = await gmail.users.labels.list({ userId: 'me' })

    return response.data.labels?.map(label => ({
      id: label.id || '',
      name: label.name || '',
      type: label.type || 'user'
    })) || []
  }

  // Search emails based on query
  async searchEmails(
    credentials: GmailCredentials,
    query: string,
    maxResults: number = 10
  ): Promise<any[]> {
    this.oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken
    })

    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })
    
    // Search for messages
    const searchResponse = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults
    })

    if (!searchResponse.data.messages) {
      return []
    }

    // Get full message details
    const messages = await Promise.all(
      searchResponse.data.messages.map(async (message) => {
        const messageResponse = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'full'
        })
        return messageResponse.data
      })
    )

    return messages
  }

  // Mark email as read
  async markAsRead(credentials: GmailCredentials, messageId: string): Promise<void> {
    this.oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken
    })

    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD']
      }
    })
  }
}

// Default Gmail scopes
export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify'
]

// Gmail query builders
export class GmailQueryBuilder {
  private query: string[] = []

  // Add sender filter
  from(email: string): this {
    this.query.push(`from:${email}`)
    return this
  }

  // Add recipient filter
  to(email: string): this {
    this.query.push(`to:${email}`)
    return this
  }

  // Add subject filter
  subject(text: string): this {
    this.query.push(`subject:"${text}"`)
    return this
  }

  // Add label filter
  label(labelName: string): this {
    this.query.push(`label:${labelName}`)
    return this
  }

  // Add has attachment filter
  hasAttachment(): this {
    this.query.push('has:attachment')
    return this
  }

  // Add unread filter
  isUnread(): this {
    this.query.push('is:unread')
    return this
  }

  // Add date filter
  after(date: string): this {
    this.query.push(`after:${date}`)
    return this
  }

  before(date: string): this {
    this.query.push(`before:${date}`)
    return this
  }

  // Add size filter
  larger(size: string): this {
    this.query.push(`larger:${size}`)
    return this
  }

  smaller(size: string): this {
    this.query.push(`smaller:${size}`)
    return this
  }

  // Build final query string
  build(): string {
    return this.query.join(' ')
  }

  // Reset query
  reset(): this {
    this.query = []
    return this
  }
}