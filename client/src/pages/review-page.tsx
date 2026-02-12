import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTransactionStore } from "@/lib/transaction-store";
import { apiRequest } from "@/lib/queryClient";
import type { Transaction } from "@shared/schema";

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
      <div className="w-14 h-1.5 rounded-full bg-muted overflow-visible">
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

export default function ReviewPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const store = useTransactionStore();
  const [detailTx, setDetailTx] = useState<Transaction | null>(null);
  const [bulkLabel, setBulkLabel] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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
      store.setClassificationProgress({ current: Math.min(Math.round((i / 5) * total), total), total });
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

  const handleExport = async () => {
    try {
      const res = await apiRequest("POST", "/api/export", {
        transactions: store.transactions,
      });
      const data = await res.json();
      const blob = new Blob([data.csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "corrected-transactions.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export complete", description: "CSV downloaded successfully." });
    } catch (err: any) {
      toast({
        title: "Export failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleBulkApplyLabel = () => {
    if (!bulkLabel || selectedArr.length === 0) return;
    store.bulkUpdate(selectedArr, {
      newLabel: bulkLabel,
      reviewStatus: "ManuallyEdited",
      confidence: 1.0,
      reason: "Manually overridden by user",
      ruleId: "MANUAL",
    });
    setBulkLabel("");
    toast({
      title: "Labels updated",
      description: `Applied "${bulkLabel}" to ${selectedArr.length} transactions.`,
    });
  };

  const handleBulkMarkReviewed = () => {
    if (selectedArr.length === 0) return;
    store.bulkUpdate(selectedArr, { reviewStatus: "ManuallyEdited" });
    toast({
      title: "Marked as reviewed",
      description: `${selectedArr.length} transactions marked as reviewed.`,
    });
  };

  const allFilteredIds = filtered.map((t) => t.id);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => store.selectedIds.has(id));

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
        <Button variant="ghost" size="icon" onClick={() => navigate("/import")} data-testid="button-back-import">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">Review Transactions</h1>
            <Badge variant="secondary" className="text-xs font-medium">Step 2</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {stats.total} transactions loaded
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleClassify} disabled={store.isClassifying} data-testid="button-classify">
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
          <Button variant="outline" onClick={handleExport} data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
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
                    Classifying {store.classificationProgress.current}/{store.classificationProgress.total}...
                  </p>
                  <Progress
                    value={(store.classificationProgress.current / store.classificationProgress.total) * 100}
                    className="mt-2 h-1.5"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={fadeUp} custom={1} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total", value: stats.total, color: "text-foreground", dot: "bg-foreground/30", filter: "all" as const, testId: "stat-total" },
          { label: "Auto-labeled", value: stats.auto, color: "text-chart-2", dot: "bg-chart-2", filter: "Auto" as const, testId: "stat-auto" },
          { label: "Needs Review", value: stats.needsReview, color: "text-chart-4", dot: "bg-chart-4", filter: "NeedsReview" as const, testId: "stat-needs-review" },
          { label: "Edited", value: stats.manuallyEdited, color: "text-chart-3", dot: "bg-chart-3", filter: "ManuallyEdited" as const, testId: "stat-edited" },
        ].map((s) => (
          <Card
            key={s.label}
            className={`p-4 cursor-pointer hover-elevate transition-all duration-200 ${
              store.filter === s.filter ? "ring-1 ring-primary" : ""
            }`}
            onClick={() => store.setFilter(s.filter)}
            data-testid={s.testId}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${s.dot}`} />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{s.label}</p>
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
                  <Button size="sm" variant="outline" onClick={handleBulkMarkReviewed} data-testid="button-bulk-reviewed">
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
                    <TableCell className="text-xs text-muted-foreground">{tx.originalLabel}</TableCell>
                    <TableCell className="text-xs font-medium">{tx.newLabel}</TableCell>
                    <TableCell>{confidenceBar(tx.confidence)}</TableCell>
                    <TableCell>{statusBadge(tx.reviewStatus)}</TableCell>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
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
              <div className="flex flex-wrap items-center justify-between gap-3" data-testid="export-summary">
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
                <Button onClick={handleExport} data-testid="button-export-bottom">
                  <Download className="h-4 w-4 mr-2" />
                  Export Corrected CSV
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

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
                  <p className="text-sm font-mono break-all text-foreground">{detailTx.txHash}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Date</p>
                    <p className="text-sm text-foreground">{detailTx.timestamp || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Chain</p>
                    <p className="text-sm text-foreground">{detailTx.chain || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Asset</p>
                    <p className="text-sm text-foreground">{detailTx.asset || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Amount</p>
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
                      <Badge variant="outline" className="font-mono text-xs">{detailTx.ruleId}</Badge>
                    </div>
                  </Card>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Manual Override
                  </p>
                  <Input
                    placeholder="Enter new label..."
                    data-testid="input-override-label"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = (e.target as HTMLInputElement).value;
                        if (val) {
                          store.updateTransaction(detailTx.id, {
                            newLabel: val,
                            reviewStatus: "ManuallyEdited",
                            confidence: 1.0,
                            reason: "Manually overridden by user",
                            ruleId: "MANUAL",
                          });
                          setDetailTx({
                            ...detailTx,
                            newLabel: val,
                            reviewStatus: "ManuallyEdited",
                            confidence: 1.0,
                            reason: "Manually overridden by user",
                            ruleId: "MANUAL",
                          });
                        }
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">Press Enter to apply</p>
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
