import { ArrowDownRight, Send, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDemoTrading } from "@/contexts/DemoTradingContext";
import { useState, useEffect } from "react";

export function BalanceCard() {
  const navigate = useNavigate();
  const { isDemoMode, demoBalance: demoBal } = useDemoTrading();

  // State for P&L and ROI calculations
  const [todaysEarnings, setTodaysEarnings] = useState(0);
  const [roi, setRoi] = useState(0);
  const [initialBalance] = useState(isDemoMode ? 10000 : 0);
  const [walletConnected, setWalletConnected] = useState(false);

  // Check wallet connection status
  useEffect(() => {
    const checkConnection = () => {
      const savedConnection = localStorage.getItem("walletConnected");
      setWalletConnected(savedConnection === "true");
    };

    checkConnection();
    // Listen for wallet connection changes
    const interval = setInterval(checkConnection, 1000);
    return () => clearInterval(interval);
  }, []);

  // Show balance based on wallet connection and demo mode
  const displayBalance = !walletConnected
    ? "$0.00" // Always show $0 when no wallet connected
    : isDemoMode
      ? `$${demoBal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
      : "$0.00"; // Start with $0 for real wallet until we fetch actual balance

  const displaySymbol = isDemoMode ? "USD" : "ETH";
  const demoAddress = "0x742d...4c50";

  // Calculate P&L and ROI
  useEffect(() => {
    if (!walletConnected) {
      setTodaysEarnings(0);
      setRoi(0);
      return;
    }

    if (isDemoMode) {
      const earnings = demoBal - initialBalance;
      const roiPercent =
        initialBalance > 0
          ? ((demoBal - initialBalance) / initialBalance) * 100
          : 0;
      setTodaysEarnings(earnings);
      setRoi(roiPercent);
    } else {
      // For real wallet, start with zero but could fetch actual balance
      setTodaysEarnings(0);
      setRoi(0);

      // TODO: Implement actual wallet balance fetching
      // This would require calling blockchain APIs or wallet providers
    }
  }, [demoBal, isDemoMode, initialBalance, walletConnected]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gradient-start to-gradient-end p-6 text-white">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button className="text-sm font-medium text-white bg-white/20 px-3 py-1 rounded-lg">
              {!walletConnected
                ? "No Wallet Connected"
                : isDemoMode
                  ? "Demo Balance"
                  : "Wallet Balance"}
            </button>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/60">
              Today, {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-3xl font-bold">{displayBalance}</div>
            <div className="text-sm text-white/60 mt-1 font-mono">
              {!walletConnected
                ? "Connect wallet to view address"
                : localStorage.getItem("walletAddress")?.slice(0, 6) +
                    "..." +
                    localStorage.getItem("walletAddress")?.slice(-4) ||
                  demoAddress}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-white/80">Today's P&L</div>
              <div
                className={`text-lg font-semibold flex items-center gap-1 ${
                  todaysEarnings >= 0 ? "text-green-300" : "text-red-300"
                }`}
              >
                {todaysEarnings >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {isDemoMode
                  ? `${todaysEarnings >= 0 ? "+" : ""}$${Math.abs(todaysEarnings).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                  : `${todaysEarnings >= 0 ? "+" : ""}${Math.abs(todaysEarnings).toFixed(4)} ETH`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/80">ROI</div>
              <div
                className={`text-lg font-semibold flex items-center justify-end gap-1 ${
                  roi >= 0 ? "text-green-300" : "text-red-300"
                }`}
              >
                {roi >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {roi >= 0 ? "+" : ""}
                {roi.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => navigate("/deposits")}
            className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-3 flex items-center justify-center gap-2 transition-all hover:bg-white/30"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span className="text-sm font-medium">Deposit</span>
          </button>
          <button
            onClick={() => navigate("/withdraw")}
            className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-3 flex items-center justify-center gap-2 transition-all hover:bg-white/30"
          >
            <Send className="w-4 h-4" />
            <span className="text-sm font-medium">Withdraw</span>
          </button>
        </div>
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
      </div>
    </div>
  );
}
