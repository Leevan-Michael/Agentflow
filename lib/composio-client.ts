// Composio API client for managing app integrations
export interface ComposioApp {
  id: string
  name: string
  description: string
  logo: string
  category: string
  requiresConfig?: boolean
}

export interface ComposioConnection {
  id: string
  appId: string
  status: "active" | "pending" | "error"
  connectedAt?: string
  entityId: string
}

const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY || ""
const COMPOSIO_BASE_URL = "https://backend.composio.dev/api/v1"
const API_TIMEOUT = 10000 // 10 seconds

export class ComposioClient {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || COMPOSIO_API_KEY
  }

  private isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0
  }

  private async parseResponse(response: Response) {
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      return await response.json()
    }
    // If not JSON, return the text as an error message
    const text = await response.text()
    throw new Error(text || "Unknown error occurred")
  }

  // Initiate OAuth connection for an app
  async initiateConnection(appId: string, entityId: string, redirectUrl?: string) {
    if (!this.isConfigured()) {
      throw new Error("Composio API key is not configured")
    }

    try {
      const response = await fetch(`${COMPOSIO_BASE_URL}/connectedAccounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
        },
        body: JSON.stringify({
          integrationId: appId,
          entityId,
          redirectUrl: redirectUrl || `${window.location.origin}/dashboard/integrations/callback`,
        }),
      })

      if (!response.ok) {
        const errorData = await this.parseResponse(response).catch(() => ({ error: "Failed to initiate connection" }))
        throw new Error(errorData.error || "Failed to initiate connection")
      }

      const data = await this.parseResponse(response)
      return {
        connectionId: data.connectionRequest?.id,
        redirectUrl: data.redirectUrl,
      }
    } catch (error) {
      console.error("Error initiating connection:", error)
      throw error
    }
  }

  // Get all connections for an entity
  async getConnections(entityId: string): Promise<ComposioConnection[]> {
    if (!this.isConfigured()) {
      console.log("[v0] Composio API key is not configured. Returning empty connections list.")
      return []
    }

    try {
      console.log("[v0] Fetching connections for entity:", entityId)
      const response = await this.fetchWithTimeout(`${COMPOSIO_BASE_URL}/connectedAccounts?entityId=${entityId}`, {
        headers: {
          "X-API-Key": this.apiKey,
        },
      })

      console.log("[v0] Composio API response status:", response.status)

      if (!response.ok) {
        const errorData = await this.parseResponse(response).catch((err) => {
          console.error("[v0] Failed to parse error response:", err.message)
          return { error: "Failed to fetch connections" }
        })
        console.error("[v0] Composio API error:", errorData)
        return []
      }

      const data = await this.parseResponse(response)
      console.log("[v0] Composio connections fetched:", data.items?.length || 0)
      return data.items || []
    } catch (error) {
      if (error instanceof Error) {
        console.error("[v0] Error fetching connections:", error.message)
      } else {
        console.error("[v0] Unknown error fetching connections:", error)
      }
      return []
    }
  }

  // Delete a connection
  async deleteConnection(connectionId: string) {
    if (!this.isConfigured()) {
      throw new Error("Composio API key is not configured")
    }

    try {
      const response = await fetch(`${COMPOSIO_BASE_URL}/connectedAccounts/${connectionId}`, {
        method: "DELETE",
        headers: {
          "X-API-Key": this.apiKey,
        },
      })

      if (!response.ok) {
        const errorData = await this.parseResponse(response).catch(() => ({ error: "Failed to delete connection" }))
        throw new Error(errorData.error || "Failed to delete connection")
      }

      return true
    } catch (error) {
      console.error("Error deleting connection:", error)
      throw error
    }
  }

  // Wait for connection to become active
  async waitForConnection(connectionId: string, maxAttempts = 30): Promise<boolean> {
    if (!this.isConfigured()) {
      throw new Error("Composio API key is not configured")
    }

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`${COMPOSIO_BASE_URL}/connectedAccounts/${connectionId}`, {
          headers: {
            "X-API-Key": this.apiKey,
          },
        })

        if (!response.ok) {
          const errorData = await this.parseResponse(response).catch(() => ({
            error: "Failed to check connection status",
          }))
          throw new Error(errorData.error || "Failed to check connection status")
        }

        const data = await this.parseResponse(response)
        if (data.status === "ACTIVE") {
          return true
        }

        // Wait 2 seconds before next attempt
        await new Promise((resolve) => setTimeout(resolve, 2000))
      } catch (error) {
        console.error("Error checking connection status:", error)
      }
    }

    return false
  }

  async getActionsForApp(appId: string): Promise<any[]> {
    if (!this.isConfigured()) {
      console.log("[v0] Composio API key is not configured. Returning empty actions list.")
      return []
    }

    try {
      console.log("[v0] Fetching actions for app:", appId)
      const response = await this.fetchWithTimeout(`${COMPOSIO_BASE_URL}/actions?appName=${appId}`, {
        headers: {
          "X-API-Key": this.apiKey,
        },
      })

      if (!response.ok) {
        const errorData = await this.parseResponse(response).catch((err) => {
          console.error("[v0] Failed to parse error response:", err.message)
          return { error: "Failed to fetch actions" }
        })
        console.error("[v0] Composio API error:", errorData)
        return []
      }

      const data = await this.parseResponse(response)
      console.log("[v0] Actions fetched for app:", data.items?.length || 0)
      return data.items || []
    } catch (error) {
      if (error instanceof Error) {
        console.error("[v0] Error fetching actions:", error.message)
      } else {
        console.error("[v0] Unknown error fetching actions:", error)
      }
      return []
    }
  }

  async getAllActions(): Promise<any[]> {
    if (!this.isConfigured()) {
      console.log("[v0] Composio API key is not configured. Returning empty actions list.")
      return []
    }

    try {
      console.log("[v0] Fetching all actions")
      const response = await this.fetchWithTimeout(`${COMPOSIO_BASE_URL}/actions`, {
        headers: {
          "X-API-Key": this.apiKey,
        },
      })

      if (!response.ok) {
        const errorData = await this.parseResponse(response).catch((err) => {
          console.error("[v0] Failed to parse error response:", err.message)
          return { error: "Failed to fetch actions" }
        })
        console.error("[v0] Composio API error:", errorData)
        return []
      }

      const data = await this.parseResponse(response)
      console.log("[v0] All actions fetched:", data.items?.length || 0)
      return data.items || []
    } catch (error) {
      if (error instanceof Error) {
        console.error("[v0] Error fetching all actions:", error.message)
      } else {
        console.error("[v0] Unknown error fetching all actions:", error)
      }
      return []
    }
  }

  private async fetchWithTimeout(url: string, options: RequestInit, timeout = API_TIMEOUT): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      console.log("[v0] Making request to:", url)
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.error("[v0] Request timeout - the API took too long to respond")
          throw new Error("Request timeout - the API took too long to respond")
        }
        console.error("[v0] Fetch error:", error.message)
        throw error
      }
      throw new Error("Unknown fetch error")
    }
  }
}

// Available apps for integration
export const AVAILABLE_APPS: ComposioApp[] = [
  {
    id: "slack",
    name: "Slack",
    description: "Team communication and collaboration platform",
    logo: "/integrations/slack.svg",
    category: "Communication",
  },
  {
    id: "microsoft-teams",
    name: "Microsoft Teams",
    description: "Chat, meetings, and collaboration in Microsoft 365",
    logo: "/integrations/teams.svg",
    category: "Communication",
  },
  {
    id: "jira",
    name: "Jira",
    description: "Project management and issue tracking for agile teams",
    logo: "/integrations/jira.svg",
    category: "Project Management",
  },
  {
    id: "confluence",
    name: "Confluence",
    description: "Collaborative workspace that connects teams with the content they need",
    logo: "/integrations/confluence.svg",
    category: "Documentation",
  },
  {
    id: "airtable",
    name: "Airtable",
    description: "Database solution combining spreadsheet simplicity with powerful database capabilities",
    logo: "/integrations/airtable.svg",
    category: "Database",
    requiresConfig: true,
  },
  {
    id: "notion",
    name: "Notion",
    description: "All-in-one workspace for notes, docs, wikis, and project management",
    logo: "/integrations/notion.svg",
    category: "Productivity",
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Email service by Google with powerful search and organization",
    logo: "/integrations/gmail.svg",
    category: "Email",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Time management and scheduling calendar service",
    logo: "/integrations/google-calendar.svg",
    category: "Calendar",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Cloud storage and file synchronization service",
    logo: "/integrations/google-drive.svg",
    category: "Storage",
  },
  {
    id: "outlook",
    name: "Outlook",
    description: "Email and calendar service by Microsoft",
    logo: "/integrations/outlook.svg",
    category: "Email",
  },
  {
    id: "office-365",
    name: "Office 365",
    description: "Cloud-based suite of productivity apps and services",
    logo: "/integrations/office365.svg",
    category: "Productivity",
  },
  {
    id: "sharepoint",
    name: "SharePoint",
    description: "Document management and collaboration platform",
    logo: "/integrations/sharepoint.svg",
    category: "Storage",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Customer relationship management (CRM) platform",
    logo: "/integrations/salesforce.svg",
    category: "CRM",
    requiresConfig: true,
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Marketing, sales, and service software platform",
    logo: "/integrations/hubspot.svg",
    category: "CRM",
    requiresConfig: true,
  },
  {
    id: "zendesk",
    name: "Zendesk",
    description: "Customer service and support ticketing system",
    logo: "/integrations/zendesk.svg",
    category: "Support",
    requiresConfig: true,
  },
]
