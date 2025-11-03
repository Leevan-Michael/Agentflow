import { streamText } from "ai"
import * as fal from "@fal-ai/serverless-client"

export const maxDuration = 60

fal.config({
  credentials: process.env.FAL_KEY,
})

const SYSTEM_PROMPT = `You are AgentFlow AI, a helpful and intelligent AI assistant. You provide clear, accurate, and thoughtful responses to user queries. You can help with a wide range of tasks including research, analysis, writing, coding, and general questions.

When responding:
- Be concise and clear
- Use markdown formatting for better readability
- Break down complex topics into understandable parts
- Provide examples when helpful
- Be honest if you don't know something
- NEVER use emoji icons in your responses - use simple text and bullet points only`

async function performWebSearch(query: string): Promise<string> {
  try {
    const tavilyApiKey = process.env.TAVILY_API_KEY
    if (!tavilyApiKey) {
      return "Web search is not available (API key not configured)."
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query,
        search_depth: "basic",
        include_answer: true,
        include_raw_content: false,
        max_results: 5,
      }),
    })

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`)
    }

    const data = await response.json()

    let searchResults = `## Web Search Results for: "${query}"\n\n`

    if (data.answer) {
      searchResults += `**Summary:** ${data.answer}\n\n`
    }

    if (data.results && data.results.length > 0) {
      searchResults += `### Sources:\n\n`
      data.results.forEach((result: any, index: number) => {
        searchResults += `${index + 1}. **[${result.title}](${result.url})**\n`
        searchResults += `   ${result.content}\n\n`
      })
    }

    return searchResults
  } catch (error) {
    console.error("[v0] Web search error:", error)
    return `Web search encountered an error: ${error instanceof Error ? error.message : "Unknown error"}`
  }
}

async function performDeepResearch(query: string): Promise<string> {
  try {
    const tavilyApiKey = process.env.TAVILY_API_KEY
    if (!tavilyApiKey) {
      return "Deep research is not available (API key not configured)."
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query,
        search_depth: "advanced",
        include_answer: true,
        include_raw_content: true,
        max_results: 10,
      }),
    })

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`)
    }

    const data = await response.json()

    let researchResults = `## Deep Research Results for: "${query}"\n\n`

    if (data.answer) {
      researchResults += `### Executive Summary\n${data.answer}\n\n`
    }

    if (data.results && data.results.length > 0) {
      researchResults += `### Detailed Findings\n\n`
      data.results.forEach((result: any, index: number) => {
        researchResults += `#### ${index + 1}. ${result.title}\n`
        researchResults += `**Source:** [${result.url}](${result.url})\n\n`
        researchResults += `${result.content}\n\n`
        if (result.raw_content) {
          researchResults += `**Additional Context:** ${result.raw_content.substring(0, 300)}...\n\n`
        }
        researchResults += `---\n\n`
      })
    }

    return researchResults
  } catch (error) {
    console.error("[v0] Deep research error:", error)
    return `Deep research encountered an error: ${error instanceof Error ? error.message : "Unknown error"}`
  }
}

async function generateImage(prompt: string, model: string): Promise<string> {
  try {
    if (!process.env.FAL_KEY) {
      return `I would generate an image with the prompt: "${prompt}" using ${model}, but image generation is not configured.`
    }

    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt,
        image_size: "square_hd",
        num_inference_steps: 4,
        num_images: 1,
      },
    })

    const imageUrl = result.images?.[0]?.url

    if (!imageUrl) {
      throw new Error("No image generated")
    }

    return `## Generated Image\n\n![${prompt}](${imageUrl})\n\n**Prompt:** ${prompt}\n**Model:** ${model}`
  } catch (error) {
    console.error("[v0] Image generation error:", error)
    return `Image generation encountered an error: ${error instanceof Error ? error.message : "Unknown error"}`
  }
}

export async function POST(req: Request) {
  try {
    const { messages, tools, files } = await req.json()
    console.log("[v0] Chat request received:", { messageCount: messages?.length, tools, filesCount: files?.length })

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid messages format")
    }

    let userPrompt = messages[messages.length - 1]?.content || ""

    if (files && files.length > 0) {
      userPrompt += "\n\n## Attached Files:\n\n"
      files.forEach((file: any) => {
        userPrompt += `### File: ${file.name}\n\n`
        if (file.content) {
          userPrompt += `\`\`\`\n${file.content}\n\`\`\`\n\n`
        } else {
          userPrompt += `(File type: ${file.type}, Size: ${file.size})\n\n`
        }
      })
      userPrompt += "\nPlease analyze the above file content and respond to my question.\n"
    }

    let toolResults = ""

    if (tools?.webSearch) {
      console.log("[v0] Performing web search...")
      toolResults = await performWebSearch(userPrompt)
      userPrompt = `${toolResults}\n\nBased on the above web search results, please answer: ${userPrompt}`
    } else if (tools?.deepResearch) {
      console.log("[v0] Performing deep research...")
      toolResults = await performDeepResearch(userPrompt)
      userPrompt = `${toolResults}\n\nBased on the above research, please provide a comprehensive analysis for: ${userPrompt}`
    } else if (tools?.imageGeneration) {
      console.log("[v0] Generating image...")
      const imageResult = await generateImage(userPrompt, tools.imageModel || "Flux Schnell")
      return new Response(imageResult, {
        headers: { "Content-Type": "text/plain" },
      })
    } else if (tools?.canvas) {
      userPrompt = `[Canvas Mode] ${userPrompt}\n\nPlease provide a well-structured response with clear sections, bullet points, and formatting suitable for visual presentation.`
    }

    // Update messages with enhanced prompt
    const enhancedMessages = [...messages]
    enhancedMessages[enhancedMessages.length - 1] = {
      ...enhancedMessages[enhancedMessages.length - 1],
      content: userPrompt,
    }

    const messagesWithSystem = [{ role: "system" as const, content: SYSTEM_PROMPT }, ...enhancedMessages]

    const result = await streamText({
      model: "anthropic/claude-sonnet-4",
      messages: messagesWithSystem,
      maxTokens: 4000,
      temperature: 0.7,
    })

    console.log("[v0] Streaming response started")

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
