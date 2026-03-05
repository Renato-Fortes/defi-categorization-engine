import { useLocation, Link } from "wouter";
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, ArrowUpRight, CheckCircle, Shield, Zap,
  Upload, Download, Brain, Lock, Layers, Cpu,
  Sparkles, GitBranch, ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

function useCountUp(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const started = useRef(false);

  useEffect(() => {
    if ((!startOnView || inView) && !started.current) {
      started.current = true;
      const startTime = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * end));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }, [inView, end, duration, startOnView]);

  return { count, ref };
}

const protocols = [
  "Aave V3", "Uniswap V3", "Compound", "Curve", "Lido", "MakerDAO",
  "1inch", "Balancer", "SushiSwap", "Yearn", "Convex", "Synthetix",
  "Aave V3", "Uniswap V3", "Compound", "Curve", "Lido", "MakerDAO",
];

function ProtocolMarquee() {
  return (
    <div className="relative overflow-hidden py-8 motion-reduce:hidden" aria-hidden="true">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
      <div className="flex animate-marquee">
        {[0, 1].map((set) => (
          <div key={set} className="flex gap-8 shrink-0 pr-8">
            {protocols.map((p, i) => (
              <span key={`${set}-${i}`} className="text-sm font-medium text-muted-foreground/50 tracking-wide uppercase whitespace-nowrap">
                {p}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function GlowOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-[120px] pointer-events-none ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{ duration: 8, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

type CodeToken = { text: string; color: string };

function tokenizeLine(text: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    let matched = false;
    const patterns: [RegExp, string][] = [
      [/^(const|if|return)\b/, "text-violet-400"],
      [/^(".*?")/, "text-emerald-400"],
      [/^(0\.\d+)/, "text-amber-400"],
      [/^(event|decoder|txLog)\b/, "text-blue-300"],
      [/^(\.\w+)/, "text-cyan-300"],
    ];

    for (const [regex, color] of patterns) {
      const match = remaining.match(regex);
      if (match) {
        tokens.push({ text: match[0], color });
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      const nextSpecial = remaining.slice(1).search(/(const|if|return|event|decoder|txLog|"|\.\w|0\.)/);
      const end = nextSpecial === -1 ? remaining.length : nextSpecial + 1;
      tokens.push({ text: remaining.slice(0, end), color: "text-white/70" });
      remaining = remaining.slice(end);
    }
  }

  return tokens;
}

function TypewriterCode() {
  const lines = [
    { text: "const event = decoder.decode(txLog);", delay: 0 },
    { text: "", delay: 0.8 },
    { text: 'if (event.name === "Borrow") {', delay: 1.2 },
    { text: "  return {", delay: 1.8 },
    { text: '    label: "Aave V3 Borrow",', delay: 2.2 },
    { text: "    confidence: 0.97,", delay: 2.6 },
    { text: '    rule: "AAVE_V3_BORROW"', delay: 3.0 },
    { text: "  };", delay: 3.4 },
    { text: "}", delay: 3.6 },
  ];

  return (
    <div className="relative">
      <div className="rounded-2xl border border-white/[0.08] bg-[#0d1117] overflow-hidden shadow-2xl" role="img" aria-label="Code snippet showing DeFi transaction classification logic">
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-[11px] font-mono text-white/30 ml-2">classifier.ts</span>
        </div>
        <div className="p-6 font-mono text-[13px] leading-7 min-h-[280px]">
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: line.delay, ease: "easeOut" }}
            >
              {line.text ? (
                <div className="text-white/70">
                  {tokenizeLine(line.text).map((token, j) => (
                    <span key={j} className={token.color}>{token.text}</span>
                  ))}
                </div>
              ) : (
                <div className="h-7" />
              )}
            </motion.div>
          ))}
          <motion.div
            className="inline-block w-2 h-5 bg-white/60 ml-0.5 motion-reduce:hidden"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </div>
      </div>

      <motion.div
        className="absolute -top-4 -right-4 px-4 py-2 rounded-xl bg-emerald-500/90 text-white text-xs font-semibold shadow-lg backdrop-blur-sm flex items-center gap-2"
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 4, duration: 0.5 }}
      >
        <Sparkles className="h-3.5 w-3.5" />
        97% confidence
      </motion.div>

      <motion.div
        className="absolute -bottom-3 -left-3 px-4 py-2 rounded-xl border bg-background/90 backdrop-blur-sm shadow-lg flex items-center gap-2 text-xs"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 4.5 }}
      >
        <GitBranch className="h-3.5 w-3.5 text-primary" />
        <span className="text-muted-foreground">Rule:</span>
        <span className="font-mono font-semibold text-foreground">AAVE_V3_BORROW</span>
      </motion.div>
    </div>
  );
}

function LiveClassificationDemo() {
  const rows = [
    { hash: "0x7a3f...c912", label: "Aave V3 Borrow", conf: 97, status: "auto" },
    { hash: "0x8b2e...d401", label: "Uniswap V3 Swap", conf: 94, status: "auto" },
    { hash: "0x1c4d...a8f3", label: "Unknown Transfer", conf: 42, status: "review" },
    { hash: "0x9e1a...b7c6", label: "Aave V3 Repay", conf: 99, status: "auto" },
    { hash: "0x3f5b...e2d9", label: "Curve LP Deposit", conf: 91, status: "auto" },
  ];

  return (
    <div className="rounded-2xl border bg-card/50 backdrop-blur-xl overflow-hidden">
      <div className="px-6 py-4 border-b bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium text-foreground">Live Classification</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">5 transactions</span>
      </div>
      <div className="divide-y">
        {rows.map((row, i) => (
          <motion.div
            key={i}
            className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 + i * 0.15 }}
          >
            <div className="flex items-center gap-4 min-w-0">
              <span className="font-mono text-xs text-muted-foreground shrink-0">{row.hash}</span>
              <span className="text-sm font-medium text-foreground truncate">{row.label}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${row.conf >= 80 ? "bg-emerald-500" : "bg-amber-500"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${row.conf}%` }}
                    transition={{ duration: 0.8, delay: 1.5 + i * 0.15 }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-8">{row.conf}%</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                row.status === "auto"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-amber-500/10 text-amber-500"
              }`}>
                {row.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const sectionFade = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemFade = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function Landing() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const stat1 = useCountUp(10);
  const stat2 = useCountUp(98);
  const stat3 = useCountUp(50);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const progressWidth = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} className="min-h-screen">
      <motion.div
        className="fixed top-14 left-0 right-0 h-[2px] bg-primary/80 origin-left z-50"
        style={{ width: progressWidth }}
      />

      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <GlowOrb className="w-[900px] h-[900px] bg-primary/[0.07] top-[-200px] left-[10%]" delay={0} />
          <GlowOrb className="w-[700px] h-[700px] bg-chart-3/[0.05] bottom-[-100px] right-[5%]" delay={3} />
          <GlowOrb className="w-[500px] h-[500px] bg-chart-2/[0.04] top-[40%] right-[30%]" delay={6} />

          <svg className="absolute inset-0 w-full h-full opacity-[0.015] dark:opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-10 py-32 md:py-40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
            <motion.div
              className="lg:col-span-7 space-y-8"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div
                variants={itemFade}
                className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-primary/15 bg-primary/[0.04] text-primary text-sm font-medium backdrop-blur-sm"
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                DeFi Categorization Engine
              </motion.div>

              <motion.h1
                variants={itemFade}
                className="text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-[-0.035em] leading-[0.95] text-foreground"
              >
                Classify DeFi
                <br />
                transactions
                <br />
                <span className="bg-gradient-to-r from-primary via-chart-3 to-chart-2 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
                  with precision.
                </span>
              </motion.h1>

              <motion.p
                variants={itemFade}
                className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed"
              >
                The categorization engine that crypto accountants trust.
                Import CSVs, auto-label with on-chain intelligence, and export audit-ready results — in minutes.
              </motion.p>

              <motion.div variants={itemFade} className="flex flex-wrap items-center gap-4 pt-4">
                <Button
                  size="lg"
                  className="h-13 px-8 text-base gap-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  onClick={() => navigate(isAuthenticated ? "/import" : "/login")}
                  data-testid="button-get-started"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 px-8 text-base gap-2.5 rounded-xl"
                  onClick={() => navigate("/import?sample=true")}
                  data-testid="button-try-sample"
                >
                  Try sample dataset
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>

              <motion.div
                variants={itemFade}
                className="flex flex-wrap items-center gap-8 pt-4 text-sm text-muted-foreground"
              >
                {[
                  { icon: CheckCircle, text: "Free to use" },
                  { icon: Shield, text: "Privacy-first" },
                  { icon: Zap, text: "Instant results" },
                ].map((item, i) => (
                  <span key={i} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-emerald-500" />
                    {item.text}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              className="lg:col-span-5 hidden lg:block"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <TypewriterCode />
            </motion.div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/20 flex items-start justify-center p-1.5">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </section>

      <section className="border-t border-b bg-muted/10">
        <ProtocolMarquee />
      </section>

      <section className="py-32 md:py-40 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x">
              {[
                { ref: stat1.ref, count: stat1.count, suffix: "x", label: "Faster than manual review", sub: "Average time saved per batch" },
                { ref: stat2.ref, count: stat2.count, suffix: "%", label: "Classification accuracy", sub: "Across all supported protocols" },
                { ref: stat3.ref, count: stat3.count, suffix: "+", label: "DeFi protocols supported", sub: "And growing every month" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  variants={itemFade}
                  className="text-center py-10 md:py-0 md:px-12 first:pt-0 last:pb-0 md:first:pl-0 md:last:pr-0"
                >
                  <div className="text-6xl md:text-7xl font-bold text-foreground tracking-tight">
                    <span ref={stat.ref}>{stat.count}</span>
                    <span className="text-primary">{stat.suffix}</span>
                  </div>
                  <div className="text-base font-medium text-foreground mt-3">{stat.label}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.sub}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-32 md:py-40 px-6 md:px-10 bg-muted/10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <GlowOrb className="w-[600px] h-[600px] bg-primary/[0.04] top-0 right-[10%]" delay={2} />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div variants={itemFade} className="max-w-2xl mb-20">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                How it works
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.05]">
                From CSV to
                <br />
                audit-ready in
                <br />
                <span className="text-muted-foreground">four steps.</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden">
              {[
                { icon: Upload, num: "01", title: "Import", desc: "Upload your Koinly or Cryptio CSV export, or load a sample dataset to explore.", gradient: "from-blue-500 to-indigo-600" },
                { icon: Brain, num: "02", title: "Analyze", desc: "Our engine decodes on-chain events and applies deterministic rules with full explanations.", gradient: "from-violet-500 to-purple-600" },
                { icon: CheckCircle, num: "03", title: "Review", desc: "See confidence scores, filter exceptions, override labels, and create custom rules.", gradient: "from-emerald-500 to-teal-600" },
                { icon: Download, num: "04", title: "Export", desc: "Download your corrected CSV with new labels, rule IDs, and complete audit trail.", gradient: "from-amber-500 to-orange-600" },
              ].map((step, i) => (
                <motion.div
                  key={step.num}
                  variants={itemFade}
                  className="bg-background p-8 md:p-10 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-[0.03]`} />
                  </div>
                  <div className="relative z-10">
                    <span className="text-xs font-mono text-muted-foreground/50 tracking-widest">{step.num}</span>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mt-6 mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                      <step.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-32 md:py-40 px-6 md:px-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <motion.div variants={itemFade}>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-500 mb-4">
                  Under the hood
                </p>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-[1.05] mb-8">
                  On-chain intelligence,
                  <br />
                  <span className="text-muted-foreground">deterministic results.</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-10">
                  We decode actual smart contract events — not just transaction metadata.
                  Our engine reads Aave V3 pool events, Uniswap router calls, and LP actions directly from the blockchain.
                </p>
                <div className="space-y-5">
                  {[
                    "Decode ABI-encoded event logs from any EVM chain",
                    "Match against protocol-specific classification rules",
                    "Assign confidence scores with full explanations",
                    "Flag low-confidence items for human review",
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      variants={itemFade}
                      className="flex items-start gap-4"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center mt-0.5 shrink-0">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <span className="text-base text-foreground">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemFade}>
                <LiveClassificationDemo />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-32 md:py-40 px-6 md:px-10 bg-muted/10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <GlowOrb className="w-[800px] h-[800px] bg-chart-3/[0.04] bottom-[-200px] left-[20%]" delay={4} />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div variants={itemFade} className="max-w-2xl mb-20">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-chart-3 mb-4">
                Why choose us
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.05]">
                Built for the
                <br />
                <span className="text-muted-foreground">precision you need.</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Shield, title: "Audit-ready output", desc: "Every label change includes a reason, rule ID, and confidence score. Built for regulatory compliance from day one.", color: "text-blue-500", bg: "bg-blue-500" },
                { icon: Zap, title: "Instant classification", desc: "Process hundreds of transactions in seconds. No more spending hours manually reviewing Koinly exports.", color: "text-amber-500", bg: "bg-amber-500" },
                { icon: Brain, title: "ML-powered rules", desc: "Deterministic classification backed by on-chain event log analysis. No black-box guessing — fully explainable.", color: "text-violet-500", bg: "bg-violet-500" },
                { icon: Layers, title: "Multi-chain support", desc: "Works across Ethereum, Arbitrum, Polygon, Optimism, and other EVM chains. One engine for all your data.", color: "text-cyan-500", bg: "bg-cyan-500" },
                { icon: Lock, title: "Privacy-first design", desc: "Your data stays in your browser. We don't store transactions on our servers. Process locally, export securely.", color: "text-rose-500", bg: "bg-rose-500" },
                { icon: Cpu, title: "Protocol-aware", desc: "Deep support for Aave V3, Compound, Uniswap, Curve, Lido, and 50+ protocols with custom rule sets.", color: "text-emerald-500", bg: "bg-emerald-500" },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  variants={itemFade}
                  className="group p-8 rounded-2xl border bg-background hover:shadow-xl transition-all duration-500 relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className={`absolute top-0 right-0 w-40 h-40 ${f.bg}/[0.06] rounded-full blur-[60px]`} />
                  </div>
                  <div className="relative z-10">
                    <div className={`w-11 h-11 rounded-xl ${f.bg}/10 flex items-center justify-center mb-6`}>
                      <f.icon className={`h-5 w-5 ${f.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-32 md:py-40 px-6 md:px-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <GlowOrb className="w-[1000px] h-[1000px] bg-primary/[0.06] top-[-300px] left-1/2 -translate-x-1/2" delay={0} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.h2
              variants={itemFade}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.05] mb-8"
            >
              Ready to fix your
              <br />
              DeFi labels?
            </motion.h2>
            <motion.p
              variants={itemFade}
              className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Stop manually reviewing hundreds of transactions. Let the engine handle the heavy lifting while you focus on what matters.
            </motion.p>
            <motion.div
              variants={itemFade}
              className="flex flex-wrap items-center justify-center gap-5"
            >
              <Button
                size="lg"
                className="h-14 px-10 text-base gap-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                onClick={() => navigate(isAuthenticated ? "/import" : "/login")}
                data-testid="button-cta-bottom"
              >
                Start classifying
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-10 text-base gap-3 rounded-xl"
                onClick={() => navigate("/contact")}
                data-testid="button-contact-bottom"
              >
                Talk to us
                <ArrowUpRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t py-12 px-6 md:px-10 bg-muted/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center text-white text-sm font-bold">
              D
            </div>
            <span className="text-sm font-semibold text-foreground tracking-tight">DeFi Categorizer</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="/contact" className="hover:text-foreground transition-colors" data-testid="link-footer-contact">Contact</Link>
            <Link href="/login" className="hover:text-foreground transition-colors" data-testid="link-footer-login">Login</Link>
          </div>
          <p className="text-xs text-muted-foreground/60">
            Complementing Koinly & Cryptio
          </p>
        </div>
      </footer>
    </div>
  );
}
