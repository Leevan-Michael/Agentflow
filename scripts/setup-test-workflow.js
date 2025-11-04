#!/usr/bin/env node

/**
 * Setup Test Workflow Script
 * 
 * This script helps set up a demo workflow for testing purposes.
 * Run with: node scripts/setup-test-workflow.js
 */

const testWorkflow = {
  id: 'test-workflow-001',
  name: 'Demo Test Workflow',
  description: 'A sample workflow for testing all functionality',
  nodes: [
    {
      id: 'webhook-trigger',
      type: 'webhook',
      name: 'Webhook Trigger',
      position: { x: 100, y: 100 },
      parameters: {
        path: '/webhook/test',
        method: 'POST'
      },
      inputs: [],
      outputs: [
        { id: 'trigger', name: 'Trigger', type: 'trigger' }
      ]
    },
    {
      id: 'http-request',
      type: 'http',
      name: 'HTTP Request',
      position: { x: 400, y: 100 },
      parameters: {
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        method: 'GET'
      },
      inputs: [
        { id: 'trigger', name: 'Trigger', type: 'trigger' }
      ],
      outputs: [
        { id: 'response', name: 'Response', type: 'data' }
      ]
    },
    {
      id: 'condition-check',
      type: 'condition',
      name: 'Check Response',
      position: { x: 700, y: 100 },
      parameters: {
        condition: 'response.status === 200'
      },
      inputs: [
        { id: 'data', name: 'Data', type: 'data' }
      ],
      outputs: [
        { id: 'true', name: 'True', type: 'condition' },
        { id: 'false', name: 'False', type: 'condition' }
      ]
    },
    {
      id: 'jira-create',
      type: 'jira',
      name: 'Create Jira Issue',
      position: { x: 1000, y: 50 },
      parameters: {
        action: 'create',
        project: 'TEST',
        issueType: 'Task'
      },
      inputs: [
        { id: 'trigger', name: 'Trigger', type: 'condition' }
      ],
      outputs: [
        { id: 'issue', name: 'Issue', type: 'data' }
      ]
    },
    {
      id: 'email-notification',
      type: 'email',
      name: 'Send Email',
      position: { x: 1000, y: 200 },
      parameters: {
        to: 'admin@example.com',
        subject: 'Workflow Failed'
      },
      inputs: [
        { id: 'trigger', name: 'Trigger', type: 'condition' }
      ],
      outputs: []
    }
  ],
  connections: [
    {
      id: 'conn-1',
      sourceNodeId: 'webhook-trigger',
      sourcePortId: 'trigger',
      targetNodeId: 'http-request',
      targetPortId: 'trigger'
    },
    {
      id: 'conn-2',
      sourceNodeId: 'http-request',
      sourcePortId: 'response',
      targetNodeId: 'condition-check',
      targetPortId: 'data'
    },
    {
      id: 'conn-3',
      sourceNodeId: 'condition-check',
      sourcePortId: 'true',
      targetNodeId: 'jira-create',
      targetPortId: 'trigger'
    },
    {
      id: 'conn-4',
      sourceNodeId: 'condition-check',
      sourcePortId: 'false',
      targetNodeId: 'email-notification',
      targetPortId: 'trigger'
    }
  ]
}

console.log('🚀 Test Workflow Configuration:')
console.log(JSON.stringify(testWorkflow, null, 2))

console.log('\n📋 Testing Instructions:')
console.log('1. Copy the workflow configuration above')
console.log('2. Navigate to /dashboard/workflows in your browser')
console.log('3. Use the workflow canvas to recreate this structure')
console.log('4. Test all the functionality described in WORKFLOW_TESTING_GUIDE.md')

console.log('\n🔧 Quick Test Scenarios:')
console.log('• Add nodes from different categories')
console.log('• Create connections between nodes')
console.log('• Test invalid connection attempts')
console.log('• Use keyboard shortcuts (Delete, Ctrl+D, Escape)')
console.log('• Test workflow execution')
console.log('• Test canvas pan and zoom')

console.log('\n✅ Success Criteria:')
console.log('• All nodes can be added and positioned')
console.log('• Connections work with visual feedback')
console.log('• Invalid connections are rejected')
console.log('• Keyboard shortcuts function properly')
console.log('• Canvas interactions are smooth')
console.log('• Workflow execution shows status updates')

console.log('\n🐛 Common Issues to Watch For:')
console.log('• Duplicate key warnings in console')
console.log('• Connection lines not rendering properly')
console.log('• Nodes not responding to mouse events')
console.log('• Performance issues with many nodes')
console.log('• Responsive design problems on mobile')

console.log('\n📱 Browser Testing:')
console.log('• Chrome (recommended)')
console.log('• Firefox')
console.log('• Safari')
console.log('• Edge')

console.log('\n🎯 Ready to test! Open your browser and start testing the workflow canvas.')