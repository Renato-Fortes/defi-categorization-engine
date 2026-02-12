import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import ImportPage from "@/pages/import-page";
import ReviewPage from "@/pages/review-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/import" component={ImportPage} />
      <Route path="/review" component={ReviewPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <motion.nav
              className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md"
              initial={{ y: -48 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between gap-3 flex-wrap">
                <a href="/" className="flex items-center gap-2.5 font-semibold text-sm text-foreground" data-testid="link-home">
                  <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    D
                  </div>
                  <span className="tracking-tight">DeFi Categorizer</span>
                </a>
                <ThemeToggle />
              </div>
            </motion.nav>
            <div className="pt-12">
              <Router />
            </div>
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
