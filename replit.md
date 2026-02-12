# DeFi Categorization Engine

## Overview
A web app that demonstrates a DeFi Categorization Engine for crypto accountants. Imports CSV exports from Koinly/Cryptio, auto-labels DeFi transactions (starting with Aave V3 Borrow/Repay) using deterministic rules, provides a review UI with confidence scores and explanations, allows manual overrides and bulk actions, and exports a corrected CSV.

## Architecture
- **Frontend**: React + TypeScript + Tailwind + shadcn/ui (Vite)
- **Backend**: Express API routes (same server)
- **State**: Zustand for client-side transaction state, in-memory server storage
- **CSV**: papaparse for parsing/generating CSV
- **Classification**: Demo mode with hardcoded tx hash matching; optional on-chain mode via ethers.js

## Pages
- `/` - Landing page with workflow explanation
- `/import` - CSV upload (drag & drop), sample dataset loading, preview table
- `/review` - Main review table with filtering, bulk actions, detail side panel, export

## API Routes
- `POST /api/import` - Parse CSV text, return normalized transactions
- `POST /api/classify` - Classify transactions (demo mode or on-chain)
- `POST /api/export` - Generate corrected CSV from transactions

## Key Files
- `shared/schema.ts` - Zod schemas and TypeScript types
- `server/classifier.ts` - Classification engine (demo mode + on-chain Aave decoding)
- `server/routes.ts` - API endpoints
- `client/src/lib/transaction-store.ts` - Zustand store for transactions
- `client/src/lib/sample-data.ts` - Bundled sample CSV
- `client/src/pages/` - Landing, Import, Review pages

## Environment Variables
- `RPC_URL` - Alchemy/Infura RPC endpoint (optional, demo mode works without it)
- `CHAIN_NAME` - e.g. "arbitrum" (default)
- `AAVE_POOL_ADDRESS` - Aave V3 Pool contract address (has default for Arbitrum)

## Running
- `npm run dev` starts Express + Vite dev server on port 5000
