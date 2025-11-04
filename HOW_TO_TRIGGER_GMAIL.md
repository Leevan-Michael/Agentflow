# How to Trigger Gmail in Workflows

This guide explains how to set up and trigger Gmail-based workflows in the AgentFlow system.

## Overview

Gmail triggers allow you to automatically start workflows when specific email events occur, such as:
- New emails received
- Emails from specific senders
- Emails with certain subjects or content
- Emails with attachments
- Emails with specific labels

## Quick Start

### 1. Access Gmail Trigger Demo
Navigate to: `/gmail-trigger-demo`

This page provides:
- Interactive Gmail trigger configuration
- Real-time testing capabilities
- Sample configurations and presets
- Live logging to see trigger execution

### 2. Basic Setup Steps

1. **Configure Credentials**
   - Click "Connect" to set up Gmail OAuth
   - Grant necessary permissions
   - Test connection

2. **Choose Trigger Type**
   - New Email (any email)
   - Sender Email (specific sender)
   - Subject Contains (keywords)
   - Has Attachment
   - Custom Query (advanced)

3. **Set Polling Options**
   - Poll interval (1-60 minutes)
   - Max emails per check
   - Processing options

4. **Test Configuration**
   - Use "Test Configuration" button
   - Check logs for results
   - Verify trigger conditions

## Trigger Types Explained

### 1. New Email Trigger
**Use Case**: Trigger on any new email
```javascript
{
  triggerOn: 'newEmail',
  onlyUnread: true,
  pollInterval: 5
}
```

### 2. Sender Email Trigger
**Use Case**: Monitor emails from specific senders
```javascript
{
  triggerOn: 'senderEmail',
  senderEmail: 'support@company.com',
  onlyUnread: true,
  markAsRead: true
}
```

### 3. Subject Contains Trigger
**Use Case**: Trigger on emails with specific keywords in subject
```javascript
{
  triggerOn: 'subjectContains',
  subjectKeywords: 'urgent, bug, error, critical',
  caseSensitive: false,
  wholeWordsOnly: false
}
```

### 4. Body Contains Trigger
**Use Case**: Monitor email content for specific terms
```javascript
{
  triggerOn: 'bodyContains',
  bodyKeywords: 'action required, deadline, important',
  includeHtmlContent: true
}
```

### 5. Labeled Email Trigger
**Use Case**: Trigger on emails with specific Gmail labels
```javascript
{
  triggerOn: 'labeledEmail',
  labelName: 'Important',
  onlyUnread: true
}
```

### 6. Attachment Trigger
**Use Case**: Process emails with attachments
```javascript
{
  triggerOn: 'attachmentType',
  attachmentType: 'pdf',
  minAttachmentSize: '1MB',
  downloadAttachments: true
}
```

### 7. Domain Trigger
**Use Case**: Monitor emails from specific domains
```javascript
{
  triggerOn: 'senderDomain',
  senderDomain: 'company.com',
  domainList: 'company.com\npartner.org\nclient.net'
}
```

### 8. Custom Query Trigger
**Use Case**: Advanced Gmail search syntax
```javascript
{
  triggerOn: 'customQuery',
  customQuery: 'from:alerts@monitoring.com subject:"CRITICAL" newer_than:1h'
}
```

## Step-by-Step Workflow Creation

### Step 1: Create New Workflow
1. Go to `/workflows`
2. Click "New Workflow"
3. Choose "Email to Ticket Automation" template

### Step 2: Configure Gmail Trigger
1. **Add Gmail Trigger Node**
   - Drag Gmail Trigger from node library
   - Click to configure

2. **Set Up Authentication**
   - Click "Connect Gmail Account"
   - Complete OAuth flow
   - Grant required permissions

3. **Configure Trigger Conditions**
   - Select trigger type
   - Set specific parameters
   - Configure polling interval

### Step 3: Add Processing Nodes
1. **AI Analysis Node** (Optional)
   - Classify email content
   - Extract key information
   - Determine priority/category

2. **JIRA Ticket Creation**
   - Map email data to ticket fields
   - Set project and issue type
   - Configure assignee rules

3. **Notification Node**
   - Send confirmation emails
   - Slack notifications
   - Update dashboards

### Step 4: Test the Workflow
1. **Use Test Mode**
   - Click "Test Configuration"
   - Send test email
   - Monitor execution logs

2. **Check Results**
   - Verify trigger activation
   - Confirm ticket creation
   - Validate notifications

## Configuration Examples

### Support Ticket Automation
```javascript
{
  // Gmail Trigger
  event: 'messageReceived',
  triggerOn: 'senderEmail',
  senderEmail: 'support@company.com',
  onlyUnread: true,
  markAsRead: true,
  includeAttachments: true,
  
  // Processing Options
  pollInterval: 2,
  maxEmails: 10,
  addLabels: 'processed,automated'
}
```

### Bug Report Processing
```javascript
{
  // Gmail Trigger
  event: 'messageReceived',
  triggerOn: 'subjectContains',
  subjectKeywords: 'bug,error,issue,problem',
  importance: 'important',
  
  // AI Analysis
  aiAnalysis: true,
  classification: ['bug', 'feature', 'question'],
  priorityDetection: true,
  
  // JIRA Integration
  project: 'BUG',
  issueType: 'Bug',
  autoAssign: true
}
```

### Invoice Processing
```javascript
{
  // Gmail Trigger
  event: 'messageReceived',
  triggerOn: 'attachmentType',
  attachmentType: 'pdf',
  senderDomain: 'vendors.company.com',
  downloadAttachments: true,
  
  // Processing
  extractData: true,
  validateInvoice: true,
  approvalWorkflow: true
}
```

## Advanced Features

### 1. Query Preview
The system generates Gmail search queries in real-time:
```
Generated Query Examples:
- Basic: "is:unread -in:spam -in:trash in:inbox"
- Filtered: "from:support@company.com has:attachment larger:1M"
- Complex: "subject:(bug OR error) has:attachment filename:pdf newer_than:1d"
```

### 2. Label Management
- Automatic label loading from Gmail
- System vs custom label distinction
- Unread count display
- Post-processing label management

### 3. Connection Testing
- Real-time Gmail API testing
- Query validation
- Sample email preview
- Error diagnosis

### 4. Preset Configurations
Ready-to-use templates:
- **Support Emails**: Customer support automation
- **Bug Reports**: Issue tracking integration
- **Invoice Processing**: Financial workflow automation
- **High Priority**: Critical email alerts
- **Large Attachments**: File processing workflows

## Troubleshooting

### Common Issues

#### 1. Authentication Problems
**Symptoms**: "No Gmail account connected" or authentication errors

**Solutions**:
- Re-authenticate Gmail account
- Check OAuth permissions
- Verify API credentials
- Test connection manually

#### 2. No Emails Detected
**Symptoms**: Trigger doesn't activate despite matching emails

**Solutions**:
- Verify Gmail search query
- Check polling interval
- Confirm email matches criteria
- Test with simpler query first

#### 3. Rate Limiting
**Symptoms**: "Rate limit exceeded" errors

**Solutions**:
- Increase polling interval
- Reduce max emails per check
- Implement exponential backoff
- Monitor quota usage

#### 4. Attachment Issues
**Symptoms**: Attachments not downloading or processing

**Solutions**:
- Check download permissions
- Verify attachment size limits
- Confirm file type support
- Test with smaller files

### Debug Tools

#### 1. Connection Test
```javascript
// Test Gmail API connection
POST /api/gmail/test
{
  "credentials": {...},
  "query": "is:unread",
  "maxResults": 1
}
```

#### 2. Query Validation
```javascript
// Validate Gmail search query
const query = "from:support@company.com has:attachment"
// Preview in Gmail web interface first
```

#### 3. Log Analysis
- Check execution logs in `/debug`
- Monitor API response times
- Track success/failure rates
- Analyze error patterns

## Best Practices

### 1. Performance Optimization
- Use specific filters to reduce API calls
- Set appropriate polling intervals
- Limit batch sizes for large mailboxes
- Monitor quota usage regularly

### 2. Security Considerations
- Use OAuth2 for authentication
- Implement proper token refresh
- Secure credential storage
- Audit access logs regularly

### 3. Reliability Measures
- Handle API rate limits gracefully
- Implement retry logic with backoff
- Monitor connection health
- Set up error alerting

### 4. Workflow Design
- Start with simple triggers
- Test thoroughly before production
- Document configuration choices
- Plan for error scenarios

## API Integration

### Gmail API Endpoints
```javascript
// Get labels
GET /api/gmail/labels

// Test connection
POST /api/gmail/test

// Trigger webhook
POST /api/gmail/trigger
```

### Webhook Configuration
```javascript
{
  "url": "https://your-domain.com/api/gmail/webhook",
  "events": ["messageReceived"],
  "filters": {
    "query": "is:unread",
    "maxResults": 10
  }
}
```

## Monitoring & Analytics

### Key Metrics
- **Trigger Activation Rate**: How often triggers fire
- **Processing Success Rate**: Successful workflow completions
- **Average Processing Time**: Time from trigger to completion
- **Error Rate**: Failed executions and reasons

### Dashboard Views
- Real-time trigger status
- Recent email processing
- Error logs and alerts
- Performance metrics

## Getting Help

### Resources
- **Demo Page**: `/gmail-trigger-demo` - Interactive testing
- **Debug Tools**: `/debug` - System diagnostics
- **Documentation**: This guide and API docs
- **Support**: Contact system administrators

### Community
- Share configuration examples
- Report bugs and issues
- Request new features
- Contribute improvements

---

## Quick Reference

### Essential URLs
- **Gmail Demo**: `/gmail-trigger-demo`
- **Workflow Editor**: `/workflows`
- **Debug Tools**: `/debug`
- **Test Logs**: `/test-logs`

### Key Components
- **Enhanced Gmail Trigger Config**: Full configuration interface
- **Gmail Trigger Node**: Visual workflow component
- **Execution Logs**: Real-time monitoring
- **Status Dashboard**: Performance metrics

### Configuration Templates
Copy and modify these templates for common use cases:

**Basic Email Monitor**:
```json
{
  "triggerOn": "newEmail",
  "onlyUnread": true,
  "pollInterval": 5,
  "maxEmails": 10
}
```

**Support Automation**:
```json
{
  "triggerOn": "senderEmail",
  "senderEmail": "support@company.com",
  "markAsRead": true,
  "includeAttachments": true,
  "addLabels": "processed"
}
```

**Bug Tracking**:
```json
{
  "triggerOn": "subjectContains",
  "subjectKeywords": "bug,error,issue",
  "importance": "important",
  "downloadAttachments": true
}
```

This comprehensive system provides enterprise-grade Gmail integration with powerful automation capabilities.