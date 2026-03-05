import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield, Zap, Lock, ArrowRight, Eye, EyeOff, CheckCircle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

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

export default function Register() {
  const { isLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/import");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email";
    if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "Registration failed", description: data.message, variant: "destructive" });
        return;
      }

      toast({
        title: "Account created",
        description: data.message,
      });

      if (data.verifyUrl) {
        toast({
          title: "Verification link",
          description: "Check the server console for your verification link (no email service configured yet).",
        });
      }

      navigate("/login?registered=true");
    } catch (err: any) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:w-[55%] relative overflow-hidden flex items-center justify-center px-8 lg:px-16 py-20 lg:py-0">
        <div className="absolute inset-0 pointer-events-none">
          <GlowOrb className="w-[600px] h-[600px] bg-primary/[0.06] top-[-100px] left-[10%]" delay={0} />
          <GlowOrb className="w-[500px] h-[500px] bg-chart-3/[0.05] bottom-[10%] right-[5%]" delay={3} />

          <svg className="absolute inset-0 w-full h-full opacity-[0.015] dark:opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="register-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#register-grid)" />
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
            Start classifying
            <br />
            <span className="bg-gradient-to-r from-primary via-chart-3 to-chart-2 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
              today.
            </span>
          </motion.h1>

          <motion.p variants={itemFade} custom={2} className="text-lg text-muted-foreground leading-relaxed mb-10">
            Create your account to start auto-labeling DeFi transactions with audit-ready precision. Free to use, no credit card required.
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
          className="max-w-sm w-full space-y-8"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={itemFade} custom={0} className="space-y-3">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Create account</h2>
            <p className="text-muted-foreground">
              Fill in your details to get started
            </p>
          </motion.div>

          <motion.form variants={itemFade} custom={1} onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">First name</Label>
                <Input
                  id="firstName"
                  placeholder="Jane"
                  className="h-12 rounded-xl"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  data-testid="input-first-name"
                />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">Last name</Label>
                <Input
                  id="lastName"
                  placeholder="Smith"
                  className="h-12 rounded-xl"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  data-testid="input-last-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@company.com"
                className="h-12 rounded-xl"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                data-testid="input-email"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  className="h-12 rounded-xl pr-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  data-testid="input-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-14 gap-2.5 text-base rounded-xl shadow-lg shadow-primary/20"
              disabled={isSubmitting}
              data-testid="button-register"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </motion.form>

          <motion.div variants={itemFade} custom={2} className="space-y-4">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>You'll receive a verification email to confirm your account</span>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline" data-testid="link-login">
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
