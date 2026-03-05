import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight, Shield, Zap, Lock, Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function FloatingOrb({ delay, x, y, size, color }: { delay: number; x: string; y: string; size: number; color: string }) {
  return (
    <motion.div
      className={`absolute rounded-full ${color}`}
      style={{ left: x, top: y, width: size, height: size }}
      animate={{
        y: [0, -15, 0],
        opacity: [0.4, 0.8, 0.4],
      }}
      transition={{
        duration: 5,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
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
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-chart-2/10 flex items-center justify-center mx-auto">
            <Sparkles className="h-8 w-8 text-chart-2" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back!</h2>
            <p className="text-muted-foreground">
              You're signed in as <span className="font-medium text-foreground">{user.email || user.firstName || "User"}</span>
            </p>
          </div>
          <Button size="lg" className="w-full gap-2" onClick={() => navigate("/import")} data-testid="button-go-to-app">
            Go to dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-chart-3/5 flex items-center justify-center px-8 py-16 lg:py-0">
        <div className="absolute inset-0 pointer-events-none">
          <FloatingOrb delay={0} x="15%" y="20%" size={80} color="bg-primary/10" />
          <FloatingOrb delay={1} x="70%" y="15%" size={60} color="bg-chart-3/10" />
          <FloatingOrb delay={2} x="30%" y="70%" size={100} color="bg-chart-2/8" />
          <FloatingOrb delay={3} x="80%" y="60%" size={50} color="bg-primary/8" />

          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="login-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#login-grid)" />
          </svg>
        </div>

        <motion.div
          className="relative z-10 max-w-md text-center lg:text-left space-y-6"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} custom={0} className="flex items-center gap-3 justify-center lg:justify-start">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center text-white text-lg font-bold">
              D
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">DeFi Categorizer</span>
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
            Classify transactions
            <br />
            <span className="bg-gradient-to-r from-primary via-chart-3 to-chart-2 bg-clip-text text-transparent">
              with confidence.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg leading-relaxed">
            Sign in to access your dashboard, import CSVs, and start auto-labeling DeFi transactions with audit-ready precision.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="space-y-3 pt-2">
            {[
              { icon: Shield, text: "Enterprise-grade security" },
              { icon: Zap, text: "Instant transaction classification" },
              { icon: Lock, text: "Your data never leaves your control" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 justify-center lg:justify-start">
                <item.icon className="h-4 w-4 text-chart-2" />
                <span className="text-sm text-muted-foreground">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <div className="lg:w-1/2 flex items-center justify-center px-8 py-16 lg:py-0">
        <motion.div
          className="max-w-sm w-full space-y-8"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} custom={0} className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Welcome</h2>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </motion.div>

          <motion.div variants={fadeUp} custom={1} className="space-y-4">
            <Button
              size="lg"
              className="w-full gap-3 text-base h-12"
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
                <span className="bg-background px-3 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              size="lg"
              variant="outline"
              className="w-full gap-3 text-base h-12"
              onClick={() => { window.location.href = "/api/login"; }}
              data-testid="button-login-email"
            >
              <Mail className="h-5 w-5" />
              Continue with email
            </Button>
          </motion.div>

          <motion.p variants={fadeUp} custom={2} className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy.
            Your account supports Google, GitHub, and email sign-in.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

function Mail(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
