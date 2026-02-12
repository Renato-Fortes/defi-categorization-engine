import { create } from "zustand";
import type { Transaction, ReviewStatus } from "@shared/schema";

interface TransactionStore {
  transactions: Transaction[];
  selectedIds: Set<string>;
  filter: "all" | "Auto" | "NeedsReview" | "ManuallyEdited";
  classificationProgress: { current: number; total: number } | null;
  isClassifying: boolean;
  setTransactions: (txs: Transaction[]) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  bulkUpdate: (ids: string[], updates: Partial<Transaction>) => void;
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setFilter: (f: "all" | "Auto" | "NeedsReview" | "ManuallyEdited") => void;
  setClassificationProgress: (p: { current: number; total: number } | null) => void;
  setIsClassifying: (v: boolean) => void;
  getFilteredTransactions: () => Transaction[];
  getStats: () => { auto: number; needsReview: number; manuallyEdited: number; total: number };
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  selectedIds: new Set(),
  filter: "all",
  classificationProgress: null,
  isClassifying: false,

  setTransactions: (txs) => set({ transactions: txs, selectedIds: new Set() }),

  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.id === id ? { ...tx, ...updates } : tx
      ),
    })),

  bulkUpdate: (ids, updates) =>
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        ids.includes(tx.id) ? { ...tx, ...updates } : tx
      ),
      selectedIds: new Set(),
    })),

  toggleSelected: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedIds: next };
    }),

  selectAll: (ids) => set({ selectedIds: new Set(ids) }),
  clearSelection: () => set({ selectedIds: new Set() }),
  setFilter: (f) => set({ filter: f }),
  setClassificationProgress: (p) => set({ classificationProgress: p }),
  setIsClassifying: (v) => set({ isClassifying: v }),

  getFilteredTransactions: () => {
    const { transactions, filter } = get();
    if (filter === "all") return transactions;
    return transactions.filter((tx) => tx.reviewStatus === filter);
  },

  getStats: () => {
    const txs = get().transactions;
    return {
      auto: txs.filter((t) => t.reviewStatus === "Auto").length,
      needsReview: txs.filter((t) => t.reviewStatus === "NeedsReview").length,
      manuallyEdited: txs.filter((t) => t.reviewStatus === "ManuallyEdited").length,
      total: txs.length,
    };
  },
}));
