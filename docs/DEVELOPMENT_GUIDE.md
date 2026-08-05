# Development Guide

## Coding standards
- Frontend: TypeScript everywhere, small reusable components, no duplicated
  logic — shared UI lives in `frontend/src/components/ui`.
- Backend: package-by-layer (`controller` → `service` → `repository`), DTOs
  never leak entities across the REST boundary, constructor/`@Inject` field
  injection only (no service locators).
- No hardcoded credentials anywhere — configuration is via environment
  variables (`application.properties` placeholders, `.env.example`).
- Database schema changes are Flyway migrations only; Hibernate DDL
  auto-generation is disabled (`validate` mode).

## Adding a new backend resource
1. Add/extend the JPA entity in `entity/`.
2. Add a Flyway migration under `db/migration/` (never edit an already-applied
   migration — add a new `V{n}__description.sql`).
3. Add a Panache repository in `repository/`.
4. Add a DTO (or extend an existing one) in `dto/`.
5. Add business logic in `service/` (or `automation/` for AI/recovery flows).
6. Expose it via a `@Path`-annotated resource in `controller/`.

## Adding a new frontend page
1. Create `src/pages/<Name>/<Name>.tsx`.
2. Add the route in `src/App.tsx` inside the `<ProtectedRoute>` / `<AppLayout>` tree.
3. Add a nav entry in `src/layouts/Sidebar.tsx`.
4. Pull data via a `services/<resource>.service.ts` + React Query hook, or use
   `services/mockData.ts` while the backend endpoint is still a placeholder.

## Testing
- Backend: `mvn test` (uses an in-memory H2 datasource, see the `%test` profile
  in `application.properties`).
- Frontend: no test runner is configured yet in Phase 2 — add Vitest +
  React Testing Library when component logic grows beyond presentational code.
