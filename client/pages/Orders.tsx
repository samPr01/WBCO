// @ts-nocheck
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  DollarSign,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Filter
} from "lucide-react";

interface Trade {
  _id: string;
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
  tradeType: string;
  returnPercentage: number;
  fee: number;
  actualDirection?: string;
  totalReturn?: number;
}

const TRADE_TYPES = ['All', 'Option', 'Contract', 'Intelligent AI Trading', 'Loan'];

export default function Orders() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  
  const [trades, setTrades] = useState<Trade[]>([]);
  const [expandedTrade, setExpandedTrade] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const API_BASE = import.meta.env.VITE_TRADING_API_URL || 'http://localhost:3003';

  // Fetch user's trades
  const fetchTrades = async (pageNum = 1, append = false) => {
    if (!isConnected || !address) return;
    
    setIsLoading(true);
    
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20'
      });
      
      if (selectedType !== 'All') {
        params.append('tradeType', selectedType.toLowerCase());
      }
      
      const response = await fetch(`${API_BASE}/api/trades/${address}?${params}`);
      const data = await response.json();
      
      if (data.success) {
        if (append) {
          setTrades(prev => [...prev, ...data.trades]);
        } else {
          setTrades(data.trades);
        }
        
        setHasMore(data.trades.length === 20);
        setPage(pageNum);
      } else {
        toast.error(data.message || "Failed to fetch trades");
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
      toast.error("Failed to fetch trades");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades(1, false);
  }, [isConnected, address, selectedType]);

  const toggleTradeExpansion = (tradeId: string) => {
    setExpandedTrade(expandedTrade === tradeId ? null : tradeId);
  };

  const buyAgain = (trade: Trade) => {
    navigate(`/trading/${trade.symbol}`, {
      state: {
        amount: trade.amount,
        duration: trade.duration,
        tradeType: trade.tradeType
      }
    });
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusIcon = (trade: Trade) => {
    if (trade.status === 'pending') {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    }
    
    if (trade.status === 'completed') {
      return trade.isWin ? 
        <CheckCircle className="w-4 h-4 text-green-600" /> : 
        <XCircle className="w-4 h-4 text-red-600" />;
    }
    
    return <Clock className="w-4 h-4 text-muted-foreground" />;
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
              Please connect your wallet to view your order history.
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Your trading history and order details</p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchTrades(1, false)}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TRADE_TYPES.map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(type)}
            className="whitespace-nowrap"
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Trades List */}
      <div className="space-y-3">
        {trades.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start trading to see your order history here.
              </p>
              <Button onClick={() => navigate('/market')}>
                Start Trading
              </Button>
            </CardContent>
          </Card>
        ) : (
          trades.map((trade) => (
            <Card key={trade._id} className="overflow-hidden">
              {/* Trade Summary */}
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{trade.symbol}</span>
                      <Badge variant="outline">{formatDuration(trade.duration)}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(trade)}
                      <span className="text-sm capitalize">{trade.prediction}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`text-right ${trade.profit && trade.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <div className="font-bold text-lg">
                        {trade.profit ? (trade.profit > 0 ? '+' : '') + `$${trade.profit.toFixed(2)}` : 'Pending'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {trade.amount} {trade.symbol}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTradeExpansion(trade._id)}
                    >
                      {expandedTrade === trade._id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedTrade === trade._id && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    {/* Trade Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Open Time</div>
                        <div className="font-medium">{formatDateTime(trade.openTime)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Close Time</div>
                        <div className="font-medium">
                          {trade.closeTime ? formatDateTime(trade.closeTime) : 'Pending'}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Amount</div>
                        <div className="font-medium">${trade.amount.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Fee</div>
                        <div className="font-medium">${trade.fee.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Open Price</div>
                        <div className="font-medium">${formatPrice(trade.openPrice)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Close Price</div>
                        <div className="font-medium">
                          {trade.closePrice ? `$${formatPrice(trade.closePrice)}` : 'Pending'}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Return %</div>
                        <div className="font-medium">{trade.returnPercentage}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Expected Return</div>
                        <div className="font-medium">${trade.expectedReturn.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Trade Result */}
                    {trade.status === 'completed' && (
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-muted-foreground">Result</div>
                            <div className={`font-bold ${trade.isWin ? 'text-green-600' : 'text-red-600'}`}>
                              {trade.isWin ? 'WIN' : 'LOSS'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Actual Direction</div>
                            <div className="font-medium capitalize">{trade.actualDirection}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Total Return</div>
                            <div className="font-medium">
                              ${trade.totalReturn ? trade.totalReturn.toFixed(2) : '0.00'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Buy Again Button */}
                    <div className="flex justify-center">
                      <Button
                        onClick={() => buyAgain(trade)}
                        className="w-full max-w-xs"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Buy Again
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && trades.length > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => fetchTrades(page + 1, true)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

