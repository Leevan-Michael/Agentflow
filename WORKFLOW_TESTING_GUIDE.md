# Workflow Testing Guide

This guide explains how to manually test the workflow functionality in the Agentflow frontend.

## Prerequisites

1. **Start the Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Navigate to Workflows**
   - Open your browser to `http://localhost:3000`
   - Sign in to your account
   - Go to Dashboard → Workflows (`/dashboard/workflows`)

## Testing the Workflow Canvas

### 1. Basic Canvas Operations

#### **Pan and Zoom**
- **Pan**: Click and drag on empty canvas area to move around
- **Zoom In**: Use mouse wheel up or Ctrl + scroll up
- **Zoom Out**: Use mouse wheel down or Ctrl + scroll down
- **Reset View**: Double-click on empty canvas area

#### **Grid and Visual Elements**
- Verify the grid background is visible
- Check that the canvas responds smoothly to interactions

### 2. Node Management

#### **Adding Nodes**
1. **Open Node Library**: Click the "+" button or use the node library panel
2. **Browse Categories**: 
   - All
   - Triggers (Webhook, Schedule)
   - Actions (HTTP Request, Send Email)
   - Logic (IF Condition, Transform Data)
   - Integrations (Jira, Slack, Gmail, Notion, Airtable)
   - Project Management (Jira PM, Trello, Asana, Monday.com)

3. **Add Node**: Click on any node type to add it to the canvas
4. **Verify**: Node appears at default position with proper icon and styling

#### **Node Selection and Interaction**
1. **Select Node**: Click on any node
   - Border should turn blue
   - Node should be highlighted
2. **Move Node**: Drag selected node to new position
3. **Node Menu**: Click the "⋯" menu on selected node
   - Test "Duplicate" option
   - Test "Delete" option

#### **Node Properties**
1. **Node Display**: Each node should show:
   - Icon (emoji or custom icon)
   - Node name
   - Node type badge
   - Parameter count (if configured)
2. **Status Indicators**: Nodes may show status icons:
   - ⏱️ Running (spinning clock)
   - ✅ Success (green checkmark)
   - ❌ Error (red X)

### 3. Connection System (n8n-style)

#### **Creating Connections**
1. **Start Connection**: 
   - Hover over a node to see input/output ports
   - Click and drag from an output port (right side)
   - Drag to an input port (left side) of another node

2. **Visual Feedback**:
   - Temporary connection line should follow mouse cursor
   - Line color: Blue for valid connections, Red for invalid
   - Target ports should highlight when hovering

3. **Connection Rules**:
   - Cannot connect node to itself
   - Cannot connect output to output or input to input
   - Connection line should be a smooth bezier curve

#### **Managing Connections**
1. **Select Connection**: Click on any connection line
   - Line should highlight in blue
   - Connection details should show
2. **Delete Connection**: 
   - Double-click connection line, OR
   - Select connection and press Delete key

#### **Connection Types**
- **Trigger** (Purple): Workflow start points
- **Data** (Blue): Data flow between nodes
- **Condition** (Yellow): Conditional logic paths

### 4. Keyboard Shortcuts

Test these keyboard shortcuts:

- **Delete**: Remove selected node or connection
- **Escape**: Cancel current connection attempt
- **Ctrl+D**: Duplicate selected node
- **Backspace**: Alternative delete key

### 5. Workflow Execution

#### **Execute Button**
1. Click the "Execute" button in the toolbar
2. **During Execution**:
   - Button should change to "Stop"
   - Nodes should show running status
   - Progress should be visible

3. **After Execution**:
   - Nodes should show success/error status
   - Execution results should be available

#### **Execution Status**
- **Idle**: Default state, no status icon
- **Running**: Spinning clock icon, blue color
- **Success**: Green checkmark icon
- **Error**: Red X icon

### 6. Toolbar Functions

#### **Main Toolbar**
- **Execute/Stop**: Start or stop workflow execution
- **Clear**: Remove all nodes and connections
- **Node Count**: Shows current number of nodes
- **Connection Count**: Shows current number of connections

#### **Connection Status**
When creating connections, toolbar should show:
- "Connecting..." badge during connection creation
- Instructions for connection process

### 7. Error Handling

#### **Connection Errors**
Test these invalid connection scenarios:
1. Try connecting node to itself (should fail)
2. Try connecting output to output (should fail)
3. Try connecting input to input (should fail)

#### **Node Errors**
1. Try deleting a node with connections (connections should be removed)
2. Try moving nodes outside canvas bounds
3. Test with many nodes (performance)

## Advanced Testing Scenarios

### 1. Complex Workflow Creation

Create a sample workflow:
1. **Webhook Trigger** → **HTTP Request** → **Jira Node** → **Email Node**
2. Add an **IF Condition** node for branching logic
3. Connect multiple paths and test execution

### 2. Node Configuration

1. **Select Node**: Click on any node
2. **Open Editor**: Node editor panel should appear
3. **Configure Parameters**: Test parameter input and validation
4. **Save Changes**: Verify changes are persisted

### 3. Workflow Persistence

1. **Create Workflow**: Add nodes and connections
2. **Refresh Page**: Verify workflow state is maintained
3. **Browser Navigation**: Test back/forward buttons

### 4. Responsive Design

Test on different screen sizes:
- **Desktop**: Full functionality
- **Tablet**: Touch interactions
- **Mobile**: Simplified interface

## Common Issues and Solutions

### **Nodes Not Appearing**
- Check browser console for errors
- Verify node library is loading correctly
- Check network requests for API calls

### **Connections Not Working**
- Ensure mouse events are properly handled
- Check for JavaScript errors in console
- Verify connection validation logic

### **Performance Issues**
- Test with 20+ nodes
- Check for memory leaks during long sessions
- Monitor browser performance tools

### **Visual Issues**
- Test in different browsers (Chrome, Firefox, Safari)
- Check CSS styling and responsive design
- Verify SVG rendering for connections

## Testing Checklist

- [ ] Canvas pan and zoom works smoothly
- [ ] Node library opens and closes properly
- [ ] All node types can be added to canvas
- [ ] Nodes can be selected, moved, and deleted
- [ ] Connections can be created between compatible ports
- [ ] Connection validation prevents invalid connections
- [ ] Keyboard shortcuts work as expected
- [ ] Workflow execution shows proper status updates
- [ ] Toolbar functions work correctly
- [ ] Error handling works for edge cases
- [ ] Performance is acceptable with multiple nodes
- [ ] UI is responsive across different screen sizes

## Reporting Issues

When reporting issues, include:
1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Browser and version**
5. **Console errors (if any)**
6. **Screenshots or screen recordings**

## Next Steps

After basic testing, consider:
1. **Integration Testing**: Test with real API endpoints
2. **Performance Testing**: Load testing with complex workflows
3. **User Experience Testing**: Get feedback from actual users
4. **Automated Testing**: Create automated test suites