// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from "lucide-react";

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume: number;
  marketCap: number;
}

const CRYPTO_DATA: CryptoData[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 120432.2,
    change24h: 523.8,
    changePercent24h: 0.43,
    volume: 28450000000,
    marketCap: 2350000000000
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 3245.67,
    change24h: -12.34,
    changePercent24h: -0.38,
    volume: 15800000000,
    marketCap: 389000000000
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 198.45,
    change24h: 8.23,
    changePercent24h: 4.33,
    volume: 3200000000,
    marketCap: 89000000000
  },
  {
    symbol: "XRP",
    name: "Ripple",
    price: 0.5234,
    change24h: 0.0123,
    changePercent24h: 2.41,
    volume: 2100000000,
    marketCap: 28400000000
  },
  {
    symbol: "BNB",
    name: "Binance Coin",
    price: 512.89,
    change24h: -5.67,
    changePercent24h: -1.09,
    volume: 1800000000,
    marketCap: 78000000000
  },
  {
    symbol: "ADA",
    name: "Cardano",
    price: 0.4123,
    change24h: 0.0089,
    changePercent24h: 2.21,
    volume: 890000000,
    marketCap: 14500000000
  },
  {
    symbol: "DOT",
    name: "Polkadot",
    price: 5.234,
    change24h: -0.123,
    changePercent24h: -2.30,
    volume: 450000000,
    marketCap: 6700000000
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    price: 15.67,
    change24h: 0.89,
    changePercent24h: 6.02,
    volume: 1200000000,
    marketCap: 9200000000
  },
  {
    symbol: "MATIC",
    name: "Polygon",
    price: 0.8234,
    change24h: 0.0234,
    changePercent24h: 2.92,
    volume: 670000000,
    marketCap: 7800000000
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    price: 25.67,
    change24h: -0.89,
    changePercent24h: -3.35,
    volume: 890000000,
    marketCap: 9500000000
  }
];

export function EnhancedCryptoChart() {
  const navigate = useNavigate();
  const [cryptoData, setCryptoData] = useState<CryptoData[]>(CRYPTO_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);

  // Simulate real-time price updates
  const updatePrices = () => {
    setCryptoData(prev => prev.map(crypto => {
      const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
      const newPrice = crypto.price * (1 + variation);
      const change24h = newPrice - crypto.price;
      const changePercent24h = (change24h / crypto.price) * 100;
      
      return {
        ...crypto,
        price: newPrice,
        change24h,
        changePercent24h
      };
    }));
  };

  // Refresh data
  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    updatePrices();
    setIsLoading(false);
  };

  // Auto-update prices every 30 seconds
  useEffect(() => {
    const interval = setInterval(updatePrices, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle crypto click
  const handleCryptoClick = (symbol: string) => {
    setSelectedCrypto(symbol);
    setTimeout(() => {
      navigate(`/trading/${symbol}`);
    }, 300);
  };

  // Format price
  const formatPrice = (price: number) => {
    if (price < 1) return price.toFixed(4);
    if (price < 1000) return price.toFixed(2);
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Format volume
  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(1)}K`;
    return `$${volume.toFixed(0)}`;
  };

  return (
    <Card className="bg-black border-gray-800">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Live Crypto Market</h2>
            <p className="text-gray-400">Real-time cryptocurrency prices and trading</p>
          </div>
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={isLoading}
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Crypto Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cryptoData.map((crypto) => (
            <div
              key={crypto.symbol}
              className={`
                relative p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:scale-105
                ${selectedCrypto === crypto.symbol 
                  ? 'bg-purple-900/20 border-purple-500' 
                  : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
                }
              `}
              onClick={() => handleCryptoClick(crypto.symbol)}
            >
              {/* Price Change Animation */}
              <div className="absolute top-2 right-2">
                {crypto.changePercent24h > 0 ? (
                  <div className="flex items-center gap-1 text-green-400 animate-pulse">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-medium">+{crypto.changePercent24h.toFixed(2)}%</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-400 animate-pulse">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-xs font-medium">{crypto.changePercent24h.toFixed(2)}%</span>
                  </div>
                )}
              </div>

              {/* Crypto Info */}
              <div className="space-y-3">
                {/* Symbol and Name */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{crypto.symbol}</h3>
                    <p className="text-sm text-gray-400">{crypto.name}</p>
                  </div>
                  <Badge 
                    variant={crypto.changePercent24h > 0 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {crypto.changePercent24h > 0 ? "BULL" : "BEAR"}
                  </Badge>
                </div>

                {/* Price */}
                <div>
                  <div className="text-2xl font-bold text-white">
                    ${formatPrice(crypto.price)}
                  </div>
                  <div className={`text-sm ${crypto.changePercent24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {crypto.changePercent24h > 0 ? '+' : ''}{crypto.changePercent24h.toFixed(2)}% 
                    ({crypto.change24h > 0 ? '+' : ''}${formatPrice(Math.abs(crypto.change24h))})
                  </div>
                </div>

                {/* Volume */}
                <div className="text-xs text-gray-400">
                  Volume: {formatVolume(crypto.volume)}
                </div>

                {/* Trading Button */}
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  size="sm"
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Trade {crypto.symbol}
                </Button>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Market Summary */}
        <div className="mt-8 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Market Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">
                {cryptoData.filter(c => c.changePercent24h > 0).length}
              </div>
              <div className="text-sm text-gray-400">Gaining</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {cryptoData.filter(c => c.changePercent24h < 0).length}
              </div>
              <div className="text-sm text-gray-400">Declining</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                ${formatVolume(cryptoData.reduce((sum, c) => sum + c.volume, 0))}
              </div>
              <div className="text-sm text-gray-400">Total Volume</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {cryptoData.length}
              </div>
              <div className="text-sm text-gray-400">Cryptocurrencies</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-700">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 animate-pulse" />
            <div>
              <h4 className="font-medium text-blue-300">How to Trade</h4>
              <p className="text-sm text-blue-200 mt-1">
                Click on any cryptocurrency above to start trading. You'll be redirected to the trading page where you can place UP/DOWN trades with automated 50-50 resolution.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
