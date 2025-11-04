# Frontend Logging System - Troubleshooting Guide

This guide helps troubleshoot issues with the frontend logging system when logs are not visible in the UI.

## Quick Test

1. **Navigate to Debug Page**: Go to `/debug` in your browser
2. **Check Status Indicator**: Look for the logging status badge in the top right
3. **Click Test Button**: This will test if the logging system is working
4. **Generate Sample Logs**: Click the colored buttons to generate test logs

## Common Issues & Solutions

### 1. Logs Not Appearing in UI

**Symptoms:**
- Buttons work but no logs appear in the viewers
- Log count stays at 0
- Status indicator shows "Not working"

**Solutions:**

#### Check Component Imports
Ensure all logging components are properly imported:

```typescript
import { ExecutionLogs, logger } from "@/components/workflow/execution-logs"
import { LogViewer } from "@/components/workflow/log-viewer"
```

#### Verify Log Store Initialization
The global log store should be initialized when the module loads:

```typescript
// This should be at the module level in execution-logs.tsx
export const logStore = new LogStore()
```

#### Check React State Updates
Ensure the log store is properly notifying React components:

```typescript
// In LogStore class
private notifyListeners() {
  this.listeners.forEach(listener => listener([...this.logs]))
}
```

### 2. Logs Appear in Console but Not UI

**Symptoms:**
- `console.log` works but UI logs don't appear
- Browser console shows logs but UI is empty

**Solutions:**

#### Replace Console Logs with Logger
Replace all `console.log` calls with the logger:

```typescript
// Instead of:
console.log('Success message')

// Use:
logger.success('Success message', 'category')
```

#### Check Logger Usage
Ensure you're using the logger correctly:

```typescript
// Correct usage
logger.info("Message", "category", { data: "optional" }, "nodeId", "executionId")

// Minimal usage
logger.success("Operation completed", "workflow")
```

### 3. Components Not Updating

**Symptoms:**
- Logs are stored but components don't re-render
- Manual refresh shows logs

**Solutions:**

#### Check useEffect Dependencies
Ensure useEffect has correct dependencies:

```typescript
useEffect(() => {
  const unsubscribe = logStore.subscribe((newLogs) => {
    setLogs(newLogs)
  })
  return unsubscribe
}, []) // Empty dependency array is correct
```

#### Verify State Updates
Check that state is being updated correctly:

```typescript
const [logs, setLogs] = useState<LogEntry[]>([])

// In subscription callback
setLogs(newLogs.slice(0, maxEntries))
```

### 4. TypeScript Errors

**Symptoms:**
- Build fails with TypeScript errors
- Components don't render due to type issues

**Solutions:**

#### Check Interface Definitions
Ensure all interfaces are properly defined:

```typescript
export interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'success' | 'warning' | 'error' | 'debug'
  category: string
  message: string
  details?: any
  nodeId?: string
  executionId?: string
}
```

#### Fix useEffect Return Types
Ensure cleanup functions return void:

```typescript
useEffect(() => {
  const unsubscribe = logStore.subscribe(callback)
  return () => {
    unsubscribe() // Should return void, not boolean
  }
}, [])
```

## Testing Steps

### Step 1: Basic Functionality Test

1. Go to `/debug`
2. Click "Test" button in status indicator
3. Should show "Working" status
4. Log count should increase

### Step 2: Manual Log Generation

1. Click individual log level buttons (Info, Success, Warning, Error, Debug)
2. Each click should:
   - Increase log count
   - Show new log in viewers
   - Display with correct color/icon

### Step 3: Workflow Simulation

1. Click "Run Quick Test"
2. Should generate multiple logs over time
3. Logs should appear with different categories
4. Should show execution IDs and node IDs

### Step 4: Filtering Test

1. Generate multiple logs of different levels
2. Use filter dropdown in full logs viewer
3. Search for specific terms
4. Results should update immediately

## Debug Information

### Check Browser Console

Open browser developer tools and check for:

1. **JavaScript Errors**: Any red error messages
2. **Network Errors**: Failed API calls
3. **React Warnings**: Component update issues

### Inspect Log Store

You can inspect the log store directly in browser console:

```javascript
// Access the log store
const { logStore } = require('/components/workflow/execution-logs')

// Check current logs
console.log(logStore.getLogs())

// Check listeners
console.log(logStore.listeners.size)
```

### Component State Debugging

Add temporary console logs to debug component state:

```typescript
useEffect(() => {
  console.log('Logs updated:', logs.length)
}, [logs])
```

## File Locations

Key files for the logging system:

- **Main Logger**: `components/workflow/execution-logs.tsx`
- **Compact Viewer**: `components/workflow/log-viewer.tsx`
- **Quick Test**: `components/workflow/quick-log-test.tsx`
- **Status Indicator**: `components/workflow/log-status-indicator.tsx`
- **Debug Page**: `app/debug/page.tsx`
- **Full Test Page**: `app/test-logs/page.tsx`

## Expected Behavior

When working correctly:

1. **Immediate Updates**: Logs appear instantly when generated
2. **Proper Formatting**: Each log has timestamp, level badge, category, message
3. **Color Coding**: Different levels have different colors (blue=info, green=success, yellow=warning, red=error, purple=debug)
4. **Filtering**: Can filter by level, category, and search terms
5. **Persistence**: Logs persist until page refresh or manual clear
6. **Real-time**: Multiple components show the same logs simultaneously

## Getting Help

If issues persist:

1. Check all file imports and exports
2. Verify React component mounting
3. Test with minimal example first
4. Check browser compatibility
5. Ensure all dependencies are installed

The logging system should work out of the box once properly imported and used with the `logger` functions instead of `console.log`.