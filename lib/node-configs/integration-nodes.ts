import { NodeConfiguration } from '../node-configurations'

export const jiraNodeConfig: NodeConfiguration = {
  id: 'jira',
  name: 'Jira',
  description: 'Create, update, and manage Jira issues',
  category: 'Integrations',
  icon: '🔗',
  color: 'bg-blue-600',
  parameters: [
    {
      id: 'operation',
      name: 'Operation',
      type: 'select',
      required: true,
      default: 'create',
      options: [
        { label: 'Create Issue', value: 'create' },
        { label: 'Update Issue', value: 'update' },
        { label: 'Get Issue', value: 'get' },
        { label: 'Search Issues', value: 'search' },
        { label: 'Add Comment', value: 'comment' },
        { label: 'Transition Issue', value: 'transition' }
      ],
      description: 'Jira operation to perform'
    },
    {
      id: 'project',
      name: 'Project Key',
      type: 'string',
      required: true,
      placeholder: 'PROJ',
      description: 'Jira project key (e.g., PROJ, DEV, TEST)'
    },
    {
      id: 'issueType',
      name: 'Issue Type',
      type: 'select',
      required: true,
      default: 'Task',
      options: [
        { label: 'Task', value: 'Task' },
        { label: 'Bug', value: 'Bug' },
        { label: 'Story', value: 'Story' },
        { label: 'Epic', value: 'Epic' },
        { label: 'Sub-task', value: 'Sub-task' }
      ],
      description: 'Type of Jira issue'
    },
    {
      id: 'summary',
      name: 'Summary',
      type: 'string',
      required: true,
      placeholder: 'Issue summary/title',
      description: 'Brief summary of the issue'
    },
    {
      id: 'description',
      name: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Detailed description of the issue...',
      description: 'Detailed description of the issue'
    },
    {
      id: 'priority',
      name: 'Priority',
      type: 'select',
      required: false,
      default: 'Medium',
      options: [
        { label: 'Highest', value: 'Highest' },
        { label: 'High', value: 'High' },
        { label: 'Medium', value: 'Medium' },
        { label: 'Low', value: 'Low' },
        { label: 'Lowest', value: 'Lowest' }
      ],
      description: 'Issue priority level'
    },
    {
      id: 'assignee',
      name: 'Assignee',
      type: 'string',
      required: false,
      placeholder: 'user@example.com',
      description: 'Email of the user to assign the issue to'
    },
    {
      id: 'labels',
      name: 'Labels',
      type: 'string',
      required: false,
      placeholder: 'bug, urgent, frontend',
      description: 'Comma-separated list of labels'
    }
  ],
  credentials: {
    required: true,
    types: ['jira']
  },
  inputs: [
    { id: 'trigger', name: 'Trigger', type: 'trigger', required: true }
  ],
  outputs: [
    { id: 'issue', name: 'Issue Data', type: 'data' },
    { id: 'key', name: 'Issue Key', type: 'data' },
    { id: 'url', name: 'Issue URL', type: 'data' }
  ]
}

export const slackNodeConfig: NodeConfiguration = {
  id: 'slack',
  name: 'Slack',
  description: 'Send messages and interact with Slack',
  category: 'Integrations',
  icon: '💬',
  color: 'bg-purple-600',
  parameters: [
    {
      id: 'operation',
      name: 'Operation',
      type: 'select',
      required: true,
      default: 'sendMessage',
      options: [
        { label: 'Send Message', value: 'sendMessage' },
        { label: 'Send Direct Message', value: 'sendDM' },
        { label: 'Create Channel', value: 'createChannel' },
        { label: 'Invite to Channel', value: 'inviteToChannel' },
        { label: 'Upload File', value: 'uploadFile' }
      ],
      description: 'Slack operation to perform'
    },
    {
      id: 'channel',
      name: 'Channel',
      type: 'string',
      required: true,
      placeholder: '#general or @username',
      description: 'Channel name (with #) or username (with @)'
    },
    {
      id: 'message',
      name: 'Message',
      type: 'textarea',
      required: true,
      placeholder: 'Your message here...',
      description: 'Message content to send'
    },
    {
      id: 'username',
      name: 'Bot Username',
      type: 'string',
      required: false,
      placeholder: 'WorkflowBot',
      description: 'Custom username for the bot'
    },
    {
      id: 'iconEmoji',
      name: 'Icon Emoji',
      type: 'string',
      required: false,
      placeholder: ':robot_face:',
      description: 'Emoji to use as bot icon'
    },
    {
      id: 'attachments',
      name: 'Attachments',
      type: 'json',
      required: false,
      description: 'Slack message attachments as JSON'
    }
  ],
  credentials: {
    required: true,
    types: ['slack']
  },
  inputs: [
    { id: 'trigger', name: 'Trigger', type: 'trigger', required: true }
  ],
  outputs: [
    { id: 'message', name: 'Message Data', type: 'data' },
    { id: 'timestamp', name: 'Message Timestamp', type: 'data' }
  ]
}