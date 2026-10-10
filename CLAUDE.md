# TriageDesk

AI-powered support ticket triage application: Express + TypeScript API (`server/`), React 19 + Vite dashboard (`client/`).

## Architecture & Stack
- **Backend**: Node.js, Express, TypeScript, SQLite (`better-sqlite3`), Zod validation, Vitest + Supertest.
- **Frontend**: React 19, Vite, TypeScript, React Router, Vitest + Testing Library.
- **AI Triage**: Claude 3.7 Sonnet API via `TriageProvider` abstraction with schema validation, retry, prompt-injection defense, and fallback. Includes deterministic keyword-based `MockProvider` for local offline execution.

## Engineering Rules
1. **TypeScript Strict**: `strict: true`, no `any`, strictly typed schemas and domain models.
2. **Mandatory Testing**: Every endpoint, provider rule, fallback path, and core UI component must have automated tests.
3. **Zod Validation**: All external input (HTTP request bodies, URL params, LLM JSON outputs) must be parsed and validated with Zod.
4. **Security & Secrets**: Never log, print, or commit `.env` or API credentials.
5. **Prompt Injection Defense**: Ticket input is untrusted; LLM system instructions explicitly isolate user content.
6. **Git Workflow**: Conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`). Small, self-contained changes.

## Development Commands
- `npm run dev`: Run server (port 3001) and client (port 5173) concurrently.
- `npm test`: Execute all test suites across server and client.
- `npm --prefix server run test`: Run backend tests with Vitest.
- `npm --prefix server run seed`: Populate SQLite database with 15 realistic benchmark tickets.
- `npm --prefix client run test`: Run frontend component tests.
- `npm --prefix client run build`: Compile and type-check frontend.
