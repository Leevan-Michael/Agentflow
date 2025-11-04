import { NodeConfiguration } from '../node-configurations'

export const httpNodeConfig: NodeConfiguration = {
  id: 'http',
  name: 'HTTP Request',
  description: 'Make HTTP requests to APIs and web services',
  category: 'Actions',
  icon: '🌐',
  color: 'bg-green-500',
  parameters: [
    {
      id: 'url',
      name: 'URL',
      type: 'url',
      required: true,
      placeholder: 'https://api.example.com/endpoint',
      description: 'The URL to send the request to'
    },
    {
      id: 'method',
      name: 'Method',
      type: 'select',
      required: true,
      default: 'GET',
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' },
        { label: 'PATCH', value: 'PATCH' }
      ],
      description: 'HTTP method to use'
    },
    {
      id: 'headers',
      name: 'Headers',
      type: 'json',
      required: false,
      default: '{"Content-Type": "application/json"}',
      description: 'HTTP headers as JSON object'
    },
    {
      id: 'body',
      name: 'Request Body',
      type: 'textarea',
      required: false,
      placeholder: '{"key": "value"}',
      description: 'Request body (for POST, PUT, PATCH)'
    },
    {
      id: 'timeout',
      name: 'Timeout (seconds)',
      type: 'number',
      required: false,
      default: 30,
      validation: { min: 1, max: 300 },
      description: 'Request timeout in seconds'
    }
  ],
  inputs: [
    { id: 'trigger', name: 'Trigger', type: 'trigger', required: true }
  ],
  outputs: [
    { id: 'response', name: 'Response', type: 'data' },
    { id: 'statusCode', name: 'Status Code', type: 'data' },
    { id: 'headers', name: 'Response Headers', type: 'data' }
  ]
}

export const emailNodeConfig: NodeConfiguration = {
  id: 'email',
  name: 'Send Email',
  description: 'Send emails via SMTP or email service providers',
  category: 'Actions',
  icon: '📧',
  color: 'bg-red-500',
  parameters: [
    {
      id: 'to',
      name: 'To',
      type: 'string',
      required: true,
      placeholder: 'recipient@example.com',
      description: 'Recipient email address (comma-separated for multiple)'
    },
    {
      id: 'cc',
      name: 'CC',
      type: 'string',
      required: false,
      placeholder: 'cc@example.com',
      description: 'CC email addresses (comma-separated)'
    },
    {
      id: 'bcc',
      name: 'BCC',
      type: 'string',
      required: false,
      placeholder: 'bcc@example.com',
      description: 'BCC email addresses (comma-separated)'
    },
    {
      id: 'subject',
      name: 'Subject',
      type: 'string',
      required: true,
      placeholder: 'Email subject',
      description: 'Email subject line'
    },
    {
      id: 'body',
      name: 'Body',
      type: 'textarea',
      required: true,
      placeholder: 'Email content...',
      description: 'Email body content'
    },
    {
      id: 'isHtml',
      name: 'HTML Format',
      type: 'boolean',
      required: false,
      default: false,
      description: 'Send email as HTML instead of plain text'
    },
    {
      id: 'priority',
      name: 'Priority',
      type: 'select',
      required: false,
      default: 'normal',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' }
      ],
      description: 'Email priority level'
    }
  ],
  credentials: {
    required: true,
    types: ['smtp', 'gmail', 'outlook']
  },
  inputs: [
    { id: 'trigger', name: 'Trigger', type: 'trigger', required: true }
  ],
  outputs: [
    { id: 'success', name: 'Success', type: 'data' },
    { id: 'messageId', name: 'Message ID', type: 'data' }
  ]
}