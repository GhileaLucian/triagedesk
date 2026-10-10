# TriageDesk

[![CI](https://github.com/GhileaLucian/triagedesk/actions/workflows/ci.yml/badge.svg)](https://github.com/GhileaLucian/triagedesk/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57.svg)](https://sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Autonomous AI support ticket triage platform.** Ingests unstructured customer inquiries, classifies category and priority using Claude 3.7 / keyword mock rules with prompt injection defense, and provides an actionable React 19 dashboard for support teams.

---

## ⚡ Features

- **Agentic AI Classification**: Powered by Claude API (`CLAUDE_MODEL=claude-3-7-sonnet-20250219`) via a pluggable `TriageProvider` architecture with schema validation and retry logic.
- **Offline Mock Provider**: Out-of-the-box deterministic keyword classifier (`TRIAGE_PROVIDER=mock`) requiring zero API keys for local development and CI testing.
- **Prompt Injection Defense**: Explicit system prompt sandboxing isolating untrusted user text from execution instructions.
- **Fail-Safe Fallback**: Automatic 2-attempt retry loop falling back to `"other/medium"` with a persistent `needs_review: 1` badge on LLM rate-limit or timeout.
- **React 19 Dashboard**: High-density support desk UI with real-time statistics, multi-criteria filters (status, priority, category, full-text search), modal creation, and ticket status transition flows.
- **SQLite Persistence**: Embedded persistence via `better-sqlite3` with WAL mode for high concurrency and `:memory:` isolation during unit tests.
- **Automated Test Coverage**: 30 comprehensive unit and integration tests across Supertest HTTP endpoints and Testing Library component suites.

---

## 🏗 Architecture

```mermaid
flowchart TD
    User["👤 Support Agent / Client"] -->|Vite Dev Server (Port 5173)| ReactUI["⚛️ React 19 SPA (client/)"]
    ReactUI -->|REST /api Proxy| ExpressAPI["🚀 Express + TypeScript (server/)"]

    subgraph Backend ["Backend & Data Integrity"]
        ExpressAPI -->|Zod Validation| Schemas["🛡️ Zod Validation Schemas"]
        Schemas --> Repo["📦 Ticket Repository"]
        Repo --> SQLite[("💾 SQLite Database (better-sqlite3)")]
    end

    subgraph AISubsystem ["AI Triage Subsystem"]
        ExpressAPI -->|Dispatch| TriageProv["🔀 TriageProvider Interface"]
        TriageProv -->|TRIAGE_PROVIDER=mock| Mock["🔍 Deterministic MockProvider (Keyword Rules)"]
        TriageProv -->|TRIAGE_PROVIDER=claude| Claude["🤖 ClaudeProvider (@anthropic-ai/sdk)"]
        Claude -->|Prompt-Injected Defense & 10s Timeout| AnthropicAPI["☁️ Anthropic Claude 3.7 API"]
        Claude -->|Retry Failure / Malformed JSON| Fallback["⚠️ Fallback (needs_review: 1)"]
    end
```

---

## 🚀 Quick Start (3 Steps)

### 1. Clone & Install
```bash
git clone https://github.com/GhileaLucian/triagedesk.git
cd triagedesk

# Install root, server, and client dependencies
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
*(By default, `TRIAGE_PROVIDER=mock` is active. To use Claude 3.7, set `TRIAGE_PROVIDER=claude` and add your `ANTHROPIC_API_KEY`).*

### 3. Seed Database & Launch
```bash
# Populate SQLite with 15 benchmark support tickets
npm run seed

# Run both Express API (port 3001) and React Vite (port 5173) concurrently
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Express HTTP server listening port |
| `NODE_ENV` | `development` | Runtime environment (`development`, `production`, `test`) |
| `DATABASE_PATH` | `./triagedesk.sqlite` | SQLite database file location |
| `TRIAGE_PROVIDER` | `mock` | Triage classifier: `mock` (offline keyword rules) or `claude` |
| `ANTHROPIC_API_KEY` | *(empty)* | Anthropic API key from `console.anthropic.com` |
| `CLAUDE_MODEL` | `claude-3-7-sonnet-20250219` | Anthropic model identifier |

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint returning status and timestamp |
| `GET` | `/api/tickets` | List tickets with query filters (`status`, `priority`, `category`, `search`) |
| `GET` | `/api/tickets/:id` | Fetch detailed ticket by numeric ID (returns 404 if not found) |
| `POST` | `/api/tickets` | Ingest new ticket: validates schema, triggers AI triage, and persists |
| `PATCH` | `/api/tickets/:id` | Update ticket status (`open`, `in_progress`, `resolved`) |
| `POST` | `/api/tickets/:id/retriage` | Re-evaluate ticket classification with active AI triage provider |
| `GET` | `/api/stats` | Aggregate queue metrics (counts by status, priority, category, reviews) |

---

## 🧪 Testing Suite

Run full automated tests (server + client) with one command from the project root:

```bash
npm test
```

- **Backend Tests (24 specs)**: Supertest HTTP integration covering schema bounds, 400 validation failures, filter queries, stats calculations, and mock/Claude parsing edge cases.
- **Frontend Tests (6 specs)**: Vitest + Testing Library verifying queue loading, empty states, filtering, and form constraints.

---

## 🤖 How I Used Claude Code

I built TriageDesk using Anthropic's **Claude Code** agentic CLI workflow as a pair-programming partner:
- **Architecture Scaffolding**: Prompted Claude Code to generate initial Express TypeScript templates, repository patterns, and React component structures.
- **Iterative Corrections & Hardening**: When the agent generated inlined SQLite instances or raw JSON parsing without markdown fence stripping, I intervened to parameterize `:memory:` databases for Supertest and added prompt injection insulation.
- **Full Traceability**: All engineering prompts, agent outputs, and manual corrections are documented in [`AI_LOG.md`](./AI_LOG.md).

---

## 🔮 Next Steps & Roadmap
- [ ] Role-based authentication (OAuth2 / GitHub login).
- [ ] Real-time WebSocket updates via Socket.io when tickets are retriaged.
- [ ] Slack webhook dispatcher for high-priority tickets.

---

## 📄 License
Released under the [MIT License](./LICENSE). Copyright (c) 2026 Dan Lucian Ghilea.
