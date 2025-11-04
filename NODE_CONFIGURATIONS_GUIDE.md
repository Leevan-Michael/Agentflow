# Node Configurations Guide

## 🎯 Overview

This guide covers the comprehensive node configuration system implemented for all workflow nodes. Each node type now has detailed settings, parameters, validation, and credential management.

## 📋 **Node Configuration System**

### **Features Implemented**
- ✅ **Comprehensive Parameters**: All nodes have detailed configuration options
- ✅ **Input Validation**: Real-time validation with error messages
- ✅ **Credential Management**: Secure credential handling for external services
- ✅ **Type Safety**: Proper TypeScript interfaces for all configurations
- ✅ **User-Friendly UI**: Enhanced node editor with intuitive controls

### **Parameter Types Supported**
- `string` - Text input
- `number` - Numeric input with min/max validation
- `boolean` - Toggle switch
- `select` - Dropdown selection
- `multiselect` - Multiple selection
- `textarea` - Multi-line text
- `password` - Secure password input
- `url` - URL validation
- `email` - Email validation
- `json` - JSON editor with syntax validation

## 🔧 **Node Categories & Configurations**

### **1. Trigger Nodes**

#### **Webhook Trigger**
- **Path**: Custom webhook endpoint path
- **Method**: HTTP method (GET, POST, PUT, DELETE, PATCH)
- **Authentication**: Security options (None, API Key, Basic Auth, Bearer Token)
- **Outputs**: Trigger, Request Body, Headers, Query Parameters

#### **Schedule Trigger**
- **Cron Expression**: Schedule definition (e.g., "0 9 * * 1-5")
- **Timezone**: Execution timezone
- **Enabled**: Toggle to enable/disable schedule
- **Outputs**: Trigger, Execution Timestamp

### **2. Action Nodes**

#### **HTTP Request**
- **URL**: Target endpoint with validation
- **Method**: HTTP method selection
- **Headers**: JSON object for custom headers
- **Body**: Request payload for POST/PUT/PATCH
- **Timeout**: Request timeout (1-300 seconds)
- **Outputs**: Response, Status Code, Response Headers

#### **Send Email**
- **To/CC/BCC**: Recipient email addresses
- **Subject**: Email subject line
- **Body**: Email content (plain text or HTML)
- **HTML Format**: Toggle for HTML emails
- **Priority**: Email priority (Low, Normal, High)
- **Credentials**: SMTP, Gmail, or Outlook credentials required
- **Outputs**: Success status, Message ID

### **3. Logic Nodes**

#### **IF Condition**
- **Conditions**: JSON array of condition objects
- **Combine Operation**: AND/OR logic for multiple conditions
- **Continue on Fail**: Workflow continuation setting
- **Outputs**: True path, False path

#### **Transform Data**
- **Transformations**: JSON array of transformation operations
- **Keep Original**: Include original data in output
- **Error Handling**: Continue, Stop, or Skip on errors
- **Outputs**: Transformed Data, Original Data

#### **Delay**
- **Delay Type**: Fixed, Random, or Until specific time
- **Duration**: Delay duration in seconds (1-3600)
- **Max Duration**: Maximum for random delays
- **Specific Time**: ISO timestamp for "until" delays
- **Outputs**: After Delay trigger

### **4. Integration Nodes**

#### **Jira**
- **Operation**: Create, Update, Get, Search, Comment, Transition
- **Project Key**: Jira project identifier
- **Issue Type**: Task, Bug, Story, Epic, Sub-task
- **Summary**: Issue title
- **Description**: Detailed description
- **Priority**: Highest to Lowest
- **Assignee**: User email
- **Labels**: Comma-separated labels
- **Credentials**: Jira API credentials required
- **Outputs**: Issue Data, Issue Key, Issue URL

#### **Slack**
- **Operation**: Send Message, Send DM, Create Channel, etc.
- **Channel**: Channel name (#general) or username (@user)
- **Message**: Message content
- **Username**: Custom bot username
- **Icon Emoji**: Bot icon emoji
- **Attachments**: JSON message attachments
- **Credentials**: Slack API credentials required
- **Outputs**: Message Data, Message Timestamp

#### **Gmail**
- **Operation**: Send, Get, Search, Mark Read, Add Label
- **To**: Recipient email
- **Subject**: Email subject
- **Body**: Email content
- **HTML Format**: HTML email toggle
- **Credentials**: Gmail OAuth credentials required
- **Outputs**: Email Data, Message ID

#### **Notion**
- **Operation**: Create Page, Update Page, Get Page, Database operations
- **Page ID**: Notion page identifier
- **Database ID**: Notion database identifier
- **Title**: Page or entry title
- **Content**: Page content
- **Properties**: Database properties as JSON
- **Credentials**: Notion API credentials required
- **Outputs**: Page Data, Page URL

#### **Airtable**
- **Operation**: Create, Update, Get, List, Delete records
- **Base ID**: Airtable base identifier
- **Table ID**: Airtable table identifier
- **Record ID**: Record identifier (for updates)
- **Fields**: Record fields as JSON
- **Max Records**: Maximum records to retrieve (1-1000)
- **Credentials**: Airtable API credentials required
- **Outputs**: Record Data, Records List

### **5. Project Management Nodes**

#### **Jira Project Management**
- **Operation**: Create Project, Sprint management, Epic creation
- **Project Key**: Jira project identifier
- **Project Name**: Project name for creation
- **Sprint Name**: Sprint identifier
- **Sprint Duration**: Duration in weeks (1-8)
- **Epic Name**: Epic title
- **Credentials**: Jira API credentials required
- **Outputs**: Project Data, Sprint Data, Epic Data

#### **Trello**
- **Operation**: Card and board management
- **Board ID**: Trello board identifier
- **List ID**: Trello list identifier
- **Card Name**: Card title
- **Description**: Card description
- **Due Date**: Card due date (YYYY-MM-DD)
- **Labels**: Comma-separated label names
- **Credentials**: Trello API credentials required
- **Outputs**: Card Data, Board Data, List Data

#### **Asana**
- **Operation**: Task and project management
- **Project ID**: Asana project identifier
- **Task Name**: Task title
- **Task Notes**: Task description
- **Assignee**: User email
- **Due Date**: Task due date (YYYY-MM-DD)
- **Priority**: Low, Normal, High
- **Credentials**: Asana API credentials required
- **Outputs**: Task Data, Project Data

#### **Monday.com**
- **Operation**: Item and board management
- **Board ID**: Monday.com board identifier
- **Item Name**: Item title
- **Column Values**: Column values as JSON
- **Group ID**: Group identifier
- **Credentials**: Monday.com API credentials required
- **Outputs**: Item Data, Board Data

## 🎨 **Enhanced Node Editor Features**

### **User Interface**
- **Visual Parameter Types**: Different input controls for each parameter type
- **Real-time Validation**: Immediate feedback on parameter errors
- **Credential Integration**: Easy credential configuration access
- **Help Text**: Tooltips and descriptions for all parameters
- **JSON Syntax Highlighting**: Proper JSON editing experience

### **Validation System**
- **Required Fields**: Clear indication of mandatory parameters
- **Type Validation**: URL, email, number range validation
- **JSON Validation**: Syntax checking for JSON parameters
- **Custom Patterns**: Regex validation for specific formats
- **Error Messages**: Clear, actionable error descriptions

### **Credential Management**
- **Secure Storage**: Encrypted credential storage
- **Multiple Types**: Support for various authentication methods
- **Easy Access**: One-click credential configuration
- **Visual Indicators**: Clear status of credential requirements

## 🚀 **How to Use**

### **1. Configure a Node**
1. **Add Node**: Drag node from library to canvas
2. **Click Node**: Select the node to configure
3. **Open Editor**: Click the settings icon or double-click
4. **Configure Parameters**: Fill in required and optional parameters
5. **Set Credentials**: Configure external service credentials if needed
6. **Save**: Save configuration and close editor

### **2. Parameter Configuration**
- **Required Parameters**: Marked with red asterisk (*)
- **Optional Parameters**: Can be left empty
- **Default Values**: Pre-filled where appropriate
- **Validation**: Real-time error checking
- **Help**: Hover over info icons for parameter descriptions

### **3. Credential Setup**
- **Click "Configure"**: In the credentials section
- **Add New**: Create new credential set
- **Test Connection**: Verify credentials work
- **Save**: Store securely for reuse

## 📚 **Configuration Examples**

### **HTTP Request Node**
```json
{
  "url": "https://api.github.com/repos/owner/repo/issues",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer {{$credentials.github.token}}",
    "Content-Type": "application/json"
  },
  "body": {
    "title": "{{$node.webhook.json.title}}",
    "body": "{{$node.webhook.json.description}}"
  },
  "timeout": 30
}
```

### **Jira Create Issue**
```json
{
  "operation": "create",
  "project": "PROJ",
  "issueType": "Task",
  "summary": "{{$node.webhook.json.title}}",
  "description": "Created from workflow: {{$node.webhook.json.description}}",
  "priority": "High",
  "assignee": "developer@company.com",
  "labels": "automation, workflow"
}
```

### **Condition Node**
```json
{
  "conditions": [
    {
      "field": "{{$node.http.json.status}}",
      "operator": "equals",
      "value": "success"
    },
    {
      "field": "{{$node.http.json.code}}",
      "operator": "greaterThan",
      "value": 200
    }
  ],
  "combineOperation": "AND",
  "continueOnFail": false
}
```

## 🔍 **Testing Your Configurations**

### **Validation Testing**
1. **Leave Required Fields Empty**: Verify error messages appear
2. **Enter Invalid Data**: Test URL, email, JSON validation
3. **Test Ranges**: Try numbers outside min/max limits
4. **JSON Syntax**: Test malformed JSON in JSON fields

### **Credential Testing**
1. **Invalid Credentials**: Test with wrong API keys
2. **Connection Testing**: Use built-in test functionality
3. **Permission Testing**: Verify API permissions are sufficient

### **Integration Testing**
1. **End-to-End**: Test complete workflows with real data
2. **Error Handling**: Test how nodes handle API failures
3. **Data Flow**: Verify data passes correctly between nodes

## 🎯 **Next Steps**

The comprehensive node configuration system is now ready for use. All 15+ node types have detailed configurations with:

- ✅ **Complete Parameter Sets**: All necessary configuration options
- ✅ **Validation System**: Real-time error checking and feedback
- ✅ **Credential Integration**: Secure external service authentication
- ✅ **Enhanced UI**: User-friendly configuration interface
- ✅ **Type Safety**: Full TypeScript support

Start building complex workflows with properly configured nodes! 🚀