# Jira Integration Testing Guide

## 🎯 Overview

This guide covers three different ways to test Jira functionality:

1. **Testing our built-in Jira-like features** (Project Management System)
2. **Testing integration with real Jira** (API Integration)
3. **Comparing features with actual Jira**

## 🚀 Method 1: Testing Our Jira-like Project Management System

Our system includes many Jira-equivalent features. Here's how to test them:

### Quick Start
```bash
cd Agentflow
pnpm dev
# Open http://localhost:3001 (or 3000 if available)
# Navigate to Dashboard → Projects
```

### Feature Comparison with Jira

| Jira Feature | Our Implementation | Test Location |
|--------------|-------------------|---------------|
| **Projects** | ✅ Projects with teams, due dates | Projects sidebar |
| **Issues** | ✅ Tasks with full metadata | Kanban/List views |
| **Kanban Boards** | ✅ Drag-and-drop columns | Kanban tab |
| **Issue Navigator** | ✅ Sortable, filterable list | List tab |
| **Issue Details** | ✅ Full task editor with subtasks | Click any task |
| **Comments** | ✅ Comment system | Task detail modal |
| **Attachments** | ✅ UI ready (backend pending) | Task detail modal |
| **Priorities** | ✅ Low/Medium/High/Urgent | Task creation/editing |
| **Assignees** | ✅ Team member assignment | Task assignment |
| **Due Dates** | ✅ Date tracking with overdue alerts | Task dates |
| **Labels** | ✅ Tag system | Task tags |
| **Sub-tasks** | ✅ Subtask breakdown | Task detail modal |
| **Progress Tracking** | ✅ Automatic progress calculation | Overview tab |
| **Reports** | ✅ Project analytics | Overview tab |
| **Search** | ✅ Full-text search | Search bars |
| **Filters** | ✅ Status, priority, assignee filters | Filter dropdowns |

### Detailed Testing Steps

#### 1. Project Management (Like Jira Projects)
```bash
✅ Create Project:
1. Click "New Project"
2. Fill: Name="E-commerce Platform", Description="Online store project"
3. Set Status="Active", Color=Blue, Due Date=30 days
4. Add team members, tags="web,ecommerce"
5. Verify project appears in sidebar

✅ Project Operations:
1. Switch between projects
2. Search projects
3. Filter by status
4. Edit project details
5. View project statistics
```

#### 2. Issue Management (Like Jira Issues)
```bash
✅ Create Issues/Tasks:
1. Switch to Kanban view
2. Click "+" on "To Do" column
3. Create task: "User Authentication System"
4. Set Priority="High", Assignee="John Doe"
5. Add Due Date, Tags="backend,auth"
6. Verify task appears in column

✅ Issue Operations:
1. Drag tasks between columns (To Do → In Progress → Review → Done)
2. Click task to open details
3. Edit task information
4. Add subtasks: "Login API", "Registration API", "Password Reset"
5. Mark subtasks complete and verify progress
6. Add comments: "Started implementation"
```

#### 3. Kanban Board (Like Jira Boards)
```bash
✅ Board Operations:
1. Create tasks in all columns
2. Drag tasks between columns
3. Verify status updates automatically
4. Test quick task creation from column headers
5. Verify column counters update
6. Test on mobile/tablet (responsive design)
```

#### 4. Issue Navigator (Like Jira Issue Navigator)
```bash
✅ List View Operations:
1. Switch to "List" view
2. Sort by: Title, Priority, Due Date, Status
3. Filter by: Status="In Progress", Priority="High"
4. Search for: "authentication"
5. Select multiple tasks (bulk operations)
6. Change status of selected tasks
```

#### 5. Reporting (Like Jira Reports)
```bash
✅ Analytics Testing:
1. Switch to "Overview" tab
2. Verify project progress calculation
3. Check task breakdown (To Do, In Progress, etc.)
4. View team member workload
5. Check overdue task alerts
6. Verify upcoming deadlines
7. Review recent activity feed
```

## 🔗 Method 2: Testing Real Jira Integration

### Prerequisites

1. **Jira Instance**: You need access to a Jira Cloud instance
2. **API Token**: Generate from Atlassian account
3. **Project Access**: Admin or sufficient permissions

### Setup Steps

#### 1. Get Jira Credentials
```bash
# 1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
# 2. Click "Create API token"
# 3. Label: "AgentFlow Integration"
# 4. Copy the generated token
```

#### 2. Configure Environment
Create `.env.local` in the Agentflow directory:
```env
JIRA_BASE_URL=https://yourcompany.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-generated-api-token
JIRA_PROJECT_KEY=YOUR_PROJECT_KEY
```

#### 3. Test Integration
```bash
# Start the development server
pnpm dev

# Navigate to Projects → Select any project → Jira Test tab
# Or directly test the API:
curl http://localhost:3001/api/jira/test
```

### Jira Integration Testing Steps

#### 1. Connection Test
```bash
✅ Basic Connection:
1. Go to Projects → Jira Test tab
2. Click "Test Connection"
3. Verify green success badge
4. Check console for any errors

Expected Result: ✅ "Connected to Jira successfully"
```

#### 2. Fetch Issues Test
```bash
✅ Issue Retrieval:
1. Click "Fetch Issues"
2. Verify issues appear in the list
3. Check issue details (key, summary, status, priority)
4. Verify count matches your Jira project

Expected Result: ✅ List of Jira issues with correct data
```

#### 3. Create Issue Test
```bash
✅ Issue Creation:
1. Fill in Summary: "Test Issue from AgentFlow"
2. Add Description: "Testing integration"
3. Click "Create Issue"
4. Verify success message
5. Check Jira web interface for new issue

Expected Result: ✅ New issue appears in both systems
```

#### 4. Sync Test
```bash
✅ Task Synchronization:
1. Create some tasks in our system first
2. Click "Sync Tasks"
3. Verify tasks are created in Jira
4. Check for any sync errors
5. Verify data consistency

Expected Result: ✅ Tasks synchronized between systems
```

#### 5. Full Integration Test
```bash
✅ Complete Test Suite:
1. Click "Run Complete Test Suite"
2. Wait for all tests to complete
3. Review test results
4. Check for any failures

Expected Result: ✅ All tests pass
```

### Troubleshooting Jira Integration

#### Common Issues

1. **Authentication Failed**
   ```bash
   Error: "Failed to connect to Jira"
   Solution: 
   - Verify JIRA_EMAIL and JIRA_API_TOKEN
   - Check if API token is still valid
   - Ensure email matches Jira account
   ```

2. **Project Not Found**
   ```bash
   Error: "Project key not found"
   Solution:
   - Verify JIRA_PROJECT_KEY is correct
   - Check project permissions
   - Ensure project exists and is accessible
   ```

3. **Permission Denied**
   ```bash
   Error: "Insufficient permissions"
   Solution:
   - Check Jira project permissions
   - Ensure user can create/edit issues
   - Contact Jira admin for access
   ```

4. **Network Issues**
   ```bash
   Error: "Network request failed"
   Solution:
   - Check internet connection
   - Verify JIRA_BASE_URL is correct
   - Check for firewall/proxy issues
   ```

## 📊 Method 3: Feature Comparison Testing

### Side-by-Side Comparison

Open both systems and compare:

#### Project/Issue Creation
```bash
Jira:
1. Projects → Create Project
2. Issues → Create Issue
3. Fill in required fields

Our System:
1. Projects → New Project
2. Kanban → + button
3. Fill in task details

Compare: Speed, ease of use, required fields
```

#### Kanban Board Experience
```bash
Jira:
1. Project → Board view
2. Drag issues between columns
3. Quick actions on cards

Our System:
1. Project → Kanban tab
2. Drag tasks between columns
3. Task card interactions

Compare: Responsiveness, visual design, functionality
```

#### Reporting and Analytics
```bash
Jira:
1. Reports → Various report types
2. Dashboards → Gadgets
3. Project insights

Our System:
1. Overview tab
2. Project statistics
3. Team analytics

Compare: Data depth, visualization, usefulness
```

## 🧪 Automated Testing Scripts

### API Testing with curl

```bash
# Test Jira connection
curl -X GET "http://localhost:3001/api/jira/test" \
  -H "Content-Type: application/json"

# Test specific operations
curl -X POST "http://localhost:3001/api/jira/test" \
  -H "Content-Type: application/json" \
  -d '{"action": "test-connection"}'

curl -X POST "http://localhost:3001/api/jira/test" \
  -H "Content-Type: application/json" \
  -d '{"action": "fetch-issues"}'

curl -X POST "http://localhost:3001/api/jira/test" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create-issue",
    "data": {
      "summary": "API Test Issue",
      "description": "Created via API test",
      "issueType": "Task",
      "priority": "Medium"
    }
  }'
```

### Performance Testing

```bash
# Test with large datasets
1. Create 50+ projects
2. Create 200+ tasks
3. Test Kanban board performance
4. Test list view sorting
5. Test search performance
6. Monitor browser memory usage
```

## 📋 Test Results Checklist

### Our System Testing
- [ ] Project creation and management
- [ ] Task creation with all fields
- [ ] Kanban drag and drop
- [ ] List view sorting and filtering
- [ ] Task detail modal functionality
- [ ] Subtasks and comments
- [ ] Progress tracking
- [ ] Team member assignment
- [ ] Due date management
- [ ] Search functionality
- [ ] Mobile responsiveness

### Jira Integration Testing
- [ ] Connection to Jira successful
- [ ] Can fetch existing issues
- [ ] Can create new issues
- [ ] Can update issue status
- [ ] Sync tasks between systems
- [ ] Error handling works
- [ ] Authentication secure
- [ ] Data consistency maintained

### Performance Testing
- [ ] Fast loading with large datasets
- [ ] Smooth drag and drop
- [ ] Quick search results
- [ ] Responsive on mobile
- [ ] No memory leaks
- [ ] Efficient API calls

## 🎯 Success Criteria

### Functional Requirements
- ✅ All core Jira-like features work
- ✅ Real Jira integration functions (if configured)
- ✅ Data consistency between systems
- ✅ Error handling and user feedback
- ✅ Performance acceptable with realistic data

### User Experience
- ✅ Intuitive interface
- ✅ Fast and responsive
- ✅ Mobile-friendly
- ✅ Consistent with existing AgentFlow design
- ✅ Clear error messages and guidance

### Technical Requirements
- ✅ No breaking changes to existing code
- ✅ Secure API integration
- ✅ Proper error handling
- ✅ TypeScript type safety
- ✅ Clean, maintainable code

## 🚀 Next Steps

After successful testing:

1. **Production Deployment**
   - Set up production Jira credentials
   - Configure database for persistent storage
   - Set up monitoring and logging

2. **Advanced Features**
   - Real-time synchronization
   - Webhook integration
   - Advanced reporting
   - Custom field mapping

3. **User Training**
   - Create user documentation
   - Conduct team training sessions
   - Gather user feedback

The system is now ready for comprehensive testing! 🎉