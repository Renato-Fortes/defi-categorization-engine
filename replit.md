# DeFi Categorization Engine

## Overview
A web app that demonstrates a DeFi Categorization Engine for crypto accountants. Imports CSV exports from Koinly/Cryptio, auto-labels DeFi transactions (starting with Aave V3 Borrow/Repay) using deterministic rules, provides a review UI with confidence scores and explanations, allows manual overrides and bulk actions, and exports a corrected CSV. Features full authentication with Google OAuth via Replit Auth.

## Architecture
- **Frontend**: React + TypeScript + Tailwind + shadcn/ui (Vite) + framer-motion v10
- **Backend**: Express API routes (same server)
- **Database**: PostgreSQL via Drizzle ORM (users, sessions tables)
- **Auth**: Replit Auth (OpenID Connect) with Google, GitHub, email support; express-session + passport
- **State**: Zustand for client-side transaction state, in-memory server storage for transactions
- **CSV**: papaparse for parsing/generating CSV
- **Classification**: Demo mode with hardcoded tx hash matching; optional on-chain mode via ethers.js

## Pages
- `/` - Cinematic landing page with animated hero, stats, workflow, features, code preview
- `/import` - CSV upload (drag & drop), sample dataset loading, preview table
- `/review` - Main review table with filtering, bulk actions, detail side panel, export
- `/contact` - Contact form with email, subject, message fields
- `/login` - Split-screen login page with Google/email sign-in via Replit Auth

## API Routes
- `GET /api/login` - Begin Replit Auth login flow
- `GET /api/callback` - OAuth callback
- `GET /api/logout` - End session and logout
- `GET /api/auth/user` - Get current authenticated user
- `POST /api/import` - Parse CSV text, return normalized transactions
- `POST /api/classify` - Classify transactions (demo mode or on-chain)
- `POST /api/export` - Generate corrected CSV from transactions

## Key Files
- `shared/schema.ts` - Zod schemas, TypeScript types, re-exports auth models
- `shared/models/auth.ts` - Drizzle schema for users and sessions tables
- `server/db.ts` - Drizzle database connection
- `server/replit_integrations/auth/` - Auth module (OIDC, passport, session storage)
- `server/classifier.ts` - Classification engine (demo mode + on-chain Aave decoding)
- `server/routes.ts` - API endpoints for import/classify/export
- `client/src/hooks/use-auth.ts` - React hook for authentication state
- `client/src/lib/auth-utils.ts` - Auth error handling utilities
- `client/src/lib/transaction-store.ts` - Zustand store for transactions
- `client/src/lib/sample-data.ts` - Bundled sample CSV
- `client/src/pages/` - Landing, Import, Review, Contact, Login pages

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-provisioned)
- `SESSION_SECRET` - Session encryption secret (auto-provisioned)
- `RPC_URL` - Alchemy/Infura RPC endpoint (optional, demo mode works without it)
- `CHAIN_NAME` - e.g. "arbitrum" (default)
- `AAVE_POOL_ADDRESS` - Aave V3 Pool contract address (has default for Arbitrum)

## Running
- `npm run dev` starts Express + Vite dev server on port 5000
- `npm run db:push` syncs Drizzle schema to PostgreSQL
