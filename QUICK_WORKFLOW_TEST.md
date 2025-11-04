# Quick Workflow Testing Guide

## 🚀 Getting Started

1. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Navigate to workflows:**
   - Open `http://localhost:3000`
   - Sign in to your account
   - Go to **Dashboard → Workflows**

## 🎯 Quick Test Checklist

### ✅ Basic Canvas Operations
- [ ] **Pan**: Click and drag empty canvas area
- [ ] **Zoom**: Use mouse wheel to zoom in/out
- [ ] **Grid**: Verify grid background is visible

### ✅ Node Management
- [ ] **Add Nodes**: Click "+" or use node library panel
- [ ] **Select Nodes**: Click on nodes (should highlight in blue)
- [ ] **Move Nodes**: Drag selected nodes to new positions
- [ ] **Delete Nodes**: Select node and press Delete key

### ✅ Connection System (n8n-style)
- [ ] **Create Connections**: 
  - Hover over node to see ports
  - Drag from output port (right) to input port (left)
  - Verify smooth bezier curve appears
- [ ] **Visual Feedback**: 
  - Blue line for valid connections
  - Red line for invalid connections
- [ ] **Connection Rules**:
  - Cannot connect node to itself ❌
  - Cannot connect output to output ❌
  - Cannot connect input to input ❌

### ✅ Keyboard Shortcuts
- [ ] **Delete**: Remove selected node/connection
- [ ] **Ctrl+D**: Duplicate selected node
- [ ] **Escape**: Cancel connection creation

### ✅ Workflow Execution
- [ ] **Execute Button**: Click to start workflow
- [ ] **Status Updates**: Nodes show running/success/error states
- [ ] **Stop Button**: Can stop running workflows

## 🛠️ Test Helper Tool

In development mode, you'll see a **"Test Helper"** button in the bottom-right corner. This provides:
- Guided test scenarios
- Step-by-step instructions
- Expected results for each test
- Pass/fail tracking

## 🎨 Node Types to Test

### Triggers
- **Webhook**: HTTP endpoint trigger
- **Schedule**: Cron-based trigger

### Actions  
- **HTTP Request**: Make API calls
- **Send Email**: Email notifications

### Logic
- **IF Condition**: Conditional branching
- **Transform Data**: Data manipulation

### Integrations
- **Jira**: Issue management
- **Slack**: Team communication
- **Gmail**: Email integration
- **Notion**: Documentation
- **Airtable**: Database operations

### Project Management
- **Jira PM**: Project management features
- **Trello**: Board management
- **Asana**: Task management
- **Monday.com**: Work management

## 🔍 What to Look For

### ✅ Good Signs
- Smooth canvas interactions
- Clean node styling
- Proper connection curves
- Responsive UI elements
- No console errors

### ⚠️ Issues to Report
- Duplicate key warnings in console
- Laggy or unresponsive interactions
- Broken connection lines
- Nodes not positioning correctly
- Keyboard shortcuts not working

## 🐛 Common Issues & Solutions

### **Nodes Not Appearing**
- Check browser console for errors
- Refresh the page
- Clear browser cache

### **Connections Not Working**
- Ensure you're dragging from output to input
- Check for JavaScript errors
- Try with different node types

### **Performance Issues**
- Test with fewer nodes initially
- Check browser performance tools
- Try in different browsers

## 📱 Browser Testing

Test in multiple browsers:
- **Chrome** (primary)
- **Firefox**
- **Safari** 
- **Edge**

## 🎯 Success Criteria

Your workflow canvas is working correctly if:
- ✅ All node types can be added
- ✅ Nodes can be moved and selected
- ✅ Connections work with visual feedback
- ✅ Invalid connections are rejected
- ✅ Keyboard shortcuts function
- ✅ Canvas pan/zoom is smooth
- ✅ Workflow execution shows status
- ✅ No console errors

## 🚀 Advanced Testing

Once basic functionality works:
1. **Create Complex Workflows**: 10+ nodes with multiple connections
2. **Test Edge Cases**: Try unusual connection patterns
3. **Performance Testing**: Add many nodes and test responsiveness
4. **Mobile Testing**: Test on tablet/phone screens
5. **Integration Testing**: Test with real API endpoints

## 📞 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Review the detailed **WORKFLOW_TESTING_GUIDE.md**
3. Use the Test Helper tool for guided testing
4. Take screenshots of any visual issues

Happy testing! 🎉