// @ts-nocheck
import { useState } from "react";
import {
  Plus,
  Star,
  StarOff,
  TrendingUp,
  TrendingDown,
  Search,
} from "lucide-react";

interface CryptoItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  isWatched: boolean;
}

const allCryptos: CryptoItem[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    price: 100704.7,
    change24h: -0.46,
    marketCap: 1980000000000,
    volume24h: 28500000000,
    isWatched: true,
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    price: 3256.66,
    change24h: 2.34,
    marketCap: 391000000000,
    volume24h: 15200000000,
    isWatched: true,
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    price: 217.82,
    change24h: -1.23,
    marketCap: 103000000000,
    volume24h: 3400000000,
    isWatched: false,
  },
  {
    id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    price: 0.89,
    change24h: 3.45,
    marketCap: 31200000000,
    volume24h: 890000000,
    isWatched: false,
  },
  {
    id: "polygon",
    symbol: "MATIC",
    name: "Polygon",
    price: 0.92,
    change24h: -2.17,
    marketCap: 9100000000,
    volume24h: 520000000,
    isWatched: false,
  },
  {
    id: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    price: 23.45,
    change24h: 1.89,
    marketCap: 14800000000,
    volume24h: 730000000,
    isWatched: true,
  },
  {
    id: "avalanche",
    symbol: "AVAX",
    name: "Avalanche",
    price: 42.12,
    change24h: -0.78,
    marketCap: 16500000000,
    volume24h: 450000000,
    isWatched: false,
  },
  {
    id: "polkadot",
    symbol: "DOT",
    name: "Polkadot",
    price: 7.23,
    change24h: 4.12,
    marketCap: 10200000000,
    volume24h: 340000000,
    isWatched: false,
  },
];

export function WatchlistManager() {
  const [cryptos, setCryptos] = useState(allCryptos);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"watchlist" | "all">("watchlist");

  const toggleWatchlist = (id: string) => {
    setCryptos((prev) =>
      prev.map((crypto) =>
        crypto.id === id ? { ...crypto, isWatched: !crypto.isWatched } : crypto,
      ),
    );
  };

  const filteredCryptos = cryptos.filter((crypto) => {
    const matchesSearch =
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || crypto.isWatched;
    return matchesSearch && matchesTab;
  });

  const formatPrice = (price: number) => {
    if (price > 1000) {
      return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(2)}`;
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) {
      return `$${(cap / 1e12).toFixed(2)}T`;
    } else if (cap >= 1e9) {
      return `$${(cap / 1e9).toFixed(2)}B`;
    } else if (cap >= 1e6) {
      return `$${(cap / 1e6).toFixed(2)}M`;
    }
    return `$${cap.toLocaleString()}`;
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("watchlist")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "watchlist"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            My Watchlist
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All Cryptos
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-muted border border-border rounded-lg min-w-[250px]"
          />
        </div>
      </div>

      {activeTab === "watchlist" &&
        filteredCryptos.length === 0 &&
        searchTerm === "" && (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No cryptocurrencies in watchlist
            </h3>
            <p className="text-muted-foreground mb-4">
              Add cryptocurrencies to your watchlist to track them easily
            </p>
            <button
              onClick={() => setActiveTab("all")}
              className="bg-gradient-to-r from-gradient-start to-gradient-end text-white px-4 py-2 rounded-lg font-medium"
            >
              Browse All Cryptos
            </button>
          </div>
        )}

      {filteredCryptos.length === 0 && searchTerm !== "" && (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground">
            Try searching with different terms
          </p>
        </div>
      )}

      {filteredCryptos.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-4 font-medium">Asset</th>
                  <th className="text-right p-4 font-medium">Price</th>
                  <th className="text-right p-4 font-medium">24h Change</th>
                  <th className="text-right p-4 font-medium hidden md:table-cell">
                    Market Cap
                  </th>
                  <th className="text-right p-4 font-medium hidden lg:table-cell">
                    Volume (24h)
                  </th>
                  <th className="text-center p-4 font-medium">Watch</th>
                </tr>
              </thead>
              <tbody>
                {filteredCryptos.map((crypto) => (
                  <tr
                    key={crypto.id}
                    className="border-t border-border hover:bg-muted/20 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {crypto.symbol}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold">{crypto.symbol}</div>
                          <div className="text-sm text-muted-foreground">
                            {crypto.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-semibold">
                      {formatPrice(crypto.price)}
                    </td>
                    <td className="p-4 text-right">
                      <div
                        className={`flex items-center justify-end gap-1 ${
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
                        <span className="font-medium">
                          {crypto.change24h >= 0 ? "+" : ""}
                          {crypto.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right font-medium hidden md:table-cell">
                      {formatMarketCap(crypto.marketCap)}
                    </td>
                    <td className="p-4 text-right font-medium hidden lg:table-cell">
                      {formatVolume(crypto.volume24h)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleWatchlist(crypto.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          crypto.isWatched
                            ? "text-yellow-500 hover:bg-yellow-500/10"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {crypto.isWatched ? (
                          <Star className="w-4 h-4 fill-current" />
                        ) : (
                          <StarOff className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

