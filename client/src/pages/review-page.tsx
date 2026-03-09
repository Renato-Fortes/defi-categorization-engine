import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Zap,
  Download,
  CheckCircle,
  AlertTriangle,
  Pencil,
  Tag,
  Filter,
  Info,
  Search,
  Sparkles,
  ChevronDown,
  BookOpen,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTransactionStore } from "@/lib/transaction-store";
import { apiRequest } from "@/lib/queryClient";
import type { Transaction } from "@shared/schema";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COMMON_LABELS = [
  "Swap",
  "Transfer",
  "Staking Reward",
  "Fee",
  "Borrow",
  "Repay",
  "Liquidity Add",
  "Liquidity Remove",
  "Bridge",
  "Airdrop",
  "Income",
  "Expense",
  "Needs Review",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

function statusBadge(status: string) {
  switch (status) {
    case "Auto":
      return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Auto</Badge>;
    case "NeedsReview":
      return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" />Review</Badge>;
    case "ManuallyEdited":
      return <Badge variant="outline"><Pencil className="h-3 w-3 mr-1" />Edited</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function confidenceBar(confidence: number) {
  const pct = Math.round(confidence * 100);
  const color = pct >= 80 ? "bg-chart-2" : pct >= 50 ? "bg-chart-4" : "bg-destructive";
  return (
    <div className="flex items-center gap-2">
      <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs text-muted-foreground font-mono w-8">{pct}%</span>
    </div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {value}
    </motion.span>
  );
}

// ---------------------------------------------------------------------------
// Inline label editor (Fix 5)
// ---------------------------------------------------------------------------

function LabelEditor({
  tx,
  onUpdate,
}: {
  tx: Transaction;
  onUpdate: (id: string, label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = COMMON_LABELS.filter((l) =>
    l.toLowerCase().includes(search.toLowerCase())
  );
  const showCustom = search.trim() && !COMMON_LABELS.map(l => l.toLowerCase()).includes(search.toLowerCase());

  const commit = (label: string) => {
    onUpdate(tx.id, label);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setTimeout(() => inputRef.current?.focus(), 50);
        if (!v) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          className="text-xs font-medium hover:text-primary transition-colors text-left flex items-center gap-1 group"
          onClick={(e) => e.stopPropagation()}
          data-testid={`label-editor-${tx.id}`}
        >
          {tx.newLabel}
          <Pencil className="h-2.5 w-2.5 opacity-0 group-hover:opacity-50 transition-opacity" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-52 p-2"
        onClick={(e) => e.stopPropagation()}
        align="start"
      >
        <Input
          ref={inputRef}
          placeholder="Search or type label..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 text-xs mb-2"
          onKeyDown={(e) => {
            if (e.key === "Enter" && search.trim()) {
              commit(search.trim());
            }
          }}
        />
        <div className="space-y-0.5 max-h-52 overflow-y-auto">
          {filtered.map((label) => (
            <button
              key={label}
              className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors hover:bg-muted ${
                tx.newLabel === label ? "bg-muted font-medium" : ""
              }`}
              onClick={() => commit(label)}
            >
              {label}
            </button>
          ))}
          {showCustom && (
            <button
              className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted transition-colors text-primary font-medium"
              onClick={() => commit(search.trim())}
            >
              Use &ldquo;{search.trim()}&rdquo;
            </button>
          )}
          {filtered.length === 0 && !showCustom && (
            <p className="text-xs text-muted-foreground px-2 py-2">No match</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ReviewPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const store = useTransactionStore();
  const [detailTx, setDetailTx] = useState<Transaction | null>(null);
  const [bulkLabel, setBulkLabel] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingFromDb, setIsLoadingFromDb] = useState(false);

  // Fix 2: Load from DB on mount if store is empty
  useEffect(() => {
    if (store.transactions.length === 0) {
      setIsLoadingFromDb(true);
      apiRequest("GET", "/api/transactions")
        .then((res) => res.json())
        .then((data) => {
          if (data.transactions?.length > 0) {
            store.setTransactions(data.transactions);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingFromDb(false));
    }
  }, []);

  // Fix 2: Persist a single transaction update to DB
  const persistUpdate = async (id: string, updates: Partial<Transaction>) => {
    try {
      await apiRequest("PATCH", `/api/transactions/${id}`, updates);
    } catch {
      // Optimistic update already applied locally — silent fail
    }
  };

  // Fix 2: Persist bulk updates to DB
  const persistBulkUpdate = async (ids: string[], updates: Partial<Transaction>) => {
    try {
      await apiRequest("POST", "/api/transactions/bulk", {
        updates: ids.map((id) => ({ id, ...updates })),
      });
    } catch {
      // Silent fail
    }
  };

  const filtered = store.getFilteredTransactions().filter((tx) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      tx.txHash.toLowerCase().includes(q) ||
      tx.originalLabel.toLowerCase().includes(q) ||
      tx.newLabel.toLowerCase().includes(q) ||
      (tx.asset || "").toLowerCase().includes(q)
    );
  });

  const stats = store.getStats();
  const selectedArr = Array.from(store.selectedIds);

  const handleClassify = async () => {
    if (store.transactions.length === 0) return;
    store.setIsClassifying(true);
    const total = store.transactions.length;
    store.setClassificationProgress({ current: 0, total });

    for (let i = 0; i <= Math.min(total, 5); i++) {
      store.setClassificationProgress({
        current: Math.min(Math.round((i / 5) * total), total),
        total,
      });
      await new Promise((r) => setTimeout(r, 200));
    }

    try {
      const res = await apiRequest("POST", "/api/classify", {
        transactions: store.transactions,
        demoMode: true,
      });
      const data = await res.json();
      store.setClassificationProgress({ current: total, total });
      store.setTransactions(data.transactions);
      const autoLabeled = data.transactions.filter(
        (t: Transaction) => t.reviewStatus === "Auto"
      ).length;
      toast({
        title: "Classification complete",
        description: `Auto-labeled ${autoLabeled} of ${data.transactions.length} transactions.`,
      });
    } catch (err: any) {
      toast({
        title: "Classification failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      store.setIsClassifying(false);
      store.setClassificationProgress(null);
    }
  };

  // Fix 4: Download helper
  const downloadCsv = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = async () => {
    try {
      const res = await apiRequest("POST", "/api/export", {
        transactions: store.transactions,
      });
      const data = await res.json();
      downloadCsv(data.csv, "corrected-transactions.csv");
      toast({ title: "Export complete", description: "Annotated CSV downloaded." });
    } catch (err: any) {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
    }
  };

  const handleExportJournal = async () => {
    try {
      const res = await apiRequest("POST", "/api/export/journal", {
        transactions: store.transactions,
      });
      const data = await res.json();
      downloadCsv(data.csv, "journal-entries.csv");
      toast({ title: "Export complete", description: "Journal entries CSV downloaded." });
    } catch (err: any) {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
    }
  };

  // Fix 5: Inline label update — updates store + persists to DB
  const handleLabelUpdate = (id: string, newLabel: string) => {
    const updates: Partial<Transaction> = {
      newLabel,
      reviewStatus: "ManuallyEdited",
      confidence: 1.0,
      reason: "Manually overridden by user",
      ruleId: "MANUAL",
    };
    store.updateTransaction(id, updates);
    persistUpdate(id, updates);

    // Keep detail panel in sync
    if (detailTx?.id === id) {
      setDetailTx((prev) => (prev ? { ...prev, ...updates } : null));
    }
    toast({
      title: "Label updated",
      description: `Set to "${newLabel}"`,
    });
  };

  const handleBulkApplyLabel = () => {
    if (!bulkLabel || selectedArr.length === 0) return;
    const updates: Partial<Transaction> = {
      newLabel: bulkLabel,
      reviewStatus: "ManuallyEdited",
      confidence: 1.0,
      reason: "Manually overridden by user",
      ruleId: "MANUAL",
    };
    store.bulkUpdate(selectedArr, updates);
    persistBulkUpdate(selectedArr, updates);
    setBulkLabel("");
    toast({
      title: "Labels updated",
      description: `Applied "${bulkLabel}" to ${selectedArr.length} transactions.`,
    });
  };

  const handleBulkMarkReviewed = () => {
    if (selectedArr.length === 0) return;
    const updates: Partial<Transaction> = { reviewStatus: "ManuallyEdited" };
    store.bulkUpdate(selectedArr, updates);
    persistBulkUpdate(selectedArr, updates);
    toast({
      title: "Marked as reviewed",
      description: `${selectedArr.length} transactions marked as reviewed.`,
    });
  };

  const allFilteredIds = filtered.map((t) => t.id);
  const allSelected =
    allFilteredIds.length > 0 && allFilteredIds.every((id) => store.selectedIds.has(id));

  // Export button (reusable dropdown)
  const ExportMenu = ({ size = "default" as "default" | "sm" }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} data-testid="button-export-menu">
          <Download className="h-4 w-4 mr-2" />
          Export
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCsv} data-testid="button-export-csv">
          <FileText className="h-4 w-4 mr-2" />
          Export Corrections CSV
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportJournal} data-testid="button-export-journal">
          <BookOpen className="h-4 w-4 mr-2" />
          Export Journal Entries
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (isLoadingFromDb) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (store.transactions.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-[60vh] gap-5"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Info className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">No transactions loaded</h2>
        <p className="text-muted-foreground text-sm">Import a CSV first to start reviewing.</p>
        <Button onClick={() => navigate("/import")} data-testid="button-go-import">
          Go to Import
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 py-6"
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} custom={0} className="flex flex-wrap items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/import")}
          data-testid="button-back-import"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">Review Transactions</h1>
            <Badge variant="secondary" className="text-xs font-medium">
              Step 2
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{stats.total} transactions loaded</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleClassify}
            disabled={store.isClassifying}
            data-testid="button-classify"
          >
            {store.isClassifying ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Classifying...
              </span>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Auto-categorize
              </>
            )}
          </Button>
          <ExportMenu />
        </div>
      </motion.div>

      <AnimatePresence>
        {store.isClassifying && store.classificationProgress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-4 mb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="h-4 w-4 text-primary animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Classifying {store.classificationProgress.current}/
                    {store.classificationProgress.total}...
                  </p>
                  <Progress
                    value={
                      (store.classificationProgress.current /
                        store.classificationProgress.total) *
                      100
                    }
                    className="mt-2 h-1.5"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={fadeUp}
        custom={1}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5"
      >
        {[
          {
            label: "Total",
            value: stats.total,
            color: "text-foreground",
            dot: "bg-foreground/30",
            filter: "all" as const,
            testId: "stat-total",
          },
          {
            label: "Auto-labeled",
            value: stats.auto,
            color: "text-chart-2",
            dot: "bg-chart-2",
            filter: "Auto" as const,
            testId: "stat-auto",
          },
          {
            label: "Needs Review",
            value: stats.needsReview,
            color: "text-chart-4",
            dot: "bg-chart-4",
            filter: "NeedsReview" as const,
            testId: "stat-needs-review",
          },
          {
            label: "Edited",
            value: stats.manuallyEdited,
            color: "text-chart-3",
            dot: "bg-chart-3",
            filter: "ManuallyEdited" as const,
            testId: "stat-edited",
          },
        ].map((s) => (
          <Card
            key={s.label}
            className={`p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${
              store.filter === s.filter ? "ring-1 ring-primary" : ""
            }`}
            onClick={() => store.setFilter(s.filter)}
            data-testid={s.testId}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${s.dot}`} />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {s.label}
              </p>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>
              <AnimatedNumber value={s.value} />
            </p>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} custom={2}>
        <Card className="overflow-hidden mb-5">
          <div className="p-3 border-b flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={store.filter}
                onValueChange={(v: any) => store.setFilter(v)}
              >
                <SelectTrigger className="w-[160px]" data-testid="select-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All transactions</SelectItem>
                  <SelectItem value="Auto">Auto-labeled</SelectItem>
                  <SelectItem value="NeedsReview">Needs Review</SelectItem>
                  <SelectItem value="ManuallyEdited">Manually Edited</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search..."
                className="pl-8 max-w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <div className="flex-1" />
            <AnimatePresence>
              {selectedArr.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-wrap items-center gap-2"
                >
                  <Badge variant="secondary">{selectedArr.length} selected</Badge>
                  <div className="flex items-center gap-1">
                    <Input
                      placeholder="New label..."
                      className="w-[130px]"
                      value={bulkLabel}
                      onChange={(e) => setBulkLabel(e.target.value)}
                      data-testid="input-bulk-label"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBulkApplyLabel}
                      disabled={!bulkLabel}
                      data-testid="button-bulk-apply"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkMarkReviewed}
                    data-testid="button-bulk-reviewed"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Reviewed
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(checked) => {
                        if (checked) store.selectAll(allFilteredIds);
                        else store.clearSelection();
                      }}
                      data-testid="checkbox-select-all"
                    />
                  </TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">TxHash</TableHead>
                  <TableHead className="text-xs">Asset</TableHead>
                  <TableHead className="text-xs">Amount</TableHead>
                  <TableHead className="text-xs">Original Label</TableHead>
                  <TableHead className="text-xs">New Label</TableHead>
                  <TableHead className="text-xs">Confidence</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((tx, index) => (
                  <motion.tr
                    key={tx.id}
                    className="cursor-pointer border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    onClick={() => setDetailTx(tx)}
                    data-testid={`row-tx-${tx.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={store.selectedIds.has(tx.id)}
                        onCheckedChange={() => store.toggleSelected(tx.id)}
                        data-testid={`checkbox-tx-${tx.id}`}
                      />
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                      {tx.timestamp || "—"}
                    </TableCell>
                    <TableCell className="text-xs font-mono max-w-[120px] truncate">
                      {tx.txHash.length > 14
                        ? tx.txHash.slice(0, 6) + "..." + tx.txHash.slice(-4)
                        : tx.txHash}
                    </TableCell>
                    <TableCell className="text-xs font-medium">{tx.asset || "—"}</TableCell>
                    <TableCell className="text-xs font-mono">{tx.amount || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {tx.originalLabel}
                    </TableCell>
                    {/* Fix 5: Inline label editor */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <LabelEditor tx={tx} onUpdate={handleLabelUpdate} />
                    </TableCell>
                    <TableCell>{confidenceBar(tx.confidence)}</TableCell>
                    <TableCell>{statusBadge(tx.reviewStatus)}</TableCell>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-5 w-5" />
                        <span>No transactions match the current filter.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </motion.div>

      <AnimatePresence>
        {stats.auto > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-5 bg-chart-2/5">
              <div
                className="flex flex-wrap items-center justify-between gap-3"
                data-testid="export-summary"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-chart-2" />
                    <p className="text-sm font-semibold text-foreground">Ready to Export</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Auto-labeled: {stats.auto} | Needs review: {stats.needsReview} |
                    Estimated time saved: ~{Math.round(stats.auto * 1.5)} minutes
                  </p>
                </div>
                <ExportMenu />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail side panel */}
      <Sheet open={!!detailTx} onOpenChange={(open) => !open && setDetailTx(null)}>
        <SheetContent className="overflow-y-auto">
          {detailTx && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SheetHeader>
                <SheetTitle className="text-lg">Transaction Details</SheetTitle>
              </SheetHeader>
              <div className="space-y-5 mt-6">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                    Transaction Hash
                  </p>
                  <p className="text-sm font-mono break-all text-foreground">
                    {detailTx.txHash}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                      Date
                    </p>
                    <p className="text-sm text-foreground">{detailTx.timestamp || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                      Chain
                    </p>
                    <p className="text-sm text-foreground">{detailTx.chain || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                      Asset
                    </p>
                    <p className="text-sm text-foreground">{detailTx.asset || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                      Amount
                    </p>
                    <p className="text-sm font-mono text-foreground">{detailTx.amount || "—"}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                        Original Label
                      </p>
                      <Badge variant="secondary">{detailTx.originalLabel}</Badge>
                    </div>
                    <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180 shrink-0 mt-3" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                        New Label
                      </p>
                      <Badge variant="default">{detailTx.newLabel}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                      Confidence
                    </p>
                    {confidenceBar(detailTx.confidence)}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                      Status
                    </p>
                    {statusBadge(detailTx.reviewStatus)}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                    Why we labeled this
                  </p>
                  <Card className="p-4">
                    <p className="text-sm text-foreground leading-relaxed">{detailTx.reason}</p>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      <Badge variant="outline" className="font-mono text-xs">
                        {detailTx.ruleId}
                      </Badge>
                    </div>
                  </Card>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Manual Override
                  </p>
                  <div className="space-y-2">
                    {COMMON_LABELS.map((label) => (
                      <button
                        key={label}
                        className={`w-full text-left text-xs px-3 py-2 rounded-lg border transition-colors ${
                          detailTx.newLabel === label
                            ? "border-primary bg-primary/5 font-medium"
                            : "border-border hover:bg-muted"
                        }`}
                        onClick={() => handleLabelUpdate(detailTx.id, label)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <Input
                    placeholder="Or type a custom label + Enter..."
                    data-testid="input-override-label"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) {
                          handleLabelUpdate(detailTx.id, val);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                </div>

                {detailTx.wallet && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                      Wallet
                    </p>
                    <p className="text-sm font-mono text-foreground">{detailTx.wallet}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
