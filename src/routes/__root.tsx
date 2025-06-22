import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Bug } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {/* Modern background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
        </div>

        <header className="glass-effect border-b border-border/50 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <Link
                to="/"
                className="flex items-center gap-3 font-bold text-xl hover:scale-105 transition-transform"
              >
                <div className="relative">
                  <Bug className="h-7 w-7 text-primary" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary/30 rounded-full blur-sm"></div>
                </div>
                <span className="text-primary">React Native Bug Tracker</span>
              </Link>

              <div className="flex items-center gap-4">
                <ThemeToggle />
              </div>
            </nav>
          </div>
        </header>

        <main className="min-h-screen relative">
          <Outlet />
        </main>

        <footer className="glass-effect border-t border-border/50 py-8 mt-16">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              Bug Tracker for React Native - check bug reports after releasing
              new versions
            </p>
            <div className="flex justify-center mt-4">
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            </div>
          </div>
        </footer>
        {process.env.NODE_ENV === "development" && (
          <>
            <TanStackRouterDevtools />
            <ReactQueryDevtools initialIsOpen={false} />
          </>
        )}
      </ThemeProvider>
    </QueryClientProvider>
  ),
});
