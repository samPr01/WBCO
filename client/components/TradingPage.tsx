// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  Clock, 
  DollarSign,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";

interface Trade {
  id: string;
  symbol: string;
  amount: number;
  duration: number;
  prediction: string;
  openPrice: number;
  closePrice?: number;
  expectedReturn: number;
  profit?: number;
  status: 'pending' | 'completed';
  isWin?: boolean;
  openTime: string;
  closeTime?: string;
}

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  openPrice: number;
  closePrice: number;
}

const TRADING_OPTIONS = [
  { duration: 60, return: 20 },
  { duration: 120, return: 30 },
  { duration: 180, return: 40 },
  { duration: 360, return: 50 },
  { duration: 7200, return: 60 },
  { duration: 21600, return: 80 }
];

const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '1D', '1W', '1M'];

export function TradingPage() {
  const { symbol = 'BTC' } = useParams();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  
  const [tradeType, setTradeType] = useState<'option' | 'contract'>('option');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [amount, setAmount] = useState('');
  const [expectedReturn, setExpectedReturn] = useState(0);
  const [isPlacingTrade, setIsPlacingTrade] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  
  const API_BASE = import.meta.env.VITE_TRADING_API_URL || 'http://localhost:3003';

  // WebSocket connection for real-time updates
  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:3004');
    
    websocket.onopen = () => {
      console.log('WebSocket connected');
    };
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'trade_resolved') {
        const resolvedTrade = data.data;
        setRecentTrades(prev => 
          prev.map(trade => 
            trade.id === resolvedTrade._id 
              ? { ...trade, ...resolvedTrade, id: resolvedTrade._id }
              : trade
          )
        );
        
        // Show notification
        if (resolvedTrade.isWin) {
          toast.success(`🎉 Trade won! +$${resolvedTrade.profit.toFixed(2)}`);
        } else {
          toast.error(`❌ Trade lost! -$${Math.abs(resolvedTrade.profit).toFixed(2)}`);
        }
      }
    };
    
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    setWs(websocket);
    
    return () => {
      websocket.close();
    };
  }, []);

  // Fetch current price data
  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/prices`);
        const data = await response.json();
        
        if (data.success && data.prices[symbol]) {
          const price = data.prices[symbol];
          const change = (Math.random() - 0.5) * 1000; // Simulated change
          
          setPriceData({
            symbol,
            price,
            change24h: change,
            changePercent24h: (change / price) * 100,
            high24h: price * 1.02,
            low24h: price * 0.98,
            openPrice: price * 0.99,
            closePrice: price
          });
        }
      } catch (error) {
        console.error('Error fetching price data:', error);
      }
    };

    fetchPriceData();
    const interval = setInterval(fetchPriceData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [symbol, API_BASE]);

  // Calculate expected return when amount or duration changes
  useEffect(() => {
    if (amount && selectedDuration) {
      const option = TRADING_OPTIONS.find(opt => opt.duration === selectedDuration);
      if (option) {
        const returnAmount = (parseFloat(amount) * option.return) / 100;
        setExpectedReturn(returnAmount);
      }
    } else {
      setExpectedReturn(0);
    }
  }, [amount, selectedDuration]);

  // Fetch user's recent trades
  useEffect(() => {
    if (isConnected && address) {
      const fetchRecentTrades = async () => {
        try {
          const response = await fetch(`${API_BASE}/api/trades/${address}?limit=5`);
          const data = await response.json();
          
          if (data.success) {
            setRecentTrades(data.trades.map((trade: any) => ({
              ...trade,
              id: trade._id
            })));
          }
        } catch (error) {
          console.error('Error fetching recent trades:', error);
        }
      };

      fetchRecentTrades();
    }
  }, [isConnected, address, API_BASE]);

  const placeTrade = async (prediction: 'up' | 'down') => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsPlacingTrade(true);

    try {
      const response = await fetch(`${API_BASE}/api/trade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: address,
          symbol: symbol.toUpperCase(),
          amount: parseFloat(amount),
          duration: selectedDuration,
          prediction,
          tradeType
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Trade placed successfully! ${prediction.toUpperCase()} ${symbol}`);
        
        // Add to recent trades
        const newTrade = {
          ...data.trade,
          id: data.trade.id,
          openTime: new Date().toISOString()
        };
        
        setRecentTrades(prev => [newTrade, ...prev.slice(0, 4)]);
        setAmount('');
        setExpectedReturn(0);
      } else {
        toast.error(data.message || "Failed to place trade");
      }
    } catch (error) {
      console.error('Error placing trade:', error);
      toast.error("Failed to place trade. Please try again.");
    } finally {
      setIsPlacingTrade(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price < 1) return price.toFixed(4);
    if (price < 1000) return price.toFixed(2);
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} Second`;
    if (seconds < 3600) return `${seconds / 60} Minute`;
    if (seconds < 86400) return `${seconds / 3600} Hour`;
    return `${seconds / 86400} Day`;
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-4">
              Please connect your wallet to start trading {symbol}.
            </p>
            <Button onClick={() => navigate('/')}>
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header with Symbol and Price */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{symbol}</span>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </div>
          {priceData && (
            <div className="flex items-center gap-4">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatPrice(priceData.price)}
                </div>
                <div className={`text-sm ${priceData.changePercent24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {priceData.changePercent24h >= 0 ? '+' : ''}{priceData.changePercent24h.toFixed(2)}%
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <div>High: {formatPrice(priceData.high24h)}</div>
                <div>Low: {formatPrice(priceData.low24h)}</div>
              </div>
              <div className="text-sm text-muted-foreground">
                <div>Open: {formatPrice(priceData.openPrice)}</div>
                <div>Close: {formatPrice(priceData.closePrice)}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart Placeholder */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {TIMEFRAMES.map((tf) => (
                <Button
                  key={tf}
                  variant={selectedTimeframe === tf ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(tf)}
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Simulated Chart */}
          <div className="bg-muted h-64 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-muted-foreground mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-muted-foreground">Live {symbol} Chart</p>
              <p className="text-xs text-muted-foreground">Real-time price data</p>
            </div>
          </div>
          
          {/* Buy/Sell Sentiment */}
          <div className="flex gap-4 mt-4">
            <div className="flex-1 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="text-green-600 font-medium">58.53% BUY</div>
            </div>
            <div className="flex-1 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <div className="text-red-600 font-medium">41.47% SELL</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trading Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Trade {symbol}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Trade Type Selection */}
            <div className="flex gap-2">
              <Button
                variant={tradeType === 'option' ? "default" : "outline"}
                className="flex-1"
                onClick={() => setTradeType('option')}
              >
                Option
              </Button>
              <Button
                variant={tradeType === 'contract' ? "default" : "outline"}
                className="flex-1"
                onClick={() => setTradeType('contract')}
              >
                Contract
              </Button>
            </div>

            {/* Time Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">Time</label>
              <div className="grid grid-cols-2 gap-2">
                {TRADING_OPTIONS.map((option) => (
                  <Button
                    key={option.duration}
                    variant={selectedDuration === option.duration ? "default" : "outline"}
                    className="flex flex-col items-center p-3 h-auto"
                    onClick={() => setSelectedDuration(option.duration)}
                  >
                    <div className="font-medium">{formatDuration(option.duration)}</div>
                    <div className="text-xs text-muted-foreground">{option.return}% Return</div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">Amount</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg"
              />
            </div>

            {/* Expected Return */}
            <div>
              <label className="text-sm font-medium mb-2 block">Expected Return</label>
              <div className="text-2xl font-bold text-green-600">
                $ {expectedReturn.toFixed(2)}
              </div>
            </div>

            {/* Trade Buttons */}
            <div className="flex gap-3">
              <Button
                variant="destructive"
                size="lg"
                className="flex-1"
                onClick={() => placeTrade('down')}
                disabled={isPlacingTrade}
              >
                {isPlacingTrade ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-2" />
                )}
                Down
              </Button>
              <Button
                variant="default"
                size="lg"
                className="flex-1"
                onClick={() => placeTrade('up')}
                disabled={isPlacingTrade}
              >
                {isPlacingTrade ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="w-4 h-4 mr-2" />
                )}
                Up
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTrades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  <p>No trades yet</p>
                  <p className="text-sm">Start trading to see your history</p>
                </div>
              ) : (
                recentTrades.map((trade) => (
                  <div key={trade.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{trade.symbol}</span>
                        <Badge variant="outline">{formatDuration(trade.duration)}</Badge>
                      </div>
                      <div className={`font-bold ${trade.profit && trade.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trade.profit ? (trade.profit > 0 ? '+' : '') + `$${trade.profit.toFixed(2)}` : 'Pending'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>Amount: ${trade.amount}</div>
                      <div>Return: {trade.returnPercentage}%</div>
                      <div>Open: ${formatPrice(trade.openPrice)}</div>
                      {trade.closePrice && <div>Close: ${formatPrice(trade.closePrice)}</div>}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        {trade.status === 'completed' ? (
                          trade.isWin ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )
                        ) : (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        <span className="text-xs capitalize">{trade.prediction}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/orders')}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
