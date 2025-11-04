# Gmail Trigger Guide

## 🎯 Overview

The Gmail Trigger allows you to automatically start workflows when specific email events occur in your Gmail account. This powerful trigger can monitor for new emails, specific senders, subject keywords, labels, and more.

## 📬 **Gmail Trigger Features**

### **Trigger Types**
- ✅ **New Email Received**: Trigger on any new email
- ✅ **Email with Specific Label**: Monitor emails with Gmail labels
- ✅ **Email from Specific Sender**: Watch for emails from particular addresses
- ✅ **Subject Contains Keywords**: Trigger when subject contains specific words
- ✅ **Email with Attachment**: Monitor emails that have attachments

### **Configuration Options**
- ✅ **Poll Interval**: Check frequency (1-60 minutes)
- ✅ **Mark as Read**: Automatically mark processed emails as read
- ✅ **Include Attachments**: Include attachment data in workflow
- ✅ **Max Emails per Check**: Limit processing to prevent overload
- ✅ **Enable/Disable**: Toggle trigger on/off

### **Output Data**
- ✅ **Email Data**: Complete email information
- ✅ **Subject**: Email subject line
- ✅ **Sender**: Sender email address
- ✅ **Body**: Email content (plain text and HTML)
- ✅ **Attachments**: Attachment metadata and content
- ✅ **Labels**: Gmail labels applied to the email
- ✅ **Timestamp**: When the email was received

## 🚀 **How to Set Up Gmail Trigger**

### **Step 1: Add Gmail Trigger Node**
1. **Open Workflow Editor**: Navigate to `/dashboard/workflows`
2. **Add Node**: Click "Add Node" or drag from node library
3. **Select Gmail Trigger**: Choose from "Triggers" category
4. **Place on Canvas**: Position the trigger node

### **Step 2: Configure Gmail Credentials**
1. **Click Configure**: In the credentials section
2. **Add Gmail Credentials**:
   - **Name**: "My Gmail Account"
   - **Email**: your-email@gmail.com
   - **OAuth Token**: Gmail API OAuth token
   - **Refresh Token**: For token renewal

3. **Test Connection**: Verify credentials work
4. **Save Credentials**: Store securely for reuse

### **Step 3: Configure Trigger Settings**

#### **Basic Configuration**
```json
{
  "triggerOn": "newEmail",
  "pollInterval": 5,
  "maxEmails": 10,
  "enabled": true
}
```

#### **Label-Based Trigger**
```json
{
  "triggerOn": "labeledEmail",
  "labelName": "Important",
  "pollInterval": 5,
  "markAsRead": true
}
```

#### **Sender-Based Trigger**
```json
{
  "triggerOn": "senderEmail",
  "senderEmail": "support@company.com",
  "pollInterval": 2,
  "includeAttachments": true
}
```

#### **Subject Keyword Trigger**
```json
{
  "triggerOn": "subjectContains",
  "subjectKeywords": "urgent, invoice, support",
  "pollInterval": 1,
  "maxEmails": 5
}
```

### **Step 4: Connect to Workflow**
1. **Add Action Nodes**: HTTP Request, Jira, Slack, etc.
2. **Create Connections**: Drag from Gmail trigger output ports
3. **Configure Actions**: Use email data in subsequent nodes
4. **Test Workflow**: Execute to verify functionality

## 🔧 **Configuration Parameters**

### **Trigger Type Options**

#### **New Email Received**
- **Description**: Triggers on any new email in inbox
- **Use Case**: General email processing, notifications
- **Configuration**: No additional parameters needed

#### **Email with Specific Label**
- **Description**: Monitors emails with specific Gmail labels
- **Parameters**: 
  - `labelName`: Gmail label to watch (e.g., "Important", "Work")
- **Use Case**: Organized email processing, priority handling

#### **Email from Specific Sender**
- **Description**: Watches for emails from particular email addresses
- **Parameters**: 
  - `senderEmail`: Email address to monitor
- **Use Case**: Customer support, vendor communications

#### **Subject Contains Keywords**
- **Description**: Triggers when subject contains specific words
- **Parameters**: 
  - `subjectKeywords`: Comma-separated keywords
- **Use Case**: Alert processing, keyword-based routing

#### **Email with Attachment**
- **Description**: Monitors emails that have file attachments
- **Parameters**: None required
- **Use Case**: Document processing, file handling workflows

### **Advanced Settings**

#### **Poll Interval**
- **Options**: 1, 5, 10, 15, 30, 60 minutes
- **Default**: 5 minutes
- **Recommendation**: 
  - High priority: 1-5 minutes
  - Normal: 10-15 minutes
  - Low priority: 30-60 minutes

#### **Processing Options**
- **Mark as Read**: Automatically mark processed emails as read
- **Include Attachments**: Download and include attachment data
- **Max Emails per Check**: Limit to prevent overwhelming workflows

## 📊 **Email Data Structure**

### **Trigger Output**
```json
{
  "trigger": true,
  "email": {
    "id": "email-12345",
    "subject": "Important: Action Required",
    "sender": "support@company.com",
    "receivedAt": "2024-01-15T10:30:00Z",
    "body": {
      "text": "Plain text content...",
      "html": "<html>HTML content...</html>"
    },
    "labels": ["Important", "Work"],
    "hasAttachment": true,
    "isRead": false
  },
  "attachments": [
    {
      "filename": "document.pdf",
      "size": 1048576,
      "mimeType": "application/pdf",
      "content": "base64-encoded-content"
    }
  ]
}
```

### **Using Email Data in Workflows**
```javascript
// Access email subject
{{$node["Gmail Trigger"].json["subject"]}}

// Access sender email
{{$node["Gmail Trigger"].json["sender"]}}

// Access email body
{{$node["Gmail Trigger"].json["body"]["text"]}}

// Check if email has attachments
{{$node["Gmail Trigger"].json["hasAttachment"]}}

// Access attachment filename
{{$node["Gmail Trigger"].json["attachments"][0]["filename"]}}
```

## 🎨 **Example Workflows**

### **1. Support Ticket Creation**
```
Gmail Trigger (support emails) → Jira (create ticket) → Slack (notify team)
```

**Configuration**:
- Trigger: Email from "support@company.com"
- Jira: Create ticket with email subject and body
- Slack: Notify support channel

### **2. Invoice Processing**
```
Gmail Trigger (invoice emails) → HTTP Request (extract data) → Airtable (store)
```

**Configuration**:
- Trigger: Subject contains "invoice"
- HTTP: Send to OCR service for data extraction
- Airtable: Store invoice data in database

### **3. Important Email Alerts**
```
Gmail Trigger (important label) → Slack (immediate alert) → SMS (backup)
```

**Configuration**:
- Trigger: Emails with "Important" label
- Slack: Send immediate notification
- SMS: Backup alert for critical emails

### **4. Attachment Processing**
```
Gmail Trigger (has attachment) → Transform (extract files) → Cloud Storage
```

**Configuration**:
- Trigger: Emails with attachments
- Transform: Extract and process attachments
- Storage: Save files to cloud storage

## 🔍 **Testing Gmail Trigger**

### **Test Scenarios**

#### **1. Basic Email Trigger**
1. **Configure**: Set trigger to "New Email Received"
2. **Send Test Email**: Send email to monitored account
3. **Verify**: Check workflow execution logs
4. **Validate**: Confirm email data is captured correctly

#### **2. Label-Based Trigger**
1. **Setup Gmail Label**: Create "Test" label in Gmail
2. **Configure Trigger**: Set to watch "Test" label
3. **Apply Label**: Add "Test" label to an email
4. **Verify Trigger**: Confirm workflow executes

#### **3. Sender Filter**
1. **Configure**: Set specific sender email
2. **Send from Sender**: Send email from that address
3. **Send from Other**: Send from different address
4. **Verify Filtering**: Only sender emails should trigger

#### **4. Subject Keywords**
1. **Set Keywords**: Configure "urgent, important"
2. **Send Matching**: Email with "urgent" in subject
3. **Send Non-matching**: Email without keywords
4. **Verify Filtering**: Only matching emails trigger

### **Monitoring and Debugging**

#### **Trigger Status**
- **Active**: Trigger is monitoring emails
- **Last Check**: When emails were last checked
- **Next Check**: When next check will occur
- **Emails Processed**: Count of processed emails

#### **Common Issues**
- **No Emails Triggering**: Check credentials and permissions
- **Wrong Emails Triggering**: Review filter criteria
- **Missing Attachments**: Enable "Include Attachments" option
- **Rate Limiting**: Increase poll interval if hitting limits

## 🔐 **Security and Permissions**

### **Gmail API Permissions**
- **Read Access**: Required to read email content
- **Modify Access**: Needed to mark emails as read
- **Label Access**: Required for label-based triggers

### **OAuth Scopes**
```
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/gmail.modify
```

### **Best Practices**
- **Least Privilege**: Request only necessary permissions
- **Secure Storage**: Encrypt stored credentials
- **Token Refresh**: Handle OAuth token expiration
- **Rate Limiting**: Respect Gmail API limits

## 🎯 **Use Cases**

### **Business Automation**
- **Customer Support**: Auto-create tickets from support emails
- **Invoice Processing**: Extract and process invoice data
- **Lead Management**: Capture leads from contact forms
- **Document Workflow**: Process email attachments

### **Personal Automation**
- **Bill Reminders**: Alert for bill payment emails
- **Travel Updates**: Process flight/hotel confirmations
- **Newsletter Processing**: Organize and archive newsletters
- **Important Alerts**: Forward critical emails to phone

### **Integration Scenarios**
- **CRM Integration**: Sync emails with customer records
- **Project Management**: Create tasks from email requests
- **Analytics**: Track email patterns and metrics
- **Backup**: Archive important emails to cloud storage

## 🚀 **Ready to Use!**

The Gmail Trigger is now fully implemented and ready for use. You can:

- **Monitor Gmail**: Watch for specific email events
- **Process Automatically**: Handle emails without manual intervention
- **Integrate Seamlessly**: Connect with other workflow nodes
- **Scale Efficiently**: Handle high email volumes with proper configuration

Start building email-driven workflows today! 📧🚀