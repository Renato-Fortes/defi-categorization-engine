import { sql } from "drizzle-orm";
import { index, real, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const userTransactions = pgTable(
  "user_transactions",
  {
    id: varchar("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    timestamp: varchar("timestamp"),
    wallet: varchar("wallet"),
    chain: varchar("chain"),
    txHash: varchar("tx_hash").notNull(),
    asset: varchar("asset"),
    amount: varchar("amount"),
    direction: varchar("direction"),
    originalLabel: varchar("original_label").notNull(),
    newLabel: varchar("new_label").notNull(),
    confidence: real("confidence").notNull().default(0),
    reason: varchar("reason").notNull(),
    ruleId: varchar("rule_id").notNull(),
    reviewStatus: varchar("review_status").notNull().default("NeedsReview"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("idx_user_transactions_user_id").on(table.userId)]
);

export const transactionCorrections = pgTable(
  "transaction_corrections",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    transactionId: varchar("transaction_id").notNull(),
    txHash: varchar("tx_hash").notNull(),
    originalLabel: varchar("original_label").notNull(),
    correctedLabel: varchar("corrected_label").notNull(),
    correctedAt: timestamp("corrected_at").defaultNow(),
  },
  (table) => [
    index("idx_corrections_user_id").on(table.userId),
    index("idx_corrections_transaction_id").on(table.transactionId),
  ]
);
