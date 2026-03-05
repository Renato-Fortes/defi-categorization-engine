# DeFi Categorization Engine

## Overview
A web app that demonstrates a DeFi Categorization Engine for crypto accountants. Imports CSV exports from Koinly/Cryptio, auto-labels DeFi transactions (starting with Aave V3 Borrow/Repay) using deterministic rules, provides a review UI with confidence scores and explanations, allows manual overrides and bulk actions, and exports a corrected CSV. Features custom email/password authentication with email verification.

## Architecture
- **Frontend**: React + TypeScript + Tailwind + shadcn/ui (Vite) + framer-motion v10
- **Backend**: Express API routes (same server)
- **Database**: PostgreSQL via Drizzle ORM (users, sessions tables)
- **Auth**: Custom email/password auth with bcryptjs password hashing, email verification via Resend (optional), express-session with PostgreSQL session store
- **State**: Zustand for client-side transaction state, in-memory server storage for transactions
- **CSV**: papaparse for parsing/generating CSV
- **Classification**: Demo mode with hardcoded tx hash matching; optional on-chain mode via ethers.js

## Pages
- `/` - Anthropic.com-inspired cinematic landing page: full-viewport hero with typewriter code animation, animated gradient text, protocol marquee ticker, animated counter stats (10x/98%/50+), 4-step workflow cards, live classification demo, 6 feature cards with hover effects, glow orb animations, scroll progress bar
- `/import` - CSV upload (drag & drop), sample dataset loading, preview table
- `/review` - Main review table with filtering, bulk actions, detail side panel, export
- `/contact` - Cinematic contact page with glassmorphic form card, contact info cards, enterprise CTA
- `/login` - Split-screen login: left side with branding/value props, right side with email/password form + link to create account
- `/register` - Split-screen registration: first name, last name, email, password with email verification requirement
- `/verify-email` - Email verification page (token-based, shows success/error state)

## API Routes
- `POST /api/auth/register` - Create account (firstName, lastName, email, password) + send verification email
- `POST /api/auth/login` - Sign in with email/password (requires verified email)
- `GET /api/auth/verify-email?token=xxx` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification email
- `GET /api/auth/user` - Get current authenticated user
- `POST /api/auth/logout` - Destroy session and logout
- `POST /api/import` - Parse CSV text, return normalized transactions
- `POST /api/classify` - Classify transactions (demo mode or on-chain)
- `POST /api/export` - Generate corrected CSV from transactions

## Key Files
- `shared/schema.ts` - Zod schemas, TypeScript types, re-exports auth models
- `shared/models/auth.ts` - Drizzle schema for users (with passwordHash, emailVerified, verificationToken) and sessions tables
- `server/db.ts` - Drizzle database connection
- `server/replit_integrations/auth/replitAuth.ts` - Custom auth system (register, login, verify-email, session management)
- `server/replit_integrations/auth/storage.ts` - Auth storage (getUser, getUserByEmail, getUserByVerificationToken, verifyUserEmail)
- `server/classifier.ts` - Classification engine (demo mode + on-chain Aave decoding)
- `server/routes.ts` - API endpoints for import/classify/export
- `client/src/hooks/use-auth.ts` - React hook for authentication state (fetches /api/auth/user, handles logout via POST)
- `client/src/lib/transaction-store.ts` - Zustand store for transactions
- `client/src/lib/sample-data.ts` - Bundled sample CSV
- `client/src/pages/` - Landing, Import, Review, Contact, Login, Register, VerifyEmail pages

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-provisioned)
- `SESSION_SECRET` - Session encryption secret (auto-provisioned)
- `RESEND_API_KEY` - Resend API key for sending verification emails (optional, falls back to console logging)
- `RESEND_FROM_EMAIL` - From address for emails (optional, defaults to onboarding@resend.dev)
- `RPC_URL` - Alchemy/Infura RPC endpoint (optional, demo mode works without it)
- `CHAIN_NAME` - e.g. "arbitrum" (default)
- `AAVE_POOL_ADDRESS` - Aave V3 Pool contract address (has default for Arbitrum)

## Running
- `npm run dev` starts Express + Vite dev server on port 5000
- `npm run db:push` syncs Drizzle schema to PostgreSQL
