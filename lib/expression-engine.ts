// Expression Engine - n8n-style expression evaluation
import { WorkflowNode } from '@/components/workflow/workflow-canvas'

export interface ExpressionContext {
  $node: Record<string, any>
  $json: any
  $binary: Record<string, any>
  $env: Record<string, string>
  $now: Date
  $today: Date
  $workflow: {
    id: string
    name: string
    active: boolean
  }
  $execution: {
    id: string
    mode: string
    resumeUrl?: string
  }
  $vars: Record<string, any>
}

export class ExpressionEngine {
  private context: ExpressionContext
  private nodes: WorkflowNode[]
  private currentNodeIndex: number

  constructor(nodes: WorkflowNode[], currentNodeIndex: number = 0) {
    this.nodes = nodes
    this.currentNodeIndex = currentNodeIndex
    this.context = this.buildContext()
  }

  private buildContext(): ExpressionContext {
    const nodeData: Record<string, any> = {}
    
    // Build node data context
    this.nodes.forEach((node, index) => {
      if (index < this.currentNodeIndex) {
        nodeData[node.name] = {
          json: this.getMockNodeOutput(node),
          binary: {},
          parameter: node.parameters
        }
      }
    })

    return {
      $node: nodeData,
      $json: this.getCurrentNodeJson(),
      $binary: {},
      $env: process.env as Record<string, string>,
      $now: new Date(),
      $today: new Date(new Date().setHours(0, 0, 0, 0)),
      $workflow: {
        id: 'workflow-1',
        name: 'Current Workflow',
        active: true
      },
      $execution: {
        id: `exec-${Date.now()}`,
        mode: 'manual'
      },
      $vars: {}
    }
  }

  private getCurrentNodeJson(): any {
    if (this.currentNodeIndex > 0) {
      const previousNode = this.nodes[this.currentNodeIndex - 1]
      return this.getMockNodeOutput(previousNode)
    }
    return {}
  }

  private getMockNodeOutput(node: WorkflowNode): any {
    // Generate mock output based on node type
    switch (node.type) {
      case 'webhook':
        return {
          headers: { 'content-type': 'application/json' },
          body: { message: 'Hello from webhook' },
          query: { param1: 'value1' }
        }
      case 'http':
        return {
          statusCode: 200,
          body: { success: true, data: 'API response' },
          headers: { 'content-type': 'application/json' }
        }
      case 'gmail-trigger':
        return {
          subject: 'Test Email Subject',
          sender: 'test@example.com',
          body: 'Email body content',
          attachments: []
        }
      case 'jira':
        return {
          key: 'PROJ-123',
          summary: 'Test Issue',
          status: 'Open',
          assignee: 'user@example.com'
        }
      default:
        return { result: 'success', data: 'Node output' }
    }
  }

  // Evaluate expression string
  evaluateExpression(expression: string): any {
    try {
      // Handle different expression formats
      if (expression.startsWith('{{') && expression.endsWith('}}')) {
        // n8n style expressions: {{ $node.NodeName.json.field }}
        return this.evaluateN8nExpression(expression)
      } else if (expression.startsWith('=')) {
        // Formula style: =1+1
        return this.evaluateFormula(expression.substring(1))
      } else {
        // Plain string
        return expression
      }
    } catch (error) {
      console.error('Expression evaluation error:', error)
      return `[Expression Error: ${error}]`
    }
  }

  private evaluateN8nExpression(expression: string): any {
    // Remove {{ and }}
    const cleanExpression = expression.slice(2, -2).trim()
    
    // Replace n8n variables with context access
    let jsExpression = cleanExpression
      .replace(/\$node\["([^"]+)"\]\.json/g, 'context.$node["$1"].json')
      .replace(/\$node\.([^.\s]+)\.json/g, 'context.$node["$1"].json')
      .replace(/\$json/g, 'context.$json')
      .replace(/\$now/g, 'context.$now')
      .replace(/\$today/g, 'context.$today')
      .replace(/\$env\.([^.\s]+)/g, 'context.$env["$1"]')
      .replace(/\$workflow/g, 'context.$workflow')
      .replace(/\$execution/g, 'context.$execution')

    // Create safe evaluation function
    const evalFunction = new Function('context', `
      try {
        return ${jsExpression};
      } catch (error) {
        throw new Error('Invalid expression: ' + error.message);
      }
    `)

    return evalFunction(this.context)
  }

  private evaluateFormula(formula: string): any {
    // Simple formula evaluation (can be extended)
    try {
      // Replace context variables
      let jsFormula = formula
        .replace(/\$node\["([^"]+)"\]\.json\.([^.\s]+)/g, 'this.getNodeValue("$1", "$2")')
        .replace(/\$json\.([^.\s]+)/g, 'this.context.$json["$1"]')

      // Create safe evaluation context
      const evalContext = {
        getNodeValue: (nodeName: string, field: string) => {
          return this.context.$node[nodeName]?.json?.[field]
        },
        context: this.context,
        // Math functions
        Math,
        // Date functions
        Date,
        // String functions
        String,
        Number,
        Boolean,
        Array,
        Object
      }

      const evalFunction = new Function(...Object.keys(evalContext), `return ${jsFormula}`)
      return evalFunction(...Object.values(evalContext))
    } catch (error) {
      throw new Error(`Formula error: ${error}`)
    }
  }

  // Built-in functions library
  static functions = {
    // String functions
    upper: (str: string) => str.toUpperCase(),
    lower: (str: string) => str.toLowerCase(),
    trim: (str: string) => str.trim(),
    length: (str: string) => str.length,
    substring: (str: string, start: number, end?: number) => str.substring(start, end),
    replace: (str: string, search: string, replace: string) => str.replace(search, replace),
    
    // Date functions
    now: () => new Date(),
    today: () => new Date(new Date().setHours(0, 0, 0, 0)),
    formatDate: (date: Date, format: string) => {
      // Simple date formatting
      return date.toISOString().split('T')[0]
    },
    
    // Math functions
    round: (num: number, decimals: number = 0) => Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals),
    floor: Math.floor,
    ceil: Math.ceil,
    abs: Math.abs,
    min: Math.min,
    max: Math.max,
    
    // Array functions
    first: (arr: any[]) => arr[0],
    last: (arr: any[]) => arr[arr.length - 1],
    length: (arr: any[]) => arr.length,
    join: (arr: any[], separator: string = ',') => arr.join(separator),
    
    // Object functions
    keys: Object.keys,
    values: Object.values,
    
    // Utility functions
    isEmpty: (value: any) => {
      if (value === null || value === undefined) return true
      if (typeof value === 'string') return value.trim() === ''
      if (Array.isArray(value)) return value.length === 0
      if (typeof value === 'object') return Object.keys(value).length === 0
      return false
    },
    
    isNull: (value: any) => value === null || value === undefined,
    
    // Type conversion
    toString: (value: any) => String(value),
    toNumber: (value: any) => Number(value),
    toBoolean: (value: any) => Boolean(value),
    
    // JSON functions
    parseJson: (str: string) => JSON.parse(str),
    toJson: (obj: any) => JSON.stringify(obj, null, 2)
  }

  // Get available variables for autocomplete
  getAvailableVariables(): string[] {
    const variables: string[] = []
    
    // Add node variables
    Object.keys(this.context.$node).forEach(nodeName => {
      variables.push(`$node["${nodeName}"].json`)
      variables.push(`$node.${nodeName}.json`)
    })
    
    // Add global variables
    variables.push('$json', '$now', '$today', '$workflow', '$execution')
    
    // Add environment variables
    Object.keys(this.context.$env).forEach(envVar => {
      variables.push(`$env.${envVar}`)
    })
    
    return variables
  }

  // Get available functions for autocomplete
  getAvailableFunctions(): string[] {
    return Object.keys(ExpressionEngine.functions)
  }

  // Validate expression syntax
  validateExpression(expression: string): { valid: boolean; error?: string } {
    try {
      this.evaluateExpression(expression)
      return { valid: true }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}

// Expression utilities
export class ExpressionUtils {
  // Extract all expressions from a string
  static extractExpressions(text: string): string[] {
    const expressions: string[] = []
    const regex = /\{\{([^}]+)\}\}/g
    let match

    while ((match = regex.exec(text)) !== null) {
      expressions.push(match[0])
    }

    return expressions
  }

  // Check if string contains expressions
  static hasExpressions(text: string): boolean {
    return /\{\{[^}]+\}\}/.test(text)
  }

  // Replace all expressions in text
  static replaceExpressions(text: string, engine: ExpressionEngine): string {
    return text.replace(/\{\{([^}]+)\}\}/g, (match) => {
      try {
        const result = engine.evaluateExpression(match)
        return String(result)
      } catch (error) {
        return `[Error: ${error}]`
      }
    })
  }

  // Get expression suggestions based on context
  static getExpressionSuggestions(partial: string, engine: ExpressionEngine): string[] {
    const suggestions: string[] = []
    const variables = engine.getAvailableVariables()
    const functions = engine.getAvailableFunctions()

    // Filter variables that match partial input
    variables.forEach(variable => {
      if (variable.toLowerCase().includes(partial.toLowerCase())) {
        suggestions.push(variable)
      }
    })

    // Filter functions that match partial input
    functions.forEach(func => {
      if (func.toLowerCase().includes(partial.toLowerCase())) {
        suggestions.push(`${func}()`)
      }
    })

    return suggestions.slice(0, 10) // Limit to 10 suggestions
  }
}