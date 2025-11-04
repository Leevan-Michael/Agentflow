// Gmail Credentials Store - Client-side credential management
"use client"

export interface GmailCredentials {
  id: string
  name: string
  email: string
  accessToken: string
  refreshToken: string
  clientId?: string
  clientSecret?: string
  expiresAt: number
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

class GmailCredentialsStore {
  private credentials: Map<string, GmailCredentials> = new Map()
  private listeners: Set<(credentials: GmailCredentials[]) => void> = new Set()

  constructor() {
    this.loadFromStorage()
  }

  // Load credentials from localStorage
  private loadFromStorage() {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('gmail-credentials')
      if (stored) {
        const credentialsArray: GmailCredentials[] = JSON.parse(stored)
        credentialsArray.forEach(cred => {
          this.credentials.set(cred.id, cred)
        })
      }
    } catch (error) {
      console.error('Failed to load Gmail credentials from storage:', error)
    }
  }

  // Save credentials to localStorage
  private saveToStorage() {
    if (typeof window === 'undefined') return

    try {
      const credentialsArray = Array.from(this.credentials.values())
      localStorage.setItem('gmail-credentials', JSON.stringify(credentialsArray))
    } catch (error) {
      console.error('Failed to save Gmail credentials to storage:', error)
    }
  }

  // Notify listeners of changes
  private notifyListeners() {
    const credentialsArray = Array.from(this.credentials.values())
    this.listeners.forEach(listener => listener(credentialsArray))
  }

  // Add or update credentials
  addCredentials(credentials: Omit<GmailCredentials, 'id' | 'createdAt' | 'updatedAt'>): GmailCredentials {
    const id = `gmail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    const newCredentials: GmailCredentials = {
      ...credentials,
      id,
      createdAt: now,
      updatedAt: now
    }

    this.credentials.set(id, newCredentials)
    this.saveToStorage()
    this.notifyListeners()
    
    return newCredentials
  }

  // Update existing credentials
  updateCredentials(id: string, updates: Partial<GmailCredentials>): GmailCredentials | null {
    const existing = this.credentials.get(id)
    if (!existing) return null

    const updated: GmailCredentials = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    }

    this.credentials.set(id, updated)
    this.saveToStorage()
    this.notifyListeners()
    
    return updated
  }

  // Get credentials by ID
  getCredentials(id: string): GmailCredentials | null {
    return this.credentials.get(id) || null
  }

  // Get all credentials
  getAllCredentials(): GmailCredentials[] {
    return Array.from(this.credentials.values())
  }

  // Get valid (non-expired) credentials
  getValidCredentials(): GmailCredentials[] {
    const now = Date.now()
    return Array.from(this.credentials.values()).filter(cred => 
      cred.isValid && cred.expiresAt > now
    )
  }

  // Delete credentials
  deleteCredentials(id: string): boolean {
    const deleted = this.credentials.delete(id)
    if (deleted) {
      this.saveToStorage()
      this.notifyListeners()
    }
    return deleted
  }

  // Check if credentials are expired
  isExpired(credentials: GmailCredentials): boolean {
    return Date.now() > credentials.expiresAt
  }

  // Subscribe to credential changes
  subscribe(listener: (credentials: GmailCredentials[]) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  // Test credentials validity
  async testCredentials(credentials: GmailCredentials): Promise<boolean> {
    try {
      const response = await fetch('/api/gmail/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: credentials.accessToken,
          refreshToken: credentials.refreshToken
        })
      })

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error('Failed to test Gmail credentials:', error)
      return false
    }
  }

  // Refresh access token
  async refreshAccessToken(credentials: GmailCredentials): Promise<GmailCredentials | null> {
    try {
      const response = await fetch('/api/gmail/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: credentials.refreshToken,
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret
        })
      })

      const result = await response.json()
      if (result.success) {
        const updated = this.updateCredentials(credentials.id, {
          accessToken: result.accessToken,
          expiresAt: Date.now() + (result.expiresIn * 1000),
          isValid: true
        })
        return updated
      }
      
      return null
    } catch (error) {
      console.error('Failed to refresh Gmail access token:', error)
      return null
    }
  }

  // Clear all credentials
  clearAll() {
    this.credentials.clear()
    this.saveToStorage()
    this.notifyListeners()
  }
}

// Global instance
export const gmailCredentialsStore = new GmailCredentialsStore()

// Helper functions
export const createMockCredentials = (): GmailCredentials => {
  return gmailCredentialsStore.addCredentials({
    name: 'Demo Gmail Account',
    email: 'demo@gmail.com',
    accessToken: 'mock-access-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
    clientId: 'mock-client-id',
    clientSecret: 'mock-client-secret',
    expiresAt: Date.now() + (3600 * 1000), // 1 hour from now
    isValid: true
  })
}

export const getDefaultCredentials = (): GmailCredentials | null => {
  const validCredentials = gmailCredentialsStore.getValidCredentials()
  return validCredentials.length > 0 ? validCredentials[0] : null
}