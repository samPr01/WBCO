import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, lazy, Suspense } from "react";
import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { mainnet, polygon, bsc, arbitrum } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { QueryClient as WagmiQueryClient } from "@tanstack/react-query";
// RainbowKit v2 is not compatible with current setup, using native wagmi connectors instead
import { DemoTradingProvider } from "./contexts/DemoTradingContext";
import Index from "./pages/Index";
import Market from "./pages/Market";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";
import Deposits from "./pages/Deposits";
import Withdraw from "./pages/Withdraw";
import NotFound from "./pages/NotFound";
import PersonalVerification from "./pages/PersonalVerification";
import CreditScore from "./pages/CreditScore";
import OnlineSupport from "./pages/OnlineSupport";
import Trading from "./pages/Trading";
import CryptoTradingDetail from "./pages/CryptoTradingDetail";
import UploadProof from "./pages/UploadProof";
import { Navigation, DesktopNavigation } from "./components/Navigation";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingSpinner } from "./components/LoadingSpinner";

// Lazy load admin components
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const wagmiQueryClient = new WagmiQueryClient();

// Removed Bitcoin chain to reduce bundle size and improve performance

const { chains, publicClient } = configureChains(
  [mainnet, polygon, bsc, arbitrum],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: `https://rpc.ankr.com/${chain.network}`,
      }),
    }),
  ]
);

const config = createConfig({
  autoConnect: true,
  publicClient,
});

function AppContent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DesktopNavigation />
      <main className="pb-16 md:pb-0 md:pt-16">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/market" element={<Market />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/loans" element={<Trading />} />
          <Route path="/deposits" element={<Deposits />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/trading" element={<Trading />} />
          <Route path="/trading/:cryptoId" element={<CryptoTradingDetail />} />
          <Route path="/upload-proof" element={<UploadProof />} />
          <Route
            path="/personal-verification"
            element={<PersonalVerification />}
          />
          <Route path="/credit-score" element={<CreditScore />} />
          <Route path="/online-support" element={<OnlineSupport />} />
          <Route 
            path="/admin" 
            element={
              <Suspense fallback={<LoadingSpinner size="lg" text="Loading Admin Panel..." />}>
                <AdminPanel />
              </Suspense>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Navigation />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <WagmiConfig config={config}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <DemoTradingProvider>
                <AppContent />
              </DemoTradingProvider>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </WagmiConfig>
    </ErrorBoundary>
  );
}
