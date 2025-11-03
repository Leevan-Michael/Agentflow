# WorkflowCanvas Component

A comprehensive visual workflow builder component for creating N8N-style automation workflows with drag-and-drop functionality.

## Features

- **Visual Workflow Builder**: Drag-and-drop interface for creating workflows
- **Node Library**: Pre-built nodes for triggers, actions, logic, and integrations
- **Node Editor**: Detailed configuration panel for each node type
- **Connection Management**: Visual connections between nodes with curved paths
- **Zoom & Pan**: Canvas navigation with zoom controls and panning
- **Real-time Updates**: Live editing with immediate visual feedback
- **Responsive Design**: Works on different screen sizes
- **Extensible**: Easy to add new node types and functionality

## Components

### WorkflowCanvas
Main component that provides the visual workflow builder interface.

```tsx
import { WorkflowCanvas } from "@/components/workflow"

<WorkflowCanvas
  workflowId="my-workflow"
  initialNodes={nodes}
  initialConnections={connections}
  onSave={(nodes, connections) => console.log("Save", { nodes, connections })}
  onExecute={(workflowId) => console.log("Execute", workflowId)}
  readOnly={false}
/>
```

### NodeLibrary
Sidebar component showing available node types that can be added to the workflow.

### NodeEditor  
Right sidebar for configuring the selected node's parameters and settings.

### ConnectionManager
Handles the visual rendering and interaction of connections between nodes.

## Node Types

### Triggers
- **Webhook**: HTTP endpoint triggers
- **Schedule**: Cron-based scheduling
- **Manual**: Manual workflow execution

### Actions
- **HTTP Request**: Make API calls
- **Email**: Send emails
- **Database**: Query databases

### Logic
- **Condition**: IF/ELSE branching
- **Transform**: Data transformation

### Integrations
- **Slack**: Slack messaging
- **Gmail**: Gmail operations
- **Notion**: Notion page/database operations
- **Airtable**: Airtable record management

## Usage Examples

### Basic Workflow
```tsx
import { WorkflowCanvas, WorkflowNode, Connection } from "@/components/workflow"

const nodes: WorkflowNode[] = [
  {
    id: "trigger-1",
    type: "webhook",
    name: "Webhook Trigger",
    position: { x: 100, y: 100 },
    parameters: { path: "/webhook/test" },
    inputs: [],
    outputs: [{ id: "trigger", name: "Trigger", type: "trigger" }]
  }
]

const connections: Connection[] = []

function MyWorkflow() {
  return (
    <WorkflowCanvas
      initialNodes={nodes}
      initialConnections={connections}
      onSave={(nodes, connections) => {
        // Save to backend
      }}
    />
  )
}
```

### Adding Custom Node Types

To add a new node type, update the following:

1. **Node Library** (`node-library.tsx`): Add to `nodeTypes` array
2. **Node Editor** (`node-editor.tsx`): Add configuration UI in `renderNodeParameters()`
3. **Helper Functions**: Update `getNodeDisplayName()`, `getNodeInputs()`, `getNodeOutputs()`

```tsx
// Example: Adding a new "SMS" node type
{
  id: 'sms',
  name: 'Send SMS',
  description: 'Send SMS messages via Twilio',
  category: 'Actions',
  icon: <MessageSquare className="h-5 w-5" />,
  color: 'bg-green-600'
}
```

## Keyboard Shortcuts

- **Delete**: Delete selected node or connection
- **Ctrl/Cmd + S**: Save workflow
- **Ctrl/Cmd + Z**: Undo (if implemented)
- **Space + Drag**: Pan canvas
- **Mouse Wheel**: Zoom in/out

## Styling

The component uses Tailwind CSS classes and follows the design system. Key styling features:

- **Dark/Light Mode**: Supports theme switching
- **Responsive**: Adapts to different screen sizes
- **Animations**: Smooth transitions and hover effects
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Data Structure

### WorkflowNode
```tsx
interface WorkflowNode {
  id: string
  type: string
  name: string
  position: Position
  parameters: Record<string, any>
  inputs: NodePort[]
  outputs: NodePort[]
  status?: 'idle' | 'running' | 'success' | 'error'
  disabled?: boolean
}
```

### Connection
```tsx
interface Connection {
  id: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
}
```

## Integration with Backend

The component is designed to work with any backend. Implement the `onSave` and `onExecute` callbacks to integrate with your API:

```tsx
const handleSave = async (nodes: WorkflowNode[], connections: Connection[]) => {
  await fetch('/api/workflows', {
    method: 'POST',
    body: JSON.stringify({ nodes, connections })
  })
}

const handleExecute = async (workflowId: string) => {
  await fetch(`/api/workflows/${workflowId}/execute`, {
    method: 'POST'
  })
}
```

## Performance Considerations

- **Large Workflows**: Component handles 100+ nodes efficiently
- **Memory Usage**: Optimized rendering with React best practices
- **Smooth Interactions**: Debounced updates and optimized re-renders

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- React 18+
- Tailwind CSS
- Radix UI components
- Lucide React icons