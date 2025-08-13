// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  BarChart3,
  Activity,
  DollarSign,
  Target
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { useChainId } from "wagmi";
import { DepositWithdraw } from "@/components/DepositWithdraw";

export default function Trading() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [activeTab, setActiveTab] = useState<"trading" | "deposit" | "portfolio">("trading");

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            ← Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Trading Platform</h1>
            <p className="text-muted-foreground">
              Connect your wallet to start trading
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Wallet Required</h3>
            <p className="text-muted-foreground mb-4">
              Please connect your wallet to access the trading platform.
            </p>
            <Button onClick={() => navigate("/")}>
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Trading Platform</h1>
          <p className="text-muted-foreground">
            Trade cryptocurrencies with advanced tools
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          Chain ID: {chainId || "Unknown"}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trading" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Trading
          </TabsTrigger>
          <TabsTrigger value="deposit" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Deposit & Withdraw
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Portfolio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trading" className="space-y-6">
          {/* Market Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">BTC/USD</CardTitle>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$43,250.00</div>
                <p className="text-xs text-green-500">+2.5% (24h)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ETH/USD</CardTitle>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2,650.00</div>
                <p className="text-xs text-green-500">+1.8% (24h)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
                <Activity className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2.4B</div>
                <p className="text-xs text-muted-foreground">Total volume</p>
              </CardContent>
            </Card>
          </div>

          {/* Trading Interface */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Chart Placeholder */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Price Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Trading chart coming soon</p>
                    <p className="text-xs text-muted-foreground">
                      Advanced charting with indicators
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Place Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Order Type</label>
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" className="flex-1">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      Buy
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <ArrowDownLeft className="w-4 h-4 mr-1" />
                      Sell
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (ETH)</label>
                  <input
                    type="number"
                    placeholder="0.0"
                    className="w-full px-3 py-2 border rounded-md"
                    min="0"
                    step="0.001"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (USD)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border rounded-md"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Fee:</span>
                    <span>$0.00</span>
                  </div>
                </div>

                <Button className="w-full" disabled>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Place Order
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Trading functionality coming soon
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Order Book Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Order Book</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Order book coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposit" className="space-y-6">
          <DepositWithdraw />
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Portfolio Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Value</div>
                    <div className="text-2xl font-bold">$0.00</div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">24h Change</div>
                    <div className="text-2xl font-bold text-green-500">+0.00%</div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total P&L</div>
                    <div className="text-2xl font-bold">$0.00</div>
                  </div>
                </div>

                <div className="h-60 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Portfolio chart coming soon</p>
                    <p className="text-xs text-muted-foreground">
                      Performance tracking and analytics
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
