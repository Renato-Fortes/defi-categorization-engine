import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Zap, CheckCircle, Download, ArrowRight, Shield, Clock, FileText } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Import",
    description: "Upload your Koinly or Cryptio CSV export, or load a sample dataset to try it out.",
  },
  {
    icon: Zap,
    title: "Auto-label",
    description: "Our engine decodes on-chain transactions and applies deterministic rules with explanations.",
  },
  {
    icon: CheckCircle,
    title: "Review",
    description: "See confidence scores, filter exceptions, override labels, and create custom rules.",
  },
  {
    icon: Download,
    title: "Export",
    description: "Download your corrected CSV with new labels, audit trail, and time-saved estimates.",
  },
];

const features = [
  {
    icon: Shield,
    title: "Audit-ready",
    description: "Every label change comes with a reason and rule ID for full traceability.",
  },
  {
    icon: Clock,
    title: "Save hours",
    description: "Auto-classify hundreds of DeFi transactions that tools like Koinly get wrong.",
  },
  {
    icon: FileText,
    title: "Protocol-aware",
    description: "Starting with Aave V3 borrow/repay detection using actual on-chain event logs.",
  },
];

export default function Landing() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-accent text-accent-foreground text-sm font-medium">
            <Zap className="h-3.5 w-3.5" />
            DeFi Categorization Engine
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
            Auto-label DeFi transactions
            <br />
            <span className="text-muted-foreground">for accountants.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Fix Koinly/Cryptio exports in minutes. Loans, repayments, swaps, LP, staking
            — with explanations and audit trail.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={() => navigate("/import")}
              data-testid="button-get-started"
            >
              Get started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/import?sample=true")}
              data-testid="button-try-sample"
            >
              Try sample dataset
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 border-t">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-10 text-foreground">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <Card key={step.title} className="p-5 hover-elevate">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground text-sm font-bold">
                    {i + 1}
                  </div>
                  <step.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 border-t">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-10 text-foreground">
            Built for crypto accountants
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((f) => (
              <Card key={f.title} className="p-5">
                <f.icon className="h-5 w-5 text-muted-foreground mb-3" />
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-4 py-6 border-t">
        <p className="text-center text-xs text-muted-foreground">
          DeFi Categorization Engine — Complementing Koinly & Cryptio
        </p>
      </footer>
    </div>
  );
}
