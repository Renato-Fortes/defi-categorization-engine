import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Shield, Zap, Lock, Sparkles, CheckCircle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

const itemFade = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function GlowOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-[120px] pointer-events-none ${className}`}
      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 8, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export default function Login() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/import");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          className="max-w-md w-full text-center space-y-8 p-10 rounded-2xl border bg-card/50 backdrop-blur-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-9 w-9 text-emerald-500" />
          </motion.div>
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-3">Welcome back</h2>
            <p className="text-muted-foreground text-lg">
              Signed in as <span className="font-medium text-foreground">{user.email || user.firstName || "User"}</span>
            </p>
          </div>
          <Button
            size="lg"
            className="w-full h-13 gap-2.5 text-base rounded-xl shadow-lg shadow-primary/20"
            onClick={() => navigate("/import")}
            data-testid="button-go-to-app"
          >
            Go to dashboard
            <ArrowRight className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:w-[55%] relative overflow-hidden flex items-center justify-center px-8 lg:px-16 py-20 lg:py-0">
        <div className="absolute inset-0 pointer-events-none">
          <GlowOrb className="w-[600px] h-[600px] bg-primary/[0.06] top-[-100px] left-[10%]" delay={0} />
          <GlowOrb className="w-[500px] h-[500px] bg-chart-3/[0.05] bottom-[10%] right-[5%]" delay={3} />
          <GlowOrb className="w-[400px] h-[400px] bg-chart-2/[0.04] top-[50%] left-[40%]" delay={6} />

          <svg className="absolute inset-0 w-full h-full opacity-[0.015] dark:opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="login-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#login-grid)" />
          </svg>
        </div>

        <motion.div
          className="relative z-10 max-w-lg"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={itemFade} custom={0} className="flex items-center gap-3.5 mb-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20">
              D
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">DeFi Categorizer</span>
          </motion.div>

          <motion.h1 variants={itemFade} custom={1} className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[0.95] mb-8">
            Classify with
            <br />
            <span className="bg-gradient-to-r from-primary via-chart-3 to-chart-2 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
              confidence.
            </span>
          </motion.h1>

          <motion.p variants={itemFade} custom={2} className="text-lg text-muted-foreground leading-relaxed mb-10">
            Sign in to access your dashboard, import transaction CSVs, and start auto-labeling DeFi transactions with audit-ready precision.
          </motion.p>

          <motion.div variants={itemFade} custom={3} className="space-y-4">
            {[
              { icon: Shield, text: "Enterprise-grade security" },
              { icon: Zap, text: "Instant transaction classification" },
              { icon: Lock, text: "Your data never leaves your control" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-4 w-4 text-emerald-500" />
                </div>
                <span className="text-sm text-muted-foreground">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <div className="lg:w-[45%] flex items-center justify-center px-8 lg:px-16 py-20 lg:py-0 border-l-0 lg:border-l">
        <motion.div
          className="max-w-sm w-full space-y-10"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={itemFade} custom={0} className="space-y-3">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Welcome</h2>
            <p className="text-muted-foreground text-lg">
              Sign in to your account to continue
            </p>
          </motion.div>

          <motion.div variants={itemFade} custom={1} className="space-y-5">
            <Button
              size="lg"
              className="w-full gap-3.5 text-base h-14 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              onClick={() => { window.location.href = "/api/login"; }}
              data-testid="button-login"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 text-muted-foreground tracking-widest">or</span>
              </div>
            </div>

            <Button
              size="lg"
              variant="outline"
              className="w-full gap-3.5 text-base h-14 rounded-xl"
              onClick={() => { window.location.href = "/api/login"; }}
              data-testid="button-login-email"
            >
              <MailIcon className="h-5 w-5" />
              Continue with email
            </Button>
          </motion.div>

          <motion.div variants={itemFade} custom={2} className="space-y-4">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Supports Google, GitHub, Apple, and email sign-in</span>
            </div>
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function MailIcon(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
