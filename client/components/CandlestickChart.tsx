import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandlestickChartProps {
  asset: string;
  currentPrice: number;
}

export function CandlestickChart({
  asset,
  currentPrice,
}: CandlestickChartProps) {
  const [timeframe, setTimeframe] = useState("1m");
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const timeframes = ["1m", "5m", "15m", "30m", "1h", "1D", "1W", "1M"];

  // Generate candlestick data
  useEffect(() => {
    const generateCandles = () => {
      const candles: CandleData[] = [];
      let price = currentPrice * 0.98; // Start slightly below current price

      for (let i = 0; i < 50; i++) {
        const open = price;
        const volatility = 0.02; // 2% volatility

        // Generate high and low
        const high = open * (1 + Math.random() * volatility);
        const low = open * (1 - Math.random() * volatility);

        // Generate close (with slight upward bias)
        const close = open * (1 + (Math.random() - 0.45) * volatility);

        candles.push({
          timestamp: Date.now() - (50 - i) * 60000, // 1 minute intervals
          open,
          high: Math.max(open, close, high),
          low: Math.min(open, close, low),
          close,
          volume: Math.random() * 1000000,
        });

        price = close;
      }

      return candles;
    };

    setCandleData(generateCandles());
  }, [currentPrice, timeframe]);

  // Update real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setCandleData((prev) => {
        const newCandles = [...prev];
        if (newCandles.length > 0) {
          const lastCandle = newCandles[newCandles.length - 1];
          const volatility = 0.001;

          // Update the last candle
          newCandles[newCandles.length - 1] = {
            ...lastCandle,
            close: lastCandle.close * (1 + (Math.random() - 0.5) * volatility),
            high: Math.max(
              lastCandle.high,
              lastCandle.close * (1 + Math.random() * volatility),
            ),
            low: Math.min(
              lastCandle.low,
              lastCandle.close * (1 - Math.random() * volatility),
            ),
          };
        }
        return newCandles;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const renderCandle = (
    candle: CandleData,
    index: number,
    minPrice: number,
    maxPrice: number,
  ) => {
    const isGreen = candle.close > candle.open;
    const x = (index / candleData.length) * 100;
    const bodyTop =
      ((Math.max(candle.open, candle.close) - minPrice) /
        (maxPrice - minPrice)) *
      100;
    const bodyBottom =
      ((Math.min(candle.open, candle.close) - minPrice) /
        (maxPrice - minPrice)) *
      100;
    const wickTop = ((candle.high - minPrice) / (maxPrice - minPrice)) * 100;
    const wickBottom = ((candle.low - minPrice) / (maxPrice - minPrice)) * 100;

    return (
      <g key={index}>
        {/* Invisible hover area */}
        <rect
          x={`${x - 1}%`}
          y="0%"
          width="2%"
          height="100%"
          fill="transparent"
          onMouseEnter={() => setHoveredCandle(candle)}
          onMouseLeave={() => setHoveredCandle(null)}
          style={{ cursor: "crosshair" }}
        />
        {/* Wick */}
        <line
          x1={`${x}%`}
          y1={`${100 - wickTop}%`}
          x2={`${x}%`}
          y2={`${100 - wickBottom}%`}
          stroke={isGreen ? "#22c55e" : "#ef4444"}
          strokeWidth="1"
        />
        {/* Body */}
        <rect
          x={`${x - 0.8}%`}
          y={`${100 - bodyTop}%`}
          width="1.6%"
          height={`${bodyTop - bodyBottom}%`}
          fill={isGreen ? "#22c55e" : "#ef4444"}
        />
      </g>
    );
  };

  const minPrice = Math.min(...candleData.map((c) => c.low));
  const maxPrice = Math.max(...candleData.map((c) => c.high));

  return (
    <div className="space-y-4">
      {/* Price Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {currentPrice.toFixed(2)}
          </h2>
          <div className="flex gap-4 text-sm text-gray-400">
            <span>High: {maxPrice.toFixed(2)}</span>
            <span>Low: {minPrice.toFixed(2)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">
            Open Price: {candleData[0]?.open.toFixed(2) || "-"}
          </div>
          <div className="text-sm text-gray-400">
            Close Price:{" "}
            {candleData[candleData.length - 1]?.close.toFixed(2) || "-"}
          </div>
        </div>
      </div>

      {/* Timeframe Buttons */}
      <div className="flex gap-2 overflow-x-auto">
        {timeframes.map((tf) => (
          <Button
            key={tf}
            variant={timeframe === tf ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeframe(tf)}
            className={`whitespace-nowrap ${
              timeframe === tf
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {tf}
          </Button>
        ))}
      </div>

      {/* Chart */}
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-4">
          <div className="h-64 relative">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              preserveAspectRatio="none"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setMousePosition({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                });
              }}
            >
              {/* Grid lines */}
              <defs>
                <pattern
                  id="grid"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 10 0 L 0 0 0 10"
                    fill="none"
                    stroke="#374151"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Price line at current level */}
              <line
                x1="0%"
                y1={`${100 - ((currentPrice - minPrice) / (maxPrice - minPrice)) * 100}%`}
                x2="100%"
                y2={`${100 - ((currentPrice - minPrice) / (maxPrice - minPrice)) * 100}%`}
                stroke="#22d3ee"
                strokeWidth="1"
                strokeDasharray="4,4"
              />

              {/* Candlesticks */}
              {candleData.map((candle, index) =>
                renderCandle(candle, index, minPrice, maxPrice),
              )}
            </svg>

            {/* Price labels */}
            <div className="absolute right-2 top-2 text-xs text-gray-400">
              {maxPrice.toFixed(2)}
            </div>
            <div className="absolute right-2 bottom-2 text-xs text-gray-400">
              {minPrice.toFixed(2)}
            </div>
            <div
              className="absolute right-2 text-xs text-cyan-400 bg-gray-800 px-1 rounded"
              style={{
                top: `${100 - ((currentPrice - minPrice) / (maxPrice - minPrice)) * 100}%`,
                transform: "translateY(-50%)",
              }}
            >
              {currentPrice.toFixed(2)}
            </div>

            {/* Hover tooltip */}
            {hoveredCandle && (
              <div
                className="absolute bg-gray-800 border border-gray-600 rounded-lg p-3 text-xs text-white shadow-lg z-10"
                style={{
                  left: `${mousePosition.x + 10}px`,
                  top: `${mousePosition.y - 80}px`,
                  pointerEvents: "none",
                }}
              >
                <div className="space-y-1">
                  <div className="font-semibold">{asset}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      Open:{" "}
                      <span className="text-cyan-400">
                        ${hoveredCandle.open.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      High:{" "}
                      <span className="text-green-400">
                        ${hoveredCandle.high.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      Low:{" "}
                      <span className="text-red-400">
                        ${hoveredCandle.low.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      Close:{" "}
                      <span className="text-cyan-400">
                        ${hoveredCandle.close.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="pt-1 border-t border-gray-600">
                    Volume: {(hoveredCandle.volume / 1000000).toFixed(2)}M
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Volume Bars */}
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-4">
          <div className="h-16 flex items-end gap-1">
            {candleData.map((candle, index) => {
              const maxVolume = Math.max(...candleData.map((c) => c.volume));
              const height = (candle.volume / maxVolume) * 100;
              const isGreen = candle.close > candle.open;

              return (
                <div
                  key={index}
                  className={`flex-1 ${isGreen ? "bg-green-500" : "bg-red-500"} opacity-60`}
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
