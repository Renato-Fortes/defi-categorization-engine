import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { classifyTransactions } from "./classifier";
import { importRequestSchema, classifyRequestSchema, exportRequestSchema } from "@shared/schema";
import { randomUUID } from "crypto";
import Papa from "papaparse";

const COLUMN_MAP: Record<string, string> = {
  txhash: "txHash",
  "transaction hash": "txHash",
  hash: "txHash",
  date: "timestamp",
  timestamp: "timestamp",
  label: "originalLabel",
  type: "originalLabel",
  category: "originalLabel",
  amount: "amount",
  currency: "asset",
  token: "asset",
  asset: "asset",
  wallet: "wallet",
  address: "wallet",
  chain: "chain",
  direction: "direction",
};

function normalizeColumnName(col: string): string {
  const lower = col.toLowerCase().trim();
  return COLUMN_MAP[lower] || lower;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/import", (req, res) => {
    try {
      const body = importRequestSchema.parse(req.body);
      const parsed = Papa.parse(body.csvText.trim(), {
        header: true,
        skipEmptyLines: true,
      });

      if (parsed.errors.length > 0 && parsed.data.length === 0) {
        return res.status(400).json({ message: "Failed to parse CSV", errors: parsed.errors });
      }

      const transactions = (parsed.data as Record<string, string>[]).map((row) => {
        const normalized: Record<string, string> = {};
        for (const [key, value] of Object.entries(row)) {
          const mapped = normalizeColumnName(key);
          normalized[mapped] = value;
        }

        return {
          id: randomUUID(),
          timestamp: normalized.timestamp || "",
          wallet: normalized.wallet || "",
          chain: normalized.chain || process.env.CHAIN_NAME || "arbitrum",
          txHash: normalized.txHash || "",
          asset: normalized.asset || "",
          amount: normalized.amount || "",
          direction: normalized.direction || "",
          originalLabel: normalized.originalLabel || "",
          newLabel: normalized.originalLabel || "Needs Review",
          confidence: 0,
          reason: "Not yet classified",
          ruleId: "PENDING",
          reviewStatus: "NeedsReview" as const,
        };
      }).filter((tx) => tx.txHash);

      storage.setTransactions(transactions);
      return res.json({ transactions });
    } catch (err: any) {
      return res.status(400).json({ message: err.message || "Invalid request" });
    }
  });

  app.post("/api/classify", async (req, res) => {
    try {
      const body = classifyRequestSchema.parse(req.body);
      const classified = await classifyTransactions(body.transactions, body.demoMode);
      storage.setTransactions(classified);
      return res.json({ transactions: classified });
    } catch (err: any) {
      return res.status(400).json({ message: err.message || "Classification failed" });
    }
  });

  app.post("/api/export", (req, res) => {
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

  return httpServer;
}
