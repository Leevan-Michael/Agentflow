# Gmail Trigger Configuration - n8n Style Implementation

This document describes the comprehensive Gmail trigger configuration system that matches n8n's functionality and user experience.

## Overview

The enhanced Gmail trigger provides sophisticated email monitoring capabilities with:
- Multiple trigger conditions
- Advanced filtering options
- Real-time query preview
- Connection testing
- Preset configurations
- Comprehensive error handling

## Components

### 1. Enhanced Gmail Trigger Config (`enhanced-gmail-trigger-config.tsx`)

**Features:**
- **Tabbed Interface**: Trigger, Filters, Options, Preview
- **Real-time Query Generation**: Live Gmail search query preview
- **Connection Testing**: Test Gmail API connection and query
- **Label Loading**: Fetch and display Gmail labels
- **Preset Support**: Quick configuration templates

**Configuration Tabs:**

#### Trigger Tab
- **Event Type**: Message received/sent
- **Trigger Conditions**: 11 different trigger types
- **Condition-specific Fields**: Dynamic form fields based on selection

#### Filters Tab
- **Date Range**: Time-based filtering
- **Importance**: Important/not important emails
- **Category**: Primary, Social, Promotions, etc.

#### Options Tab
- **Polling Settings**: Interval and batch size
- **Processing Options**: Mark as read, include attachments
- **Email Management**: Add/remove labels after processing

#### Preview Tab
- **Query Display**: Generated Gmail search query
- **Test Functionality**: Live connection and query testing

### 2. Enhanced Gmail Trigger Node (`enhanced-gmail-trigger-node.tsx`)

**Features:**
- **Compact Display**: Shows key configuration at a glance
- **Status Indicators**: Visual execution status
- **Quick Controls**: Play/pause, settings access
- **Filter Badges**: Visual representation of active filters
- **Execution Feedback**: Real-time status updates

### 3. API Endpoints

#### `/api/gmail/labels` - Label Management
- Fetches available Gmail labels
- Returns system and custom labels with counts
- Supports credential-based authentication

#### `/api/gmail/test` - Connection Testing
- Tests Gmail API connection
- Validates search queries
- Returns sample matching emails

## Trigger Types

### 1. New Email (`newEmail`)
- Triggers on any new email
- Basic filtering only
- Fastest execution

### 2. Labeled Email (`labeledEmail`)
- Triggers on emails with specific labels
- Supports both system and custom labels
- Shows unread count per label

### 3. Sender Email (`senderEmail`)
- Triggers on emails from specific sender
- Supports exact match option
- Handles display names and aliases

### 4. Recipient Email (`recipientEmail`)
- Triggers on emails to specific recipient
- Supports To, CC, BCC filtering
- Useful for shared mailboxes

### 5. Sender Domain (`senderDomain`)
- Triggers on emails from specific domain
- Supports multiple domains (one per line)
- Wildcard domain matching

### 6. Subject Contains (`subjectContains`)
- Triggers on subject keyword matches
- Supports multiple keywords (comma-separated)
- Case-sensitive and whole-word options

### 7. Body Contains (`bodyContains`)
- Triggers on email body content
- Searches both plain text and HTML
- Multiple keyword support

### 8. Has Attachment (`hasAttachment`)
- Triggers on emails with any attachment
- Simple boolean condition
- Fast execution

### 9. Attachment Type (`attachmentType`)
- Triggers on specific attachment types
- Supports: PDF, Images, Excel, Word, etc.
- Minimum size filtering
- Attachment count conditions

### 10. Email Size (`emailSize`)
- Triggers based on email size
- Larger/smaller than conditions
- Supports KB, MB, GB units
- Includes attachments in calculation

### 11. Custom Query (`customQuery`)
- Advanced Gmail search syntax
- Full Gmail operator support
- Overrides other filters
- Expert-level configuration

## Advanced Features

### Query Preview
```
Generated query examples:
- Basic: "is:unread -in:spam -in:trash in:inbox"
- Filtered: "from:support@company.com has:attachment larger:1M"
- Complex: "subject:(bug OR error) has:attachment filename:pdf newer_than:1d"
```

### Label Management
- Automatic label loading from Gmail
- System vs custom label distinction
- Unread count display
- Label-based filtering

### Connection Testing
- Real-time Gmail API testing
- Query validation
- Sample email preview
- Error diagnosis

### Preset Configurations
1. **Support Emails**: Monitor customer support
2. **Bug Reports**: Track bug-related emails
3. **Invoice Processing**: Handle PDF invoices
4. **High Priority**: Important email alerts
5. **Large Attachments**: Size-based filtering

## Configuration Options

### Polling Settings
- **Interval**: 1 minute to 1 hour
- **Batch Size**: 1-100 emails per check
- **Connection Timeout**: Configurable

### Processing Options
- **Mark as Read**: Auto-mark processed emails
- **Include Attachments**: Metadata inclusion
- **Download Attachments**: Content download
- **Add Labels**: Post-processing labeling
- **Remove Labels**: Label cleanup

### Filtering Options
- **Unread Only**: Skip read emails
- **Exclude Spam**: Ignore spam folder
- **Exclude Trash**: Ignore deleted emails
- **Date Range**: Time-based filtering
- **Importance**: Priority-based filtering

## Usage Examples

### Example 1: Support Ticket Creation
```javascript
{
  event: 'messageReceived',
  triggerOn: 'senderEmail',
  senderEmail: 'support@company.com',
  onlyUnread: true,
  markAsRead: true,
  includeAttachments: true,
  addLabels: 'processed,automated'
}
```

### Example 2: Bug Report Processing
```javascript
{
  event: 'messageReceived',
  triggerOn: 'subjectContains',
  subjectKeywords: 'bug,error,issue,problem',
  importance: 'important',
  includeAttachments: true,
  pollInterval: 2
}
```

### Example 3: Invoice Automation
```javascript
{
  event: 'messageReceived',
  triggerOn: 'attachmentType',
  attachmentType: 'pdf',
  senderDomain: 'vendors.company.com',
  downloadAttachments: true,
  addLabels: 'invoices,pending'
}
```

### Example 4: Custom Query
```javascript
{
  event: 'messageReceived',
  triggerOn: 'customQuery',
  customQuery: 'from:alerts@monitoring.com subject:"CRITICAL" newer_than:1h',
  pollInterval: 1,
  maxEmails: 5
}
```

## Demo Page

Access the interactive demo at `/gmail-trigger-demo` to:
- Test different configurations
- See real-time query generation
- Try preset configurations
- Simulate execution scenarios

## Integration Points

### Workflow Integration
- Seamless workflow editor integration
- Visual node representation
- Real-time status updates
- Error handling and display

### Credential Management
- OAuth2 Gmail authentication
- Token refresh handling
- Multiple account support
- Secure credential storage

### Monitoring & Logging
- Execution history tracking
- Performance metrics
- Error logging and alerts
- Usage analytics

## Best Practices

### Performance
- Use specific filters to reduce API calls
- Set appropriate polling intervals
- Limit batch sizes for large mailboxes
- Monitor quota usage

### Security
- Use OAuth2 for authentication
- Implement proper token refresh
- Secure credential storage
- Audit access logs

### Reliability
- Handle API rate limits
- Implement retry logic
- Monitor connection health
- Graceful error handling

## Troubleshooting

### Common Issues
1. **Authentication Errors**: Check OAuth2 setup
2. **No Emails Found**: Verify query syntax
3. **Rate Limiting**: Reduce polling frequency
4. **Attachment Issues**: Check download permissions

### Debug Tools
- Connection test functionality
- Query preview and validation
- Execution logs and metrics
- Error reporting system

This implementation provides a comprehensive, n8n-style Gmail trigger configuration system with professional-grade features and user experience.