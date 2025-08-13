// @ts-nocheck
import { BalanceCard } from "@/components/BalanceCard";
import { Top15CryptoChart } from "@/components/Top15CryptoChart";
import { LiveCoinWatchWidget } from "@/components/LiveCoinWatchWidget";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  const currentDateTime = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome!</h1>
          <p className="text-muted-foreground">{currentDateTime}</p>
        </div>
      </div>

      <BalanceCard />

      {/* Live Coin Watch Widget */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="font-semibold mb-4">Live Crypto Charts</h3>
        <p className="text-muted-foreground mb-4">
          Real-time cryptocurrency prices and market data
        </p>
        <LiveCoinWatchWidget />
      </div>

      <Top15CryptoChart />

      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/market")}
            className="bg-muted text-muted-foreground py-3 rounded-lg font-medium transition-colors hover:bg-muted/80"
          >
            Market Analysis
          </button>
          <button
            onClick={() => navigate("/trading")}
            className="bg-gradient-to-r from-gradient-start to-gradient-end text-white py-3 rounded-lg font-medium transition-transform hover:scale-[1.02]"
          >
            Intelligent AI Trading
          </button>
        </div>
      </div>
    </div>
  );
}

