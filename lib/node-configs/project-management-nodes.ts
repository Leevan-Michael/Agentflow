import { NodeConfiguration } from '../node-configurations'

export const jiraPmNodeConfig: NodeConfiguration = {
  id: 'jira-pm',
  name: 'Jira Project Management',
  description: 'Advanced Jira project management features',
  category: 'Project Management',
  icon: '📋',
  color: 'bg-blue-600',
  parameters: [
    {
      id: 'operation',
      name: 'Operation',
      type: 'select',
      required: true,
      default: 'createProject',
      options: [
        { label: 'Create Project', value: 'createProject' },
        { label: 'Get Project', value: 'getProject' },
        { label: 'Create Sprint', value: 'createSprint' },
        { label: 'Start Sprint', value: 'startSprint' },
        { label: 'Complete Sprint', value: 'completeSprint' },
        { label: 'Create Epic', value: 'createEpic' },
        { label: 'Add to Sprint', value: 'addToSprint' }
      ],
      description: 'Jira PM operation to perform'
    },
    {
      id: 'projectKey',
      name: 'Project Key',
      type: 'string',
      required: true,
      placeholder: 'PROJ',
      description: 'Jira project key'
    },
    {
      id: 'projectName',
      name: 'Project Name',
      type: 'string',
      required: false,
      placeholder: 'My Project',
      description: 'Name of the project (for create operations)'
    },
    {
      id: 'sprintName',
      name: 'Sprint Name',
      type: 'string',
      required: false,
      placeholder: 'Sprint 1',
      description: 'Name of the sprint'
    },
    {
      id: 'sprintDuration',
      name: 'Sprint Duration (weeks)',
      type: 'number',
      required: false,
      default: 2,
      validation: { min: 1, max: 8 },
      description: 'Duration of the sprint in weeks'
    },
    {
      id: 'epicName',
      name: 'Epic Name',
      type: 'string',
      required: false,
      placeholder: 'Feature Epic',
      description: 'Name of the epic'
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
    { id: 'project', name: 'Project Data', type: 'data' },
    { id: 'sprint', name: 'Sprint Data', type: 'data' },
    { id: 'epic', name: 'Epic Data', type: 'data' }
  ]
}

export const trelloNodeConfig: NodeConfiguration = {
  id: 'trello',
  name: 'Trello',
  description: 'Manage Trello boards, lists, and cards',
  category: 'Project Management',
  icon: '📌',
  color: 'bg-blue-500',
  parameters: [
    {
      id: 'operation',
      name: 'Operation',
      type: 'select',
      required: true,
      default: 'createCard',
      options: [
        { label: 'Create Card', value: 'createCard' },
        { label: 'Update Card', value: 'updateCard' },
        { label: 'Move Card', value: 'moveCard' },
        { label: 'Create Board', value: 'createBoard' },
        { label: 'Create List', value: 'createList' },
        { label: 'Add Comment', value: 'addComment' }
      ],
      description: 'Trello operation to perform'
    },
    {
      id: 'boardId',
      name: 'Board ID',
      type: 'string',
      required: true,
      placeholder: 'trello-board-id',
      description: 'Trello board ID'
    },
    {
      id: 'listId',
      name: 'List ID',
      type: 'string',
      required: true,
      placeholder: 'trello-list-id',
      description: 'Trello list ID'
    },
    {
      id: 'cardName',
      name: 'Card Name',
      type: 'string',
      required: true,
      placeholder: 'Task name',
      description: 'Name of the Trello card'
    },
    {
      id: 'cardDescription',
      name: 'Card Description',
      type: 'textarea',
      required: false,
      placeholder: 'Task description...',
      description: 'Description of the Trello card'
    },
    {
      id: 'dueDate',
      name: 'Due Date',
      type: 'string',
      required: false,
      placeholder: '2024-12-31',
      description: 'Due date for the card (YYYY-MM-DD)'
    },
    {
      id: 'labels',
      name: 'Labels',
      type: 'string',
      required: false,
      placeholder: 'urgent, bug, frontend',
      description: 'Comma-separated list of label names'
    }
  ],
  credentials: {
    required: true,
    types: ['trello']
  },
  inputs: [
    { id: 'trigger', name: 'Trigger', type: 'trigger', required: true }
  ],
  outputs: [
    { id: 'card', name: 'Card Data', type: 'data' },
    { id: 'board', name: 'Board Data', type: 'data' },
    { id: 'list', name: 'List Data', type: 'data' }
  ]
}

export const asanaNodeConfig: NodeConfiguration = {
  id: 'asana',
  name: 'Asana',
  description: 'Create and manage Asana tasks and projects',
  category: 'Project Management',
  icon: '✅',
  color: 'bg-red-500',
  parameters: [
    {
      id: 'operation',
      name: 'Operation',
      type: 'select',
      required: true,
      default: 'createTask',
      options: [
        { label: 'Create Task', value: 'createTask' },
        { label: 'Update Task', value: 'updateTask' },
        { label: 'Complete Task', value: 'completeTask' },
        { label: 'Create Project', value: 'createProject' },
        { label: 'Add Task to Project', value: 'addTaskToProject' }
      ],
      description: 'Asana operation to perform'
    },
    {
      id: 'projectId',
      name: 'Project ID',
      type: 'string',
      required: true,
      placeholder: 'asana-project-id',
      description: 'Asana project ID'
    },
    {
      id: 'taskName',
      name: 'Task Name',
      type: 'string',
      required: true,
      placeholder: 'Task name',
      description: 'Name of the Asana task'
    },
    {
      id: 'taskNotes',
      name: 'Task Notes',
      type: 'textarea',
      required: false,
      placeholder: 'Task notes...',
      description: 'Notes/description for the task'
    },
    {
      id: 'assignee',
      name: 'Assignee',
      type: 'string',
      required: false,
      placeholder: 'user@example.com',
      description: 'Email of the user to assign the task to'
    },
    {
      id: 'dueDate',
      name: 'Due Date',
      type: 'string',
      required: false,
      placeholder: '2024-12-31',
      description: 'Due date for the task (YYYY-MM-DD)'
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
      description: 'Task priority level'
    }
  ],
  credentials: {
    required: true,
    types: ['asana']
  },
  inputs: [
    { id: 'trigger', name: 'Trigger', type: 'trigger', required: true }
  ],
  outputs: [
    { id: 'task', name: 'Task Data', type: 'data' },
    { id: 'project', name: 'Project Data', type: 'data' }
  ]
}

export const mondayNodeConfig: NodeConfiguration = {
  id: 'monday',
  name: 'Monday.com',
  description: 'Manage Monday.com boards, items, and updates',
  category: 'Project Management',
  icon: '📅',
  color: 'bg-purple-600',
  parameters: [
    {
      id: 'operation',
      name: 'Operation',
      type: 'select',
      required: true,
      default: 'createItem',
      options: [
        { label: 'Create Item', value: 'createItem' },
        { label: 'Update Item', value: 'updateItem' },
        { label: 'Get Items', value: 'getItems' },
        { label: 'Create Board', value: 'createBoard' },
        { label: 'Add Update', value: 'addUpdate' }
      ],
      description: 'Monday.com operation to perform'
    },
    {
      id: 'boardId',
      name: 'Board ID',
      type: 'string',
      required: true,
      placeholder: 'monday-board-id',
      description: 'Monday.com board ID'
    },
    {
      id: 'itemName',
      name: 'Item Name',
      type: 'string',
      required: true,
      placeholder: 'Task name',
      description: 'Name of the Monday.com item'
    },
    {
      id: 'columnValues',
      name: 'Column Values',
      type: 'json',
      required: false,
      default: '{"status": "Working on it", "priority": "High"}',
      description: 'Column values as JSON object'
    },
    {
      id: 'groupId',
      name: 'Group ID',
      type: 'string',
      required: false,
      placeholder: 'group-id',
      description: 'Group ID to add the item to'
    }
  ],
  credentials: {
    required: true,
    types: ['monday']
  },
  inputs: [
    { id: 'trigger', name: 'Trigger', type: 'trigger', required: true }
  ],
  outputs: [
    { id: 'item', name: 'Item Data', type: 'data' },
    { id: 'board', name: 'Board Data', type: 'data' }
  ]
}