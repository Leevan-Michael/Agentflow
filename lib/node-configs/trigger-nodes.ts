import { NodeConfiguration } from '../node-configurations'

export const webhookNodeConfig: NodeConfiguration = {
  id: 'webhook',
  name: 'Webhook',
  description: 'Trigger workflows via HTTP requests',
  category: 'Triggers',
  icon: '🌐',
  color: 'bg-blue-500',
  parameters: [
    {
      id: 'path',
      name: 'Webhook Path',
      type: 'string',
      required: true,
      default: '/webhook/trigger',
      placeholder: '/webhook/my-trigger',
      description: 'The URL path for this webhook endpoint'
    },
    {
      id: 'method',
      name: 'HTTP Method',
      type: 'select',
      required: true,
      default: 'POST',
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' },
        { label: 'PATCH', value: 'PATCH' }
      ],
      description: 'HTTP method that will trigger this webhook'
    },
    {
      id: 'authentication',
      name: 'Authentication',
      type: 'select',
      required: false,
      default: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'API Key', value: 'apikey' },
        { label: 'Basic Auth', value: 'basic' },
        { label: 'Bearer Token', value: 'bearer' }
      ],
      description: 'Authentication method for webhook security'
    }
  ],
  inputs: [],
  outputs: [
    { id: 'trigger', name: 'Trigger', type: 'trigger' },
    { id: 'body', name: 'Request Body', type: 'data' },
    { id: 'headers', name: 'Headers', type: 'data' },
    { id: 'query', name: 'Query Parameters', type: 'data' }
  ]
}

export const scheduleNodeConfig: NodeConfiguration = {
  id: 'schedule',
  name: 'Schedule',
  description: 'Run workflows on a schedule using cron expressions',
  category: 'Triggers',
  icon: '⏰',
  color: 'bg-purple-500',
  parameters: [
    {
      id: 'cronExpression',
      name: 'Cron Expression',
      type: 'string',
      required: true,
      default: '0 9 * * 1-5',
      placeholder: '0 9 * * 1-5',
      description: 'Cron expression defining when to run (e.g., "0 9 * * 1-5" = 9 AM weekdays)'
    },
    {
      id: 'timezone',
      name: 'Timezone',
      type: 'select',
      required: true,
      default: 'UTC',
      options: [
        { label: 'UTC', value: 'UTC' },
        { label: 'America/New_York', value: 'America/New_York' },
        { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
        { label: 'Europe/London', value: 'Europe/London' },
        { label: 'Europe/Berlin', value: 'Europe/Berlin' },
        { label: 'Asia/Tokyo', value: 'Asia/Tokyo' }
      ],
      description: 'Timezone for schedule execution'
    },
    {
      id: 'enabled',
      name: 'Enabled',
      type: 'boolean',
      required: false,
      default: true,
      description: 'Whether this schedule is active'
    }
  ],
  inputs: [],
  outputs: [
    { id: 'trigger', name: 'Trigger', type: 'trigger' },
    { id: 'timestamp', name: 'Execution Time', type: 'data' }
  ]
}

export const gmailTriggerNodeConfig: NodeConfiguration = {
  id: 'gmail-trigger',
  name: 'Gmail Trigger',
  description: 'Trigger workflows when new emails are received in Gmail',
  category: 'Triggers',
  icon: '📬',
  color: 'bg-red-500',
  parameters: [
    {
      id: 'event',
      name: 'Event',
      type: 'select',
      required: true,
      default: 'messageReceived',
      options: [
        { label: 'Message Received', value: 'messageReceived' },
        { label: 'Message Sent', value: 'messageSent' }
      ],
      description: 'The event that should trigger the workflow'
    },
    {
      id: 'pollTimes',
      name: 'Poll Times',
      type: 'select',
      required: true,
      default: 'everyMinute',
      options: [
        { label: 'Every Minute', value: 'everyMinute' },
        { label: 'Every 2 Minutes', value: 'every2Minutes' },
        { label: 'Every 5 Minutes', value: 'every5Minutes' },
        { label: 'Every 10 Minutes', value: 'every10Minutes' },
        { label: 'Every 30 Minutes', value: 'every30Minutes' },
        { label: 'Every Hour', value: 'everyHour' }
      ],
      description: 'How often to check for new emails'
    },
    {
      id: 'filters',
      name: 'Filters',
      type: 'json',
      required: false,
      default: '{}',
      description: 'Additional filters to apply to emails (JSON format)'
    },
    {
      id: 'format',
      name: 'Format',
      type: 'select',
      required: true,
      default: 'simple',
      options: [
        { label: 'Simple', value: 'simple' },
        { label: 'Raw', value: 'raw' },
        { label: 'Resolved', value: 'resolved' }
      ],
      description: 'The format in which the email data should be returned'
    },
    {
      id: 'downloadAttachments',
      name: 'Download Attachments',
      type: 'boolean',
      required: false,
      default: false,
      description: 'Whether to download email attachments'
    },
    {
      id: 'readStatus',
      name: 'Read Status',
      type: 'select',
      required: false,
      default: 'unreadOnly',
      options: [
        { label: 'Unread Only', value: 'unreadOnly' },
        { label: 'Read Only', value: 'readOnly' },
        { label: 'Both', value: 'both' }
      ],
      description: 'Filter emails by read status'
    },
    {
      id: 'includeSpamTrash',
      name: 'Include Spam and Trash',
      type: 'boolean',
      required: false,
      default: false,
      description: 'Whether to include emails from spam and trash folders'
    },
    {
      id: 'labelIds',
      name: 'Label IDs',
      type: 'string',
      required: false,
      placeholder: 'INBOX,IMPORTANT',
      description: 'Comma-separated list of label IDs to filter by'
    },
    {
      id: 'senderEmail',
      name: 'Sender Email',
      type: 'email',
      required: false,
      placeholder: 'sender@example.com',
      description: 'Filter emails from specific sender'
    },
    {
      id: 'subject',
      name: 'Subject',
      type: 'string',
      required: false,
      placeholder: 'Subject contains...',
      description: 'Filter emails by subject content'
    },
    {
      id: 'query',
      name: 'Search Query',
      type: 'string',
      required: false,
      placeholder: 'from:example@gmail.com has:attachment',
      description: 'Gmail search query (uses Gmail search syntax)'
    },
    {
      id: 'maxResults',
      name: 'Max Results',
      type: 'number',
      required: false,
      default: 10,
      validation: { min: 1, max: 100 },
      description: 'Maximum number of emails to return per execution'
    },
    {
      id: 'attachmentPrefix',
      name: 'Attachment Prefix',
      type: 'string',
      required: false,
      default: 'attachment_',
      description: 'Prefix for attachment property names'
    },
    {
      id: 'markAsRead',
      name: 'Mark as Read',
      type: 'boolean',
      required: false,
      default: false,
      description: 'Mark processed emails as read'
    },
    {
      id: 'addLabelIds',
      name: 'Add Label IDs',
      type: 'string',
      required: false,
      placeholder: 'PROCESSED,AUTOMATED',
      description: 'Comma-separated list of label IDs to add to processed emails'
    },
    {
      id: 'removeLabelIds',
      name: 'Remove Label IDs',
      type: 'string',
      required: false,
      placeholder: 'UNREAD,INBOX',
      description: 'Comma-separated list of label IDs to remove from processed emails'
    },
    {
      id: 'labelName',
      name: 'Label Name',
      type: 'string',
      required: false,
      placeholder: 'Important, Work, etc.',
      description: 'Gmail label name to watch for'
    },
    {
      id: 'senderEmail',
      name: 'Sender Email',
      type: 'email',
      required: false,
      placeholder: 'sender@example.com',
      description: 'Email address to watch for'
    },
    {
      id: 'recipientEmail',
      name: 'Recipient Email',
      type: 'email',
      required: false,
      placeholder: 'recipient@example.com',
      description: 'Recipient email address to watch for'
    },
    {
      id: 'senderDomain',
      name: 'Sender Domain',
      type: 'string',
      required: false,
      placeholder: 'company.com',
      description: 'Domain to watch for (e.g., company.com)'
    },
    {
      id: 'subjectKeywords',
      name: 'Subject Keywords',
      type: 'string',
      required: false,
      placeholder: 'urgent, invoice, support',
      description: 'Keywords to look for in email subject (comma-separated)'
    },
    {
      id: 'bodyKeywords',
      name: 'Body Keywords',
      type: 'string',
      required: false,
      placeholder: 'action required, deadline, important',
      description: 'Keywords to look for in email body (comma-separated)'
    },
    {
      id: 'attachmentType',
      name: 'Attachment Type',
      type: 'select',
      required: false,
      options: [
        { label: 'PDF Documents', value: 'pdf' },
        { label: 'Images (JPG, PNG)', value: 'image' },
        { label: 'Excel Files', value: 'excel' },
        { label: 'Word Documents', value: 'word' },
        { label: 'ZIP Archives', value: 'zip' },
        { label: 'Any Attachment', value: 'any' }
      ],
      description: 'Type of attachment to look for'
    },
    {
      id: 'emailSizeCondition',
      name: 'Size Condition',
      type: 'select',
      required: false,
      options: [
        { label: 'Larger than', value: 'larger' },
        { label: 'Smaller than', value: 'smaller' }
      ],
      description: 'Email size condition'
    },
    {
      id: 'emailSizeValue',
      name: 'Size Value',
      type: 'string',
      required: false,
      placeholder: '1M, 500K, 10MB',
      description: 'Size value (e.g., 1M for 1MB, 500K for 500KB)'
    },
    {
      id: 'customQuery',
      name: 'Custom Gmail Query',
      type: 'textarea',
      required: false,
      placeholder: 'from:support@company.com has:attachment larger:1M',
      description: 'Advanced Gmail search query (uses Gmail search syntax)'
    },
    {
      id: 'dateRange',
      name: 'Date Range',
      type: 'select',
      required: false,
      default: 'any',
      options: [
        { label: 'Any time', value: 'any' },
        { label: 'Last hour', value: '1h' },
        { label: 'Last 24 hours', value: '1d' },
        { label: 'Last week', value: '7d' },
        { label: 'Last month', value: '30d' }
      ],
      description: 'Only check emails from this time period'
    },
    {
      id: 'pollInterval',
      name: 'Poll Interval (minutes)',
      type: 'number',
      required: true,
      default: 5,
      validation: { min: 1, max: 60 },
      description: 'How often to check for new emails (1-60 minutes)'
    },
    {
      id: 'maxEmails',
      name: 'Max Emails per Check',
      type: 'number',
      required: false,
      default: 10,
      validation: { min: 1, max: 100 },
      description: 'Maximum number of emails to process per check'
    },
    {
      id: 'onlyUnread',
      name: 'Only Unread Emails',
      type: 'boolean',
      required: false,
      default: true,
      description: 'Only trigger on unread emails'
    },
    {
      id: 'markAsRead',
      name: 'Mark as Read',
      type: 'boolean',
      required: false,
      default: false,
      description: 'Automatically mark processed emails as read'
    },
    {
      id: 'includeAttachments',
      name: 'Include Attachments',
      type: 'boolean',
      required: false,
      default: false,
      description: 'Include attachment data in the workflow output'
    },
    {
      id: 'downloadAttachments',
      name: 'Download Attachments',
      type: 'boolean',
      required: false,
      default: false,
      description: 'Download attachment content (requires "Include Attachments")'
    },
    {
      id: 'excludeSpam',
      name: 'Exclude Spam',
      type: 'boolean',
      required: false,
      default: true,
      description: 'Exclude emails marked as spam'
    },
    {
      id: 'excludeTrash',
      name: 'Exclude Trash',
      type: 'boolean',
      required: false,
      default: true,
      description: 'Exclude emails in trash'
    }
  ],
  credentials: {
    required: true,
    types: ['gmail']
  },
  inputs: [],
  outputs: [
    { id: 'trigger', name: 'Trigger', type: 'trigger' },
    { id: 'email', name: 'Email Data', type: 'data' },
    { id: 'subject', name: 'Subject', type: 'data' },
    { id: 'sender', name: 'Sender', type: 'data' },
    { id: 'body', name: 'Email Body', type: 'data' },
    { id: 'attachments', name: 'Attachments', type: 'data' },
    { id: 'labels', name: 'Labels', type: 'data' },
    { id: 'timestamp', name: 'Received Time', type: 'data' }
  ]
}