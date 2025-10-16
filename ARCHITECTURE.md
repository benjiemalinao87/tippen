# Project Architecture

This document outlines the folder structure and architectural decisions for the Tippen Voice AI Dashboard.

## Folder Structure

```
src/
├── features/              # Feature-based modules
│   ├── dashboard/         # Performance metrics dashboard
│   │   ├── components/
│   │   │   ├── PerformanceDashboard.tsx
│   │   │   └── SentimentKeywords.tsx
│   │   └── index.ts       # Barrel export
│   │
│   └── visitors/          # Visitor management
│       ├── components/
│       │   └── Visitors.tsx
│       └── index.ts       # Barrel export
│
├── shared/                # Shared resources across features
│   ├── components/
│   │   ├── charts/        # Reusable chart components
│   │   │   ├── BarChart.tsx
│   │   │   ├── DonutChart.tsx
│   │   │   ├── LineChart.tsx
│   │   │   ├── MultiLineChart.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── ui/            # Reusable UI components
│   │       ├── MetricCard.tsx
│   │       └── index.ts
│   │
│   └── types/             # Shared TypeScript interfaces
│       └── index.ts
│
├── services/              # API and external service integrations
│   └── (future API services)
│
├── pages/                 # Top-level page components
│   ├── FlowBuilder.tsx
│   └── index.ts
│
├── lib/                   # External library configurations
│   └── api.ts
│
├── App.tsx                # Main application component
├── main.tsx               # Application entry point
└── index.css              # Global styles


```

## Architecture Principles

### 1. Feature-Based Organization

Features are self-contained modules that group related components, logic, and resources:

**Benefits:**
- Easy to locate feature-specific code
- Scales well as the application grows
- Clear boundaries between features
- Supports code splitting

**Example:**
```typescript
// features/dashboard/index.ts
export { PerformanceDashboard } from './components/PerformanceDashboard';
export { SentimentKeywords } from './components/SentimentKeywords';
```

### 2. Shared Components

Reusable components are organized by type in the `shared` folder:

- **charts/**: Visualization components (BarChart, LineChart, etc.)
- **ui/**: Generic UI components (MetricCard, buttons, etc.)

**Benefits:**
- Avoid duplication
- Consistent UI across features
- Easy to maintain and update

### 3. Barrel Exports

Each feature and shared module uses an `index.ts` file for clean imports:

```typescript
// Instead of:
import { BarChart } from '../../shared/components/charts/BarChart';
import { LineChart } from '../../shared/components/charts/LineChart';

// Use:
import { BarChart, LineChart } from '../../shared/components/charts';
```

### 4. Type Safety

All TypeScript types are centralized in `shared/types/`:

```typescript
// shared/types/index.ts
export interface Agent { ... }
export interface Call { ... }
export interface DashboardMetrics { ... }
```

## Component Guidelines

### Creating a New Feature

1. Create feature folder: `src/features/[feature-name]`
2. Add `components/` subfolder
3. Build components
4. Create `index.ts` with exports:
   ```typescript
   export { MyComponent } from './components/MyComponent';
   ```

### Adding a Shared Component

1. Determine category (charts, ui, etc.)
2. Create component in `shared/components/[category]/`
3. Update category's `index.ts`:
   ```typescript
   export { NewComponent } from './NewComponent';
   ```

### Import Best Practices

```typescript
// ✅ Good - Use barrel exports
import { PerformanceDashboard } from './features/dashboard';
import { BarChart, LineChart } from './shared/components/charts';
import { MetricCard } from './shared/components/ui';

// ❌ Bad - Direct file imports
import { PerformanceDashboard } from './features/dashboard/components/PerformanceDashboard';
```

## Naming Conventions

- **Components**: PascalCase (`PerformanceDashboard.tsx`)
- **Files**: PascalCase for components, camelCase for utilities
- **Folders**: kebab-case (`shared-components`, `dashboard`)
- **Types/Interfaces**: PascalCase (`DashboardMetrics`)

## State Management

Currently using React hooks (useState, useEffect). As the app grows, consider:
- Context API for global state
- Custom hooks in `features/[feature]/hooks/`
- Zustand or similar for complex state

## Styling

- **Framework**: Tailwind CSS (utility-first)
- **Dark Mode**: Always include dark mode variants


## Testing Strategy (Future)

```
src/
├── features/
│   └── dashboard/
│       ├── components/
│       │   ├── PerformanceDashboard.tsx
│       │   └── PerformanceDashboard.test.tsx
│       └── hooks/
│           └── useDashboardData.test.ts
```

## Backend Architecture

### Cloudflare Workers + Durable Objects

The backend uses Cloudflare's edge computing platform:

```
cloudflare-backend/
├── src/
│   ├── index.ts              # Worker entry point
│   ├── VisitorCoordinator.ts # Durable Object for visitor state
│   └── types.ts              # Backend TypeScript types
├── wrangler.toml             # Cloudflare configuration
└── package.json
```

**Key Components:**

1. **Worker (index.ts)**
   - Handles HTTP requests (POST /track/visitor)
   - WebSocket upgrades (GET /ws/dashboard)
   - Visitor enrichment (IP → Company data)
   - Routes to Durable Object

2. **Durable Object (VisitorCoordinator.ts)**
   - Stores visitor state in memory (Map<visitorId, Visitor>)
   - Manages WebSocket connections to dashboards
   - Broadcasts visitor updates in real-time
   - **Auto-cleanup alarm**: Runs every 30 seconds
   - **Inactivity threshold**: Removes visitors after 60 seconds without heartbeat
   - Persists data to Durable Object storage

**Visitor Lifecycle:**
```
Visitor lands → Heartbeat every 30s → Still active
Visitor leaves → No heartbeat → 60s timeout → Auto-removed → Dashboard updates
```

**WebSocket Hibernation:**
- Uses Cloudflare's WebSocket Hibernation API
- Keeps connections alive with minimal resource usage
- Ping/pong every 30 seconds to maintain connection

## Future Enhancements

1. **Services Layer**: Add `src/services/` for API calls
2. **Hooks**: Feature-specific custom hooks
3. **Utils**: Add `src/shared/utils/` for helper functions
4. **Tests**: Add test files alongside components
5. **Storybook**: Component documentation and visual testing

## Migration Notes

**From Old Structure:**
```
src/components/  →  src/features/[feature]/components/
                    src/shared/components/[category]/
src/types/       →  src/shared/types/
```

**Import Changes:**
```typescript
// Before
import { PerformanceDashboard } from './components/PerformanceDashboard';

// After
import { PerformanceDashboard } from './features/dashboard';
```



---

**Last Updated**: 2025-10-16
**Version**: 2.0.0 (Feature-based architecture)
