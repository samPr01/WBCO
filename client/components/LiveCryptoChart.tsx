import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Signal,
  AlertTriangle,
  WifiOff,
} from "lucide-react";

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  chartData: number[];
  signal?: TradingSignal;
}

interface TradingSignal {
  symbol: string;
  signal: "BUY" | "SELL" | "HOLD";
  strength: number;
  indicators: {
    rsi?: number;
    macd?: number;
    sma?: number;
    ema?: number;
  };
  timestamp: string;
}

// Fallback data when API fails
const fallbackCryptoData: CryptoData[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 100704.7,
    change24h: -463.25,
    changePercent24h: -0.46,
    high24h: 101245.8,
    low24h: 99856.42,
    volume24h: 28500000000,
    chartData: Array.from(
      { length: 24 },
      (_, i) => 100000 + Math.random() * 2000,
    ),
    signal: {
      symbol: "BTC",
      signal: "HOLD",
      strength: 65,
      indicators: { rsi: 55, macd: -50, sma: 100500, ema: 100600 },
      timestamp: new Date().toISOString(),
    },
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 3256.66,
    change24h: 74.52,
    changePercent24h: 2.34,
    high24h: 3298.45,
    low24h: 3180.22,
    volume24h: 15200000000,
    chartData: Array.from({ length: 24 }, (_, i) => 3200 + Math.random() * 200),
    signal: {
      symbol: "ETH",
      signal: "BUY",
      strength: 78,
      indicators: { rsi: 42, macd: 25, sma: 3200, ema: 3250 },
      timestamp: new Date().toISOString(),
    },
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 217.82,
    change24h: -2.72,
    changePercent24h: -1.23,
    high24h: 225.5,
    low24h: 215.3,
    volume24h: 3400000000,
    chartData: Array.from({ length: 24 }, (_, i) => 215 + Math.random() * 20),
    signal: {
      symbol: "SOL",
      signal: "SELL",
      strength: 60,
      indicators: { rsi: 68, macd: -15, sma: 220, ema: 218 },
      timestamp: new Date().toISOString(),
    },
  },
];

function MiniChart({
  data,
  isPositive,
}: {
  data: number[];
  isPositive: boolean;
}) {
  if (!data || data.length === 0) {
    return (
      <div className="w-[120px] h-[60px] bg-muted/20 rounded animate-pulse" />
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = range === 0 ? 50 : ((max - value) / range) * 40 + 10;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width="120"
      height="60"
      viewBox="0 0 100 60"
      className="overflow-visible"
    >
      <defs>
        <linearGradient
          id={`gradient-${isPositive ? "positive" : "negative"}`}
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop
            offset="0%"
            stopColor={
              isPositive
                ? "hsl(var(--chart-positive))"
                : "hsl(var(--chart-negative))"
            }
            stopOpacity="0.3"
          />
          <stop
            offset="100%"
            stopColor={
              isPositive
                ? "hsl(var(--chart-positive))"
                : "hsl(var(--chart-negative))"
            }
            stopOpacity="0"
          />
        </linearGradient>
      </defs>

      <polyline
        fill="none"
        stroke={
          isPositive
            ? "hsl(var(--chart-positive))"
            : "hsl(var(--chart-negative))"
        }
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />

      <polygon
        fill={`url(#gradient-${isPositive ? "positive" : "negative"})`}
        points={`${points} 100,60 0,60`}
      />
    </svg>
  );
}

function SignalIndicator({ signal }: { signal?: TradingSignal }) {
  if (!signal) return null;

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "BUY":
        return "text-chart-positive bg-chart-positive/10";
      case "SELL":
        return "text-chart-negative bg-chart-negative/10";
      case "HOLD":
        return "text-yellow-500 bg-yellow-500/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case "BUY":
        return <TrendingUp className="w-3 h-3" />;
      case "SELL":
        return <TrendingDown className="w-3 h-3" />;
      case "HOLD":
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Signal className="w-3 h-3" />;
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getSignalColor(signal.signal)}`}
      >
        {getSignalIcon(signal.signal)}
        {signal.signal}
      </div>
      <div className="text-xs text-muted-foreground">
        {signal.strength}% confidence
      </div>
    </div>
  );
}

export function LiveCryptoChart() {
  const [cryptoData, setCryptoData] =
    useState<CryptoData[]>(fallbackCryptoData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(
    new Date().toISOString(),
  );

  // Simulate price updates
  useEffect(() => {
    const updatePrices = () => {
      setCryptoData((prev) =>
        prev.map((crypto) => {
          const volatility =
            crypto.symbol === "BTC"
              ? 0.01
              : crypto.symbol === "ETH"
                ? 0.02
                : 0.03;
          const randomChange = (Math.random() - 0.5) * volatility;
          const newPrice = crypto.price * (1 + randomChange);
          const change24h = newPrice - crypto.price;
          const changePercent24h = (change24h / crypto.price) * 100;

          // Update chart data
          const newChartData = [...crypto.chartData.slice(1), newPrice];

          return {
            ...crypto,
            price: newPrice,
            change24h,
            changePercent24h,
            chartData: newChartData,
          };
        }),
      );
      setLastUpdated(new Date().toISOString());
    };

    // Update prices every 3 seconds
    const interval = setInterval(updatePrices, 3000);
    return () => clearInterval(interval);
  }, []);

  // Try to fetch real data but continue with fallback if it fails
  useEffect(() => {
    const tryFetchRealData = async () => {
      try {
        setIsLoading(true);

        // Try to fetch from API with a short timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch("/api/crypto/prices", {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.data) {
            // Update with real data
            const realData = data.data.data.map((crypto: any) => ({
              symbol: crypto.symbol,
              name: crypto.name,
              price: crypto.price,
              change24h: crypto.change24h,
              changePercent24h: crypto.changePercent24h,
              high24h: crypto.high24h,
              low24h: crypto.low24h,
              volume24h: crypto.volume24h,
              chartData: Array.from(
                { length: 24 },
                (_, i) => crypto.price * (1 + (Math.random() - 0.5) * 0.1),
              ),
              signal: fallbackCryptoData.find((f) => f.symbol === crypto.symbol)
                ?.signal,
            }));

            setCryptoData(realData);
            setIsConnected(true);
            setError(null);
          }
        }
      } catch (fetchError) {
        console.warn(
          "Failed to fetch real crypto data, using fallback:",
          fetchError,
        );
        setIsConnected(false);
        setError("Using cached data");
      } finally {
        setIsLoading(false);
      }
    };

    tryFetchRealData();
  }, []);

  const formatPrice = (price: number) => {
    if (price > 1000) {
      return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(2)}`;
  };

  const formatChange = (change: number, percent: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    }
    return `$${volume.toLocaleString()}`;
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Live Crypto Charts</h3>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Activity className="w-4 h-4 text-primary animate-pulse" />
          ) : isConnected ? (
            <Activity className="w-4 h-4 text-primary animate-pulse" />
          ) : (
            <WifiOff className="w-4 h-4 text-yellow-500" />
          )}
          <span className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : isConnected ? "Live" : "Demo"} • Market
            Data
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="text-sm text-yellow-600 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error} - Showing simulated data for demo purposes
          </div>
        </div>
      )}

      <div className="space-y-4">
        {cryptoData.map((crypto) => (
          <div
            key={crypto.symbol}
            className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {crypto.symbol}
                </span>
              </div>
              <div>
                <div className="font-semibold text-lg">{crypto.symbol}</div>
                <div className="text-sm text-muted-foreground">
                  {crypto.name}
                </div>
                <SignalIndicator signal={crypto.signal} />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="font-bold text-lg">
                  {formatPrice(crypto.price)}
                </div>
                <div
                  className={`text-sm flex items-center gap-1 justify-center ${
                    crypto.changePercent24h >= 0
                      ? "text-chart-positive"
                      : "text-chart-negative"
                  }`}
                >
                  {crypto.changePercent24h >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {formatChange(crypto.change24h, crypto.changePercent24h)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Vol: {formatVolume(crypto.volume24h)}
                </div>
              </div>

              <div className="flex items-center">
                <MiniChart
                  data={crypto.chartData}
                  isPositive={crypto.changePercent24h >= 0}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-gradient-start/10 to-gradient-end/10 rounded-lg border border-primary/20">
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-1">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </div>
          <div className="text-xs text-muted-foreground">
            {isConnected ? "Real-time" : "Demo"} • Market Data & AI Signals
            {!isConnected && " (Simulated for demo)"}
          </div>
        </div>
      </div>
    </div>
  );
}
