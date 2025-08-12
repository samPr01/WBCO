import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Index from "./pages/Index";
import Market from "./pages/Market";
import Orders from "./pages/Orders";
import Loans from "./pages/Loans";
import Settings from "./pages/Settings";
import Deposits from "./pages/Deposits";
import NotFound from "./pages/NotFound";
import { Navigation, DesktopNavigation } from "./components/Navigation";
import { DemoWallet } from "./components/DemoWallet";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  if (!isWalletConnected) {
    return (
      <DemoWallet
        isConnected={false}
        onConnect={() => setIsWalletConnected(true)}
        onDisconnect={() => setIsWalletConnected(false)}
      />
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <DesktopNavigation />
        <DemoWallet
          isConnected={true}
          onConnect={() => setIsWalletConnected(true)}
          onDisconnect={() => setIsWalletConnected(false)}
        />
        <main className="pb-16 md:pb-0 md:pt-16">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/market" element={<Market />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/deposits" element={<Deposits />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Navigation />
      </div>
    </BrowserRouter>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

// Use demo app if Web3 fails, otherwise use full Web3 app
createRoot(document.getElementById("root")!).render(<App />);
