// @ts-nocheck
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Users,
  Activity,
  Filter,
  Download,
  RefreshCw,
  Search,
  Eye,
  EyeOff
} from "lucide-react";

interface Trade {
  _id: string;
  userId: string;
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

interface Stats {
  totalTrades: number;
  totalVolume: number;
  totalProfit: number;
  winRate: number;
}

export default function AdminPanel() {
  const { address, isConnected } = useAccount();
  
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalTrades: 0,
    totalVolume: 0,
    totalProfit: 0,
    winRate: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    symbol: '',
    userId: '',
    tradeType: ''
  });
  const [showUserIds, setShowUserIds] = useState(false);
  
  const API_BASE = import.meta.env.VITE_TRADING_API_URL || 'http://localhost:3003';

  // Check if user is admin (you can customize this logic)
  const isAdmin = address === '0x2499aDe1b915E12819e8E38B1d9ed3493107E2B1'; // Replace with actual admin address

  // Fetch all trades for admin
  const fetchTrades = async (pageNum = 1, append = false) => {
    if (!isConnected || !isAdmin) return;
    
    setIsLoading(true);
    
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '50'
      });
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`${API_BASE}/api/admin/trades?${params}`);
      const data = await response.json();
      
      if (data.success) {
        if (append) {
          setTrades(prev => [...prev, ...data.trades]);
        } else {
          setTrades(data.trades);
        }
        
        setStats(data.stats);
        setHasMore(data.trades.length === 50);
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
  }, [isConnected, isAdmin, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const exportTrades = () => {
    const csvContent = [
      ['ID', 'User ID', 'Symbol', 'Amount', 'Duration', 'Prediction', 'Status', 'Profit', 'Open Time', 'Close Time'],
      ...trades.map(trade => [
        trade._id,
        trade.userId,
        trade.symbol,
        trade.amount,
        trade.duration,
        trade.prediction,
        trade.status,
        trade.profit || 0,
        trade.openTime,
        trade.closeTime || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("Trades exported successfully");
  };

  const formatPrice = (price: number) => {
    if (price < 1) return price.toFixed(4);
    if (price < 1000) return price.toFixed(2);
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatUserId = (userId: string) => {
    if (showUserIds) return userId;
    return `${userId.slice(0, 6)}...${userId.slice(-4)}`;
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
            <p className="text-muted-foreground">
              Please connect your wallet to access the admin panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You don't have permission to access the admin panel.
            </p>
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
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Monitor all trading activity and statistics</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowUserIds(!showUserIds)}
          >
            {showUserIds ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showUserIds ? 'Hide' : 'Show'} User IDs
          </Button>
          <Button
            variant="outline"
            onClick={exportTrades}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={() => fetchTrades(1, false)}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Trades</p>
                <p className="text-2xl font-bold">{stats.totalTrades.toLocaleString()}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">${stats.totalVolume.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Profit</p>
                <p className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${stats.totalProfit.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold">{(stats.winRate * 100).toFixed(1)}%</p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                className="w-full p-2 border rounded-md"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Symbol</label>
              <select
                className="w-full p-2 border rounded-md"
                value={filters.symbol}
                onChange={(e) => handleFilterChange('symbol', e.target.value)}
              >
                <option value="">All</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="SOL">SOL</option>
                <option value="XRP">XRP</option>
                <option value="BNB">BNB</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Trade Type</label>
              <select
                className="w-full p-2 border rounded-md"
                value={filters.tradeType}
                onChange={(e) => handleFilterChange('tradeType', e.target.value)}
              >
                <option value="">All</option>
                <option value="option">Option</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">User ID</label>
              <Input
                placeholder="Search by user ID"
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trades Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Symbol</th>
                  <th className="text-left p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Duration</th>
                  <th className="text-left p-3 font-medium">Prediction</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Profit</th>
                  <th className="text-left p-3 font-medium">Open Time</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade._id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-mono text-sm">
                      {formatUserId(trade.userId)}
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{trade.symbol}</Badge>
                    </td>
                    <td className="p-3">${trade.amount.toFixed(2)}</td>
                    <td className="p-3">{formatDuration(trade.duration)}</td>
                    <td className="p-3">
                      <Badge 
                        variant={trade.prediction === 'up' ? 'default' : 'destructive'}
                        className="capitalize"
                      >
                        {trade.prediction}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge 
                        variant={trade.status === 'completed' ? 'default' : 'secondary'}
                      >
                        {trade.status}
                      </Badge>
                    </td>
                    <td className={`p-3 text-right font-medium ${
                      trade.profit && trade.profit > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trade.profit ? (trade.profit > 0 ? '+' : '') + `$${trade.profit.toFixed(2)}` : '-'}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {formatDateTime(trade.openTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {trades.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No trades found matching the current filters.
            </div>
          )}
          
          {hasMore && (
            <div className="text-center mt-4">
              <Button
                variant="outline"
                onClick={() => fetchTrades(page + 1, true)}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

