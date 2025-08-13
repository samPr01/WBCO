// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink,
  Copy,
  Filter,
  Download
} from "lucide-react";
import { toast } from "sonner";

interface Payment {
  _id: string;
  coin: string;
  from: string;
  to: string;
  amount: number;
  hash: string;
  blockNumber?: number;
  timestamp: string;
  userId?: string;
  status: string;
  network: string;
}

interface PaymentStats {
  _id: string;
  totalAmount: number;
  count: number;
  lastPayment: string;
}

export function PaymentMonitor() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    coin: "",
    from: "",
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const API_BASE = import.meta.env.VITE_MONITOR_API_URL || "http://localhost:3002";

  const fetchPayments = async () => {
    try {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.coin && { coin: filters.coin }),
        ...(filters.from && { from: filters.from })
      });

      const response = await fetch(`${API_BASE}/api/payments?${params}`);
      if (!response.ok) throw new Error("Failed to fetch payments");
      
      const data = await response.json();
      setPayments(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payment data");
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/payments/stats`);
      if (!response.ok) throw new Error("Failed to fetch stats");
      
      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchPayments(), fetchStats()]);
    setIsRefreshing(false);
    toast.success("Payment data refreshed");
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchPayments(), fetchStats()]);
      setIsLoading(false);
    };

    loadData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [filters]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: number, coin: string) => {
    if (coin === "BTC") {
      return `${amount.toFixed(8)} BTC`;
    } else if (coin === "USDT") {
      return `$${amount.toFixed(2)} USDT`;
    } else {
      return `${amount.toFixed(6)} ETH`;
    }
  };

  const getExplorerUrl = (hash: string, network: string) => {
    if (network === "bitcoin") {
      return `https://blockstream.info/tx/${hash}`;
    } else {
      return `https://etherscan.io/tx/${hash}`;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const exportPayments = () => {
    const csvContent = [
      ["Coin", "From", "To", "Amount", "Hash", "Timestamp", "Status"],
      ...payments.map(p => [
        p.coin,
        p.from,
        p.to,
        p.amount.toString(),
        p.hash,
        new Date(p.timestamp).toISOString(),
        p.status
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Payments exported to CSV");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading payment data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat._id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat._id} Payments
              </CardTitle>
              <Badge variant="outline">{stat.count}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatAmount(stat.totalAmount, stat._id)}
              </div>
              <p className="text-xs text-muted-foreground">
                Last: {new Date(stat.lastPayment).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Payment Monitor
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportPayments}
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Select
              value={filters.coin}
              onValueChange={(value) => setFilters(prev => ({ ...prev, coin: value, page: 1 }))}
            >
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="All Coins" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Coins</SelectItem>
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="BTC">BTC</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Filter by sender address..."
              value={filters.from}
              onChange={(e) => setFilters(prev => ({ ...prev, from: e.target.value, page: 1 }))}
              className="flex-1"
            />
          </div>

          {/* Payments Table */}
          <div className="space-y-2">
            {payments.map((payment) => (
              <div
                key={payment._id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Badge variant={payment.status === 'confirmed' ? 'default' : 'secondary'}>
                    {payment.coin}
                  </Badge>
                  <div>
                    <div className="font-medium">
                      {formatAmount(payment.amount, payment.coin)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      From: {formatAddress(payment.from)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {new Date(payment.timestamp).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {payment.blockNumber ? `Block ${payment.blockNumber}` : ''}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(payment.hash)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(getExplorerUrl(payment.hash, payment.network), '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
