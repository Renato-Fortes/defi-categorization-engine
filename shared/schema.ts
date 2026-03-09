import { z } from "zod";

export const reviewStatusEnum = z.enum(["Auto", "NeedsReview", "ManuallyEdited"]);
export type ReviewStatus = z.infer<typeof reviewStatusEnum>;

export const transactionSchema = z.object({
  id: z.string(),
  timestamp: z.string().optional(),
  wallet: z.string().optional(),
  chain: z.string().optional(),
  txHash: z.string(),
  asset: z.string().optional(),
  amount: z.string().optional(),
  direction: z.string().optional(),
  originalLabel: z.string(),
  newLabel: z.string(),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
  ruleId: z.string(),
  reviewStatus: reviewStatusEnum,
});

export type Transaction = z.infer<typeof transactionSchema>;

export const importRequestSchema = z.object({
  csvText: z.string(),
  format: z.enum(["koinly", "generic"]).default("generic"),
});

export type ImportRequest = z.infer<typeof importRequestSchema>;

export const classifyRequestSchema = z.object({
  transactions: z.array(transactionSchema),
  demoMode: z.boolean().default(true),
});

export type ClassifyRequest = z.infer<typeof classifyRequestSchema>;

export const exportRequestSchema = z.object({
  transactions: z.array(transactionSchema),
});

export type ExportRequest = z.infer<typeof exportRequestSchema>;

export const bulkUpdateSchema = z.object({
  ids: z.array(z.string()),
  newLabel: z.string().optional(),
  reviewStatus: reviewStatusEnum.optional(),
});

export type BulkUpdate = z.infer<typeof bulkUpdateSchema>;

export const walletImportSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
  chain: z.string().min(1, "Chain is required"),
});

export type WalletImport = z.infer<typeof walletImportSchema>;

export * from "./models/auth";
export * from "./models/transactions";
