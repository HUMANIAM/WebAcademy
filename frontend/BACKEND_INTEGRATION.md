# Backend Integration Guide

## Overview
The frontend is now connected to the backend API for resource management. This document explains the integration layers and how to use them.

## Architecture

### 1. API Layer (`src/services/api.ts`)
- Base HTTP client with error handling
- Configurable API base URL via environment variables
- Centralized error handling with `ApiError` class

### 2. Repository Layer (`src/repositories/resourceRepository.ts`)
- Handles HTTP requests to backend resource endpoints
- Singleton pattern for consistent instance usage
- Methods: `createResource`, `getResource`, `listResources`, `updateResource`

### 3. Hook Layer (`src/hooks/useResources.ts`)
- React hook for resource state management
- Handles loading states and error handling
- Provides CRUD operations with local state updates

### 4. Utility Layer (`src/utils/resourceMapper.ts`)
- Maps frontend form data to backend schema
- Handles user ID management
- Transforms data between frontend and backend formats

## Usage

### In Components
```typescript
import { useResources } from '../hooks/useResources';

function MyComponent() {
  const { createResource, loading, error, clearError } = useResources();
  
  const handleSubmit = async (formData) => {
    try {
      const resource = await createResource(formData);
      console.log('Created:', resource);
    } catch (err) {
      console.error('Failed:', err);
    }
  };
}
```

### Environment Configuration
Create a `.env` file with:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

## Backend Schema Mapping

Frontend form fields are mapped to backend schema as follows:

| Frontend Field | Backend Field | Notes |
|---------------|---------------|-------|
| `title` | `title` | Direct mapping |
| `description` | `short_description` | Direct mapping |
| `url` | `url` | Direct mapping |
| `platform` | `platform` | Direct mapping |
| `medium` | `resource_type` | Mapped via resourceTypeMap |
| `level` | `level` | Direct mapping |
| `estimatedTime*` | `estimated_time` | Constructed from min/max/unit |
| `selectedSkills` | `tags` | Direct mapping |
| `author` | `author` | Direct mapping |
| `image` | `image_url` | Direct mapping |
| - | `default_funding_type` | Set to 'reimbursement' |
| - | `created_by_user_id` | From getCurrentUserId() |

## Error Handling

The integration includes comprehensive error handling:
- Network errors are caught and displayed
- API errors are parsed and shown to users
- Loading states prevent duplicate submissions
- Users can dismiss errors manually

## Testing

To test the integration:
1. Start the backend server
2. Start the frontend development server
3. Open the AddResourceDialog
4. Fill out the form and submit
5. Check browser network tab for API calls
6. Verify resource is created in backend database
