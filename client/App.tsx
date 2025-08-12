import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, polygon, bsc, arbitrum } from "wagmi/chains";
import { injected, metaMask, coinbaseWallet } from "wagmi/connectors";
import { createPublicClient } from "viem";
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
import AdminPanel from "./pages/AdminPanel";
import CryptoTradingDetail from "./pages/CryptoTradingDetail";
import UploadProof from "./pages/UploadProof";
import { Navigation, DesktopNavigation } from "./components/Navigation";
import { DemoWallet } from "./components/DemoWallet";
import { ConnectWallet } from "./components/ConnectWallet";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const wagmiQueryClient = new WagmiQueryClient();

// Define Bitcoin chain
const bitcoin = {
  id: 8332, // Changed from 0 to avoid conflicts
  name: 'Bitcoin',
  nativeCurrency: {
    decimals: 8,
    name: 'Bitcoin',
    symbol: 'BTC',
  },
  rpcUrls: {
    default: { http: ['https://bitcoin.rainbow.me'] },
    public: { http: ['https://bitcoin.rainbow.me'] },
  },
  blockExplorers: {
    default: { name: 'Blockstream', url: 'https://blockstream.info' },
  },
} as const;

const config = createConfig({
  chains: [mainnet, polygon, bsc, arbitrum, bitcoin],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({
      appName: "WBCO",
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [arbitrum.id]: http(),
    [bitcoin.id]: http(),
  },
});

function AppContent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DesktopNavigation />
      <ConnectWallet />
      <DemoWallet />
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
          <Route path="/admin" element={<AdminPanel />} />
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
      <WagmiProvider config={config} queryClient={wagmiQueryClient}>
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
      </WagmiProvider>
    </ErrorBoundary>
  );
}
