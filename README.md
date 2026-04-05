# DEKRA User CRUD

User management app built with Angular 20. Supports listing, creating, editing, viewing and deleting users, with form validation and unsaved-changes protection.

## Requirements

- **[Volta](https://volta.sh)** — manages the Node version automatically. Install it and it will pick up `node@22.22.1` from `package.json` on first use.
- **Angular CLI** — `npm install -g @angular/cli`

## Stack

- **Angular 20** — standalone components, signals, OnPush
- **Angular Material 20** — UI components
- **TypeScript 5.9**
- **SCSS**

## Structure

Angular workspace with two projects: the main app and a reusable internal library.

```
dekra-user-crud/
├── src/
│   └── app/
│       ├── shared/
│       │   └── components/
│       │       ├── header/           # Global app header
│       │       └── confirm-dialog/   # Reusable confirmation dialog
│       └── user/                     # User feature (DDD-layered)
│           ├── domain/               # Business rules: models, abstract repository
│           ├── infrastructure/
│           │   ├── mock-repository/  # In-memory implementation with simulated delays
│           │   └── http-repository/  # HTTP implementation (provisional — no backend yet)
│           │       ├── user-http.dto.ts    # API response shape (snake_case)
│           │       ├── user.mapper.ts      # DTO ↔ domain mapper
│           │       └── user-http.repository.ts
│           ├── application/          # Use cases: form schema definition
│           └── ui/
│               ├── pages/
│               │   ├── user-list/    # Table with filter and sort
│               │   ├── user-detail/  # Read-only detail view
│               │   └── user-form/    # Create and edit form
│               └── guards/           # Unsaved changes route guard
└── projects/
    └── dekra-user-lib/               # Internal Angular library
        └── src/lib/
            ├── components/
            │   ├── dynamic-form/     # Form renderer from JSON schema
            │   └── dynamic-field/    # Individual field component
            ├── services/             # Form building logic
            └── models/               # Schema interfaces
```

The data layer is split into two infrastructure adapters, both implementing the `UserRepository` domain port:

- **`mock-repository/`** — in-memory implementation used during development (`environment.useMock = true`)
- **`http-repository/`** — HTTP implementation using `HttpClient`, active when `environment.useMock = false`

The active adapter is swapped in `app.config.ts` via Angular DI with no changes to the domain or UI layers. Path aliases (`@user/*`, `@env/*`) are configured in `tsconfig.json` to avoid deep relative imports.

### SCSS

```
src/
├── styles.scss                   # Global styles and Angular Material setup
└── app/shared/scss/
    └── common.scss               # Shared SCSS variables and mixins
                                  # (colors, typography, spacing, icon-button-gap…)

projects/dekra-user-lib/src/lib/styles/
└── _theme.scss                   # .dekra theme class — defines CSS custom properties
                                  # for theming the library from the consuming app
```

Color names (e.g. `$haiti-blue`) are resolved using **[Name that Color](https://chir.ag/projects/name-that-color)** — paste a hex value and get a human-readable name. This avoids anonymous hex literals scattered across the codebase: every color is defined once by name in `styles.scss` or `common.scss`, and the rest of the code references the variable.

Components import `common.scss` via `@use`. The library exposes CSS custom properties (e.g. `--dekra-form-description-color`, `--dekra-field-margin-bottom`) with their default values defined inside the `.dekra` class in `_theme.scss`. To apply or override the theme, add the class to a wrapper element or to `body` and redefine the desired variables.

## Getting started

```bash
# 1. Clone the repository
git clone <repo-url>
cd dekra-user-crud

# 2. Install dependencies (Volta will pin Node automatically)
npm install

# 3. Build the library (required before first run)
npm run build-lib

# 4. Start the dev server
npm start
```

Open `http://localhost:4200` in your browser. The app uses a mock repository, so no backend is needed.

### Working with the library

If you modify `dekra-user-lib`, rebuild it before the changes are reflected in the app:

```bash
# One-time build
npm run build-lib

# Or watch mode (rebuilds on every change)
npm run watch-lib
```

## Testing

Tests are written with **Jasmine** and run via **Karma** + ChromeHeadless.

The `pre-commit` hook enforces that all tests pass before any commit is accepted.

### Coverage thresholds

The main app enforces the following minimums:

| Metric     | Minimum |
| ---------- | ------- |
| Statements | 90%     |
| Branches   | 85%     |
| Functions  | 90%     |
| Lines      | 90%     |

The build fails if any threshold is not met. Reports are generated in `coverage/dekra-user-crud/`.

The library (`dekra-user-lib`) has its own test suite but no enforced threshold yet.

## Code quality

### Prettier

Used for consistent formatting. Run manually with `npm run format`, or check without fixing with `npm run format:check`.

### ESLint

Configured with `angular-eslint`. Run with `npm run lint`.

### Husky

Git hooks are managed by Husky and set up automatically on `npm install` via the `prepare` script.

The `pre-commit` hook runs the full test suite and lint before every commit:

```
npm run test:coverage
npm run lint
```

The `preinstall` script (`scripts/check-volta.js`) warns if Volta is not installed on the system.

## Branching strategy

- `master` — stable branch, reflects the latest working state
- Feature branches follow the pattern `feature/<description>`
- No enforced commit message convention (no commitlint configured)

## Scripts

| Command                 | Description                    |
| ----------------------- | ------------------------------ |
| `npm start`             | Dev server at `localhost:4200` |
| `npm run build`         | Production build               |
| `npm test`              | Unit tests                     |
| `npm run test:coverage` | Unit tests with coverage       |
| `npm run build-lib`     | Build the library              |
| `npm run lint`          | ESLint                         |
| `npm run format`        | Prettier                       |
