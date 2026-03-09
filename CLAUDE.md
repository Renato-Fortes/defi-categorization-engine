# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (Express + Vite, port 5000)
npm run build     # Build for production (outputs dist/index.cjs)
npm run start     # Run production build
npm run check     # TypeScript type check
npm run db:push   # Push Drizzle schema changes to the database
```

## Architecture

This is a full-stack TypeScript monorepo with a single Express server serving both the API and the React frontend via Vite (dev) or static files (prod).

**Key layout:**
- `server/` — Express backend (entry: `server/index.ts`)
- `client/src/` — React frontend (entry: `client/src/main.tsx`)
- `shared/` — Types and Zod schemas shared between client and server
- `shared/schema.ts` — Central data model: `Transaction`, `ReviewStatus`, and all API request schemas
- `shared/models/auth.ts` — Drizzle ORM user model + auth types

**Path alias:** `@shared/*` maps to `shared/*`, usable in both client and server code.

### Core data flow

1. **Import** (`POST /api/import`): CSV text is parsed with PapaParse, columns are normalized via `COLUMN_MAP`, and rows are stored in `MemStorage` (in-memory, server-side).
2. **Classify** (`POST /api/classify`): Transactions are run through `classifyTransactions()` in `server/classifier.ts`. Two modes:
   - **Demo mode** (default): matches against a hardcoded dictionary of known tx hashes.
   - **On-chain mode**: uses ethers.js to fetch transaction receipts via `RPC_URL` and decode Aave Pool `Borrow`/`Repay` events.
3. **Review**: Client-side state is managed entirely by a Zustand store (`client/src/lib/transaction-store.ts`). The store holds transactions, selection state, filter state, and classification progress.
4. **Export** (`POST /api/export`): Transactions are re-serialized to CSV with added columns: `NewLabel`, `Confidence`, `Reason`, `RuleId`, `ReviewStatus`.

### Authentication

Auth is handled via `server/replit_integrations/auth/` using Passport.js with two strategies:
- Local (email/password with bcrypt)
- Google OAuth (`passport-google-oauth20`)

User data is persisted to PostgreSQL via Drizzle ORM (`AuthStorage` in `server/replit_integrations/auth/storage.ts`). Email verification uses Resend for transactional email.

The `/import` and `/review` nav routes are only shown when `isAuthenticated` is true (enforced in `App.tsx` navbar).

### Wallet import via Noves

`server/noves.ts` contains the Noves Translate API client. Key points:
- Endpoint: `GET https://translate.noves.fi/evm/{chain}/txs/{walletAddress}` with `apiKey` header
- Paginates up to 5 pages (500 tx) per import; `truncated: true` in response if more exist
- `TYPE_MAP` maps Noves types (`swap`, `claimRewards`, `addLiquidity`, etc.) to accounting labels
- `IGNORE_TYPES` drops `approve`/`approval`/`revoke` — no accounting impact
- Supported chains are defined in `NOVES_CHAINS` (both `server/noves.ts` and duplicated in `import-page.tsx`)
- `GET /api/wallet/chains` returns the chain list without auth

### Classification rules

Current rules in `server/classifier.ts`:
- `AAVE_BORROW_V1` — detects Aave Pool `Borrow` event → "Loan (Borrow)", confidence 0.95
- `AAVE_REPAY_V1` — detects Aave Pool `Repay` event → "Loan Repayment", confidence 0.95
- `NO_MATCH` fallback — confidence 0.20, reviewStatus "NeedsReview"

The default `AAVE_POOL_ADDRESS` is the Arbitrum V3 pool (`0x794a61358D6845594F94dc1DB02A252b5b4814aD`), overridable via env var.

### Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (required) |
| `RPC_URL` | Ethereum/Arbitrum RPC endpoint for on-chain classification |
| `AAVE_POOL_ADDRESS` | Override default Aave pool contract address |
| `CHAIN_NAME` | Default chain name applied during import (default: `"arbitrum"`) |
| `SESSION_SECRET` | Express session secret |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `RESEND_API_KEY` | Resend email API key for verification emails |
| `NOVES_API_KEY` | Noves Translate API key for wallet import (`server/noves.ts`) |

### Frontend routing

Uses `wouter` (not React Router). Routes defined in `client/src/App.tsx`:
- `/` — Landing page
- `/import` — CSV upload / sample dataset load
- `/review` — Transaction review table with bulk actions and side panel
- `/contact`, `/login`, `/register`, `/verify-email`

API calls from the client use `@tanstack/react-query`. The query client is configured in `client/src/lib/queryClient.ts` with a default `apiRequest` helper that throws on non-2xx responses.
