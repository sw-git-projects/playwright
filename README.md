# Playwright E2E

## Setup

1. **Node.js** v18+ and npm: [https://nodejs.org](https://nodejs.org)

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Install browsers** (Chromium and friends for Playwright)

   ```bash
   npx playwright install
   ```

4. **Environment**

   Copy or create a `.env` in the project root (see `.env.example` if present, or use the variables below). Values are loaded via `dotenv` and `config/config.ts`.
   **Do not commit real credentials.** `.env` should stay gitignored.

---

## Run tests

```bash
# All tests
npx playwright test

# Single spec (example: new-user booking flow)
npx playwright test tests/bookScanAsNewUser.spec.ts

# UI headed / debug
npx playwright test --headed
npx playwright test --debug
```

---

## Architecture (Page Object Model)

| Area | Location | Role |
|------|----------|------|
| Specs | `tests/*.spec.ts` | Orchestrate flows; minimal UI detail |
| Page objects | `tests/pages/*.ts` | Locators + actions per screen (`JoinPage`, `SelectScanPage`, `ScheduleScanPage`, `PaymentPage`, `ConfirmationPage`, `DashboardPage`, `LoginPage`) |
| Config / env | `config/config.ts`, `.env` | Central env access |
| Helpers | `misc/helpers.ts` | Shared utilities (e.g. email alias) |

**Design choices**

- **POM** keeps selectors and user actions in one place so UI changes touch fewer files and specs stay readable.
- **One page class per major screen or concern** (join vs schedule vs payment) so the suite can grow without a single giant class.

---

## Trade-offs and assumptions

- **Staging-only URLs** — `baseURL` in `playwright.config.ts` points at staging. Tests assume that environment is up and data is stable enough for automation.
- **Locators** — A mix of `data-testid`, roles, classes and text/regex is used where test IDs are missing
- **Credentials** — Member credentials live in `.env`. CI should inject secrets via the pipeline
- **Payment** — Stripe fields are driven by third party iframe/title patterns may require maintainance
- **Flakiness** — Long timeouts exist for slow staging; retries in CI help, but the real fix is deterministic waits, not arbitrary sleeps.
- **Scope** — The demo flows are `tests/bookScanAsNewUser.spec.ts` and `tests/bookScanAsExistingUser.spec.ts` 

---

## Scalability
- **Parallelism** — Playwright can run files/workers in parallel
- **CI** — Use `CI=true` (or your pipeline’s flag) to enable this suite to be used in deployments and releases

---
