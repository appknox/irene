# Irene React App

This is the React-Vite application for the Appknox Dashboard migration from Ember.js.

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 10 (install with `npm install -g pnpm`)

### Installation

```bash
cd react-app
pnpm install
```

### Development

```bash
pnpm dev
```

The app will run on `http://localhost:5173`

### Building

```bash
pnpm build
```

### Testing

```bash
# Run tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

## Project Structure

```
react-app/
├── src/
│   ├── components/        # Reusable components
│   │   └── ak/           # Design system components
│   ├── features/         # Feature modules
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Libraries and utilities
│   │   ├── api/          # API client and hooks
│   │   └── websocket/    # WebSocket client
│   ├── stores/           # Zustand stores
│   ├── styles/           # Global styles
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── tests/                # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── mocks/            # MSW mocks
├── public/               # Static assets
└── vite.config.ts        # Vite configuration
```

## Path Aliases

The following path aliases are configured:

- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@features/*` → `src/features/*`
- `@lib/*` → `src/lib/*`
- `@hooks/*` → `src/hooks/*`
- `@stores/*` → `src/stores/*`
- `@styles/*` → `src/styles/*`
- `@types/*` → `src/types/*`
- `@utils/*` → `src/utils/*`
- `@shared/*` → `../shared/*`

## Architecture

This React app runs alongside the Ember app during the migration period. The shared authentication layer (`@shared/auth`) synchronizes session state between both apps.

### Key Technologies

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **React Router v7** - Routing
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **Axios** - HTTP client
- **Socket.IO** - WebSocket communication
- **React Intl** - Internationalization
- **Vitest** - Testing framework
- **React Testing Library** - Component testing
- **MSW** - API mocking

## Environment Variables

Create a `.env.local` file with:

```
VITE_API_HOST=http://localhost:8000
VITE_ENV=development
```

See `.env.example` for all available variables.

## Migration Status

This app is part of an incremental migration from Ember.js to React. Routes are migrated feature by feature. The route configuration is managed in `../shared/constants/routes.ts`.
