import { NodeConfiguration } from '../node-configurations'

export const gmailNodeConfig: NodeConfiguration = {
  id: 'gmail',
  name: 'Gmail',
  description: 'Send and receive emails via Gmail',
  category: 'Integrations',
  icon: '📬',
  color: 'bg-red-500',
  parameters: [
    {
      id: 'operation',
      name: 'Operation',
      type: 'select',
      required: true,
      default: 'send',
      options: [
        { label: 'Send Email', value: 'send' },
        { label: 'Get Emails', value: 'get' },
        { label: 'Search Emails', value: 'search' },
        { label: 'Mark as Read', value: 'markRead' },
        { label: 'Add Label', value: 'addLabel' }
      ],
      description: 'Gmail operation to perform'
    },
    {
      id: 'to',
      name: 'To',
      type: 'string',
      required: true,
      placeholder: 'recipient@example.com',
      description: 'Recipient email address'
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
      description: 'Send email as HTML'
    }
  ],
  credentials: {
    required: true,
    types: ['gmail']
  },
  inputs: [
    { id: 'trigger', name: 'Trigger', type: 'trigger', required: true }
  ],
  outputs: [
    { id: 'email', name: 'Email Data', type: 'data' },
    { id: 'messageId', name: 'Message ID', type: 'data' }
  ]
}

export const notionNodeConfig: NodeConfiguration = {
  id: 'notion',
  name: 'Notion',
  description: 'Create and update Notion pages and databases',
  category: 'Integrations',
  icon: '📝',
  color: 'bg-black',
  parameters: [
    {
      id: 'operation',
      name: 'Operation',
      type: 'select',
      required: true,
      default: 'createPage',
      options: [
        { label: 'Create Page', value: 'createPage' },
        { label: 'Update Page', value: 'updatePage' },
        { label: 'Get Page', value: 'getPage' },
        { label: 'Create Database Entry', value: 'createDatabaseEntry' },
        { label: 'Query Database', value: 'queryDatabase' }
      ],
      description: 'Notion operation to perform'
    },
    {
      id: 'pageId',
      name: 'Page ID',
      type: 'string',
      required: false,
      placeholder: 'notion-page-id',
      description: 'Notion page ID (for update/get operations)'
    },
    {
      id: 'databaseId',
      name: 'Database ID',
      type: 'string',
      required: false,
      placeholder: 'notion-database-id',
      description: 'Notion database ID (for database operations)'
    },
    {
      id: 'title',
      name: 'Title',
      type: 'string',
      required: true,
      placeholder: 'Page title',
      description: 'Title of the page or database entry'
    },
    {
      id: 'content',
      name: 'Content',
      type: 'textarea',
      required: false,
      placeholder: 'Page content...',
      description: 'Content to add to the page'
    },
    {
      id: 'properties',
      name: 'Properties',
      type: 'json',
      required: false,
      description: 'Database properties as JSON object'
    }
  ],
  credentials: {
    required: true,
    types: ['notion']
  },
  inputs: [
    { id: 'trigger', name: 'Trigger', type: 'trigger', required: true }
  ],
  outputs: [
    { id: 'page', name: 'Page Data', type: 'data' },
    { id: 'url', name: 'Page URL', type: 'data' }
  ]
}

export const airtableNodeConfig: NodeConfiguration = {
  id: 'airtable',
  name: 'Airtable',
  description: 'Manage Airtable records and bases',
  category: 'Integrations',
  icon: '📊',
  color: 'bg-yellow-500',
  parameters: [
    {
      id: 'operation',
      name: 'Operation',
      type: 'select',
      required: true,
      default: 'create',
      options: [
        { label: 'Create Record', value: 'create' },
        { label: 'Update Record', value: 'update' },
        { label: 'Get Record', value: 'get' },
        { label: 'List Records', value: 'list' },
        { label: 'Delete Record', value: 'delete' }
      ],
      description: 'Airtable operation to perform'
    },
    {
      id: 'baseId',
      name: 'Base ID',
      type: 'string',
      required: true,
      placeholder: 'appXXXXXXXXXXXXXX',
      description: 'Airtable base ID'
    },
    {
      id: 'tableId',
      name: 'Table ID',
      type: 'string',
      required: true,
      placeholder: 'tblXXXXXXXXXXXXXX',
      description: 'Airtable table ID'
    },
    {
      id: 'recordId',
      name: 'Record ID',
      type: 'string',
      required: false,
      placeholder: 'recXXXXXXXXXXXXXX',
      description: 'Record ID (for update/get/delete operations)'
    },
    {
      id: 'fields',
      name: 'Fields',
      type: 'json',
      required: true,
      default: '{"Name": "Example", "Status": "Active"}',
      description: 'Record fields as JSON object'
    },
    {
      id: 'maxRecords',
      name: 'Max Records',
      type: 'number',
      required: false,
      default: 100,
      validation: { min: 1, max: 1000 },
      description: 'Maximum number of records to retrieve'
    }
  ],
  credentials: {
    required: true,
    types: ['airtable']
  },
  inputs: [
    { id: 'trigger', name: 'Trigger', type: 'trigger', required: true }
  ],
  outputs: [
    { id: 'record', name: 'Record Data', type: 'data' },
    { id: 'records', name: 'Records List', type: 'data' }
  ]
}