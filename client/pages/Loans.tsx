// @ts-nocheck
import { Clock, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { useDemoTrading } from "@/contexts/DemoTradingContext";

const investmentPlans = [
  {
    days: "1 Days",
    amount: "$200 - $10000",
    dailyIncome: "0.15% - 0.80%",
    totalReturn: "0.15% - 0.80%",
    icon: Clock,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    days: "5 Days",
    amount: "$1000 - $50000",
    dailyIncome: "0.30% - 1.50%",
    totalReturn: "1.50% - 7.50%",
    icon: Calendar,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    days: "30 Days",
    amount: "$5000 - $100000",
    dailyIncome: "1.00% - 3.50%",
    totalReturn: "30.0% - 105%",
    icon: TrendingUp,
    gradient: "from-purple-500 to-pink-500",
  },
];

export default function Loans() {
  const { isDemoMode, demoBalance } = useDemoTrading();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="bg-gradient-to-r from-gradient-start to-gradient-end rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-white/80">
              Intelligent AI Trading
            </h2>
            <div className="mt-2">
              <div className="text-sm text-white/60">
                {isDemoMode ? "Demo Balance" : "Total Planned Amount"}
              </div>
              <div className="text-2xl font-bold">
                {isDemoMode
                  ? `$${demoBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                  : "$0"}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/60">Cumulative ROI</div>
            <div className="text-2xl font-bold">0.00%</div>
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold mb-2">Intelligent AI Trading</h1>
        <p className="text-muted-foreground mb-6">
          Choose the perfect investment plan for your financial goals
        </p>

        <div className="space-y-4">
          {investmentPlans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={index}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${plan.gradient} rounded-lg flex items-center justify-center`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{plan.days}</h3>
                        <div className="text-sm text-muted-foreground">
                          Duration
                        </div>
                      </div>
                    </div>
                    <button className="bg-gradient-to-r from-gradient-start to-gradient-end text-white px-6 py-2 rounded-lg font-medium">
                      Invest Now
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Amount Range
                      </div>
                      <div className="font-semibold">{plan.amount}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Daily Income
                      </div>
                      <div className="font-semibold text-chart-positive">
                        {plan.dailyIncome}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Total Return
                      </div>
                      <div className="font-semibold text-chart-positive">
                        {plan.totalReturn}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 px-6 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Risk Level:</span>
                    <span className="font-medium">
                      {index === 0 ? "Low" : index === 1 ? "Medium" : "High"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="font-semibold mb-4">Active Investments</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <div>
              <div className="font-medium">5 Day Plan</div>
              <div className="text-sm text-muted-foreground">
                Started 2 days ago
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-chart-positive">+$156.80</div>
              <div className="text-sm text-muted-foreground">
                $5,000 invested
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <div>
              <div className="font-medium">30 Day Plan</div>
              <div className="text-sm text-muted-foreground">
                Started 15 days ago
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-chart-positive">
                +$2,247.33
              </div>
              <div className="text-sm text-muted-foreground">
                $10,000 invested
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
