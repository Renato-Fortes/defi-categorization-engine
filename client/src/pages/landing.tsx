import { useLocation, Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Upload, Zap, CheckCircle, Download, ArrowRight, Shield, Clock, FileText,
  Brain, BarChart3, Lock, Layers, Cpu, TrendingUp, ChevronRight,
  Sparkles, Database, GitBranch
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const steps = [
  {
    icon: Upload,
    title: "Import",
    description: "Upload your Koinly or Cryptio CSV export, or load a sample dataset to try it out.",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: Zap,
    title: "Auto-label",
    description: "Our engine decodes on-chain transactions and applies deterministic rules with explanations.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: CheckCircle,
    title: "Review",
    description: "See confidence scores, filter exceptions, override labels, and create custom rules.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Download,
    title: "Export",
    description: "Download your corrected CSV with new labels, audit trail, and time-saved estimates.",
    gradient: "from-amber-500 to-orange-600",
  },
];

const features = [
  {
    icon: Shield,
    title: "Audit-ready output",
    description: "Every label change comes with a reason and rule ID. Built for regulatory compliance from day one.",
    gradient: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-500",
  },
  {
    icon: Clock,
    title: "Hours saved instantly",
    description: "Auto-classify hundreds of DeFi transactions that Koinly and Cryptio categorize incorrectly.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
  },
  {
    icon: Brain,
    title: "ML-powered rules",
    description: "Deterministic classification backed by on-chain event log analysis. No black-box guessing.",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-500",
  },
  {
    icon: FileText,
    title: "Protocol-aware",
    description: "Deep support for Aave V3, Compound, Uniswap, and more. Decodes borrows, repays, swaps, and LP actions.",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-500",
  },
  {
    icon: Layers,
    title: "Multi-chain support",
    description: "Works across Ethereum, Arbitrum, Polygon, and other EVM chains. One engine, all your data.",
    gradient: "from-cyan-500/20 to-blue-500/20",
    iconColor: "text-cyan-500",
  },
  {
    icon: Lock,
    title: "Privacy-first",
    description: "Your data stays in your browser. We don't store transactions. Process locally, export securely.",
    gradient: "from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-500",
  },
];

const stats = [
  { value: "10x", label: "Faster than manual review", icon: TrendingUp },
  { value: "98%", label: "Classification accuracy", icon: BarChart3 },
  { value: "50+", label: "DeFi protocols supported", icon: Cpu },
  { value: "0", label: "Data stored on our servers", icon: Database },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function FloatingParticle({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-primary/20 dark:bg-primary/10"
      style={{ left: x, top: y, width: size, height: size }}
      animate={{
        y: [0, -20, 0],
        opacity: [0.3, 0.7, 0.3],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <FloatingParticle delay={0} x="10%" y="20%" size={6} />
      <FloatingParticle delay={0.5} x="80%" y="15%" size={4} />
      <FloatingParticle delay={1} x="25%" y="70%" size={8} />
      <FloatingParticle delay={1.5} x="70%" y="60%" size={5} />
      <FloatingParticle delay={2} x="50%" y="30%" size={7} />
      <FloatingParticle delay={2.5} x="90%" y="80%" size={4} />
      <FloatingParticle delay={3} x="15%" y="50%" size={6} />

      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/3 left-1/4 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--chart-3) / 0.06) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute top-1/2 right-1/4 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--chart-2) / 0.05) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
    </div>
  );
}

function NetworkVisualization() {
  const nodes = [
    { cx: 100, cy: 60, r: 4 },
    { cx: 200, cy: 40, r: 3 },
    { cx: 300, cy: 80, r: 5 },
    { cx: 150, cy: 120, r: 3 },
    { cx: 250, cy: 100, r: 4 },
    { cx: 350, cy: 50, r: 3 },
    { cx: 50, cy: 90, r: 4 },
    { cx: 180, cy: 150, r: 3 },
  ];

  const connections = [
    [0, 1], [1, 2], [0, 3], [3, 4], [4, 2], [2, 5], [0, 6], [3, 7], [4, 7],
  ];

  return (
    <svg viewBox="0 0 400 180" className="w-full h-auto opacity-30 dark:opacity-20">
      {connections.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={nodes[a].cx}
          y1={nodes[a].cy}
          x2={nodes[b].cx}
          y2={nodes[b].cy}
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, delay: i * 0.15, ease: "easeOut" }}
        />
      ))}
      {nodes.map((node, i) => (
        <motion.circle
          key={i}
          cx={node.cx}
          cy={node.cy}
          r={node.r}
          fill="hsl(var(--primary))"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
        />
      ))}
      <motion.circle
        cx={300}
        cy={80}
        r={12}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="1"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

function TransactionFlowAnimation() {
  const rows = [
    { label: "Aave V3 Borrow", confidence: 0.97, status: "Auto" },
    { label: "Uniswap Swap", confidence: 0.94, status: "Auto" },
    { label: "Unknown Transfer", confidence: 0.45, status: "Review" },
    { label: "Aave V3 Repay", confidence: 0.99, status: "Auto" },
  ];

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="rounded-xl border bg-card/80 backdrop-blur-sm overflow-hidden shadow-lg">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-chart-4/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-chart-2/60" />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground ml-2">classification_engine.tsx</span>
        </div>
        <div className="p-3 space-y-2">
          {rows.map((row, i) => (
            <motion.div
              key={i}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 text-xs"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1 + i * 0.2 }}
            >
              <span className="font-mono text-foreground">{row.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-muted-foreground">{(row.confidence * 100).toFixed(0)}%</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  row.status === "Auto"
                    ? "bg-chart-2/20 text-chart-2"
                    : "bg-chart-4/20 text-chart-4"
                }`}>
                  {row.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        className="absolute -top-3 -right-3 w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center shadow-lg"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles className="h-7 w-7 text-white" />
      </motion.div>

      <motion.div
        className="absolute -bottom-2 -left-2 px-3 py-1.5 rounded-lg bg-card border shadow-md flex items-center gap-2 text-xs"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.5 }}
      >
        <GitBranch className="h-3 w-3 text-chart-2" />
        <span className="text-muted-foreground">4 classified</span>
        <span className="font-semibold text-chart-2">98% avg</span>
      </motion.div>
    </div>
  );
}

export default function Landing() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <div className="min-h-screen flex flex-col">
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center px-4 py-24 md:py-32 overflow-hidden" style={{ position: "relative" }}>
        <AnimatedGrid />

        <motion.div
          className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          <motion.div
            className="space-y-8"
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
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-foreground"
            >
              Classify DeFi
              <br />
              transactions with
              <br />
              <span className="bg-gradient-to-r from-primary via-chart-3 to-chart-2 bg-clip-text text-transparent">
                machine precision.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg text-muted-foreground max-w-lg leading-relaxed"
            >
              The categorization engine that crypto accountants trust. Import CSVs from Koinly or Cryptio, auto-label with on-chain analysis, and export audit-ready results.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <Button
                size="lg"
                className="gap-2 text-base px-6"
                onClick={() => navigate(isAuthenticated ? "/import" : "/login")}
                data-testid="button-get-started"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-base"
                onClick={() => navigate("/import?sample=true")}
                data-testid="button-try-sample"
              >
                Try sample dataset
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={4}
              className="flex flex-wrap items-center gap-6 pt-2 text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-chart-2" />
                Free to use
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-chart-2" />
                Privacy-first
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-chart-2" />
                Instant results
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <TransactionFlowAnimation />
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  custom={i}
                  className="text-center space-y-2"
                >
                  <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <div className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-24 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} custom={0} className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                How it works
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Four steps to perfect labels
              </h2>
              <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
                From raw CSV to audit-ready export in minutes, not hours.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, i) => (
                <motion.div key={step.title} variants={fadeUp} custom={i + 2}>
                  <Card className="p-6 h-full group hover:shadow-lg transition-all duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-[0.03]`} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-5">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${step.gradient} text-white text-sm font-bold`}>
                          {i + 1}
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center mb-4">
                        <step.icon className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 text-lg">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-chart-2/5 blur-[100px]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} custom={0} className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest text-chart-2 mb-3">
                Features
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Built for crypto accountants
              </h2>
              <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
                Accuracy, speed, and auditability — the things that matter most.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <motion.div key={f.title} variants={fadeUp} custom={i + 2}>
                  <Card className="p-6 h-full group hover:shadow-lg transition-all duration-500">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5`}>
                      <f.icon className={`h-6 w-6 ${f.iconColor}`} />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-lg">{f.title}</h3>
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

      <section className="px-4 py-24 bg-muted/20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div variants={fadeUp} custom={0}>
                <p className="text-xs font-semibold uppercase tracking-widest text-chart-3 mb-3">
                  Under the hood
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  On-chain intelligence,
                  <br />
                  <span className="text-muted-foreground">deterministic results.</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6 text-lg">
                  We decode actual smart contract events — not just transaction metadata. Our engine reads Aave V3 pool events, Uniswap router calls, and LP actions directly from the blockchain.
                </p>
                <div className="space-y-4">
                  {[
                    "Decode ABI-encoded event logs from any EVM chain",
                    "Match against protocol-specific rule sets",
                    "Assign confidence scores with full explanations",
                    "Flag low-confidence items for human review",
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      variants={fadeUp}
                      custom={i + 2}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle className="h-5 w-5 text-chart-2 mt-0.5 shrink-0" />
                      <span className="text-sm text-foreground">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <motion.div variants={fadeUp} custom={1}>
                <NetworkVisualization />
                <div className="mt-6 rounded-xl border bg-card/50 backdrop-blur-sm p-5">
                  <div className="font-mono text-xs space-y-2 text-muted-foreground">
                    <div><span className="text-chart-3">const</span> <span className="text-foreground">event</span> = decoder.<span className="text-primary">decode</span>(log);</div>
                    <div><span className="text-chart-3">if</span> (event.name === <span className="text-chart-2">"Borrow"</span>) {"{"}</div>
                    <div className="pl-4"><span className="text-chart-3">return</span> {"{"}</div>
                    <div className="pl-8">label: <span className="text-chart-2">"Aave V3 Borrow"</span>,</div>
                    <div className="pl-8">confidence: <span className="text-chart-4">0.97</span>,</div>
                    <div className="pl-8">rule: <span className="text-chart-2">"AAVE_V3_BORROW"</span></div>
                    <div className="pl-4">{"};"}</div>
                    <div>{"}"}</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl md:text-4xl font-bold text-foreground mb-6"
            >
              Ready to fix your DeFi labels?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Stop manually reviewing hundreds of transactions. Let the engine handle the heavy lifting while you focus on what matters.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={2}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Button
                size="lg"
                className="gap-2 text-base px-8"
                onClick={() => navigate(isAuthenticated ? "/import" : "/login")}
                data-testid="button-cta-bottom"
              >
                Start classifying
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-base"
                onClick={() => navigate("/contact")}
                data-testid="button-contact-bottom"
              >
                Contact us
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <footer className="px-4 py-10 border-t bg-muted/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center text-white text-xs font-bold">
              D
            </div>
            <span className="text-sm font-semibold text-foreground tracking-tight">DeFi Categorizer</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/contact" className="hover:text-foreground transition-colors" data-testid="link-footer-contact">Contact</Link>
            <Link href="/login" className="hover:text-foreground transition-colors" data-testid="link-footer-login">Login</Link>
          </div>
          <p className="text-xs text-muted-foreground">
            Complementing Koinly & Cryptio
          </p>
        </div>
      </footer>
    </div>
  );
}
