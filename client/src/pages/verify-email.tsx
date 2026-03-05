import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

export default function VerifyEmail() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Verification failed. Please try again.");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        className="max-w-md w-full text-center space-y-8 p-10 rounded-2xl border bg-card/50 backdrop-blur-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {status === "loading" && (
          <>
            <motion.div
              className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-9 w-9 text-primary" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Verifying your email...</h2>
              <p className="text-muted-foreground">Please wait while we confirm your account.</p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <motion.div
              className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="h-9 w-9 text-emerald-500" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-verify-success">Email verified</h2>
              <p className="text-muted-foreground">{message}</p>
            </div>
            <Link href="/login">
              <Button size="lg" className="w-full h-13 rounded-xl" data-testid="button-go-login">
                Sign in to your account
              </Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
              <XCircle className="h-9 w-9 text-destructive" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-verify-error">Verification failed</h2>
              <p className="text-muted-foreground">{message}</p>
            </div>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full h-13 rounded-xl" data-testid="button-back-login">
                Back to login
              </Button>
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
