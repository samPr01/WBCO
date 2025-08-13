// @ts-nocheck
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Activity, Clock } from "lucide-react";

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

interface Trade {
  id: string;
  price: number;
  amount: number;
  side: "buy" | "sell";
  time: string;
}

const mockBuyOrders: OrderBookEntry[] = [
  { price: 100650.25, amount: 0.125, total: 12581.28 },
  { price: 100640.15, amount: 0.089, total: 8956.97 },
  { price: 100630.50, amount: 0.234, total: 23547.54 },
  { price: 100620.75, amount: 0.156, total: 15696.84 },
  { price: 100610.25, amount: 0.445, total: 44771.66 },
];

const mockSellOrders: OrderBookEntry[] = [
  { price: 100720.50, amount: 0.234, total: 23568.60 },
  { price: 100730.25, amount: 0.167, total: 16821.95 },
  { price: 100740.75, amount: 0.089, total: 8965.93 },
  { price: 100750.50, amount: 0.298, total: 30023.65 },
  { price: 100760.25, amount: 0.445, total: 44838.31 },
];

const mockRecentTrades: Trade[] = [
  { id: "1", price: 100704.70, amount: 0.025, side: "sell", time: "14:23:45" },
  { id: "2", price: 100710.25, amount: 0.156, side: "buy", time: "14:23:42" },
  { id: "3", price: 100698.50, amount: 0.089, side: "sell", time: "14:23:38" },
  { id: "4", price: 100715.75, amount: 0.234, side: "buy", time: "14:23:35" },
  { id: "5", price: 100692.25, amount: 0.067, side: "sell", time: "14:23:31" },
];

export function LiveExchange() {
  const [selectedPair, setSelectedPair] = useState("BTC/USD");
  const [currentPrice, setCurrentPrice] = useState(100704.70);
  const [priceChange, setPriceChange] = useState(-0.46);
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const randomChange = (Math.random() - 0.5) * 100;
      setCurrentPrice(prev => {
        const newPrice = prev + randomChange;
        const change = ((newPrice - 100704.70) / 100704.70) * 100;
        setPriceChange(change);
        return newPrice;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatChange = (change: number) => `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Live Exchange</h3>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Price Ticker */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between mb-4">
          <select 
            className="bg-transparent text-lg font-bold border-none outline-none"
            value={selectedPair}
            onChange={(e) => setSelectedPair(e.target.value)}
          >
            <option value="BTC/USD">BTC/USD</option>
            <option value="ETH/USD">ETH/USD</option>
            <option value="SOL/USD">SOL/USD</option>
          </select>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Real-time</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Price</div>
            <div className="text-2xl font-bold">{formatPrice(currentPrice)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">24h Change</div>
            <div className={`text-lg font-semibold flex items-center gap-1 ${priceChange >= 0 ? 'text-chart-positive' : 'text-chart-negative'}`}>
              {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {formatChange(priceChange)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">24h High</div>
            <div className="text-lg font-semibold">$101,245.80</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">24h Low</div>
            <div className="text-lg font-semibold">$99,856.42</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Interface */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h4 className="font-semibold mb-4">Place Order</h4>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setTradeType("buy")}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                  tradeType === "buy" 
                    ? "bg-chart-positive text-white" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setTradeType("sell")}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                  tradeType === "sell" 
                    ? "bg-chart-negative text-white" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Sell
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setOrderType("limit")}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  orderType === "limit" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Limit
              </button>
              <button
                onClick={() => setOrderType("market")}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  orderType === "market" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Market
              </button>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Amount (BTC)</label>
              <input
                type="number"
                placeholder="0.00000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2"
              />
            </div>

            {orderType === "limit" && (
              <div>
                <label className="text-sm font-medium mb-2 block">Price (USD)</label>
                <input
                  type="number"
                  placeholder={currentPrice.toFixed(2)}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2"
                />
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Available:</span>
                <span>$8,240.00</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span>${amount && price ? (parseFloat(amount) * parseFloat(price || currentPrice.toString())).toFixed(2) : '0.00'}</span>
              </div>
            </div>

            <button className={`w-full py-3 rounded-lg font-medium transition-colors ${
              tradeType === "buy" 
                ? "bg-chart-positive text-white hover:bg-chart-positive/90" 
                : "bg-chart-negative text-white hover:bg-chart-negative/90"
            }`}>
              {tradeType === "buy" ? "Buy" : "Sell"} {selectedPair.split('/')[0]}
            </button>
          </div>
        </div>

        {/* Order Book */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h4 className="font-semibold mb-4">Order Book</h4>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Price (USD)</span>
                <span>Amount (BTC)</span>
                <span>Total</span>
              </div>
              
              {/* Sell Orders */}
              <div className="space-y-1 mb-3">
                {mockSellOrders.reverse().map((order, index) => (
                  <div key={index} className="flex justify-between text-xs py-1 bg-chart-negative/5 rounded">
                    <span className="text-chart-negative font-mono">{formatPrice(order.price)}</span>
                    <span className="font-mono">{order.amount.toFixed(3)}</span>
                    <span className="font-mono">{order.total.toFixed(0)}</span>
                  </div>
                ))}
              </div>

              {/* Spread */}
              <div className="flex justify-center py-2 border-y border-border">
                <span className="text-sm font-semibold">
                  Spread: $16.00
                </span>
              </div>

              {/* Buy Orders */}
              <div className="space-y-1 mt-3">
                {mockBuyOrders.map((order, index) => (
                  <div key={index} className="flex justify-between text-xs py-1 bg-chart-positive/5 rounded">
                    <span className="text-chart-positive font-mono">{formatPrice(order.price)}</span>
                    <span className="font-mono">{order.amount.toFixed(3)}</span>
                    <span className="font-mono">{order.total.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h4 className="font-semibold mb-4">Recent Trades</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Price (USD)</span>
              <span>Amount (BTC)</span>
              <span>Time</span>
            </div>
            
            {mockRecentTrades.map((trade) => (
              <div key={trade.id} className="flex justify-between text-xs py-1">
                <span className={`font-mono ${trade.side === 'buy' ? 'text-chart-positive' : 'text-chart-negative'}`}>
                  {formatPrice(trade.price)}
                </span>
                <span className="font-mono">{trade.amount.toFixed(3)}</span>
                <span className="text-muted-foreground">{trade.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

