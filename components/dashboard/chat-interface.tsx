"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ImageModelSelector } from "./image-model-selector"
import { FileTypeIcon } from "./file-type-icon"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useSearchParams } from "next/navigation"
import { saveChat, getChatById, generateChatTitle, type Chat } from "@/lib/chat-storage"
import { PromptSelector } from "./prompt-selector"
import { MentionMenu } from "./mention-menu"

interface Source {
  domain: string
  title: string
  snippet: string
  url: string
  favicon?: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: Date
}

interface AttachedFile {
  name: string
  size: string
  type: string
  content?: string
  uploading?: boolean
}

const mockSources: Source[] = [
  {
    domain: "linkedin.com",
    title: "Kroolo",
    snippet:
      "...integration with the most popular productivity tools. Bid farewell to duplicate entries and data loss, as Kroolo ensures a smooth, consolidated user experience. 📊 Intuitive...",
    url: "https://linkedin.com/company/kroolo",
  },
  {
    domain: "kroolo.com",
    title: "Kroolo vs Glean - Which One To Choose & Why?",
    snippet:
      "Kroolo Product Positioning & Core Strengths It also offers capacity planning, workload balancing, automated triggers/automations, AI dashboards",
    url: "https://kroolo.com/vs/glean",
  },
  {
    domain: "kroolo.com",
    title: "AI Personalization: 5 Use Cases, Benefits, & Challenges",
    snippet:
      "...### 🌟 Unified Data Integration: To provide a single source of truth, Kroolo unifies inputs from several sources, including calendars, CRM, email, and project management software. I...",
    url: "https://kroolo.com/blog/ai-personalization",
  },
  {
    domain: "kroolo.com",
    title: "About Us",
    snippet:
      "Every team member's unique strengths come together to create something special—where work is not just about getting things done, but about growing, learning, and makin...",
    url: "https://kroolo.com/about",
  },
  {
    domain: "kroolo.com",
    title: "7 Key Features of the Best Task Management Software",
    snippet:
      "One of the standout ways Kroolo prevents adoption failure is through its frictionless onboarding experience. New users can get up and running in minutes with pre-built templates,...",
    url: "https://kroolo.com/blog/task-management-software",
  },
  {
    domain: "kroolo.com",
    title: "Kroolo: AI Powered Productivity Management Software",
    snippet:
      "Kroolo is your one-stop-shop to securely deploy AI, and bring tools in a common-sense way to work faster, smarter, and more cost-effective way. ### Work Management #### Goa...",
    url: "https://kroolo.com",
  },
  {
    domain: "softwaresuggest.com",
    title: "Kroolo Reviews and Pricing 2025",
    snippet:
      "Read verified Kroolo reviews from the IT community. Get detailed information about features, pricing, and user reviews.",
    url: "https://softwaresuggest.com/kroolo",
  },
]

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n")
  const elements: React.ReactNode[] = []
  let key = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Headers
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="text-base font-semibold mt-3 mb-2">
          {line.substring(4)}
        </h3>,
      )
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="text-lg font-bold mt-4 mb-2">
          {line.substring(3)}
        </h2>,
      )
    } else if (line.startsWith("# ")) {
      elements.push(
        <h1 key={key++} className="text-xl font-bold mt-4 mb-2">
          {line.substring(2)}
        </h1>,
      )
    }
    // Lists
    else if (line.match(/^\d+\.\s/)) {
      const items: string[] = [line]
      while (i + 1 < lines.length && lines[i + 1].match(/^\d+\.\s/)) {
        items.push(lines[++i])
      }
      elements.push(
        <ol key={key++} className="list-decimal pl-5 mb-3 space-y-1">
          {items.map((item, idx) => (
            <li key={idx} className="text-foreground">
              {formatInlineMarkdown(item.replace(/^\d+\.\s/, ""))}
            </li>
          ))}
        </ol>,
      )
    } else if (line.match(/^[-*]\s/)) {
      const items: string[] = [line]
      while (i + 1 < lines.length && lines[i + 1].match(/^[-*]\s/)) {
        items.push(lines[++i])
      }
      elements.push(
        <ul key={key++} className="pl-5 mb-3 space-y-1">
          {items.map((item, idx) => (
            <li key={idx} className="text-foreground flex gap-2">
              <span className="text-muted-foreground select-none">•</span>
              <span className="flex-1">{formatInlineMarkdown(item.replace(/^[-*]\s/, ""))}</span>
            </li>
          ))}
        </ul>,
      )
    }
    // Code blocks
    else if (line.startsWith("```")) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(
        <pre key={key++} className="bg-muted p-3 rounded-lg overflow-x-auto mb-3">
          <code className="text-sm font-mono">{codeLines.join("\n")}</code>
        </pre>,
      )
    }
    // Horizontal rule
    else if (line.match(/^---+$/)) {
      elements.push(<hr key={key++} className="my-4 border-border" />)
    }
    // Empty line
    else if (line.trim() === "") {
      elements.push(<div key={key++} className="h-2" />)
    }
    // Regular paragraph
    else {
      elements.push(
        <p key={key++} className="mb-3">
          {formatInlineMarkdown(line)}
        </p>,
      )
    }
  }

  return <div className="text-sm text-foreground leading-relaxed">{elements}</div>
}

function formatInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Bold **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(remaining.substring(0, boldMatch.index))
      }
      parts.push(
        <strong key={key++} className="font-semibold">
          {boldMatch[1]}
        </strong>,
      )
      remaining = remaining.substring(boldMatch.index + boldMatch[0].length)
      continue
    }

    // Italic *text*
    const italicMatch = remaining.match(/\*(.+?)\*/)
    if (italicMatch && italicMatch.index !== undefined) {
      if (italicMatch.index > 0) {
        parts.push(remaining.substring(0, italicMatch.index))
      }
      parts.push(
        <em key={key++} className="italic">
          {italicMatch[1]}
        </em>,
      )
      remaining = remaining.substring(italicMatch.index + italicMatch.index.length)
      continue
    }

    // Inline code `code`
    const codeMatch = remaining.match(/`(.+?)`/)
    if (codeMatch && codeMatch.index !== undefined) {
      if (codeMatch.index > 0) {
        parts.push(remaining.substring(0, codeMatch.index))
      }
      parts.push(
        <code key={key++} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
          {codeMatch[1]}
        </code>,
      )
      remaining = remaining.substring(codeMatch.index + codeMatch[0].length)
      continue
    }

    // Links [text](url)
    const linkMatch = remaining.match(/\[([^\]]+)\]$$([^)]+)$$/)
    if (linkMatch && linkMatch.index !== undefined) {
      if (linkMatch.index > 0) {
        parts.push(remaining.substring(0, linkMatch.index))
      }
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {linkMatch[1]}
        </a>,
      )
      remaining = remaining.substring(linkMatch.index + linkMatch[0].length)
      continue
    }

    // No more matches, add remaining text
    parts.push(remaining)
    break
  }

  return <>{parts}</>
}

export function ChatInterface() {
  const searchParams = useSearchParams()
  const chatId = searchParams?.get("chat")

  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId)
  const [currentModel, setCurrentModel] = useState("Claude Sonnet 4")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showPromptSelector, setShowPromptSelector] = useState(false)
  const [showMentionMenu, setShowMentionMenu] = useState(false)
  const [mentionSearchQuery, setMentionSearchQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (chatId) {
      const existingChat = getChatById(chatId)
      if (existingChat) {
        setCurrentChatId(chatId)
        setCurrentModel(existingChat.model)
        setMessages(
          existingChat.messages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.timestamp,
          })),
        )
      }
    }
  }, [chatId])

  useEffect(() => {
    if (messages.length === 0) return

    const chatToSave: Chat = {
      id: currentChatId || `chat-${Date.now()}`,
      title: currentChatId
        ? getChatById(currentChatId)?.title || generateChatTitle(messages[0]?.content || "New chat")
        : generateChatTitle(messages[0]?.content || "New chat"),
      model: currentModel,
      createdAt: currentChatId ? getChatById(currentChatId)?.createdAt || new Date() : new Date(),
      updatedAt: new Date(),
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt,
      })),
    }

    saveChat(chatToSave)

    if (!currentChatId) {
      setCurrentChatId(chatToSave.id)
      window.history.replaceState(null, "", `/dashboard?chat=${chatToSave.id}`)
    }
  }, [messages, currentChatId, currentModel])

  const [showFileMenu, setShowFileMenu] = useState(false)
  const [showIntegrationPopover, setShowIntegrationPopover] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const [showImageModelSelector, setShowImageModelSelector] = useState(false)
  const [selectedImageModel, setSelectedImageModel] = useState("imagen-4")

  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [deepResearchEnabled, setDeepResearchEnabled] = useState(false)
  const [canvasEnabled, setCanvasEnabled] = useState(false)
  const [imageEnabled, setImageEnabled] = useState(false)

  const [showSourcesPanel, setShowSourcesPanel] = useState(false)
  const [selectedSources, setSelectedSources] = useState<any[]>([])

  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)

    const cursorPosition = e.target.selectionStart || 0
    const textBeforeCursor = value.substring(0, cursorPosition)
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")

    if (lastAtIndex !== -1) {
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : " "
      if (charBeforeAt === " " || lastAtIndex === 0) {
        const searchText = textBeforeCursor.substring(lastAtIndex + 1)
        setMentionSearchQuery(searchText)
        setShowMentionMenu(true)
      } else {
        setShowMentionMenu(false)
      }
    } else {
      setShowMentionMenu(false)
    }
  }

  const handleMentionSelect = (item: any, category: string) => {
    const lastAtIndex = input.lastIndexOf("@")
    if (lastAtIndex !== -1) {
      const beforeAt = input.substring(0, lastAtIndex)
      const afterAt = input.substring(lastAtIndex).split(" ").slice(1).join(" ")
      const newInput = `${beforeAt}@${item.name} ${afterAt}`.trim()
      setInput(newInput)
    }
    setShowMentionMenu(false)
    setMentionSearchQuery("")
    inputRef.current?.focus()
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      createdAt: new Date(),
    }

    console.log("[v0] Submitting message:", userMessage.content)
    setMessages((prev) => [...prev, userMessage])
    console.log("[v0] Messages after adding user message:", messages.length + 1)
    setInput("")
    setIsLoading(true)
    setError(null)

    const toolFlags = {
      webSearch: webSearchEnabled,
      deepResearch: deepResearchEnabled,
      canvas: canvasEnabled,
      imageGeneration: imageEnabled,
      imageModel: selectedImageModel,
    }

    const filesData = attachedFiles.map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
      content: file.content,
    }))

    setWebSearchEnabled(false)
    setDeepResearchEnabled(false)
    setCanvasEnabled(false)
    setImageEnabled(false)
    const currentFiles = [...attachedFiles]
    setAttachedFiles([])

    const assistantMessageId = `msg-${Date.now()}-assistant`

    try {
      console.log("[v0] Sending chat request with tools:", toolFlags)

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          tools: toolFlags,
          files: filesData.length > 0 ? filesData : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""
      let messageAdded = false

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          assistantContent += chunk

          console.log("[v0] Received chunk, total length:", assistantContent.length)

          if (!messageAdded && assistantContent.trim()) {
            const assistantMessage: Message = {
              id: assistantMessageId,
              role: "assistant",
              content: assistantContent,
              createdAt: new Date(),
            }
            console.log("[v0] Adding assistant message to state")
            setMessages((prev) => [...prev, assistantMessage])
            messageAdded = true
          } else if (messageAdded) {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantMessageId ? { ...m, content: assistantContent } : m)),
            )
          }
        }
      }

      console.log("[v0] Chat completed successfully, final content length:", assistantContent.length)
      console.log("[v0] Total messages in state:", messages.length + 2)
    } catch (err) {
      console.error("[v0] Chat error:", err)
      setError(err instanceof Error ? err.message : "Failed to send message")
      setMessages((prev) => prev.filter((m) => !(m.role === "assistant" && m.content === "")))
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles: AttachedFile[] = []

    for (const file of Array.from(files)) {
      const fileData: AttachedFile = {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        type: file.type,
        uploading: true,
      }

      newFiles.push(fileData)

      try {
        if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
          const text = await file.text()
          fileData.content = text
        } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          // For PDFs, read as text (basic extraction)
          const text = await file.text()
          fileData.content = `PDF Content:\n${text}`
        } else if (file.type.includes("word") || file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
          // For Word docs, read as text
          const text = await file.text()
          fileData.content = `Document Content:\n${text}`
        } else if (file.type.includes("spreadsheet") || file.name.endsWith(".xlsx") || file.name.endsWith(".csv")) {
          const text = await file.text()
          fileData.content = `Spreadsheet Content:\n${text}`
        } else {
          // For other files, try to read as text
          try {
            const text = await file.text()
            fileData.content = text
          } catch {
            fileData.content = `[Binary file: ${file.name} - ${fileData.size}]`
          }
        }
      } catch (error) {
        console.error("[v0] Error reading file:", error)
        fileData.content = `[Could not read file: ${file.name}]`
      }

      fileData.uploading = false
    }

    setAttachedFiles([...attachedFiles, ...newFiles])
    setShowFileMenu(false)
  }

  const handleCloudFileSelect = (provider: string) => {
    const mockFile = {
      name: `Document from ${provider}.pdf`,
      size: "2.4 MB",
      type: "application/pdf",
      source: provider,
      uploading: true,
    }
    setAttachedFiles([...attachedFiles, mockFile])
    setShowIntegrationPopover(false)
    setShowFileMenu(false)

    setTimeout(() => {
      setAttachedFiles((prev) => prev.map((file) => ({ ...file, uploading: false })))
    }, 2000)
  }

  const removeFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index))
  }

  const handleWebSearchToggle = () => {
    setWebSearchEnabled(!webSearchEnabled)
    if (!webSearchEnabled) {
      setDeepResearchEnabled(false)
      setCanvasEnabled(false)
      setImageEnabled(false)
    }
  }

  const handleDeepResearchToggle = () => {
    setDeepResearchEnabled(!deepResearchEnabled)
    if (!deepResearchEnabled) {
      setWebSearchEnabled(false)
      setCanvasEnabled(false)
      setImageEnabled(false)
    }
  }

  const handleCanvasToggle = () => {
    setCanvasEnabled(!canvasEnabled)
    if (!canvasEnabled) {
      setWebSearchEnabled(false)
      setDeepResearchEnabled(false)
      setImageEnabled(false)
    }
  }

  const handleImageToggle = () => {
    setImageEnabled(!imageEnabled)
    if (!imageEnabled) {
      setWebSearchEnabled(false)
      setDeepResearchEnabled(false)
      setCanvasEnabled(false)
      setShowImageModelSelector(true)
    }
  }

  const handleSelectPrompt = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  const hasText = input.trim().length > 0

  const getMessageContent = (message: any): string => {
    if (typeof message.content === "string") {
      return message.content
    }

    if (Array.isArray(message.content)) {
      return message.content
        .filter((part: any) => part.type === "text")
        .map((part: any) => part.text || part.content)
        .join("")
    }

    return ""
  }

  return (
    <div className="flex h-full flex-col font-sans">
      {error && (
        <div className="bg-destructive/10 border-destructive/20 border px-4 py-3 text-sm text-destructive">
          <strong>Error:</strong> {error}
        </div>
      )}

      {messages.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <Logo size="lg" showText />
            </div>
            <p className="mt-4 text-muted-foreground">Ask anything and get started</p>
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.map((message) => {
              const content = getMessageContent(message)

              return (
                <div key={message.id} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8">
                    {message.role === "user" ? (
                      <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-muted-foreground"
                        >
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-gradient-ai-primary flex items-center justify-center">
                        <Logo size="sm" className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Message content */}
                  <div className="flex-1 min-w-0 space-y-3 pt-0.5">
                    {message.role === "user" ? (
                      <div
                        className="relative inline-block"
                        onMouseEnter={() => setHoveredMessageId(message.id)}
                        onMouseLeave={() => setHoveredMessageId(null)}
                      >
                        <div className="inline-block rounded-2xl bg-muted px-4 py-2.5 text-sm text-foreground">
                          {content}
                        </div>

                        {hoveredMessageId === message.id && (
                          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                            <button
                              className="flex items-center gap-1.5 text-xs hover:text-foreground transition-colors"
                              title="Timestamp"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                              </svg>
                              <span>
                                {new Date(message.createdAt).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {!content.trim() && isLoading ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <svg
                              className="animate-spin h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                            <span>Thinking...</span>
                          </div>
                        ) : (
                          renderMarkdown(content)
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="border-t border-border bg-background p-4">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleFormSubmit}>
            <div className="relative rounded-2xl border border-border bg-background shadow-sm">
              {attachedFiles.length > 0 && (
                <div className="border-b border-border px-5 py-3">
                  <div className="flex flex-wrap gap-2">
                    {attachedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5"
                      >
                        {file.uploading ? (
                          <svg
                            className="animate-spin text-muted-foreground"
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                        ) : (
                          <FileTypeIcon fileName={file.name} className="h-10 w-10 flex-shrink-0" />
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm text-foreground font-medium">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {file.uploading ? "Uploading..." : "Document"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="ml-2 rounded-full bg-muted-foreground/10 p-1.5 hover:bg-muted-foreground/20 transition-colors"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-muted-foreground"
                          >
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask anything or tag with @"
                  disabled={isLoading}
                  className="w-full rounded-t-2xl border-0 bg-transparent px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 disabled:opacity-50"
                />

                <MentionMenu
                  isOpen={showMentionMenu}
                  onClose={() => {
                    setShowMentionMenu(false)
                    setMentionSearchQuery("")
                  }}
                  onSelect={handleMentionSelect}
                  searchQuery={mentionSearchQuery}
                />
              </div>

              <div className="flex items-center justify-between border-t border-border px-3 py-2.5">
                <div className="flex items-center gap-1">
                  <div className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFileMenu(!showFileMenu)}
                      className="h-8 w-8 p-0 hover:bg-muted/50 text-muted-foreground hover:text-foreground flex items-center justify-center"
                      title="Attach file"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                      </svg>
                    </Button>

                    {showFileMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => {
                            setShowFileMenu(false)
                            setShowIntegrationPopover(false)
                          }}
                        />
                        <div className="absolute bottom-full left-0 mb-2 z-50 w-48 rounded-lg border border-border bg-background shadow-lg">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowIntegrationPopover(!showIntegrationPopover)}
                              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted/50 rounded-t-lg transition-colors"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                              </svg>
                              <span>Select file</span>
                              <svg
                                className="ml-auto"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </button>

                            {showIntegrationPopover && (
                              <div className="absolute left-full top-0 ml-2 w-80 rounded-lg border border-border bg-background shadow-xl">
                                <div className="border-b border-border px-4 py-3">
                                  <h3 className="text-sm font-semibold text-foreground">Connect integration</h3>
                                </div>
                                <div className="p-3 space-y-2">
                                  <button
                                    type="button"
                                    onClick={() => handleCloudFileSelect("Google Drive")}
                                    className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 hover:bg-muted/30 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 flex items-center justify-center">
                                        <svg width="20" height="20" viewBox="0 0 87.3 78" fill="none">
                                          <path
                                            d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
                                            fill="#0066da"
                                          />
                                          <path
                                            d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z"
                                            fill="#00ac47"
                                          />
                                          <path
                                            d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
                                            fill="#ea4335"
                                          />
                                          <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2z" fill="#00832d" />
                                          <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2z" fill="#2684fc" />
                                          <path
                                            d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"
                                            fill="#ffba00"
                                          />
                                        </svg>
                                      </div>
                                      <span className="text-sm font-medium text-foreground">Google Drive</span>
                                    </div>
                                    <span className="text-sm text-blue-600 font-medium">Connect</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleCloudFileSelect("OneDrive")}
                                    className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 hover:bg-muted/30 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 flex items-center justify-center">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                          <path d="M13.5 3L3 9v6l10.5 6L24 15V9l-10.5-6z" fill="#0364B8" />
                                          <path d="M3 9l10.5 6V21L3 15V9z" fill="#0078D4" />
                                          <path d="M13.5 15L24 9v6l-10.5 6v-6z" fill="#1490DF" />
                                          <path d="M13.5 3v12L3 9l10.5-6z" fill="#28A8EA" />
                                        </svg>
                                      </div>
                                      <span className="text-sm font-medium text-foreground">OneDrive</span>
                                    </div>
                                    <span className="text-sm text-blue-600 font-medium">Connect</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleCloudFileSelect("Dropbox")}
                                    className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 hover:bg-muted/30 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 flex items-center justify-center">
                                        <svg width="20" height="20" viewBox="0 0 235 200" fill="none">
                                          <path d="M58.86 0L0 37.5 58.86 75l58.86-37.5L58.86 0z" fill="#0061FF" />
                                          <path
                                            d="M176.14 0L117.72 37.5l58.86 37.5L235 37.5 176.14 0z"
                                            fill="#0061FF"
                                          />
                                          <path d="M0 112.5L58.86 150l58.86-37.5-58.86-37.5z" fill="#0061FF" />
                                          <path
                                            d="M176.14 75l-58.86 37.5 58.86 37.5L235 112.5 176.14 75z"
                                            fill="#0061FF"
                                          />
                                          <path d="M58.86 162.5L117.72 200l58.86-37.5-58.86-37.5z" fill="#0061FF" />
                                        </svg>
                                      </div>
                                      <span className="text-sm font-medium text-foreground">Dropbox</span>
                                    </div>
                                    <span className="text-sm text-blue-600 font-medium">Connect</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          <label className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted/50 rounded-b-lg transition-colors cursor-pointer">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                            </svg>
                            <span>Upload file</span>
                            <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                          </label>
                        </div>
                      </>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleWebSearchToggle}
                    className={cn(
                      "h-8 gap-2 px-3 text-xs font-normal transition-colors",
                      webSearchEnabled
                        ? "bg-muted text-foreground hover:bg-muted/80"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12a10 10 0 0 1 18 0M12 2a10 10 0 0 1 10 10M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    </svg>
                    <span>Web search</span>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDeepResearchToggle}
                    className={cn(
                      "h-8 gap-2 px-3 text-xs font-normal transition-colors",
                      deepResearchEnabled
                        ? "bg-muted text-foreground hover:bg-muted/80"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    <span>Deep research</span>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCanvasToggle}
                    className={cn(
                      "h-8 gap-2 px-3 text-xs font-normal transition-colors",
                      canvasEnabled
                        ? "bg-muted text-foreground hover:bg-muted/80"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <span>Canvas</span>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleImageToggle}
                    className={cn(
                      "h-8 gap-2 px-3 text-xs font-normal transition-colors",
                      imageEnabled
                        ? "bg-muted text-foreground hover:bg-muted/80"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L7 21l-4 1 1-4L21 15z" />
                    </svg>
                    <span>Image</span>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPromptSelector(true)}
                    className="h-8 gap-2 px-3 text-xs font-normal hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                    title="Browse prompt library"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 17.5a5.5 5.5 0 1 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="m5 12l7-7 7 7" />
                    </svg>
                    <span>Prompts</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 rounded-full p-0 hover:bg-muted/50 text-muted-foreground hover:text-foreground relative group flex items-center justify-center"
                    title="Voice input"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="m19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                    </svg>
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isLoading}
                    className={cn(
                      "h-9 w-9 rounded-full p-0 transition-all flex items-center justify-center",
                      hasText
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <ImageModelSelector
        selectedModel={selectedImageModel}
        onSelectModel={(model) => {
          setSelectedImageModel(model)
          setImageEnabled(true)
        }}
        isOpen={showImageModelSelector}
        onClose={() => setShowImageModelSelector(false)}
      />

      <PromptSelector
        isOpen={showPromptSelector}
        onClose={() => setShowPromptSelector(false)}
        onSelectPrompt={handleSelectPrompt}
      />

      <Sheet open={showSourcesPanel} onOpenChange={setShowSourcesPanel}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Sources</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {selectedSources.map((source, idx) => (
              <a
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5">
                    {source.domain.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">{source.domain}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-foreground mb-2 line-clamp-2">{source.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-3">{source.snippet}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
