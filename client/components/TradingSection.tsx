import { TrendingDown, TrendingUp, MoreHorizontal } from "lucide-react";

interface CryptoData {
  symbol: string;
  name: string;
  price: string;
  change: string;
  isPositive: boolean;
}

const cryptoData: CryptoData[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: "$100,704.70",
    change: "-0.46%",
    isPositive: false,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: "$3,256.66",
    change: "+2.34%",
    isPositive: true,
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: "$217.82",
    change: "-1.23%",
    isPositive: false,
  },
];

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
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Top Trade</h3>
        <button className="text-primary text-sm font-medium hover:underline">
          More
        </button>
      </div>

      <div className="space-y-3">
        {cryptoData.map((crypto) => (
          <div
            key={crypto.symbol}
            className="bg-card rounded-xl p-4 border border-border"
          >
            <div className="flex items-center justify-between">
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

              <div className="flex items-center gap-4">
                <MiniChart isPositive={crypto.isPositive} />
                <div className="text-right">
                  <div className="font-semibold">{crypto.price}</div>
                  <div
                    className={`text-sm flex items-center gap-1 ${
                      crypto.isPositive
                        ? "text-chart-positive"
                        : "text-chart-negative"
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
