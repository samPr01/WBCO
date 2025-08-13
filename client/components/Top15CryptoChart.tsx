// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCryptoPrices, CryptoPrice } from "@/hooks/useCryptoPrices";

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  rank: number;
}

export function Top15CryptoChart() {
  const navigate = useNavigate();
  const { 
    prices: cryptoPrices, 
    isLoading, 
    error, 
    formatPrice, 
    formatMarketCap,
    refetch 
  } = useCryptoPrices();

  // Convert API data to component format
  const cryptos: CryptoData[] = cryptoPrices.map((crypto: CryptoPrice) => ({
    id: crypto.id,
    symbol: crypto.symbol.toUpperCase(),
    name: crypto.name,
    price: crypto.current_price,
    change24h: crypto.price_change_percentage_24h,
    marketCap: crypto.market_cap,
    volume24h: crypto.total_volume,
    rank: crypto.market_cap_rank,
  }));

  const handleCryptoClick = (crypto: CryptoData) => {
    navigate(`/trading/${crypto.id}`, {
      state: {
        symbol: crypto.symbol,
        name: crypto.name,
        price: crypto.price,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Top 15 Cryptocurrencies
          </div>
          <button
            onClick={refetch}
            disabled={isLoading}
            className="p-2 hover:bg-muted rounded-md transition-colors"
            title="Refresh prices"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </CardTitle>
        {error && (
          <p className="text-sm text-destructive">
            Error loading prices: {error}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading crypto prices...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {cryptos.map((crypto) => (
            <div
              key={crypto.id}
              onClick={() => handleCryptoClick(crypto)}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-all cursor-pointer hover:scale-[1.01]"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 text-xs">
                    #{crypto.rank}
                  </Badge>
                  <div className="w-10 h-10 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {crypto.symbol}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="font-semibold">{crypto.symbol}</div>
                  <div className="text-sm text-muted-foreground">
                    {crypto.name}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="font-bold">{formatPrice(crypto.price)}</div>
                  <div
                    className={`text-sm flex items-center gap-1 justify-center ${
                      crypto.change24h >= 0
                        ? "text-chart-positive"
                        : "text-chart-negative"
                    }`}
                  >
                    {crypto.change24h >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {crypto.change24h >= 0 ? "+" : ""}
                    {crypto.change24h.toFixed(2)}%
                  </div>
                </div>

                <div className="text-right hidden md:block">
                  <div className="text-sm text-muted-foreground">
                    Market Cap
                  </div>
                  <div className="font-medium">
                    {formatMarketCap(crypto.marketCap)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

