import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Upload, FileText, ArrowRight, ArrowLeft, Database, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTransactionStore } from "@/lib/transaction-store";
import { apiRequest } from "@/lib/queryClient";
import { SAMPLE_CSV } from "@/lib/sample-data";
import Papa from "papaparse";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function ImportPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        handleCsvLoaded(ev.target?.result as string, file.name);
      };
      reader.readAsText(file);
    } else {
      toast({ title: "Invalid file", description: "Please upload a CSV file.", variant: "destructive" });
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        handleCsvLoaded(ev.target?.result as string, file.name);
      };
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
      toast({
        title: "Import successful",
        description: `Imported ${data.transactions.length} transactions.`,
      });
      navigate("/review");
    } catch (err: any) {
      toast({
        title: "Import failed",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
    >
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
            Upload a CSV export from Koinly, Cryptio, or use our sample dataset.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <motion.div variants={fadeUp} custom={1}>
            <Card
              className={`p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 border-dashed border-2 ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : fileName
                    ? "border-chart-2/50 bg-chart-2/5"
                    : "border-border"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
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
                  <p className="text-sm text-muted-foreground">
                    {previewRows.length} rows loaded — click to replace
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-foreground">
                    Drop CSV file here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports Koinly, Cryptio, or generic CSV exports
                  </p>
                </div>
              )}
            </Card>
          </motion.div>

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
                            <TableHead key={i} className="text-xs whitespace-nowrap">
                              {h}
                            </TableHead>
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

        <motion.div variants={fadeUp} custom={2} className="space-y-4">
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
              Enable if your CSV was exported from Koinly. Otherwise, we auto-detect columns.
            </p>
          </Card>

          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-foreground text-sm">Quick Start</h3>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                handleCsvLoaded(SAMPLE_CSV, "sample-dataset.csv");
              }}
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
        </motion.div>
      </div>
    </motion.div>
  );
}
