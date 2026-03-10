import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  FileText,
  ArrowRight,
  ArrowLeft,
  Database,
  CheckCircle,
  Wallet,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTransactionStore } from "@/lib/transaction-store";
import { apiRequest } from "@/lib/queryClient";
import { SAMPLE_CSV } from "@/lib/sample-data";
import Papa from "papaparse";

// ---------------------------------------------------------------------------
// Supported chains (mirrors server/noves.ts — kept in sync manually)
// ---------------------------------------------------------------------------

const NOVES_CHAINS = [
  { id: "eth", name: "Ethereum" },
  { id: "arbitrum", name: "Arbitrum" },
  { id: "base", name: "Base" },
  { id: "polygon", name: "Polygon" },
  { id: "optimism", name: "Optimism" },
  { id: "bsc", name: "BNB Chain" },
  { id: "avalanche", name: "Avalanche" },
  { id: "fantom", name: "Fantom" },
  { id: "linea", name: "Linea" },
  { id: "zksync", name: "zkSync Era" },
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

// ---------------------------------------------------------------------------
// CSV Upload tab
// ---------------------------------------------------------------------------

function CsvUploadTab({
  onImported,
}: {
  onImported: (count: number, format: string) => void;
}) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isKoinly, setIsKoinly] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const { setTransactions } = useTransactionStore();
  const search = useSearch();

  const loadSample = search.includes("sample=true");

  useEffect(() => {
    if (loadSample && !csvText) {
      handleCsvLoaded(SAMPLE_CSV, "sample-dataset.csv");
    }
  }, [loadSample]);

  function handleCsvLoaded(text: string, name: string) {
    setCsvText(text);
    setFileName(name);
    const parsed = Papa.parse(text.trim(), { header: false, skipEmptyLines: true });
    const rows = parsed.data as string[][];
    if (rows.length > 0) {
      setPreviewHeaders(rows[0]);
      setPreviewRows(rows.slice(1, 21));
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith(".csv")) {
        const reader = new FileReader();
        reader.onload = (ev) => handleCsvLoaded(ev.target?.result as string, file.name);
        reader.readAsText(file);
      } else {
        toast({ title: "Invalid file", description: "Please upload a CSV file.", variant: "destructive" });
      }
    },
    [toast]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => handleCsvLoaded(ev.target?.result as string, file.name);
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    if (!csvText) return;
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/import", {
        csvText,
        format: isKoinly ? "koinly" : "generic",
      });
      const data = await res.json();
      setTransactions(data.transactions);
      const formatLabel =
        data.detectedFormat === "koinly"
          ? "Koinly"
          : data.detectedFormat === "cryptio"
          ? "Cryptio"
          : "generic";
      onImported(data.transactions.length, formatLabel);
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <Card
          className={`p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 border-dashed border-2 ${
            isDragging
              ? "border-primary bg-primary/5"
              : fileName
              ? "border-chart-2/50 bg-chart-2/5"
              : "border-border"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          data-testid="dropzone-csv"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileSelect}
            data-testid="input-csv-file"
          />
          {fileName ? (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-chart-2/10 flex items-center justify-center mx-auto">
                <CheckCircle className="h-6 w-6 text-chart-2" />
              </div>
              <p className="font-semibold text-foreground" data-testid="text-filename">{fileName}</p>
              <p className="text-sm text-muted-foreground">{previewRows.length} rows loaded — click to replace</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground">Drop CSV file here or click to browse</p>
              <p className="text-sm text-muted-foreground">Supports Koinly, Cryptio, or generic CSV exports</p>
            </div>
          )}
        </Card>

        <AnimatePresence>
          {previewRows.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <Card className="overflow-hidden">
                <div className="p-4 border-b flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm text-foreground">Preview</span>
                    <Badge variant="secondary">{previewRows.length} rows</Badge>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {previewHeaders.map((h, i) => (
                          <TableHead key={i} className="text-xs whitespace-nowrap">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewRows.slice(0, 10).map((row, ri) => (
                        <TableRow key={ri}>
                          {row.map((cell, ci) => (
                            <TableCell key={ci} className="text-xs whitespace-nowrap font-mono">
                              {cell.length > 24 ? cell.slice(0, 22) + "..." : cell}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-4">
        <Card className="p-5 space-y-4">
          <h3 className="font-semibold text-foreground text-sm">Import Settings</h3>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="koinly-toggle" className="text-sm text-muted-foreground">
              Koinly format
            </Label>
            <Switch
              id="koinly-toggle"
              checked={isKoinly}
              onCheckedChange={setIsKoinly}
              data-testid="switch-koinly"
            />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Enable if your CSV was exported from Koinly. Otherwise, format is auto-detected.
          </p>
        </Card>

        <Card className="p-5 space-y-4">
          <h3 className="font-semibold text-foreground text-sm">Quick Start</h3>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleCsvLoaded(SAMPLE_CSV, "sample-dataset.csv")}
            data-testid="button-load-sample"
          >
            <Database className="h-4 w-4 mr-2" />
            Load sample dataset
          </Button>
          <p className="text-xs text-muted-foreground leading-relaxed">
            12 transactions including 2 Aave Borrows and 2 Aave Repays for demo.
          </p>
        </Card>

        <Button
          className="w-full"
          size="lg"
          disabled={!csvText || isLoading}
          onClick={handleImport}
          data-testid="button-import"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Importing...
            </span>
          ) : (
            <>
              Import & Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wallet Import tab
// ---------------------------------------------------------------------------

function WalletImportTab({
  onImported,
}: {
  onImported: (count: number, chain: string, truncated: boolean) => void;
}) {
  const { toast } = useToast();
  const { setTransactions } = useTransactionStore();
  const [walletAddress, setWalletAddress] = useState("");
  const [chain, setChain] = useState("eth");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    count: number;
    chain: string;
    address: string;
    truncated: boolean;
  } | null>(null);

  const isValidAddress = /^0x[0-9a-fA-F]{40}$/.test(walletAddress.trim());

  const handleImport = async () => {
    if (!walletAddress.trim() || !chain) return;
    setIsLoading(true);
    setResult(null);
    try {
      const res = await apiRequest("POST", "/api/import/wallet", {
        walletAddress: walletAddress.trim(),
        chain,
      });
      const data = await res.json();
      setTransactions(data.transactions);
      setResult({
        count: data.total,
        chain: data.chain,
        address: data.walletAddress,
        truncated: data.truncated,
      });
      onImported(data.total, data.chain, data.truncated);
    } catch (err: any) {
      toast({
        title: "Wallet import failed",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        {/* Address + chain inputs */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Connect Wallet</p>
              <p className="text-xs text-muted-foreground">
                Fetch and classify all on-chain transactions via Noves
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet-address" className="text-sm">
              Wallet Address
            </Label>
            <Input
              id="wallet-address"
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className={`font-mono ${
                walletAddress && !isValidAddress ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
              data-testid="input-wallet-address"
            />
            {walletAddress && !isValidAddress && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Must be a valid EVM address (0x + 40 hex chars)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="chain-select" className="text-sm">
              Chain
            </Label>
            <Select value={chain} onValueChange={setChain}>
              <SelectTrigger id="chain-select" data-testid="select-chain">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NOVES_CHAINS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={!isValidAddress || isLoading}
            onClick={handleImport}
            data-testid="button-import-wallet"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Fetching transactions…
              </span>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Import from Wallet
              </>
            )}
          </Button>
        </Card>

        {/* Result summary */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-5 border-chart-2/30 bg-chart-2/5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-chart-2/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-chart-2" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground mb-0.5">
                      {result.count} transactions imported
                    </p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {result.address}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Chain: {NOVES_CHAINS.find((c) => c.id === result.chain)?.name ?? result.chain}
                    </p>
                    {result.truncated && (
                      <p className="text-xs text-chart-4 mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Showing first 250 transactions — older history was truncated.
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right column: info panel */}
      <div className="space-y-4">
        <Card className="p-5 space-y-4">
          <h3 className="font-semibold text-foreground text-sm">How it works</h3>
          <ol className="space-y-3">
            {[
              "Paste your wallet address and select the chain",
              "We fetch all transactions via the Noves Translate API",
              "Each transaction is classified automatically (swap, borrow, staking, etc.)",
              "Review and correct labels, then export journal entries",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-xs text-muted-foreground leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
              <Zap className="h-3 w-3 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">Powered by Noves</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Noves decodes raw on-chain data into human-readable transaction types across{" "}
            {NOVES_CHAINS.length}+ EVM chains. Labels like &ldquo;swap&rdquo;,
            &ldquo;stake&rdquo;, and &ldquo;claimRewards&rdquo; are mapped directly to
            accounting categories.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {["swap", "stake", "borrow", "bridge", "airdrop"].map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-mono">
                {tag}
              </Badge>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

type Tab = "csv" | "wallet";

export default function ImportPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("csv");

  const handleImported = (count: number, detail: string, truncated = false) => {
    const truncatedNote = truncated ? " (history truncated at 500)" : "";
    toast({
      title: "Import successful",
      description: `Imported ${count} transactions — ${detail}${truncatedNote}.`,
    });
    navigate("/review");
  };

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={fadeUp} custom={0} className="flex flex-wrap items-center gap-3 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} data-testid="button-back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Import Transactions</h1>
            <Badge variant="secondary" className="text-xs font-medium">Step 1</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Upload a CSV export or connect a wallet address to fetch transactions on-chain.
          </p>
        </div>
      </motion.div>

      {/* Tab switcher */}
      <motion.div variants={fadeUp} custom={1} className="flex items-center gap-1 p-1 bg-muted rounded-xl mb-6 w-fit">
        {[
          { id: "csv" as Tab, label: "Upload CSV", icon: FileText },
          { id: "wallet" as Tab, label: "Import from Wallet", icon: Wallet },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid={`tab-${id}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </motion.div>

      {/* Tab content */}
      <motion.div variants={fadeUp} custom={2}>
        <AnimatePresence mode="wait">
          {activeTab === "csv" ? (
            <motion.div
              key="csv"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
            >
              <CsvUploadTab
                onImported={(count, format) =>
                  handleImported(count, `format: ${format}`)
                }
              />
            </motion.div>
          ) : (
            <motion.div
              key="wallet"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
            >
              <WalletImportTab
                onImported={(count, chain, truncated) =>
                  handleImported(
                    count,
                    `chain: ${NOVES_CHAINS.find((c) => c.id === chain)?.name ?? chain}`,
                    truncated
                  )
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
