// @ts-nocheck
import { useState } from "react";
import { WatchlistManager } from "@/components/WatchlistManager";
import { LiveCryptoChart } from "@/components/LiveCryptoChart";
import { Top15CryptoChart } from "@/components/Top15CryptoChart";
import { Star, BarChart3 } from "lucide-react";

export default function Market() {
  const [activeTab, setActiveTab] = useState<"crypto" | "watchlist">("crypto");

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Market</h1>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-card rounded-xl p-2 border border-border inline-flex gap-1">
        <button
          onClick={() => setActiveTab("crypto")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === "crypto"
              ? "bg-gradient-to-r from-gradient-start to-gradient-end text-white shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Crypto Charts
        </button>
        <button
          onClick={() => setActiveTab("watchlist")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === "watchlist"
              ? "bg-gradient-to-r from-gradient-start to-gradient-end text-white shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Star className="w-4 h-4" />
          Watchlist
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "crypto" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">All Crypto Charts</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Live prices and trading for top 15 cryptocurrencies. Click any
              crypto to start trading with real-time price data.
            </p>
            <Top15CryptoChart />
          </div>
        )}

        {activeTab === "watchlist" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Market</h2>
            <WatchlistManager />
          </div>
        )}
      </div>
    </div>
  );
}
