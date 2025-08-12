import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useDemoTrading } from "@/contexts/DemoTradingContext";
import { CandlestickChart } from "@/components/CandlestickChart";
import { AdvancedOptionsTrading } from "@/components/AdvancedOptionsTrading";
import { useCryptoPrices, CryptoPrice } from "@/hooks/useCryptoPrices";

interface PricePoint {
  timestamp: string;
  price: number;
  volume: number;
}

interface CryptoDetailData {
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
  priceHistory: PricePoint[];
}

export default function CryptoTradingDetail() {
  const { cryptoId } = useParams<{ cryptoId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isDemoMode, demoBalance, addTrade } = useDemoTrading();
  const { getCryptoPriceById, formatPrice: formatCryptoPrice, formatMarketCap, formatVolume } = useCryptoPrices();

  const [cryptoData, setCryptoData] = useState<CryptoDetailData | null>(null);
  const [timeframe, setTimeframe] = useState("1Y");
  const [tradeAmount, setTradeAmount] = useState(100);
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [selectedTimeframe, setSelectedTimeframe] = useState("60"); // seconds

  // Trading timeframes with returns (all in seconds)
  const tradingTimeframes = [
    { seconds: 60, label: "60s", returnPercent: 20 },
    { seconds: 120, label: "120s", returnPercent: 30 },
    { seconds: 180, label: "180s", returnPercent: 40 },
    { seconds: 360, label: "360s", returnPercent: 50 },
    { seconds: 720, label: "720s", returnPercent: 60 },
    { seconds: 2160, label: "2160s", returnPercent: 80 },
  ];

  // Get crypto info from location state or use default
  const cryptoInfo = location.state || {
    symbol: "BTC",
    name: "Bitcoin",
    price: 100000,
  };

  // Check if this is an investment plan trade
  const isInvestmentPlan = cryptoInfo.investmentPlan;
  const investmentPlan = cryptoInfo.plan;

  useEffect(() => {
    // Try to get real crypto data first
    const realCrypto = getCryptoPriceById(cryptoId || cryptoInfo.symbol.toLowerCase());
    
    if (realCrypto) {
      // Generate 2-year historical data based on real price
      const generatePriceHistory = (currentPrice: number): PricePoint[] => {
        const data: PricePoint[] = [];
        const now = new Date();
        const twoYearsAgo = new Date(
          now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000,
        );

        let price = currentPrice * 0.3; // Start from 30% of current price 2 years ago
        const totalDays = 730; // 2 years

        for (let i = 0; i < totalDays; i++) {
          const date = new Date(twoYearsAgo.getTime() + i * 24 * 60 * 60 * 1000);

          // Simulate realistic price movement with overall upward trend
          const randomChange = (Math.random() - 0.48) * 0.05; // Slightly positive bias
          const trend = (i / totalDays) * 0.7; // Overall 70% increase over 2 years

          price = price * (1 + randomChange + trend * 0.001);

          data.push({
            timestamp: date.toISOString().split("T")[0],
            price: Math.max(0, price),
            volume: Math.random() * 1000000000,
          });
        }

        return data;
      };

      const realData: CryptoDetailData = {
        symbol: realCrypto.symbol.toUpperCase(),
        name: realCrypto.name,
        currentPrice: realCrypto.current_price,
        change24h: realCrypto.price_change_24h,
        high24h: realCrypto.high_24h,
        low24h: realCrypto.low_24h,
        volume24h: realCrypto.total_volume,
        marketCap: realCrypto.market_cap,
        priceHistory: generatePriceHistory(realCrypto.current_price),
      };

      setCryptoData(realData);
    } else {
      // Fallback to mock data if real data not available
      const generatePriceHistory = (currentPrice: number): PricePoint[] => {
        const data: PricePoint[] = [];
        const now = new Date();
        const twoYearsAgo = new Date(
          now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000,
        );

        let price = currentPrice * 0.3;
        const totalDays = 730;

        for (let i = 0; i < totalDays; i++) {
          const date = new Date(twoYearsAgo.getTime() + i * 24 * 60 * 60 * 1000);
          const randomChange = (Math.random() - 0.48) * 0.05;
          const trend = (i / totalDays) * 0.7;

          price = price * (1 + randomChange + trend * 0.001);

          data.push({
            timestamp: date.toISOString().split("T")[0],
            price: Math.max(0, price),
            volume: Math.random() * 1000000000,
          });
        }

        return data;
      };

      const mockData: CryptoDetailData = {
        symbol: cryptoInfo.symbol,
        name: cryptoInfo.name,
        currentPrice: cryptoInfo.price,
        change24h: (Math.random() - 0.5) * 10,
        high24h: cryptoInfo.price * 1.05,
        low24h: cryptoInfo.price * 0.95,
        volume24h: Math.random() * 1000000000,
        marketCap: cryptoInfo.price * 19000000,
        priceHistory: generatePriceHistory(cryptoInfo.price),
      };

      setCryptoData(mockData);
    }
  }, [cryptoId, cryptoInfo.symbol, cryptoInfo.name, cryptoInfo.price, getCryptoPriceById]);

  const handleTrade = async (prediction: "UP" | "DOWN") => {
    // Check wallet connection first
    const walletConnected = localStorage.getItem("walletConnected") === "true";
    if (!walletConnected) {
      toast.error("Please connect your wallet first to trade");
      return;
    }

    if (tradeAmount <= 0) {
      toast.error("Trade amount must be greater than 0");
      return;
    }

    // Check balance based on demo mode
    const currentBalance = isDemoMode ? demoBalance : 1.2345; // ETH balance for real wallet
    if (tradeAmount > currentBalance) {
      toast.error(`Insufficient ${isDemoMode ? "demo" : "wallet"} balance`);
      return;
    }

    if (!cryptoData) return;

    // Handle investment plan vs regular trade
    if (isInvestmentPlan && investmentPlan) {
      // Investment plan trade
      const trade = {
        asset: `${cryptoData.symbol}/USD`,
        timeframe: investmentPlan.duration,
        amount: tradeAmount,
        prediction: "UP", // Investment plans are always bullish
        expectedReturn:
          tradeAmount * (parseFloat(investmentPlan.returnPercentage) / 100),
        entryPrice: cryptoData.currentPrice,
        expiresAt: new Date(
          Date.now() +
            (investmentPlan.duration.includes("Hour")
              ? 60 * 60 * 1000
              : investmentPlan.duration.includes("Days")
                ? parseInt(investmentPlan.duration) * 24 * 60 * 60 * 1000
                : 24 * 60 * 60 * 1000),
        ),
        type: "investment",
      };

      addTrade(trade);
      toast.success(
        `Investment started: ${investmentPlan.name} plan with $${tradeAmount.toLocaleString()} (Expected return: ${investmentPlan.returnPercentage}%)`,
      );
    } else {
      // Regular options trade
      const selectedTime = tradingTimeframes.find(
        (t) => t.seconds.toString() === selectedTimeframe,
      );
      if (!selectedTime) return;

      const trade = {
        asset: `${cryptoData.symbol}/USD`,
        timeframe: `${selectedTime.seconds}s`,
        amount: tradeAmount,
        prediction,
        expectedReturn: tradeAmount * (selectedTime.returnPercent / 100),
        entryPrice: cryptoData.currentPrice,
        expiresAt: new Date(Date.now() + selectedTime.seconds * 1000),
        type: "options",
      };

      addTrade(trade);
      toast.success(
        `${prediction} trade placed for ${cryptoData.symbol} (${selectedTime.seconds}s, ${selectedTime.returnPercent}% return)`,
      );
    }
  };



  const getTimeframeData = () => {
    if (!cryptoData) return [];

    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case "1M":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "3M":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "6M":
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case "1Y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case "2Y":
        startDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }

    return cryptoData.priceHistory.filter(
      (point) => new Date(point.timestamp) >= startDate,
    );
  };

  if (!cryptoData) {
    return <div>Loading...</div>;
  }

  const chartData = getTimeframeData();
  const minPrice = Math.min(...chartData.map((p) => p.price));
  const maxPrice = Math.max(...chartData.map((p) => p.price));

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{cryptoData.symbol} Trading</h1>
          <p className="text-muted-foreground">{cryptoData.name}</p>
        </div>
      </div>

      {/* Price Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-muted-foreground">Current Price</div>
              <div className="text-3xl font-bold">
                {formatCryptoPrice(cryptoData.currentPrice)}
              </div>
              <div
                className={`text-sm flex items-center gap-1 ${
                  cryptoData.change24h >= 0
                    ? "text-chart-positive"
                    : "text-chart-negative"
                }`}
              >
                {cryptoData.change24h >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {cryptoData.change24h >= 0 ? "+" : ""}
                {cryptoData.change24h.toFixed(2)}%
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">24h High</div>
              <div className="text-lg font-semibold">
                {formatCryptoPrice(cryptoData.high24h)}
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">24h Low</div>
              <div className="text-lg font-semibold">
                {formatCryptoPrice(cryptoData.low24h)}
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">24h Volume</div>
              <div className="text-lg font-semibold">
                ${(cryptoData.volume24h / 1e9).toFixed(2)}B
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candlestick Chart */}
      <CandlestickChart
        asset={cryptoData.symbol}
        currentPrice={cryptoData.currentPrice}
      />

      {/* Investment Plan Trading Interface */}
      {isInvestmentPlan && investmentPlan && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              AI Investment Plan: {investmentPlan.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold mb-3">Plan Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">
                        {investmentPlan.duration}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Daily Income:</span>
                      <span className="font-medium text-chart-positive">
                        {investmentPlan.dailyIncome}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Return:</span>
                      <span className="font-medium text-chart-positive">
                        {investmentPlan.totalReturn}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk Level:</span>
                      <span className="font-medium">
                        {investmentPlan.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="investmentAmount"
                    className="text-sm font-medium"
                  >
                    Investment Amount ({isDemoMode ? "USD" : "ETH"})
                  </Label>
                  <Input
                    id="investmentAmount"
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(Number(e.target.value))}
                    placeholder={`Min: ${investmentPlan.minAmount}`}
                    className="mt-1"
                    min={investmentPlan.minAmount}
                    max={investmentPlan.maxAmount}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Range: ${investmentPlan.minAmount.toLocaleString()} - $
                    {investmentPlan.maxAmount.toLocaleString()}
                  </div>
                </div>

                <Button
                  onClick={() => {
                    if (tradeAmount < investmentPlan.minAmount) {
                      toast.error(
                        `Minimum investment is $${investmentPlan.minAmount.toLocaleString()}`,
                      );
                      return;
                    }
                    if (tradeAmount > investmentPlan.maxAmount) {
                      toast.error(
                        `Maximum investment is $${investmentPlan.maxAmount.toLocaleString()}`,
                      );
                      return;
                    }
                    handleTrade("UP"); // Investment plans are always bullish
                  }}
                  className="w-full bg-gradient-to-r from-gradient-start to-gradient-end text-white py-4"
                  size="lg"
                >
                  Start AI Investment
                </Button>

                {tradeAmount >= investmentPlan.minAmount && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Investment:</span>
                        <span className="font-medium">
                          ${tradeAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expected Daily:</span>
                        <span className="font-medium text-chart-positive">
                          ${(tradeAmount * 0.05).toLocaleString()} - $
                          {(tradeAmount * 0.15).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-semibold pt-2 border-t border-border">
                        <span>Total Expected Return:</span>
                        <span className="text-chart-positive">
                          $
                          {(
                            tradeAmount *
                            (parseFloat(investmentPlan.returnPercentage) / 100)
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time-Based Trading Interface */}
      {!isInvestmentPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Quick Options Trading
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Trade Amount */}
            <div>
              <Label htmlFor="tradeAmount" className="text-sm font-medium">
                Trade Amount ({isDemoMode ? "USD" : "ETH"})
              </Label>
              <Input
                id="tradeAmount"
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(Number(e.target.value))}
                placeholder="Enter amount"
                className="mt-1"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Available:{" "}
                {isDemoMode ? `$${demoBalance.toFixed(2)}` : "1.2345 ETH"}
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <Label className="text-sm font-medium">
                Select Trading Duration
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {tradingTimeframes.map((timeframe) => (
                  <button
                    key={timeframe.seconds}
                    onClick={() =>
                      setSelectedTimeframe(timeframe.seconds.toString())
                    }
                    className={`p-3 rounded-lg border transition-all ${
                      selectedTimeframe === timeframe.seconds.toString()
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-medium">{timeframe.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {timeframe.returnPercent}% return
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {timeframe.seconds}s
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prediction Buttons */}
            <div>
              <Label className="text-sm font-medium">Price Prediction</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Button
                  onClick={() => handleTrade("UP")}
                  className="bg-chart-positive hover:bg-chart-positive/90 text-white py-4"
                  size="lg"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  HIGHER
                </Button>
                <Button
                  onClick={() => handleTrade("DOWN")}
                  className="bg-chart-negative hover:bg-chart-negative/90 text-white py-4"
                  size="lg"
                >
                  <TrendingDown className="w-5 h-5 mr-2" />
                  LOWER
                </Button>
              </div>
            </div>

            {/* Trade Summary */}
            {tradeAmount > 0 && (
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Trade Amount:</span>
                    <span className="font-medium">
                      {isDemoMode ? `$${tradeAmount}` : `${tradeAmount} ETH`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">
                      {
                        tradingTimeframes.find(
                          (t) => t.seconds.toString() === selectedTimeframe,
                        )?.label
                      }
                      (
                      {
                        tradingTimeframes.find(
                          (t) => t.seconds.toString() === selectedTimeframe,
                        )?.seconds
                      }
                      s)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Potential Return:</span>
                    <span className="font-medium text-chart-positive">
                      {
                        tradingTimeframes.find(
                          (t) => t.seconds.toString() === selectedTimeframe,
                        )?.returnPercent
                      }
                      %
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-2 border-t border-border">
                    <span>Potential Profit:</span>
                    <span className="text-chart-positive">
                      +{isDemoMode ? "$" : ""}
                      {(
                        (tradeAmount *
                          (tradingTimeframes.find(
                            (t) => t.seconds.toString() === selectedTimeframe,
                          )?.returnPercent || 0)) /
                        100
                      ).toFixed(2)}
                      {!isDemoMode ? " ETH" : ""}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Advanced Options Trading (Demo Mode Only) */}
      {isDemoMode && (
        <AdvancedOptionsTrading
          asset={cryptoData.symbol}
          currentPrice={cryptoData.currentPrice}
        />
      )}
    </div>
  );
}
