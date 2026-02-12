import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
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
            <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between gap-3 flex-wrap">
                <a href="/" className="flex items-center gap-2 font-semibold text-sm text-foreground" data-testid="link-home">
                  <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    D
                  </div>
                  DeFi Categorizer
                </a>
                <ThemeToggle />
              </div>
            </nav>
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
