# Webhook Triggers Guide - AgentFlow

## 🎯 Overview

Webhook Triggers allow external systems to trigger AgentFlow workflows via HTTP requests. This enables real-time automation and integration with third-party services, similar to n8n's webhook functionality.

## 🚀 Features

### **Flexible HTTP Methods**
- ✅ **GET**: Simple trigger requests
- ✅ **POST**: Data submission triggers
- ✅ **PUT**: Update-based triggers
- ✅ **DELETE**: Deletion-based triggers
- ✅ **PATCH**: Partial update triggers

### **Security Options**
- ✅ **Public Webhooks**: No authentication required
- ✅ **Authenticated Webhooks**: Bearer token authentication
- ✅ **Auto-generated Tokens**: Secure random token generation
- ✅ **Custom Tokens**: User-defined authentication tokens

### **Real-time Execution**
- ✅ **Instant Triggers**: Immediate workflow execution
- ✅ **Execution Tracking**: Monitor webhook calls and responses
- ✅ **Error Handling**: Proper HTTP status codes and error messages
- ✅ **Performance Metrics**: Execution time tracking

## 🛠️ How to Use

### **Step 1: Create Webhook Trigger**

1. **Open Workflow Editor**
   ```bash
   # Navigate to: Dashboard → Workflows
   # Create new workflow or edit existing
   ```

2. **Add Webhook Trigger Node**
   - Drag "Webhook" node from Triggers category
   - Place it as the first node in your workflow

3. **Configure Webhook**
   - **HTTP Method**: Choose GET, POST, PUT, DELETE, or PATCH
   - **Webhook Path**: Set unique path (e.g., `/my-webhook`)
   - **Authentication**: Toggle if you need secure access
   - **Auth Token**: Generate or set custom token

4. **Create Webhook**
   - Click "Create Webhook" button
   - Webhook URL will be generated automatically

### **Step 2: Use Webhook URL**

Your webhook will be available at:
```
https://yourdomain.com/api/webhooks/your-path
```

For local development:
```
http://localhost:3000/api/webhooks/your-path
```

### **Step 3: Test Webhook**

#### **Using curl (Command Line)**
```bash
# Simple GET request
curl "http://localhost:3000/api/webhooks/my-webhook"

# POST with JSON data
curl -X POST "http://localhost:3000/api/webhooks/my-webhook" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from webhook!", "data": {"key": "value"}}'

# With authentication
curl -X POST "http://localhost:3000/api/webhooks/my-webhook" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-auth-token" \
  -d '{"message": "Authenticated request"}'
```

#### **Using JavaScript (Frontend)**
```javascript
// Simple POST request
const response = await fetch('http://localhost:3000/api/webhooks/my-webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Include if authentication is required
    'Authorization': 'Bearer your-auth-token'
  },
  body: JSON.stringify({
    message: 'Hello from JavaScript!',
    timestamp: new Date().toISOString(),
    data: { userId: 123, action: 'user_signup' }
  })
})

const result = await response.json()
console.log('Webhook response:', result)
```

#### **Using Python**
```python
import requests
import json

# Webhook data
data = {
    "message": "Hello from Python!",
    "user_id": 123,
    "event": "user_created"
}

# Headers
headers = {
    "Content-Type": "application/json",
    # Include if authentication is required
    "Authorization": "Bearer your-auth-token"
}

# Send request
response = requests.post(
    "http://localhost:3000/api/webhooks/my-webhook",
    headers=headers,
    data=json.dumps(data)
)

print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
```

## 🔧 Configuration Options

### **HTTP Methods**

| Method | Use Case | Example |
|--------|----------|---------|
| **GET** | Simple triggers, status checks | Health checks, notifications |
| **POST** | Data submission, creation events | User signups, form submissions |
| **PUT** | Update events, data replacement | Profile updates, settings changes |
| **DELETE** | Deletion events, cleanup triggers | Account deletions, data purging |
| **PATCH** | Partial updates, incremental changes | Status updates, field modifications |

### **Authentication**

#### **Public Webhook (No Auth)**
```bash
curl -X POST "http://localhost:3000/api/webhooks/public-webhook" \
  -H "Content-Type: application/json" \
  -d '{"message": "Public access"}'
```

#### **Authenticated Webhook**
```bash
curl -X POST "http://localhost:3000/api/webhooks/secure-webhook" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer abc123def456" \
  -d '{"message": "Secure access"}'
```

### **Request Data Access**

In your workflow, the webhook data is available as:

```javascript
// Webhook trigger data structure
{
  "webhook": {
    "method": "POST",
    "path": "/my-webhook",
    "headers": {
      "content-type": "application/json",
      "authorization": "Bearer token",
      "user-agent": "curl/7.68.0"
    },
    "query": {
      "param1": "value1",
      "param2": "value2"
    },
    "body": {
      "message": "Hello from webhook!",
      "data": {"key": "value"}
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🎨 Common Use Cases

### **1. Form Submissions**
```javascript
// HTML form webhook integration
<form action="http://localhost:3000/api/webhooks/contact-form" method="POST">
  <input name="name" placeholder="Your Name" required>
  <input name="email" type="email" placeholder="Email" required>
  <textarea name="message" placeholder="Message" required></textarea>
  <button type="submit">Send Message</button>
</form>
```

### **2. GitHub Webhooks**
```json
// GitHub webhook payload example
{
  "action": "opened",
  "pull_request": {
    "title": "Add new feature",
    "user": {"login": "developer"},
    "base": {"ref": "main"}
  },
  "repository": {
    "name": "my-repo",
    "full_name": "user/my-repo"
  }
}
```

### **3. Stripe Webhooks**
```json
// Stripe webhook payload example
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1234567890",
      "amount": 2000,
      "currency": "usd",
      "status": "succeeded"
    }
  }
}
```

### **4. Slack Slash Commands**
```bash
# Slack slash command webhook
curl -X POST "http://localhost:3000/api/webhooks/slack-command" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=verification-token&team_id=T1234&user_name=john&command=/deploy&text=production"
```

## 🔍 Monitoring & Debugging

### **Execution History**
- View recent webhook executions in the node interface
- See request details, response status, and execution time
- Monitor success/failure rates

### **Response Codes**

| Status | Meaning | Description |
|--------|---------|-------------|
| **200** | Success | Webhook executed successfully |
| **401** | Unauthorized | Missing or invalid auth token |
| **403** | Forbidden | Webhook is disabled |
| **404** | Not Found | Webhook path doesn't exist |
| **500** | Server Error | Workflow execution failed |

### **Error Responses**
```json
// Authentication error
{
  "success": false,
  "error": "Authentication required",
  "message": "Invalid or missing authorization token"
}

// Webhook not found
{
  "success": false,
  "error": "Webhook not found",
  "message": "No webhook configured for POST /invalid-path"
}

// Execution error
{
  "success": false,
  "error": "Workflow execution failed",
  "message": "Internal server error"
}
```

## 🔒 Security Best Practices

### **1. Use Authentication**
- Always enable authentication for production webhooks
- Use strong, randomly generated tokens
- Rotate tokens regularly

### **2. Validate Input**
- Validate webhook payload structure
- Sanitize user input in workflows
- Implement rate limiting (future feature)

### **3. Monitor Usage**
- Track webhook execution frequency
- Monitor for suspicious activity
- Set up alerts for failed executions

### **4. Secure Endpoints**
- Use HTTPS in production
- Implement IP whitelisting if needed
- Log webhook access for auditing

## 🚀 Advanced Examples

### **Multi-step Workflow**
```
Webhook Trigger → Condition → Jira (Create Issue) → Slack (Notify Team)
```

### **Data Processing Pipeline**
```
Webhook Trigger → Transform Data → HTTP Request → Email Notification
```

### **Integration Workflow**
```
GitHub Webhook → Condition (PR opened) → Slack (Notify) → Jira (Create Task)
```

## 🛠️ Troubleshooting

### **Common Issues**

1. **Webhook Not Triggering**
   - Check if webhook is active
   - Verify URL and HTTP method
   - Check authentication token

2. **Authentication Failures**
   - Ensure Bearer token format: `Bearer your-token`
   - Verify token matches webhook configuration
   - Check for typos in Authorization header

3. **Payload Issues**
   - Verify Content-Type header
   - Check JSON formatting
   - Ensure data structure is valid

4. **Workflow Not Executing**
   - Check workflow is saved and active
   - Verify node connections
   - Review execution logs

### **Debug Steps**

1. **Test with Built-in Tester**
   - Use the "Test" button in webhook node
   - Check execution history

2. **Use curl for Testing**
   ```bash
   curl -v -X POST "http://localhost:3000/api/webhooks/debug" \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

3. **Check Browser Network Tab**
   - Monitor requests and responses
   - Verify headers and payload

4. **Review Server Logs**
   - Check console output for errors
   - Look for webhook execution logs

## 🎉 Benefits

### **Real-time Automation**
- Instant workflow triggers
- No polling required
- Event-driven architecture

### **Easy Integration**
- Standard HTTP interface
- Works with any system that can make HTTP requests
- No special SDKs required

### **Flexible & Secure**
- Multiple HTTP methods supported
- Optional authentication
- Configurable endpoints

### **Monitoring & Debugging**
- Execution history tracking
- Performance metrics
- Error logging and reporting

The Webhook Triggers system provides a powerful, flexible way to integrate AgentFlow with external systems and create real-time automation workflows! 🚀