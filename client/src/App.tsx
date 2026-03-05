import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { LogIn, LogOut, User } from "lucide-react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import ImportPage from "@/pages/import-page";
import ReviewPage from "@/pages/review-page";
import Contact from "@/pages/contact";
import Login from "@/pages/login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/import" component={ImportPage} />
      <Route path="/review" component={ReviewPage} />
      <Route path="/contact" component={Contact} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  const isLoginPage = location === "/login";

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/60 backdrop-blur-xl backdrop-saturate-150"
      initial={{ y: -56 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-sm text-foreground group" data-testid="link-home">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:shadow-md group-hover:shadow-primary/20 transition-shadow duration-300">
            D
          </div>
          <span className="tracking-tight hidden sm:inline">DeFi Categorizer</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 text-sm">
          {[
            { href: "/", label: "Home", testId: "link-nav-home", show: true },
            { href: "/import", label: "Import", testId: "link-nav-import", show: isAuthenticated },
            { href: "/review", label: "Review", testId: "link-nav-review", show: isAuthenticated },
            { href: "/contact", label: "Contact", testId: "link-nav-contact", show: true },
          ].filter(item => item.show).map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3.5 py-1.5 rounded-lg transition-all duration-200 ${
                location === item.href
                  ? "text-foreground font-medium bg-muted/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
              data-testid={item.testId}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          {!isLoading && (
            isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt=""
                    className="w-7 h-7 rounded-full border shadow-sm"
                    data-testid="img-user-avatar"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center" data-testid="icon-user-avatar">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <span className="text-sm text-foreground font-medium hidden sm:inline" data-testid="text-user-name">
                  {user?.firstName || user?.email || "Account"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => { window.location.href = "/api/logout"; }}
                  data-testid="button-logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : !isLoginPage ? (
              <Button
                size="sm"
                className="h-8 px-4 gap-1.5 text-xs rounded-lg shadow-sm"
                onClick={() => { window.location.href = "/api/login"; }}
                data-testid="button-nav-login"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign in
              </Button>
            ) : null
          )}
        </div>
      </div>
    </motion.nav>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="pt-14">
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
