# Ember to React Migration Guide

This document outlines the migration strategy from Ember.js to React with Vite.

## Overview

We are performing a **parallel rebuild** where a standalone React app is built from scratch alongside the existing Ember app. When the React app reaches feature parity, we'll cutover completely.

## Project Structure

```
irene/
├── app/                    # Ember.js app (existing, will be deprecated)
├── react-app/              # React-Vite app (standalone, new)
│   ├── src/
│   │   ├── lib/auth/      # Authentication
│   │   ├── lib/api/       # API client
│   │   ├── types/         # TypeScript types
│   │   └── ...
├── tests/                  # Ember tests
├── cypress/                # E2E tests
└── package.json           # Ember dependencies
```

## Setup

### Initial Setup

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Install Ember dependencies (for existing app)
npm install

# Install React app dependencies
cd react-app && pnpm install

# Start Ember dev server (port 4200)
npm start

# Start React dev server (port 5173) - in a separate terminal
cd react-app && pnpm dev
```

### Development Workflow

Both apps are developed independently:

- **Ember app**: `http://localhost:4200` - existing production app
- **React app**: `http://localhost:5173` - new standalone app
- **Django API**: `http://localhost:8000` - shared backend

The React app connects directly to the Django API with no dependency on Ember.

## Architecture

### Standalone React App

The React app is completely independent:

- **No shared code** with Ember app
- **Direct API connection** to Django backend
- **Own authentication** via localStorage
- **Independent deployment** capability

### Authentication

React app (`react-app/src/lib/auth/session.ts`):

- Stores session data in localStorage
- SessionManager class for auth state
- Handles SSO flows (OIDC, SAML2)
- No dependency on Ember

### API Client

The API client (`react-app/src/lib/api/client.ts`):

- Axios-based HTTP client
- Automatic authentication headers
- Rate limiting handling (429 responses)
- Unauthorized handling (401 responses)
- Type-safe API calls

## Migration Process

### For Each Feature Implementation:

1. **Plan the Feature**
   - Identify components, routes, services needed
   - Document data flow and API endpoints
   - Plan testing strategy

2. **Create TypeScript Types**
   - Add API types to `react-app/src/types/`
   - Create feature-specific types

3. **Implement API Layer**
   - Create TanStack Query hooks in `react-app/src/lib/api/`
   - Add MSW mocks for testing

4. **Build Components**
   - Build React components from scratch (referencing Ember for UX)
   - Use migrated design system components (`ak-*`)
   - Match existing UI/UX patterns

5. **Implement State Management**
   - Add Zustand stores if needed
   - Integrate with TanStack Query
   - Handle WebSocket updates

6. **Add Routes**
   - Update `react-app/src/App.tsx`
   - Test navigation

7. **Write Tests**
   - Unit tests with Vitest
   - Integration tests with React Testing Library
   - E2E tests with Cypress
   - Achieve parity with Ember test coverage

8. **Visual Parity Testing**
   - Compare React implementation to Ember
   - Use Storybook for component documentation
   - Fix visual differences

9. **Feature Complete**
   - Mark feature as complete in tracking
   - Document any differences from Ember
   - Update progress tracking

## Testing Strategy

### Unit Tests

- **Ember**: QUnit + ember-exam
- **React**: Vitest + React Testing Library

### Integration Tests

- **Ember**: QUnit + setupRenderingTest
- **React**: Vitest + React Testing Library

### E2E Tests

- **Both**: Cypress (shared test suite)
- Tests should work regardless of which app handles the route

### Running Tests

```bash
# Ember tests
npm run test:ember

# React tests
cd react-app && pnpm test

# Cypress E2E
npm run cypress:run
```

## Design System Migration

The custom `ak-*` design system is being migrated component by component:

1. **Priority 1**: Primitives (typography, icons, buttons)
2. **Priority 2**: Form controls (inputs, selects, checkboxes)
3. **Priority 3**: Layout (stack, app bar, breadcrumbs)
4. **Priority 4**: Overlays (modals, drawers, tooltips)
5. **Priority 5**: Data display (tables, lists, charts)
6. **Priority 6**: Complex (trees, providers)

See the full plan in the migration plan document.

## Build & Deployment

### Development

```bash
# Ember dev server
npm start

# React dev server
cd react-app && pnpm dev
```

### Production Build

```bash
# Build Ember app
npm run build

# Build React app
cd react-app && pnpm build
```

Both builds are deployed to S3/CloudFront with routing rules.

## Common Tasks

### Adding a New React Route

Add route to `react-app/src/App.tsx`:
```typescript
<Route path="/new-feature" element={<NewFeature />} />
```

### Using Authentication

```typescript
import { useSession } from '@hooks';

function MyComponent() {
  const { isAuthenticated, session, login, logout } = useSession();
  
  // Access token
  const token = session?.b64token;
  
  // Check if authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <div>Authenticated content</div>;
}
```

### Making API Calls

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@lib/api';

function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.get('/api/organizations/:id/projects'),
  });
}
```

## Troubleshooting

### Authentication Issues

- Check browser console for session errors
- Verify localStorage contains `irene:session`
- Ensure Django API is running and accessible
- Check CORS settings if API requests fail

### Route Not Working

- Check React Router configuration in `App.tsx`
- Verify path matches exactly
- Check for typos in route paths

### Build Errors

- Clear node_modules and reinstall: `cd react-app && rm -rf node_modules && pnpm install`
- Check TypeScript errors: `cd react-app && pnpm type-check`
- Verify path aliases in tsconfig
- Run linting: `cd react-app && pnpm lint`

## Resources

- [Migration Plan](/.cursor/plans/ember_to_react_migration_*.plan.md)
- [React App README](react-app/README.md)
- [Ember Documentation](https://guides.emberjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TanStack Query](https://tanstack.com/query/)

## Team Communication

- Weekly migration standup
- #migration Slack channel
- Migration board in Jira
- Pair programming sessions for complex features

## Timeline

See the detailed timeline in the migration plan document. The estimated timeline is ~11 months (44 weeks).

## Questions?

Contact the migration team or check the migration plan document for more details.
