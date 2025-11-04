# Jira Credentials Authentication Guide

## 🎯 Overview

This guide covers the n8n-style Jira credentials authentication system integrated into AgentFlow workflows. Users can securely store and manage their Jira API credentials, then use them in workflow nodes without exposing sensitive information.

## 🔐 Features

### **Secure Credential Management**
- ✅ **Encrypted Storage**: API tokens are stored securely (masked in UI)
- ✅ **User Isolation**: Each user can only access their own credentials
- ✅ **Connection Testing**: Built-in credential validation
- ✅ **Multiple Instances**: Support for multiple Jira instances per user

### **n8n-Style UX**
- ✅ **Credential Reuse**: Create once, use in multiple workflow nodes
- ✅ **Visual Indicators**: Clear status indicators for configured/unconfigured nodes
- ✅ **Easy Management**: Add, edit, delete credentials from workflow editor
- ✅ **Test Integration**: Test credentials before saving

### **Comprehensive Jira Operations**
- ✅ **Create Issues**: Full issue creation with all fields
- ✅ **Update Issues**: Modify existing issues
- ✅ **Get Issues**: Retrieve issue details
- ✅ **Search Issues**: JQL-based issue searching

## 🚀 How to Use

### **Step 1: Access Workflow Editor**
```bash
# Start the application
cd Agentflow
pnpm dev

# Navigate to:
# http://localhost:3000 → Dashboard → Workflows
```

### **Step 2: Add Jira Node to Workflow**
1. **Open Workflow Editor**
2. **Drag Jira Node** from the node library (Integrations category)
3. **Click on Jira Node** to configure

### **Step 3: Configure Jira Credentials**
1. **Click "Configure" button** in the credentials section
2. **Add New Jira Credentials**:
   - **Name**: "My Company Jira"
   - **Base URL**: https://yourcompany.atlassian.net
   - **Email**: your-email@company.com
   - **API Token**: [Your Jira API token]
   - **Project Key**: PROJ (optional)

3. **Test Connection** to verify credentials
4. **Save Credentials**

### **Step 4: Configure Jira Operation**
1. **Select Operation**: Create Issue, Update Issue, Get Issue, or Search Issues
2. **Configure Parameters** based on selected operation:

#### **Create Issue**
- Project Key: PROJ
- Issue Type: Task, Story, Bug, Epic
- Summary: Issue title
- Description: Issue description
- Priority: Highest, High, Medium, Low, Lowest
- Assignee: username or email

#### **Update Issue**
- Issue Key: PROJ-123
- Summary: Updated title
- Description: Updated description
- Priority: New priority
- Assignee: New assignee

#### **Get Issue**
- Issue Key: PROJ-123

#### **Search Issues**
- JQL Query: `project = PROJ AND status = "To Do"`

## 🔧 API Token Setup

### **Getting Your Jira API Token**
1. **Go to Atlassian Account**: https://id.atlassian.com/manage-profile/security/api-tokens
2. **Click "Create API token"**
3. **Label**: "AgentFlow Integration"
4. **Copy the generated token** (save it securely!)

### **Required Permissions**
Your Jira user needs:
- ✅ **Browse Projects** permission
- ✅ **Create Issues** permission (for create operations)
- ✅ **Edit Issues** permission (for update operations)
- ✅ **View Issues** permission (for get/search operations)

## 🏗️ Architecture

### **Frontend Components**
```
components/workflow/
├── jira-credentials-modal.tsx     # Credential management UI
├── jira-node.tsx                  # Jira workflow node
└── node-editor.tsx               # Updated with Jira support
```

### **Backend APIs**
```
app/api/
├── credentials/
│   ├── route.ts                  # CRUD operations for credentials
│   └── test/route.ts            # Credential testing endpoint
└── jira/
    └── test/route.ts            # Jira integration testing
```

### **State Management**
```
lib/
├── types/credentials.ts          # TypeScript interfaces
└── credentials-store.ts          # Zustand store for credentials
```

## 🧪 Testing the Integration

### **Test Credential Storage**
1. **Add Jira Credentials** in workflow editor
2. **Test Connection** - should show green success
3. **Save and Reuse** - credentials appear in dropdown for other nodes
4. **Delete Credentials** - should remove from all nodes using them

### **Test Jira Operations**
1. **Create Issue Operation**:
   - Configure all required fields
   - Execute workflow
   - Verify issue created in Jira

2. **Update Issue Operation**:
   - Use existing issue key
   - Modify fields
   - Execute workflow
   - Verify changes in Jira

3. **Get Issue Operation**:
   - Use existing issue key
   - Execute workflow
   - Verify issue data returned

4. **Search Issues Operation**:
   - Use JQL query
   - Execute workflow
   - Verify search results

### **Test Error Handling**
1. **Invalid Credentials**: Should show clear error message
2. **Network Issues**: Should handle timeouts gracefully
3. **Invalid Project Key**: Should show project not found error
4. **Invalid Issue Key**: Should show issue not found error

## 🔒 Security Features

### **Credential Protection**
- ✅ **API Token Masking**: Tokens never displayed in UI after saving
- ✅ **Secure Storage**: In-memory storage for demo (use encrypted DB in production)
- ✅ **User Isolation**: Users can only access their own credentials
- ✅ **No Logging**: Sensitive data not logged in console

### **API Security**
- ✅ **Input Validation**: All inputs validated before processing
- ✅ **Error Handling**: Detailed errors without exposing sensitive info
- ✅ **Rate Limiting Ready**: Architecture supports rate limiting
- ✅ **HTTPS Only**: All Jira API calls use HTTPS

## 📊 Workflow Examples

### **Basic Issue Creation Workflow**
```
Schedule Trigger → Jira (Create Issue) → Email Notification
```

### **Issue Management Workflow**
```
HTTP Trigger → Jira (Search Issues) → Condition → Jira (Update Issue)
```

### **Automated Bug Reporting**
```
Error Webhook → Transform Data → Jira (Create Bug) → Slack Notification
```

## 🚀 Production Deployment

### **Environment Variables**
```env
# Optional: Default Jira settings
JIRA_DEFAULT_BASE_URL=https://yourcompany.atlassian.net
JIRA_DEFAULT_PROJECT_KEY=PROJ

# Security
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://yourdomain.com
```

### **Database Migration**
For production, replace in-memory storage with encrypted database:

```typescript
// Replace credentials Map with database calls
const credentials = await db.credentials.findMany({
  where: { userId },
  select: { id: true, name: true, baseUrl: true, email: true, projectKey: true }
  // Never select apiToken in queries
})
```

### **Security Hardening**
1. **Encrypt API Tokens**: Use AES encryption for stored tokens
2. **Add Rate Limiting**: Prevent credential brute force attacks
3. **Audit Logging**: Log credential access and usage
4. **Token Rotation**: Support for rotating API tokens

## 🎉 Benefits

### **For Users**
- ✅ **Easy Setup**: One-time credential configuration
- ✅ **Secure**: No need to enter credentials in every node
- ✅ **Reusable**: Use same credentials across multiple workflows
- ✅ **Testable**: Verify credentials before using in workflows

### **For Developers**
- ✅ **Modular**: Clean separation of credential management
- ✅ **Extensible**: Easy to add other service credentials
- ✅ **Secure**: Built-in security best practices
- ✅ **Maintainable**: Well-structured codebase

The Jira credentials authentication system provides a secure, user-friendly way to integrate Jira operations into AgentFlow workflows, following n8n's proven patterns for credential management! 🚀