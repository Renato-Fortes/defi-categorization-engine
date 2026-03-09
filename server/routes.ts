import type { Express } from "express";
import { type Server } from "http";
import { classifyTransactions } from "./classifier";
import {
  importRequestSchema,
  classifyRequestSchema,
  exportRequestSchema,
  transactionSchema,
} from "@shared/schema";
import { userTransactions, transactionCorrections } from "@shared/schema";
import { randomUUID } from "crypto";
import Papa from "papaparse";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "./replit_integrations/auth/replitAuth";
import type { Transaction } from "@shared/schema";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Column maps for format detection
// ---------------------------------------------------------------------------

const GENERIC_COLUMN_MAP: Record<string, string> = {
  txhash: "txHash",
  "transaction hash": "txHash",
  "transaction id": "txHash",
  hash: "txHash",
  date: "timestamp",
  timestamp: "timestamp",
  label: "originalLabel",
  type: "originalLabel",
  category: "originalLabel",
  operation: "originalLabel",
  amount: "amount",
  currency: "asset",
  token: "asset",
  asset: "asset",
  wallet: "wallet",
  address: "wallet",
  chain: "chain",
  direction: "direction",
};

const KOINLY_COLUMN_MAP: Record<string, string> = {
  date: "timestamp",
  "sent amount": "amount",
  "sent currency": "asset",
  "received amount": "receivedAmount",
  "received currency": "receivedAsset",
  "fee amount": "fee",
  "fee currency": "feeAsset",
  "net worth amount": "netWorth",
  "net worth currency": "netWorthCurrency",
  label: "originalLabel",
  description: "description",
  txhash: "txHash",
  "transaction id": "txHash",
};

const CRYPTIO_COLUMN_MAP: Record<string, string> = {
  date: "timestamp",
  operation: "originalLabel",
  type: "type",
  "sending wallet": "wallet",
  "receiving wallet": "toWallet",
  "sent amount": "amount",
  "sent asset": "asset",
  "received amount": "receivedAmount",
  "received asset": "receivedAsset",
  fee: "fee",
  "fee asset": "feeAsset",
  "fee amount": "feeAmount",
  label: "overrideLabel",
  description: "description",
  txhash: "txHash",
  "transaction id": "txHash",
};

function detectFormat(headers: string[]): "koinly" | "cryptio" | "generic" {
  const lower = headers.map((h) => h.toLowerCase().trim());
  if (lower.includes("sent currency") || lower.includes("received currency")) return "koinly";
  if (lower.includes("sending wallet") || lower.includes("receiving wallet")) return "cryptio";
  return "generic";
}

function getColumnMap(fmt: "koinly" | "cryptio" | "generic"): Record<string, string> {
  if (fmt === "koinly") return KOINLY_COLUMN_MAP;
  if (fmt === "cryptio") return CRYPTIO_COLUMN_MAP;
  return GENERIC_COLUMN_MAP;
}

function normalizeColumnName(col: string, columnMap: Record<string, string>): string {
  return columnMap[col.toLowerCase().trim()] ?? col.toLowerCase().trim();
}

// ---------------------------------------------------------------------------
// Account mappings for journal entry export
// ---------------------------------------------------------------------------

interface AccountMapping {
  debit: string;
  credit: string;
  memo: string;
}

const ACCOUNT_MAP: Record<string, AccountMapping> = {
  "loan (borrow)": { debit: "Crypto Assets", credit: "Loan Payable", memo: "DeFi Borrow" },
  "borrow": { debit: "Crypto Assets", credit: "Loan Payable", memo: "DeFi Borrow" },
  "loan repayment": { debit: "Loan Payable", credit: "Crypto Assets", memo: "DeFi Repayment" },
  "repay": { debit: "Loan Payable", credit: "Crypto Assets", memo: "DeFi Repayment" },
  "swap": { debit: "Crypto Assets Received", credit: "Crypto Assets Sold", memo: "Token Swap" },
  "trade": { debit: "Crypto Assets Received", credit: "Crypto Assets Sold", memo: "Token Trade" },
  "transfer": { debit: "Receiving Wallet", credit: "Sending Wallet", memo: "Wallet Transfer" },
  "staking reward": { debit: "Crypto Assets", credit: "Staking Income", memo: "Staking Reward" },
  "fee": { debit: "Transaction Fee Expense", credit: "Crypto Assets", memo: "Transaction Fee" },
  "liquidity add": { debit: "LP Token", credit: "Crypto Assets", memo: "LP Deposit" },
  "liquidity remove": { debit: "Crypto Assets", credit: "LP Token", memo: "LP Withdrawal" },
  "bridge": { debit: "Destination Chain Asset", credit: "Source Chain Asset", memo: "Bridge Transfer" },
  "airdrop": { debit: "Crypto Assets", credit: "Airdrop Income", memo: "Airdrop" },
  "income": { debit: "Crypto Assets", credit: "Crypto Income", memo: "Income" },
  "expense": { debit: "Business Expense", credit: "Crypto Assets", memo: "Expense" },
};

function getAccountMapping(label: string): AccountMapping {
  return (
    ACCOUNT_MAP[label.toLowerCase()] ?? {
      debit: "Unclassified Crypto",
      credit: "Unclassified Crypto",
      memo: label,
    }
  );
}

// ---------------------------------------------------------------------------
// DB helpers
// ---------------------------------------------------------------------------

function dbRowToTransaction(row: typeof userTransactions.$inferSelect): Transaction {
  return {
    id: row.id,
    timestamp: row.timestamp ?? undefined,
    wallet: row.wallet ?? undefined,
    chain: row.chain ?? undefined,
    txHash: row.txHash,
    asset: row.asset ?? undefined,
    amount: row.amount ?? undefined,
    direction: row.direction ?? undefined,
    originalLabel: row.originalLabel,
    newLabel: row.newLabel,
    confidence: row.confidence ?? 0,
    reason: row.reason,
    ruleId: row.ruleId,
    reviewStatus: row.reviewStatus as "Auto" | "NeedsReview" | "ManuallyEdited",
  };
}

// ---------------------------------------------------------------------------
// Request schemas
// ---------------------------------------------------------------------------

const updateTransactionSchema = z.object({
  newLabel: z.string().optional(),
  reviewStatus: z.enum(["Auto", "NeedsReview", "ManuallyEdited"]).optional(),
  confidence: z.number().min(0).max(1).optional(),
  reason: z.string().optional(),
  ruleId: z.string().optional(),
});

const bulkUpdateSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string(),
      newLabel: z.string().optional(),
      reviewStatus: z.enum(["Auto", "NeedsReview", "ManuallyEdited"]).optional(),
      confidence: z.number().min(0).max(1).optional(),
      reason: z.string().optional(),
      ruleId: z.string().optional(),
    })
  ),
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // GET /api/transactions — load authenticated user's transactions
  app.get("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const rows = await db
        .select()
        .from(userTransactions)
        .where(eq(userTransactions.userId, userId));
      return res.json({ transactions: rows.map(dbRowToTransaction) });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || "Failed to load transactions" });
    }
  });

  // POST /api/import — parse CSV, save to DB, return transactions
  app.post("/api/import", isAuthenticated, async (req, res) => {
    try {
      const body = importRequestSchema.parse(req.body);
      const parsed = Papa.parse(body.csvText.trim(), {
        header: true,
        skipEmptyLines: true,
      });

      if (parsed.errors.length > 0 && parsed.data.length === 0) {
        return res.status(400).json({ message: "Failed to parse CSV", errors: parsed.errors });
      }

      const rawRows = parsed.data as Record<string, string>[];
      const headers = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];

      // Auto-detect format unless user explicitly set it
      const detectedFormat =
        body.format !== "generic" ? body.format : detectFormat(headers);
      const columnMap = getColumnMap(detectedFormat);

      const transactions: Transaction[] = rawRows
        .map((row) => {
          const normalized: Record<string, string> = {};
          for (const [key, value] of Object.entries(row)) {
            const mapped = normalizeColumnName(key, columnMap);
            normalized[mapped] = value as string;
          }

          // For Koinly: prefer sent amount when present, else received amount
          const amount =
            normalized.amount ||
            normalized.receivedAmount ||
            "";
          const asset =
            normalized.asset ||
            normalized.receivedAsset ||
            "";

          // For Cryptio: overrideLabel takes precedence over originalLabel if set
          const label =
            normalized.overrideLabel ||
            normalized.originalLabel ||
            "";

          return {
            id: randomUUID(),
            timestamp: normalized.timestamp || "",
            wallet: normalized.wallet || "",
            chain: normalized.chain || process.env.CHAIN_NAME || "arbitrum",
            txHash: normalized.txHash || "",
            asset,
            amount,
            direction: normalized.direction || "",
            originalLabel: label,
            newLabel: label || "Needs Review",
            confidence: 0,
            reason: "Not yet classified",
            ruleId: "PENDING",
            reviewStatus: "NeedsReview" as const,
          };
        })
        .filter((tx) => tx.txHash);

      // Replace user's transactions in DB
      const userId = req.session.userId!;
      await db.delete(userTransactions).where(eq(userTransactions.userId, userId));

      if (transactions.length > 0) {
        await db.insert(userTransactions).values(
          transactions.map((tx) => ({ ...tx, userId }))
        );
      }

      return res.json({ transactions, detectedFormat });
    } catch (err: any) {
      return res.status(400).json({ message: err.message || "Invalid request" });
    }
  });

  // POST /api/classify — classify transactions, persist results to DB
  app.post("/api/classify", isAuthenticated, async (req, res) => {
    try {
      const body = classifyRequestSchema.parse(req.body);
      const classified = await classifyTransactions(body.transactions, body.demoMode);

      const userId = req.session.userId!;
      // Update each transaction in DB
      await Promise.all(
        classified.map((tx) =>
          db
            .update(userTransactions)
            .set({
              newLabel: tx.newLabel,
              confidence: tx.confidence,
              reason: tx.reason,
              ruleId: tx.ruleId,
              reviewStatus: tx.reviewStatus,
              updatedAt: new Date(),
            })
            .where(eq(userTransactions.id, tx.id))
        )
      );

      return res.json({ transactions: classified });
    } catch (err: any) {
      return res.status(400).json({ message: err.message || "Classification failed" });
    }
  });

  // PATCH /api/transactions/:id — update a single transaction, record correction
  app.patch("/api/transactions/:id", isAuthenticated, async (req, res) => {
    try {
      const updates = updateTransactionSchema.parse(req.body);
      const userId = req.session.userId!;
      const txId = String(req.params.id);

      // Fetch current state to detect label change
      const [current] = await db
        .select()
        .from(userTransactions)
        .where(eq(userTransactions.id, txId));

      if (!current || current.userId !== userId) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      await db
        .update(userTransactions)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(userTransactions.id, txId));

      // Record correction if label changed
      const newLabel = updates.newLabel;
      if (newLabel && newLabel !== current.newLabel) {
        await db.insert(transactionCorrections).values({
          userId,
          transactionId: txId,
          txHash: current.txHash,
          originalLabel: current.newLabel,
          correctedLabel: newLabel,
        });
      }

      const [updated] = await db
        .select()
        .from(userTransactions)
        .where(eq(userTransactions.id, txId));

      return res.json({ transaction: dbRowToTransaction(updated) });
    } catch (err: any) {
      return res.status(400).json({ message: err.message || "Update failed" });
    }
  });

  // POST /api/transactions/bulk — bulk update, record corrections
  app.post("/api/transactions/bulk", isAuthenticated, async (req, res) => {
    try {
      const { updates } = bulkUpdateSchema.parse(req.body);
      const userId = req.session.userId!;

      const corrections: Array<{
        userId: string;
        transactionId: string;
        txHash: string;
        originalLabel: string;
        correctedLabel: string;
      }> = [];

      for (const update of updates) {
        const { id, ...fields } = update;

        const [current] = await db
          .select()
          .from(userTransactions)
          .where(eq(userTransactions.id, id));

        if (!current || current.userId !== userId) continue;

        await db
          .update(userTransactions)
          .set({ ...fields, updatedAt: new Date() })
          .where(eq(userTransactions.id, id));

        const changedLabel = fields.newLabel;
        if (changedLabel && changedLabel !== current.newLabel) {
          corrections.push({
            userId,
            transactionId: id,
            txHash: current.txHash,
            originalLabel: current.newLabel,
            correctedLabel: changedLabel,
          });
        }
      }

      if (corrections.length > 0) {
        await db.insert(transactionCorrections).values(corrections);
      }

      return res.json({ updated: updates.length, corrections: corrections.length });
    } catch (err: any) {
      return res.status(400).json({ message: err.message || "Bulk update failed" });
    }
  });

  // POST /api/export — annotated CSV export
  app.post("/api/export", isAuthenticated, (req, res) => {
    try {
      const body = exportRequestSchema.parse(req.body);
      const exportData = body.transactions.map((tx) => ({
        Date: tx.timestamp || "",
        TxHash: tx.txHash,
        Chain: tx.chain || "",
        Wallet: tx.wallet || "",
        Asset: tx.asset || "",
        Amount: tx.amount || "",
        OriginalLabel: tx.originalLabel,
        NewLabel: tx.newLabel,
        Confidence: tx.confidence,
        Reason: tx.reason,
        RuleId: tx.ruleId,
        ReviewStatus: tx.reviewStatus,
      }));

      const csv = Papa.unparse(exportData);
      return res.json({ csv });
    } catch (err: any) {
      return res.status(400).json({ message: err.message || "Export failed" });
    }
  });

  // POST /api/export/journal — double-entry journal entries export
  app.post("/api/export/journal", isAuthenticated, (req, res) => {
    try {
      const body = exportRequestSchema.parse(req.body);

      const journalRows: Array<Record<string, string | number>> = [];

      for (const tx of body.transactions) {
        if (tx.reviewStatus === "NeedsReview" && tx.ruleId === "PENDING") continue;

        const mapping = getAccountMapping(tx.newLabel);
        const description = `${mapping.memo}${tx.asset ? ` — ${tx.asset}` : ""}`;

        journalRows.push({
          Date: tx.timestamp || "",
          TxHash: tx.txHash,
          Description: description,
          "Debit Account": mapping.debit,
          "Credit Account": mapping.credit,
          Amount: tx.amount || "",
          Currency: tx.asset || "",
          Memo: `${tx.newLabel} | Rule: ${tx.ruleId} | Confidence: ${Math.round(tx.confidence * 100)}%`,
          ReviewStatus: tx.reviewStatus,
        });
      }

      const csv = Papa.unparse(journalRows);
      return res.json({ csv });
    } catch (err: any) {
      return res.status(400).json({ message: err.message || "Journal export failed" });
    }
  });

  return httpServer;
}
