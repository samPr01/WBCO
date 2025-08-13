// @ts-nocheck
import { TrendingDown, TrendingUp, MoreHorizontal, RefreshCw } from "lucide-react";
import { useCryptoPrices, CryptoPrice } from "@/hooks/useCryptoPrices";

interface CryptoData {
  symbol: string;
  name: string;
  price: string;
  change: string;
  isPositive: boolean;
}

function MiniChart({ isPositive }: { isPositive: boolean }) {
  // Generate random path data for the mini chart
  const points = Array.from({ length: 8 }, (_, i) => {
    const x = i * 8;
    const y = 12 + Math.random() * 8;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width="60" height="24" viewBox="0 0 60 24" className="ml-auto">
      <path
        d={`M${points}`}
        stroke={
          isPositive
            ? "hsl(var(--chart-positive))"
            : "hsl(var(--chart-negative))"
        }
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TradingSection() {
  const { 
    prices: cryptoPrices, 
    isLoading, 
    error, 
    formatPrice,
    refetch 
  } = useCryptoPrices();

  // Convert API data to component format (show top 3)
  const cryptoData: CryptoData[] = cryptoPrices.slice(0, 3).map((crypto: CryptoPrice) => ({
    symbol: crypto.symbol.toUpperCase(),
    name: crypto.name,
    price: formatPrice(crypto.current_price),
    change: `${crypto.price_change_percentage_24h >= 0 ? '+' : ''}${crypto.price_change_percentage_24h.toFixed(2)}%`,
    isPositive: crypto.price_change_percentage_24h >= 0,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Top Trade</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={refetch}
            disabled={isLoading}
            className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="text-primary text-sm font-medium hover:underline">
            More
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted-foreground/20 rounded w-16"></div>
                      <div className="h-3 bg-muted-foreground/20 rounded w-24"></div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-4 bg-muted-foreground/20 rounded w-20"></div>
                      <div className="h-3 bg-muted-foreground/20 rounded w-12"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Failed to load crypto data</p>
            <button 
              onClick={refetch}
              className="text-primary text-sm mt-2 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          cryptoData.map((crypto) => (
            <div
              key={crypto.symbol}
              className="bg-card rounded-lg p-4 border border-border hover:bg-muted/20 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    {crypto.symbol}
                  </div>
                  <div>
                    <div className="font-medium">{crypto.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {crypto.symbol}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{crypto.price}</div>
                  <div
                    className={`text-sm flex items-center gap-1 ${
                      crypto.isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {crypto.isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {crypto.change}
                  </div>
                </div>
                <MiniChart isPositive={crypto.isPositive} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

