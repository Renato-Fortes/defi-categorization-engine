import type { Transaction } from "@shared/schema";

export interface IStorage {
  getTransactions(): Transaction[];
  setTransactions(txs: Transaction[]): void;
  updateTransaction(id: string, updates: Partial<Transaction>): Transaction | undefined;
}

export class MemStorage implements IStorage {
  private transactions: Transaction[] = [];

  getTransactions(): Transaction[] {
    return this.transactions;
  }

  setTransactions(txs: Transaction[]): void {
    this.transactions = txs;
  }

  updateTransaction(id: string, updates: Partial<Transaction>): Transaction | undefined {
    const idx = this.transactions.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    this.transactions[idx] = { ...this.transactions[idx], ...updates };
    return this.transactions[idx];
  }
}

export const storage = new MemStorage();
