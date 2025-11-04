# Gmail Trigger Testing Guide

## 🧪 **Quick Test Steps**

### **1. Add Gmail Trigger to Workflow**
1. Navigate to `/dashboard/workflows`
2. Click "Add Node" button
3. Select "Gmail Trigger" from Triggers category
4. Verify node appears on canvas with 📬 icon

### **2. Configure Gmail Trigger**
1. **Click on Gmail Trigger node** to select it
2. **Open Configuration**: Click settings icon or double-click node
3. **Set Basic Parameters**:
   - **Trigger On**: "New Email Received"
   - **Poll Interval**: 5 minutes
   - **Enable Trigger**: On

### **3. Test Node Configuration**
1. **Verify Node Library Entry**:
   - Gmail Trigger appears in Triggers category
   - Has correct icon and description
   - Can be added to canvas

2. **Verify Node Properties**:
   - Node ID: `gmail-trigger`
   - Icon: 📬 (mail emoji)
   - Color: Red background
   - Category: Triggers

3. **Verify Input/Output Ports**:
   - **Inputs**: None (it's a trigger)
   - **Outputs**: 
     - Trigger (purple port)
     - Email Data (blue port)
     - Subject (blue port)
     - Sender (blue port)
     - Email Body (blue port)

### **4. Test API Endpoint**
Test the Gmail trigger API endpoint:

```bash
# Test trigger check
curl -X POST http://localhost:3000/api/gmail/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "nodeId": "gmail-trigger-test",
    "parameters": {
      "triggerOn": "newEmail",
      "pollInterval": 5,
      "enabled": true
    }
  }'

# Test trigger status
curl "http://localhost:3000/api/gmail/trigger?nodeId=gmail-trigger-test"
```

### **5. Test Configuration Options**

#### **Test Different Trigger Types**:
1. **New Email**: Default configuration
2. **Labeled Email**: Set `labelName` to "Important"
3. **Sender Email**: Set `senderEmail` to "test@example.com"
4. **Subject Keywords**: Set `subjectKeywords` to "urgent, invoice"
5. **Has Attachment**: Select attachment trigger

#### **Test Parameter Validation**:
1. **Required Fields**: Verify trigger type is required
2. **Email Validation**: Test invalid email formats
3. **Number Ranges**: Test poll interval limits (1-60 minutes)
4. **Conditional Fields**: Verify fields appear based on trigger type

### **6. Test Workflow Integration**

#### **Create Test Workflow**:
```
Gmail Trigger → HTTP Request → Slack Notification
```

1. **Add Gmail Trigger**: Configure for new emails
2. **Add HTTP Request**: Set to webhook.site for testing
3. **Add Slack Node**: Configure to send notifications
4. **Connect Nodes**: Create connections between all nodes
5. **Test Execution**: Run workflow and verify data flow

#### **Test Data Flow**:
1. **Email Data**: Verify email content is passed to next node
2. **Subject Access**: Use `{{$node["Gmail Trigger"].json["subject"]}}`
3. **Sender Access**: Use `{{$node["Gmail Trigger"].json["sender"]}}`
4. **Body Access**: Use `{{$node["Gmail Trigger"].json["body"]}}`

## ✅ **Expected Results**

### **Node Library**
- ✅ Gmail Trigger appears in Triggers category
- ✅ Has mail icon (📬) and red color
- ✅ Shows correct description
- ✅ Can be dragged to canvas

### **Node Configuration**
- ✅ Opens enhanced node editor
- ✅ Shows all parameter options
- ✅ Validates required fields
- ✅ Shows conditional fields based on trigger type
- ✅ Displays credential requirements

### **Canvas Integration**
- ✅ Node displays with correct icon
- ✅ Shows proper input/output ports
- ✅ Can be selected and moved
- ✅ Can be connected to other nodes
- ✅ Can be deleted with delete functionality

### **API Responses**
- ✅ POST `/api/gmail/trigger` returns mock email data
- ✅ GET `/api/gmail/trigger` returns trigger status
- ✅ Proper error handling for invalid requests
- ✅ Filtering works based on trigger criteria

## 🐛 **Troubleshooting**

### **Node Not Appearing**
- Check node library configuration
- Verify import statements in node-configurations.ts
- Restart development server

### **Configuration Issues**
- Verify enhanced node editor is working
- Check parameter validation
- Test with different trigger types

### **API Errors**
- Check server logs for errors
- Verify API endpoint is accessible
- Test with valid JSON payloads

### **Connection Problems**
- Verify input/output port definitions
- Check port types match (trigger, data, condition)
- Test connection creation between nodes

## 🎯 **Success Criteria**

The Gmail Trigger is working correctly if:

- ✅ **Node appears** in the Triggers category
- ✅ **Configuration opens** when clicking on the node
- ✅ **Parameters validate** correctly with proper error messages
- ✅ **Connections work** to other workflow nodes
- ✅ **API responds** with mock email data
- ✅ **Filtering works** based on trigger criteria
- ✅ **Data flows** properly to connected nodes

## 🚀 **Next Steps**

After basic testing:

1. **Real Gmail Integration**: Connect to actual Gmail API
2. **Credential Management**: Implement OAuth flow
3. **Advanced Filtering**: Add more sophisticated email filters
4. **Performance Testing**: Test with high email volumes
5. **Error Handling**: Improve error messages and recovery

The Gmail Trigger is now ready for comprehensive testing! 📧✨