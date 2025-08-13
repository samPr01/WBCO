// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Target,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useDemoTrading } from "@/contexts/DemoTradingContext";

interface OptionContract {
  id: string;
  type: "CALL" | "PUT";
  asset: string;
  strikePrice: number;
  premium: number;
  expiry: string;
  impliedVolatility: number;
}

const OPTION_CONTRACTS: OptionContract[] = [
  {
    id: "BTC-CALL-105000",
    type: "CALL",
    asset: "BTC",
    strikePrice: 105000,
    premium: 2500,
    expiry: "2024-12-31",
    impliedVolatility: 0.65,
  },
  {
    id: "BTC-PUT-95000",
    type: "PUT",
    asset: "BTC",
    strikePrice: 95000,
    premium: 1800,
    expiry: "2024-12-31",
    impliedVolatility: 0.72,
  },
  {
    id: "ETH-CALL-4000",
    type: "CALL",
    asset: "ETH",
    strikePrice: 4000,
    premium: 180,
    expiry: "2024-12-31",
    impliedVolatility: 0.58,
  },
  {
    id: "ETH-PUT-3000",
    type: "PUT",
    asset: "ETH",
    strikePrice: 3000,
    premium: 120,
    expiry: "2024-12-31",
    impliedVolatility: 0.61,
  },
];

export function OptionsTrading() {
  const { isDemoMode, demoBalance, addTrade } = useDemoTrading();
  const [selectedContract, setSelectedContract] =
    useState<OptionContract | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<"BUY" | "SELL">("BUY");

  const totalCost = selectedContract ? selectedContract.premium * quantity : 0;

  const handleOptionTrade = () => {
    if (!isDemoMode) {
      toast.error("Demo mode must be enabled to trade options");
      return;
    }

    if (!selectedContract) {
      toast.error("Please select an option contract");
      return;
    }

    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    if (totalCost > demoBalance) {
      toast.error("Insufficient demo balance");
      return;
    }

    const trade = {
      asset: `${selectedContract.asset} ${selectedContract.type} $${selectedContract.strikePrice}`,
      timeframe: `Until ${selectedContract.expiry}`,
      amount: totalCost,
      prediction:
        selectedContract.type === "CALL" ? ("UP" as const) : ("DOWN" as const),
      expectedReturn: totalCost * 0.5, // 50% potential return for options
      entryPrice: selectedContract.premium,
      expiresAt: new Date(selectedContract.expiry),
    };

    addTrade(trade);
    toast.success(
      `${orderType} ${quantity} ${selectedContract.asset} ${selectedContract.type} option(s) placed!`,
    );
  };

  return (
    <div className="space-y-6">
      {!isDemoMode && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Enable demo mode in Settings to start options trading
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Options Trading
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Available Options */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              Available Option Contracts
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {OPTION_CONTRACTS.map((contract) => (
                <Card
                  key={contract.id}
                  className={`cursor-pointer transition-all ${
                    selectedContract?.id === contract.id
                      ? "ring-2 ring-primary border-primary"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedContract(contract)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            contract.type === "CALL" ? "default" : "destructive"
                          }
                        >
                          {contract.type}
                        </Badge>
                        <span className="font-semibold">{contract.asset}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          Premium
                        </div>
                        <div className="font-bold">${contract.premium}</div>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Strike Price:
                        </span>
                        <span>${contract.strikePrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expiry:</span>
                        <span>{contract.expiry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IV:</span>
                        <span>
                          {(contract.impliedVolatility * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Details */}
          {selectedContract && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="orderType">Order Type</Label>
                    <Select
                      value={orderType}
                      onValueChange={(value: "BUY" | "SELL") =>
                        setOrderType(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUY">BUY TO OPEN</SelectItem>
                        <SelectItem value="SELL">SELL TO OPEN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      min="1"
                      disabled={!isDemoMode}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Total Cost
                    </div>
                    <div className="text-lg font-bold">
                      ${totalCost.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Max Profit
                    </div>
                    <div className="text-lg font-bold text-green-500">
                      $
                      {selectedContract.type === "CALL"
                        ? "Unlimited"
                        : (
                            selectedContract.strikePrice * quantity
                          ).toLocaleString()}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleOptionTrade}
                  disabled={!isDemoMode || totalCost > demoBalance}
                  className="w-full"
                  size="lg"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  {orderType} {quantity} Contract{quantity > 1 ? "s" : ""} for $
                  {totalCost.toLocaleString()}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Options Info */}
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Options Trading Guide</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>CALL Options:</strong> Profit when the asset price
                  goes above the strike price
                </p>
                <p>
                  <strong>PUT Options:</strong> Profit when the asset price goes
                  below the strike price
                </p>
                <p>
                  <strong>Premium:</strong> The cost to buy the option contract
                </p>
                <p>
                  <strong>Implied Volatility (IV):</strong> Market's expectation
                  of price movement
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

