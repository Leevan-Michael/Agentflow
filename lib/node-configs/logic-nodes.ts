import { NodeConfiguration } from '../node-configurations'

export const conditionNodeConfig: NodeConfiguration = {
  id: 'condition',
  name: 'IF Condition',
  description: 'Branch your workflow based on conditions',
  category: 'Logic',
  icon: '🔀',
  color: 'bg-orange-500',
  parameters: [
    {
      id: 'conditions',
      name: 'Conditions',
      type: 'json',
      required: true,
      default: JSON.stringify([
        {
          field: 'data.status',
          operator: 'equals',
          value: 'success'
        }
      ], null, 2),
      description: 'Array of conditions to evaluate'
    },
    {
      id: 'combineOperation',
      name: 'Combine Operation',
      type: 'select',
      required: true,
      default: 'AND',
      options: [
        { label: 'AND (all conditions must be true)', value: 'AND' },
        { label: 'OR (any condition must be true)', value: 'OR' }
      ],
      description: 'How to combine multiple conditions'
    },
    {
      id: 'continueOnFail',
      name: 'Continue on Fail',
      type: 'boolean',
      required: false,
      default: false,
      description: 'Continue workflow execution even if condition fails'
    }
  ],
  inputs: [
    { id: 'data', name: 'Data', type: 'data', required: true }
  ],
  outputs: [
    { id: 'true', name: 'True', type: 'condition' },
    { id: 'false', name: 'False', type: 'condition' }
  ]
}

export const transformNodeConfig: NodeConfiguration = {
  id: 'transform',
  name: 'Transform Data',
  description: 'Transform and manipulate data between nodes',
  category: 'Logic',
  icon: '🔄',
  color: 'bg-teal-500',
  parameters: [
    {
      id: 'transformations',
      name: 'Transformations',
      type: 'json',
      required: true,
      default: JSON.stringify([
        {
          operation: 'set',
          field: 'output.processedAt',
          value: '{{new Date().toISOString()}}'
        },
        {
          operation: 'rename',
          from: 'input.oldField',
          to: 'output.newField'
        }
      ], null, 2),
      description: 'Array of transformation operations'
    },
    {
      id: 'keepOriginal',
      name: 'Keep Original Data',
      type: 'boolean',
      required: false,
      default: true,
      description: 'Include original data in output'
    },
    {
      id: 'errorHandling',
      name: 'Error Handling',
      type: 'select',
      required: false,
      default: 'continue',
      options: [
        { label: 'Continue on Error', value: 'continue' },
        { label: 'Stop on Error', value: 'stop' },
        { label: 'Skip Invalid', value: 'skip' }
      ],
      description: 'How to handle transformation errors'
    }
  ],
  inputs: [
    { id: 'data', name: 'Input Data', type: 'data', required: true }
  ],
  outputs: [
    { id: 'transformed', name: 'Transformed Data', type: 'data' },
    { id: 'original', name: 'Original Data', type: 'data' }
  ]
}

export const delayNodeConfig: NodeConfiguration = {
  id: 'delay',
  name: 'Delay',
  description: 'Add delays to your workflow',
  category: 'Logic',
  icon: '⏱️',
  color: 'bg-gray-500',
  parameters: [
    {
      id: 'delayType',
      name: 'Delay Type',
      type: 'select',
      required: true,
      default: 'fixed',
      options: [
        { label: 'Fixed Delay', value: 'fixed' },
        { label: 'Random Delay', value: 'random' },
        { label: 'Until Specific Time', value: 'until' }
      ],
      description: 'Type of delay to apply'
    },
    {
      id: 'duration',
      name: 'Duration (seconds)',
      type: 'number',
      required: true,
      default: 5,
      validation: { min: 1, max: 3600 },
      description: 'Delay duration in seconds'
    },
    {
      id: 'maxDuration',
      name: 'Max Duration (seconds)',
      type: 'number',
      required: false,
      default: 10,
      validation: { min: 1, max: 3600 },
      description: 'Maximum duration for random delays'
    },
    {
      id: 'specificTime',
      name: 'Specific Time',
      type: 'string',
      required: false,
      placeholder: '2024-12-31T23:59:59Z',
      description: 'ISO timestamp to delay until (for "until" type)'
    }
  ],
  inputs: [
    { id: 'trigger', name: 'Trigger', type: 'trigger', required: true }
  ],
  outputs: [
    { id: 'delayed', name: 'After Delay', type: 'trigger' }
  ]
}