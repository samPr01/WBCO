import { ArrowDownRight, Send, FileText } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OptionsTrading } from "@/components/OptionsTrading";
import { ContractTrading } from "@/components/ContractTrading";
import { useDemoTrading } from "@/contexts/DemoTradingContext";

export default function Orders() {
  const navigate = useNavigate();
  const { isDemoMode, demoBalance, trades } = useDemoTrading();
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gradient-start to-gradient-end p-6 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <button className="text-sm font-medium text-white bg-white/20 px-3 py-1 rounded-lg">
                {isDemoMode ? "Demo Balance" : "Balance"}
              </button>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/60">
                Today, {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-3xl font-bold">
              {isDemoMode
                ? `$${demoBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                : "$0"}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/withdraw")}
              className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-3 flex items-center justify-center gap-2 transition-all hover:bg-white/30"
            >
              <Send className="w-4 h-4" />
              <span className="text-sm font-medium">Withdraw</span>
            </button>
            <button
              onClick={() => navigate("/deposits")}
              className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-3 flex items-center justify-center gap-2 transition-all hover:bg-white/30"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span className="text-sm font-medium">Deposit</span>
            </button>
          </div>
        </div>

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
        </div>
      </div>

      {/* Trading Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Trades</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="ai-trading">AI Trading</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Trading Activity</h2>
            {isDemoMode && (
              <div className="text-sm text-muted-foreground">
                Demo Mode • {trades.length} total trades
              </div>
            )}
          </div>

          {trades.length === 0 ? (
            <div className="bg-card rounded-xl border border-border">
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                  <FileText className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-muted-foreground">
                  No trades yet.
                </h3>
                <p className="text-muted-foreground">
                  Your trades, transfers and deposits will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left p-4 font-medium">Asset</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-right p-4 font-medium">Amount</th>
                      <th className="text-center p-4 font-medium">
                        Prediction
                      </th>
                      <th className="text-center p-4 font-medium">Status</th>
                      <th className="text-right p-4 font-medium">Return</th>
                      <th className="text-right p-4 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.slice(0, 20).map((trade) => (
                      <tr
                        key={trade.id}
                        className="border-t border-border hover:bg-muted/20 transition-colors"
                      >
                        <td className="p-4 font-medium">{trade.asset}</td>
                        <td className="p-4">
                          <div className="text-sm">{trade.timeframe}</div>
                        </td>
                        <td className="p-4 text-right">
                          ${trade.amount.toFixed(2)}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              trade.prediction === "UP"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {trade.prediction}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              trade.result === "WIN"
                                ? "bg-green-100 text-green-800"
                                : trade.result === "LOSS"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {trade.result}
                          </span>
                        </td>
                        <td
                          className={`p-4 text-right font-medium ${
                            trade.result === "WIN"
                              ? "text-green-500"
                              : trade.result === "LOSS"
                                ? "text-red-500"
                                : "text-muted-foreground"
                          }`}
                        >
                          {trade.result === "PENDING"
                            ? "-"
                            : trade.actualReturn >= 0
                              ? `+$${trade.actualReturn.toFixed(2)}`
                              : `$${trade.actualReturn.toFixed(2)}`}
                        </td>
                        <td className="p-4 text-right text-sm text-muted-foreground">
                          {trade.timestamp.toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="options">
          <OptionsTrading />
        </TabsContent>

        <TabsContent value="contracts">
          <ContractTrading />
        </TabsContent>

        <TabsContent value="ai-trading">
          <div className="bg-card rounded-xl border border-border">
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
              <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-muted-foreground">
                AI Trading Coming Soon
              </h3>
              <p className="text-muted-foreground">
                Intelligent AI trading algorithms will be available soon.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
