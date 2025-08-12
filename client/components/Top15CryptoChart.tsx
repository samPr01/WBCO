import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

// Top 15 cryptocurrencies data (in production, this would come from an API)
const TOP_15_CRYPTOS: CryptoData[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    price: 100704.7,
    change24h: -0.46,
    marketCap: 1980000000000,
    volume24h: 28500000000,
    rank: 1,
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    price: 3256.66,
    change24h: 2.34,
    marketCap: 391000000000,
    volume24h: 15200000000,
    rank: 2,
  },
  {
    id: "tether",
    symbol: "USDT",
    name: "Tether",
    price: 1.0,
    change24h: 0.02,
    marketCap: 120000000000,
    volume24h: 45000000000,
    rank: 3,
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    price: 217.82,
    change24h: -1.23,
    marketCap: 103000000000,
    volume24h: 3400000000,
    rank: 4,
  },
  {
    id: "bnb",
    symbol: "BNB",
    name: "BNB",
    price: 692.34,
    change24h: 1.87,
    marketCap: 100000000000,
    volume24h: 1800000000,
    rank: 5,
  },
  {
    id: "xrp",
    symbol: "XRP",
    name: "XRP",
    price: 2.45,
    change24h: 5.23,
    marketCap: 140000000000,
    volume24h: 8900000000,
    rank: 6,
  },
  {
    id: "usd-coin",
    symbol: "USDC",
    name: "USDC",
    price: 1.0,
    change24h: 0.01,
    marketCap: 38000000000,
    volume24h: 6200000000,
    rank: 7,
  },
  {
    id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    price: 0.89,
    change24h: 3.45,
    marketCap: 31200000000,
    volume24h: 890000000,
    rank: 8,
  },
  {
    id: "avalanche",
    symbol: "AVAX",
    name: "Avalanche",
    price: 42.12,
    change24h: -0.78,
    marketCap: 16500000000,
    volume24h: 450000000,
    rank: 9,
  },
  {
    id: "dogecoin",
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.41,
    change24h: 2.15,
    marketCap: 60000000000,
    volume24h: 3200000000,
    rank: 10,
  },
  {
    id: "tron",
    symbol: "TRX",
    name: "TRON",
    price: 0.25,
    change24h: 1.92,
    marketCap: 21000000000,
    volume24h: 1100000000,
    rank: 11,
  },
  {
    id: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    price: 23.45,
    change24h: 1.89,
    marketCap: 14800000000,
    volume24h: 730000000,
    rank: 12,
  },
  {
    id: "polygon",
    symbol: "MATIC",
    name: "Polygon",
    price: 0.92,
    change24h: -2.17,
    marketCap: 9100000000,
    volume24h: 520000000,
    rank: 13,
  },
  {
    id: "polkadot",
    symbol: "DOT",
    name: "Polkadot",
    price: 7.23,
    change24h: 4.12,
    marketCap: 10200000000,
    volume24h: 340000000,
    rank: 14,
  },
  {
    id: "litecoin",
    symbol: "LTC",
    name: "Litecoin",
    price: 106.78,
    change24h: -0.65,
    marketCap: 8000000000,
    volume24h: 890000000,
    rank: 15,
  },
];

export function Top15CryptoChart() {
  const navigate = useNavigate();
  const [cryptos, setCryptos] = useState(TOP_15_CRYPTOS);

  // Simulate price updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptos((prev) =>
        prev.map((crypto) => ({
          ...crypto,
          price: crypto.price * (1 + (Math.random() - 0.5) * 0.002), // ±0.1% random change
          change24h: crypto.change24h + (Math.random() - 0.5) * 0.1,
        })),
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    if (price < 1) {
      return `$${price.toFixed(4)}`;
    } else if (price < 1000) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) {
      return `$${(cap / 1e12).toFixed(2)}T`;
    } else if (cap >= 1e9) {
      return `$${(cap / 1e9).toFixed(2)}B`;
    } else {
      return `$${(cap / 1e6).toFixed(2)}M`;
    }
  };

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
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Top 15 Cryptocurrencies
        </CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
