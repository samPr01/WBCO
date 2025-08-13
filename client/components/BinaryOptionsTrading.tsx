// @ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Bitcoin,
  Timer,
  DollarSign,
  Target,
  Trophy,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useDemoTrading } from "@/contexts/DemoTradingContext";

interface DurationCard {
  timeframe: string;
  duration: string;
  returnPercentage: number;
}

const DURATION_CARDS: DurationCard[] = [
  { timeframe: "60s", duration: "1 Min", returnPercentage: 20 },
  { timeframe: "120s", duration: "2 Min", returnPercentage: 30 },
  { timeframe: "300s", duration: "5 Min", returnPercentage: 40 },
  { timeframe: "600s", duration: "10 Min", returnPercentage: 50 },
  { timeframe: "3600s", duration: "1 Hour", returnPercentage: 65 },
  { timeframe: "21600s", duration: "6 Hours", returnPercentage: 80 },
];

export function BinaryOptionsTrading() {
  const { isDemoMode, demoBalance, addTrade, trades } = useDemoTrading();
  const [selectedDuration, setSelectedDuration] = useState(DURATION_CARDS[0]);
  const [tradeAmount, setTradeAmount] = useState(10);
  const [btcPrice, setBtcPrice] = useState(100704.7);
  const [isTrading, setIsTrading] = useState(false);

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBtcPrice((prev) => {
        const change = (Math.random() - 0.5) * 100; // Random change between -50 and +50
        return Math.max(0, prev + change);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const tradingFee = tradeAmount * 0.02; // 2% trading fee
  const totalCost = tradeAmount + tradingFee;
  const expectedReturn =
    tradeAmount * (selectedDuration.returnPercentage / 100);
  const totalReturn = tradeAmount + expectedReturn;

  const handleTrade = async (prediction: "UP" | "DOWN") => {
    if (!isDemoMode) {
      toast.error("Demo mode must be enabled to trade");
      return;
    }

    if (tradeAmount <= 0) {
      toast.error("Trade amount must be greater than 0");
      return;
    }

    if (totalCost > demoBalance) {
      toast.error("Insufficient demo balance (including 2% fee)");
      return;
    }

    setIsTrading(true);

    const trade = {
      asset: "BTC/USDT",
      timeframe: selectedDuration.timeframe,
      amount: totalCost, // Include fee in total amount
      prediction,
      expectedReturn,
      entryPrice: btcPrice,
      expiresAt: new Date(
        Date.now() + getTimeframeMs(selectedDuration.timeframe),
      ),
    };

    addTrade(trade);

    // Visual feedback
    const direction = prediction === "UP" ? "higher" : "lower";
    toast.success(
      `Trade placed! Predicting BTC will go ${direction} in ${selectedDuration.duration}`,
    );

    setTimeout(() => {
      setIsTrading(false);
    }, 1000);
  };

  const pendingTrades = trades.filter((trade) => trade.result === "PENDING");
  const recentTrades = trades.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Demo Mode Alert */}
      {!isDemoMode && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Enable demo mode in Settings to start trading with $100,000
                virtual funds
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header Row - Asset Info */}
      <Card className="bg-gradient-to-r from-gradient-start/10 to-gradient-end/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full flex items-center justify-center">
                <Bitcoin className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">BTC/USDT</h2>
                  <Button variant="ghost" size="sm" className="p-1">
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-2xl font-bold text-primary">
                  Live: $
                  {btcPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>

            {isDemoMode && (
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  Demo Balance
                </div>
                <div className="text-xl font-bold text-green-500">
                  $
                  {demoBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trade Duration Cards */}
      <div>
        <Label className="text-base font-medium mb-3 block">
          Trade Duration
        </Label>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {DURATION_CARDS.map((duration) => (
            <Button
              key={duration.timeframe}
              variant={
                selectedDuration.timeframe === duration.timeframe
                  ? "default"
                  : "outline"
              }
              onClick={() => setSelectedDuration(duration)}
              className={`min-w-[120px] h-16 flex-col gap-1 ${
                selectedDuration.timeframe === duration.timeframe
                  ? "bg-gradient-to-r from-gradient-start to-gradient-end text-white shadow-lg ring-2 ring-primary/50"
                  : "hover:ring-2 hover:ring-primary/30"
              }`}
            >
              <div className="font-semibold">{duration.duration}</div>
              <div className="text-xs opacity-90">
                +{duration.returnPercentage}%
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Amount Input + Expected Return */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <Label htmlFor="tradeAmount" className="text-base font-medium">
              Trade Amount ($)
            </Label>
            <Input
              id="tradeAmount"
              type="number"
              value={tradeAmount}
              onChange={(e) =>
                setTradeAmount(Math.max(0, parseFloat(e.target.value) || 0))
              }
              min="1"
              max={isDemoMode ? demoBalance / 1.02 : 0}
              className="mt-2 text-lg"
              disabled={!isDemoMode}
            />
            <div className="mt-2 text-sm text-muted-foreground">
              Min: $1{" "}
              {isDemoMode && `• Max: $${(demoBalance / 1.02).toFixed(2)}`}
              <br />
              Trading fee: ${tradingFee.toFixed(2)} (2%)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Label className="text-base font-medium">Expected Return</Label>
            <div className="mt-2 space-y-2">
              <div className="text-lg font-semibold text-green-500">
                +${expectedReturn.toFixed(2)} (
                {selectedDuration.returnPercentage}%)
              </div>
              <div className="text-sm text-muted-foreground">
                Total cost: ${totalCost.toFixed(2)} (incl. fee)
                <br />
                Total if win: ${totalReturn.toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prediction Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          size="lg"
          onClick={() => handleTrade("UP")}
          disabled={
            !isDemoMode ||
            isTrading ||
            tradeAmount <= 0 ||
            totalCost > demoBalance
          }
          className={`h-16 text-lg font-bold bg-green-600 hover:bg-green-700 text-white ${
            isTrading
              ? "animate-pulse"
              : "hover:shadow-lg hover:shadow-green-500/20"
          } transition-all duration-200`}
        >
          <TrendingUp className="w-6 h-6 mr-2" />
          UP
        </Button>

        <Button
          size="lg"
          onClick={() => handleTrade("DOWN")}
          disabled={
            !isDemoMode ||
            isTrading ||
            tradeAmount <= 0 ||
            totalCost > demoBalance
          }
          className={`h-16 text-lg font-bold bg-red-600 hover:bg-red-700 text-white ${
            isTrading
              ? "animate-pulse"
              : "hover:shadow-lg hover:shadow-red-500/20"
          } transition-all duration-200`}
        >
          <TrendingDown className="w-6 h-6 mr-2" />
          DOWN
        </Button>
      </div>

      {/* Pending Trades Alert */}
      {pendingTrades.length > 0 && (
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-600">
                {pendingTrades.length} active trade
                {pendingTrades.length > 1 ? "s" : ""} pending
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trading Result Table */}
      {recentTrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Recent Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 font-medium">Asset</th>
                    <th className="text-left p-2 font-medium">Timeframe</th>
                    <th className="text-right p-2 font-medium">Amount</th>
                    <th className="text-center p-2 font-medium">Prediction</th>
                    <th className="text-center p-2 font-medium">Result</th>
                    <th className="text-right p-2 font-medium">Return</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-border/50">
                      <td className="p-2 font-medium">{trade.asset}</td>
                      <td className="p-2">{trade.timeframe}</td>
                      <td className="p-2 text-right">
                        ${trade.amount.toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        <Badge
                          variant={
                            trade.prediction === "UP"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {trade.prediction}
                        </Badge>
                      </td>
                      <td className="p-2 text-center">
                        <Badge
                          variant={
                            trade.result === "WIN"
                              ? "default"
                              : trade.result === "LOSS"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {trade.result}
                        </Badge>
                      </td>
                      <td
                        className={`p-2 text-right font-medium ${
                          trade.result === "WIN"
                            ? "text-green-500"
                            : trade.result === "LOSS"
                              ? "text-red-500"
                              : "text-muted-foreground"
                        }`}
                      >
                        {trade.result === "PENDING"
                          ? "-"
                          : trade.actualReturn >= 0
                            ? `+$${trade.actualReturn.toFixed(2)}`
                            : `$${trade.actualReturn.toFixed(2)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Utility function to convert timeframe to milliseconds
function getTimeframeMs(timeframe: string): number {
  const timeMap: { [key: string]: number } = {
    "60s": 60 * 1000,
    "120s": 120 * 1000,
    "300s": 300 * 1000,
    "600s": 600 * 1000,
    "3600s": 3600 * 1000,
    "21600s": 21600 * 1000,
  };
  return timeMap[timeframe] || 60 * 1000; // Default to 60s
}
