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
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 md:py-28 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-chart-2/5 blur-3xl" />
        </div>

        <motion.div
          className="max-w-3xl mx-auto space-y-7 relative z-10"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-accent text-accent-foreground text-sm font-medium"
          >
            <Zap className="h-3.5 w-3.5" />
            DeFi Categorization Engine
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]"
          >
            Auto-label DeFi
            <br />
            transactions{" "}
            <span className="text-muted-foreground">for accountants.</span>
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
        </motion.div>
      </section>

      <section className="px-4 py-20 border-t">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-2xl md:text-3xl font-semibold text-center mb-3 text-foreground"
            >
              How it works
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-center text-muted-foreground mb-12 max-w-xl mx-auto"
            >
              Four simple steps to fix your DeFi transaction labels.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((step, i) => (
                <motion.div key={step.title} variants={fadeUp} custom={i + 2}>
                  <Card className="p-5 h-full hover-elevate transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground text-sm font-bold shrink-0">
                        {i + 1}
                      </div>
                      <step.icon className="h-4 w-4 text-muted-foreground" />
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

      <section className="px-4 py-20 border-t">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-2xl md:text-3xl font-semibold text-center mb-3 text-foreground"
            >
              Built for crypto accountants
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-center text-muted-foreground mb-12 max-w-xl mx-auto"
            >
              Accuracy, speed, and auditability — the things that matter most.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {features.map((f, i) => (
                <motion.div key={f.title} variants={fadeUp} custom={i + 2}>
                  <Card className="p-6 h-full">
                    <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center mb-4">
                      <f.icon className="h-5 w-5 text-accent-foreground" />
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

      <footer className="px-4 py-8 border-t">
        <p className="text-center text-xs text-muted-foreground">
          DeFi Categorization Engine — Complementing Koinly & Cryptio
        </p>
      </footer>
    </div>
  );
}
