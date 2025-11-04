# Project Management Module - AgentFlow

## Overview

This module adds comprehensive project management capabilities to AgentFlow, including:

- **Project Creation & Management**: Create, organize, and track multiple projects
- **Task Management**: Full CRUD operations for tasks with status tracking
- **Kanban Board**: Drag-and-drop task management with visual workflow
- **Task List View**: Tabular view with sorting, filtering, and bulk operations
- **Team Collaboration**: Assign tasks to team members and track progress
- **Progress Tracking**: Visual progress indicators and completion statistics
- **Due Date Management**: Track deadlines and identify overdue items
- **Priority Management**: Set and manage task priorities (Low, Medium, High, Urgent)
- **Subtasks & Comments**: Break down tasks and collaborate with team comments
- **File Attachments**: Attach files to tasks for better context
- **Project Analytics**: Comprehensive stats and progress visualization

## Architecture

### Frontend Components

```
components/project-management/
├── project-management-dashboard.tsx    # Main dashboard component
├── kanban-board.tsx                   # Drag-and-drop Kanban interface
├── kanban-column.tsx                  # Individual Kanban columns
├── task-card.tsx                      # Task cards with drag support
├── task-list.tsx                      # Table view for tasks
├── task-detail-modal.tsx              # Detailed task view/edit modal
├── create-task-modal.tsx              # Task creation modal
├── create-project-modal.tsx           # Project creation modal
├── project-card.tsx                   # Project overview cards
└── project-stats.tsx                  # Analytics and statistics
```

### Backend API Routes

```
app/api/
├── projects/route.ts                  # Project CRUD operations
└── tasks/route.ts                     # Task CRUD operations
```

### Data Models

```
lib/types/project-management.ts        # TypeScript interfaces
lib/project-management-store.ts        # Zustand state management
```

## Features

### 1. Project Management
- Create projects with name, description, color coding, and team members
- Set project status (Planning, Active, On Hold, Completed, Archived)
- Track project progress with automatic calculation based on task completion
- Set project due dates and track deadlines
- Tag projects for better organization

### 2. Task Management
- Create tasks with title, description, priority, and assignee
- Set task status (To Do, In Progress, Review, Done)
- Add due dates and track overdue tasks
- Estimate and track actual hours spent
- Add tags for categorization
- Create subtasks for task breakdown
- Add comments for team collaboration
- Attach files to tasks

### 3. Visual Interfaces

#### Kanban Board
- Drag-and-drop tasks between columns
- Visual status representation
- Quick task creation from any column
- Real-time progress updates

#### Task List View
- Sortable columns (Title, Priority, Due Date, Status)
- Advanced filtering by status, priority, assignee
- Bulk operations support
- Progress indicators for subtasks

#### Project Overview
- Project statistics and analytics
- Team member progress tracking
- Recent activity feed
- Upcoming deadlines
- Overdue task alerts

### 4. Team Collaboration
- Assign tasks to team members
- Track individual member progress
- Comment system for task discussions
- File sharing through attachments
- Activity tracking and notifications

## Dependencies Added

```json
{
  "@dnd-kit/core": "^6.3.1",           // Drag and drop functionality
  "@dnd-kit/sortable": "^10.0.0",      // Sortable drag and drop
  "@dnd-kit/utilities": "^3.2.2",      // DnD utilities
  "uuid": "^13.0.0",                   // Unique ID generation
  "@types/uuid": "^10.0.0",            // TypeScript types for UUID
  "zustand": "^5.0.8"                  // State management
}
```

## API Endpoints

### Projects API (`/api/projects`)

#### GET `/api/projects`
- Returns all projects with task counts and progress
- Query parameters:
  - `id`: Get specific project
  - `status`: Filter by project status

#### POST `/api/projects`
- Creates a new project
- Body: `{ name, description, color, status, dueDate, members, tags }`

#### PUT `/api/projects`
- Updates an existing project
- Body: `{ id, ...updates }`

#### DELETE `/api/projects?id={projectId}`
- Deletes a project and all associated tasks

### Tasks API (`/api/tasks`)

#### GET `/api/tasks`
- Returns tasks with optional filtering
- Query parameters:
  - `id`: Get specific task
  - `projectId`: Filter by project
  - `status`: Filter by status
  - `assigneeId`: Filter by assignee

#### POST `/api/tasks`
- Creates a new task
- Body: `{ title, description, status, priority, assigneeId, projectId, dueDate, tags, estimatedHours }`

#### PUT `/api/tasks`
- Updates an existing task
- Body: `{ id, ...updates }`

#### DELETE `/api/tasks?id={taskId}`
- Deletes a task

## Testing Guide

### 1. Setup and Installation

1. **Install Dependencies**:
   ```bash
   cd Agentflow
   pnpm install
   ```

2. **Start Development Server**:
   ```bash
   pnpm dev
   ```

3. **Navigate to Project Management**:
   - Open http://localhost:3000
   - Go to Dashboard
   - Click "Projects" in the sidebar

### 2. Project Management Testing

#### Create a New Project
1. Click "New Project" button
2. Fill in project details:
   - Name: "Test Project 1"
   - Description: "Testing project management features"
   - Status: "Active"
   - Color: Select any color
   - Due Date: Set a future date
   - Team Members: Select team members
   - Tags: Add relevant tags
3. Click "Create Project"
4. Verify project appears in sidebar

#### Project Operations
1. **View Project**: Click on project in sidebar
2. **Edit Project**: Use dropdown menu on project card
3. **Delete Project**: Use dropdown menu (confirm deletion)
4. **Filter Projects**: Use status filter dropdown
5. **Search Projects**: Use search bar

### 3. Task Management Testing

#### Create Tasks
1. Select a project from sidebar
2. Switch to "Kanban" view
3. Click "+" button on any column
4. Fill task details:
   - Title: "Test Task 1"
   - Description: "Testing task creation"
   - Priority: "High"
   - Assignee: Select team member
   - Due Date: Set deadline
   - Tags: Add tags
   - Estimated Hours: Enter estimate
5. Click "Create Task"

#### Task Operations
1. **View Task Details**: Click on any task card
2. **Edit Task**: Click edit button in task detail modal
3. **Add Subtasks**: In task detail modal, add subtasks
4. **Add Comments**: Add comments in task detail modal
5. **Change Status**: Drag task between Kanban columns
6. **Update Priority**: Use dropdown menu on task card

### 4. Kanban Board Testing

#### Drag and Drop
1. Switch to "Kanban" view
2. Drag tasks between columns (To Do → In Progress → Review → Done)
3. Verify status updates automatically
4. Test drag and drop with multiple tasks

#### Column Operations
1. Create tasks directly from column headers
2. Verify task counts update in column headers
3. Test with empty columns

### 5. List View Testing

#### Sorting and Filtering
1. Switch to "List" view
2. Test column sorting (click column headers)
3. Use status filter dropdown
4. Use priority filter dropdown
5. Test search functionality
6. Verify sorting indicators

#### Bulk Operations
1. Select multiple tasks using checkboxes
2. Test bulk status changes
3. Verify progress indicators for subtasks

### 6. Analytics and Statistics Testing

#### Project Overview
1. Switch to "Overview" tab
2. Verify project progress calculation
3. Check task breakdown statistics
4. Verify team member progress
5. Test overdue task alerts
6. Check upcoming deadlines

#### Real-time Updates
1. Create/complete tasks and verify stats update
2. Change task status and verify progress bars
3. Add team members and verify member stats

### 7. Error Handling Testing

#### API Error Testing
1. Test with invalid project/task IDs
2. Test creating tasks without required fields
3. Test deleting non-existent items
4. Verify error messages display correctly

#### UI Error Testing
1. Test form validation (empty required fields)
2. Test drag and drop edge cases
3. Test modal interactions
4. Test responsive design on different screen sizes

### 8. Performance Testing

#### Large Dataset Testing
1. Create multiple projects (10+)
2. Create many tasks per project (50+)
3. Test Kanban board performance with many tasks
4. Test list view sorting with large datasets
5. Verify search performance

#### Memory Testing
1. Navigate between different views repeatedly
2. Create and delete many items
3. Check for memory leaks in browser dev tools

## Manual Configuration

### API Keys and External Services

Currently, the project management module works entirely offline with in-memory storage. No external API keys are required.

For production deployment, you would need to:

1. **Database Setup**: Replace in-memory storage with a proper database (PostgreSQL, MongoDB, etc.)
2. **Authentication**: Integrate with your authentication system
3. **File Storage**: Set up file storage for task attachments (AWS S3, Cloudinary, etc.)
4. **Real-time Updates**: Implement WebSocket connections for real-time collaboration

### Environment Variables (Future)

```env
# Database
DATABASE_URL=your_database_connection_string

# File Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Real-time Features
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster
```

## Integration with Existing AgentFlow

The project management module is designed to integrate seamlessly with the existing AgentFlow system:

1. **Dashboard Integration**: Added to the main dashboard sidebar
2. **UI Consistency**: Uses existing UI components and design system
3. **State Management**: Uses Zustand for consistent state management
4. **API Patterns**: Follows existing API route patterns
5. **TypeScript**: Fully typed for consistency with existing codebase

## Future Enhancements

1. **Real-time Collaboration**: WebSocket integration for live updates
2. **Advanced Analytics**: Charts, reports, and insights
3. **Time Tracking**: Built-in time tracking with timers
4. **Gantt Charts**: Timeline view for project planning
5. **Templates**: Project and task templates
6. **Integrations**: Connect with external tools (Slack, GitHub, etc.)
7. **Mobile App**: React Native mobile application
8. **Notifications**: Email and push notifications
9. **Advanced Permissions**: Role-based access control
10. **API Webhooks**: External system integrations

## Troubleshooting

### Common Issues

1. **Tasks not updating**: Check browser console for API errors
2. **Drag and drop not working**: Ensure @dnd-kit dependencies are installed
3. **State not persisting**: Check localStorage in browser dev tools
4. **UI components not rendering**: Verify all UI components are properly imported

### Debug Mode

Enable debug logging by adding to your environment:
```env
NEXT_PUBLIC_DEBUG=true
```

This will show detailed logs in the browser console for troubleshooting.

## Support

For issues or questions about the project management module:

1. Check the browser console for error messages
2. Verify all dependencies are installed correctly
3. Test with a fresh browser session (clear cache/localStorage)
4. Check the API responses in Network tab of browser dev tools

The module is designed to be self-contained and should work out of the box with the existing AgentFlow setup.