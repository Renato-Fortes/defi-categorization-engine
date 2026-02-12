import { useLocation } from "wouter";
import { motion } from "framer-motion";
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
    color: "text-chart-1",
    bg: "bg-chart-1/10",
  },
  {
    icon: Clock,
    title: "Save hours",
    description: "Auto-classify hundreds of DeFi transactions that tools like Koinly get wrong.",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
  },
  {
    icon: FileText,
    title: "Protocol-aware",
    description: "Starting with Aave V3 borrow/repay detection using actual on-chain event logs.",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function Landing() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-24 md:py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/8 blur-[100px]" />
          <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-chart-3/6 blur-[120px]" />
          <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full bg-chart-2/5 blur-[100px]" />
        </div>

        <motion.div
          className="max-w-3xl mx-auto space-y-8 relative z-10"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium"
          >
            <Zap className="h-3.5 w-3.5" />
            DeFi Categorization Engine
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground"
          >
            Auto-label DeFi
            <br />
            <span className="bg-gradient-to-r from-primary via-chart-3 to-chart-2 bg-clip-text text-transparent">
              transactions
            </span>{" "}
            <span className="text-muted-foreground font-normal">
              for accountants.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Fix Koinly/Cryptio exports in minutes. Loans, repayments, swaps, LP, staking
            — with explanations and audit trail.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
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
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={4}
            className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-chart-2" />
              No signup required
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-chart-2" />
              Data stays in browser
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-chart-2" />
              Instant results
            </span>
          </motion.div>
        </motion.div>
      </section>

      <section className="px-4 py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} custom={0} className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                Workflow
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                How it works
              </h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
                Four simple steps to fix your DeFi transaction labels.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((step, i) => (
                <motion.div key={step.title} variants={fadeUp} custom={i + 2}>
                  <Card className="p-5 h-full hover-elevate transition-all duration-300 relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground text-sm font-bold shrink-0">
                        {i + 1}
                      </div>
                      <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center">
                        <step.icon className="h-4 w-4 text-accent-foreground" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1.5">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} custom={0} className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-chart-2 mb-3">
                Why us
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Built for crypto accountants
              </h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
                Accuracy, speed, and auditability — the things that matter most.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {features.map((f, i) => (
                <motion.div key={f.title} variants={fadeUp} custom={i + 2}>
                  <Card className="p-6 h-full hover-elevate transition-all duration-300">
                    <div className={`w-10 h-10 rounded-md ${f.bg} flex items-center justify-center mb-4`}>
                      <f.icon className={`h-5 w-5 ${f.color}`} />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1.5">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {f.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="px-4 py-8 border-t bg-muted/20">
        <p className="text-center text-xs text-muted-foreground">
          DeFi Categorization Engine — Complementing Koinly & Cryptio
        </p>
      </footer>
    </div>
  );
}
