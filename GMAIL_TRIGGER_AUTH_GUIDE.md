# Gmail Trigger Authentication & Configuration Guide

## 🔐 **Gmail Authentication Setup**

### **Overview**
The Gmail Trigger uses OAuth 2.0 authentication to securely access your Gmail account. This guide walks you through setting up Google Cloud credentials and configuring the Gmail trigger with advanced conditions.

## 🚀 **Step 1: Google Cloud Setup**

### **Create Google Cloud Project**
1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create New Project**:
   - Click "Select a project" → "New Project"
   - Enter project name: "AgentFlow Gmail Integration"
   - Click "Create"

### **Enable Gmail API**
1. **Navigate to APIs & Services** → **Library**
2. **Search for "Gmail API"**
3. **Click "Gmail API"** → **Enable**

### **Create OAuth 2.0 Credentials**
1. **Go to APIs & Services** → **Credentials**
2. **Click "Create Credentials"** → **OAuth client ID**
3. **Configure OAuth consent screen** (if prompted):
   - User Type: External (for testing) or Internal (for organization)
   - App name: "AgentFlow Gmail Trigger"
   - User support email: Your email
   - Developer contact: Your email
4. **Create OAuth client ID**:
   - Application type: **Desktop application**
   - Name: "AgentFlow Gmail Client"
   - Click "Create"
5. **Download credentials** or copy Client ID and Client Secret

## 🔧 **Step 2: Configure Gmail Trigger**

### **Add Gmail Trigger to Workflow**
1. **Open Workflow Editor**: Navigate to `/dashboard/workflows`
2. **Add Gmail Trigger**: Click "Add Node" → Select "Gmail Trigger"
3. **Click on Gmail Trigger node** to open configuration

### **Setup Credentials**
1. **Click "Setup" in Credentials section**
2. **Enter Credential Details**:
   - **Name**: "My Gmail Account"
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
3. **Generate Authorization URL**
4. **Authorize Access**:
   - Click the authorization URL
   - Sign in to Google account
   - Grant permissions
   - Copy authorization code
5. **Exchange for Tokens**:
   - Paste authorization code
   - Click "Exchange for Tokens"
6. **Test Connection**:
   - Click "Test Gmail Connection"
   - Verify account details
   - Save credentials

## ⚙️ **Step 3: Advanced Trigger Configuration**

### **Trigger Conditions**

#### **1. New Email Received**
- **Use Case**: Monitor all incoming emails
- **Configuration**: No additional parameters needed
- **Example**: Trigger on any new email in inbox

#### **2. Email with Specific Label**
- **Use Case**: Monitor emails with Gmail labels
- **Configuration**: 
  - Select label from dropdown (auto-loaded from Gmail)
  - Or enter label name manually
- **Example**: Trigger on emails labeled "Important" or "Support"

#### **3. Email from Specific Sender**
- **Use Case**: Monitor emails from particular addresses
- **Configuration**: Enter sender email address
- **Example**: `support@company.com`, `notifications@service.com`

#### **4. Email to Specific Recipient**
- **Use Case**: Monitor emails sent to specific addresses
- **Configuration**: Enter recipient email address
- **Example**: `sales@yourcompany.com`, `info@yourcompany.com`

#### **5. Email from Domain**
- **Use Case**: Monitor all emails from a domain
- **Configuration**: Enter domain name (without @)
- **Example**: `company.com` (matches any email from *@company.com)

#### **6. Subject Contains Keywords**
- **Use Case**: Monitor emails with specific subject keywords
- **Configuration**: Enter comma-separated keywords
- **Example**: `urgent, invoice, support, action required`

#### **7. Body Contains Keywords**
- **Use Case**: Monitor emails with specific content
- **Configuration**: Enter comma-separated keywords
- **Example**: `deadline, important, review needed`

#### **8. Email with Attachment**
- **Use Case**: Monitor emails with any attachments
- **Configuration**: No additional parameters needed
- **Example**: Trigger on any email with files attached

#### **9. Specific Attachment Type**
- **Use Case**: Monitor emails with specific file types
- **Configuration**: Select attachment type
- **Options**: PDF, Images, Excel, Word, ZIP, Any
- **Example**: Only trigger on emails with PDF attachments

#### **10. Email Size Condition**
- **Use Case**: Monitor large or small emails
- **Configuration**: 
  - Condition: Larger than / Smaller than
  - Size: Value with unit (1M, 500K, 10MB)
- **Example**: Emails larger than 5MB or smaller than 100KB

#### **11. Advanced Query**
- **Use Case**: Complex filtering using Gmail search syntax
- **Configuration**: Enter custom Gmail search query
- **Example**: `from:support@company.com has:attachment larger:1M -label:processed`

### **Advanced Options**

#### **Date Range Filtering**
- **Any time**: No date restriction
- **Last hour**: Only emails from past hour
- **Last 24 hours**: Only emails from past day
- **Last week**: Only emails from past 7 days
- **Last month**: Only emails from past 30 days

#### **Processing Options**
- **Poll Interval**: How often to check (1-60 minutes)
- **Max Emails per Check**: Limit processing (1-100 emails)
- **Only Unread Emails**: Only trigger on unread emails
- **Mark as Read**: Auto-mark processed emails as read
- **Include Attachments**: Include attachment metadata
- **Download Attachments**: Download attachment content
- **Exclude Spam**: Skip spam emails
- **Exclude Trash**: Skip deleted emails

## 📊 **Step 4: Query Preview & Testing**

### **Query Preview Tab**
- **View Generated Query**: See the Gmail search query that will be used
- **Understand Filtering**: Preview shows exactly what emails will match
- **Debug Issues**: Use preview to troubleshoot filtering problems

### **Example Queries**
```
# Basic unread emails
is:unread -in:spam -in:trash

# Emails from support with attachments
from:support@company.com has:attachment is:unread -in:spam -in:trash

# Important emails with PDF attachments
label:Important has:attachment filename:pdf is:unread -in:spam -in:trash

# Large emails from last week
larger:5M newer_than:7d is:unread -in:spam -in:trash

# Custom complex query
from:*@company.com (subject:"urgent" OR subject:"important") has:attachment -label:processed
```

## 🔒 **Security & Permissions**

### **Required OAuth Scopes**
- `https://www.googleapis.com/auth/gmail.readonly`: Read email content
- `https://www.googleapis.com/auth/gmail.modify`: Mark emails as read

### **Security Best Practices**
1. **Least Privilege**: Only request necessary permissions
2. **Secure Storage**: Credentials are encrypted in database
3. **Token Refresh**: Automatic refresh token handling
4. **Access Control**: User-specific credential isolation

### **Permission Management**
- **View Permissions**: Check granted scopes in Google Account settings
- **Revoke Access**: Remove app access from Google Account security page
- **Update Permissions**: Re-authorize if additional scopes needed

## 🧪 **Step 5: Testing & Validation**

### **Test Credentials**
1. **Connection Test**: Verify API access works
2. **Profile Check**: Confirm correct Gmail account
3. **Label Loading**: Verify labels are accessible
4. **Permission Validation**: Check required scopes are granted

### **Test Trigger Conditions**
1. **Send Test Emails**: Create emails matching your conditions
2. **Check Query Preview**: Verify query syntax is correct
3. **Monitor Logs**: Watch for trigger activations
4. **Validate Data**: Confirm email data is captured correctly

### **Common Issues & Solutions**

#### **Authentication Errors**
- **Invalid Credentials**: Re-create OAuth credentials
- **Expired Tokens**: Refresh tokens automatically handled
- **Insufficient Permissions**: Check OAuth scopes
- **Account Access**: Verify Gmail account has API access enabled

#### **Trigger Not Firing**
- **Query Syntax**: Check query preview for errors
- **Date Range**: Ensure emails exist in specified time range
- **Filters**: Verify emails aren't excluded by spam/trash filters
- **Poll Interval**: Check if enough time has passed

#### **Missing Emails**
- **Unread Filter**: Disable if you want to include read emails
- **Label Issues**: Verify label names are correct
- **Size Limits**: Check max emails per check setting
- **Time Range**: Expand date range if needed

## 📈 **Step 6: Production Deployment**

### **OAuth Consent Screen**
- **Verification**: Submit app for Google verification (for external users)
- **Privacy Policy**: Add privacy policy URL
- **Terms of Service**: Add terms of service URL
- **Scopes Justification**: Explain why each scope is needed

### **Rate Limiting**
- **Gmail API Limits**: 1 billion quota units per day
- **Request Limits**: 250 quota units per user per 100 seconds
- **Optimization**: Implement efficient polling strategies

### **Monitoring**
- **Error Tracking**: Monitor authentication failures
- **Performance**: Track API response times
- **Usage**: Monitor quota consumption
- **Alerts**: Set up alerts for failures

## 🎯 **Example Workflow Configurations**

### **Support Ticket Creation**
```json
{
  "triggerOn": "senderEmail",
  "senderEmail": "support@company.com",
  "pollInterval": 2,
  "markAsRead": true,
  "includeAttachments": true
}
```

### **Invoice Processing**
```json
{
  "triggerOn": "subjectContains",
  "subjectKeywords": "invoice, billing, payment",
  "attachmentType": "pdf",
  "pollInterval": 15,
  "downloadAttachments": true
}
```

### **VIP Customer Monitoring**
```json
{
  "triggerOn": "labeledEmail",
  "labelName": "VIP",
  "pollInterval": 1,
  "includeAttachments": true,
  "markAsRead": false
}
```

### **Large File Alerts**
```json
{
  "triggerOn": "emailSize",
  "emailSizeCondition": "larger",
  "emailSizeValue": "10MB",
  "pollInterval": 5,
  "includeAttachments": false
}
```

## 🚀 **Ready to Use!**

Your Gmail Trigger is now fully configured with:

- ✅ **Secure Authentication**: OAuth 2.0 with proper scopes
- ✅ **Advanced Filtering**: 11 different trigger conditions
- ✅ **Flexible Options**: Comprehensive configuration options
- ✅ **Query Preview**: Visual query building and validation
- ✅ **Production Ready**: Scalable and secure implementation

Start automating your email workflows today! 📧🚀