import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Timer, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useDemoTrading } from "@/contexts/DemoTradingContext";

interface OptionsTradeProps {
  asset: string;
  currentPrice: number;
}

export function AdvancedOptionsTrading({
  asset,
  currentPrice,
}: OptionsTradeProps) {
  const { isDemoMode, demoBalance, addTrade } = useDemoTrading();
  const [selectedTime, setSelectedTime] = useState(60);
  const [tradeAmount, setTradeAmount] = useState(100);
  const [tradeDirection, setTradeDirection] = useState<"UP" | "DOWN" | null>(
    null,
  );
  const [countdown, setCountdown] = useState(0);
  const [isTrading, setIsTrading] = useState(false);
  const [lastPrice, setLastPrice] = useState(currentPrice);
  const [openPrice, setOpenPrice] = useState<number | null>(null);

  // Calculate trading fee and returns
  const tradingFee = tradeAmount * 0.02;
  const totalCost = tradeAmount + tradingFee;
  const expectedReturn = tradeAmount * 0.2; // 20% return for demo

  // Update last price periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLastPrice((prev) => prev * (1 + (Math.random() - 0.5) * 0.001));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && isTrading) {
      // Trade expired
      finalizeTrade();
    }
  }, [countdown, isTrading]);

  const placeTrade = (direction: "UP" | "DOWN") => {
    if (!isDemoMode) {
      toast.error("Demo mode must be enabled to trade");
      return;
    }

    if (totalCost > demoBalance) {
      toast.error("Insufficient balance including fees");
      return;
    }

    setTradeDirection(direction);
    setOpenPrice(lastPrice);
    setCountdown(selectedTime);
    setIsTrading(true);

    const trade = {
      asset: asset,
      timeframe: `${selectedTime}s`,
      amount: totalCost,
      prediction: direction,
      expectedReturn,
      entryPrice: lastPrice,
      expiresAt: new Date(Date.now() + selectedTime * 1000),
    };

    addTrade(trade);
    toast.success(`${direction} trade placed for ${asset}!`);
  };

  const finalizeTrade = () => {
    if (!openPrice || !tradeDirection) return;

    const priceDifference = lastPrice - openPrice;
    const isWin =
      (tradeDirection === "UP" && priceDifference > 0) ||
      (tradeDirection === "DOWN" && priceDifference < 0);

    toast.success(
      isWin
        ? `Trade won! +$${expectedReturn.toFixed(2)}`
        : `Trade lost. -$${tradeAmount.toFixed(2)}`,
    );

    // Reset state
    setIsTrading(false);
    setTradeDirection(null);
    setOpenPrice(null);
    setCountdown(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const timeOptions = [60, 120, 300, 600, 1800, 3600];

  return (
    <div className="space-y-6">
      {/* Option/Contract Toggle */}
      <div className="flex gap-2">
        <Button
          variant="default"
          className="flex-1 bg-purple-600 hover:bg-purple-700"
        >
          Option
        </Button>
        <Button variant="outline" className="flex-1">
          Contract
        </Button>
      </div>

      {/* Time Selection */}
      <div className="grid grid-cols-3 gap-2">
        {timeOptions.map((time) => (
          <Button
            key={time}
            variant={selectedTime === time ? "default" : "outline"}
            onClick={() => setSelectedTime(time)}
            className={
              selectedTime === time ? "bg-purple-600 hover:bg-purple-700" : ""
            }
          >
            {time < 60 ? `${time}s` : `${time / 60}m`}
          </Button>
        ))}
      </div>

      {/* Trading Interface */}
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6 space-y-6">
          {/* Asset and Price Info */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">{asset}</h3>
              <div className="text-lg text-green-400">
                ${tradeAmount} Expected Return ${expectedReturn.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {isTrading ? formatTime(countdown) : `${selectedTime} seconds`}
              </div>
              {isTrading && (
                <Progress
                  value={(countdown / selectedTime) * 100}
                  className="w-32 h-2 mt-2"
                />
              )}
            </div>
          </div>

          {/* Trade Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Last Price</span>
                <span className="text-white">${lastPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Direction</span>
                <span
                  className={`font-medium ${
                    tradeDirection === "UP"
                      ? "text-green-400"
                      : tradeDirection === "DOWN"
                        ? "text-red-400"
                        : "text-white"
                  }`}
                >
                  {tradeDirection || "Not Selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Open Price</span>
                <span className="text-white">
                  {openPrice ? `$${openPrice.toFixed(2)}` : "-"}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Amount</span>
                <span className="text-white">${tradeAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fee</span>
                <span className="text-white">${tradingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Cost</span>
                <span className="text-white">${totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-gray-400 text-sm">Trade Amount</label>
            <Input
              type="number"
              value={tradeAmount}
              onChange={(e) =>
                setTradeAmount(Math.max(1, parseFloat(e.target.value) || 1))
              }
              className="bg-gray-800 border-gray-600 text-white"
              disabled={isTrading}
            />
          </div>

          {/* Trading Buttons */}
          {!isTrading ? (
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => placeTrade("UP")}
                disabled={!isDemoMode || totalCost > demoBalance}
                className="h-16 bg-green-600 hover:bg-green-700 text-white text-lg font-bold"
              >
                <TrendingUp className="w-6 h-6 mr-2" />
                UP
              </Button>
              <Button
                onClick={() => placeTrade("DOWN")}
                disabled={!isDemoMode || totalCost > demoBalance}
                className="h-16 bg-red-600 hover:bg-red-700 text-white text-lg font-bold"
              >
                <TrendingDown className="w-6 h-6 mr-2" />
                DOWN
              </Button>
            </div>
          ) : (
            <Button
              onClick={finalizeTrade}
              className="w-full h-16 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold"
            >
              Close Trade
            </Button>
          )}

          {/* Balance Info */}
          {isDemoMode && (
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-gray-400 text-sm">Demo Balance</div>
              <div className="text-xl font-bold text-green-400">
                $
                {demoBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
