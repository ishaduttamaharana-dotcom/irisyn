# Digital Twin — Frontend

React + TypeScript + Vite single-page app for the AI-Powered Autonomous Data Center Digital Twin.

## Stack
- React 18, TypeScript, Vite
- Tailwind CSS (dark mode via `class` strategy)
- React Router v6
- TanStack React Query
- Axios (centralized API client with interceptors)
- Recharts (resource charts)
- Socket.io client (real-time updates, not yet wired to a live backend)
- Lucide React (icons)

## Getting started
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
App runs at `http://localhost:5173`. The Vite dev server proxies `/api` and `/ws` to `http://localhost:8080` (the Quarkus backend).

## Folder structure
```
src/
  layouts/        # AppLayout, Sidebar, Navbar, DashboardLayout
  routes/          # ProtectedRoute
  context/         # ThemeProvider, AuthContext
  services/        # apiClient + one service module per resource, mockData.ts
  components/
    ui/            # StatCard, Badge, DataTable, ProgressBar
    loading/        # Spinner, PageLoader, SkeletonCard
    error/          # ErrorBoundary, ErrorState
    dashboard/      # Dashboard-only widgets (charts, alerts, chat placeholder, etc.)
    digital-twin/   # Rack/node visualization placeholder
  pages/           # One folder per route
  types/           # Shared domain types
```

## Notes for Phase 2
- All pages currently render from `services/mockData.ts`. Swap the mock imports for the
  React Query hooks around each `services/*.service.ts` module once the backend endpoints
  return real data.
- Auth is a stub (`AuthContext` auto-logs in a default user) — replace with real
  session/token handling when the backend security module lands.
- `OpenClawChat` posts nowhere yet; wire it to `ai.service.ts#sendChatMessage` once
  `POST /chat` is implemented server-side.
