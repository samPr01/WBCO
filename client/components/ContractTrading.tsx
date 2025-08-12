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
import { Slider } from "@/components/ui/slider";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Target,
  AlertTriangle,
  AlertCircle,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { useDemoTrading } from "@/contexts/DemoTradingContext";

interface FuturesContract {
  id: string;
  asset: string;
  contractSize: number;
  currentPrice: number;
  tickSize: number;
  tickValue: number;
  expiry: string;
  marginRequired: number;
}

const FUTURES_CONTRACTS: FuturesContract[] = [
  {
    id: "BTCUSD-DEC24",
    asset: "BTC/USD",
    contractSize: 1,
    currentPrice: 100704.7,
    tickSize: 5,
    tickValue: 5,
    expiry: "2024-12-29",
    marginRequired: 15000,
  },
  {
    id: "ETHUSD-DEC24",
    asset: "ETH/USD",
    contractSize: 10,
    currentPrice: 3256.66,
    tickSize: 0.25,
    tickValue: 2.5,
    expiry: "2024-12-29",
    marginRequired: 5000,
  },
  {
    id: "SOLUSD-DEC24",
    asset: "SOL/USD",
    contractSize: 100,
    currentPrice: 217.82,
    tickSize: 0.01,
    tickValue: 1,
    expiry: "2024-12-29",
    marginRequired: 2000,
  },
];

export function ContractTrading() {
  const { isDemoMode, demoBalance, addTrade } = useDemoTrading();
  const [selectedContract, setSelectedContract] =
    useState<FuturesContract | null>(null);
  const [orderType, setOrderType] = useState<"LONG" | "SHORT">("LONG");
  const [quantity, setQuantity] = useState(1);
  const [leverage, setLeverage] = useState([10]);
  const [stopLoss, setStopLoss] = useState(0);
  const [takeProfit, setTakeProfit] = useState(0);

  const currentLeverage = leverage[0];
  const marginRequired = selectedContract
    ? (selectedContract.marginRequired * quantity) / currentLeverage
    : 0;
  const notionalValue = selectedContract
    ? selectedContract.currentPrice * selectedContract.contractSize * quantity
    : 0;

  const handleContractTrade = () => {
    if (!isDemoMode) {
      toast.error("Demo mode must be enabled to trade futures");
      return;
    }

    if (!selectedContract) {
      toast.error("Please select a futures contract");
      return;
    }

    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    if (marginRequired > demoBalance) {
      toast.error("Insufficient margin");
      return;
    }

    const trade = {
      asset: `${selectedContract.asset} ${orderType} ${currentLeverage}x`,
      timeframe: `Until ${selectedContract.expiry}`,
      amount: marginRequired,
      prediction: orderType === "LONG" ? ("UP" as const) : ("DOWN" as const),
      expectedReturn: marginRequired * 2, // Potential 200% return for futures
      entryPrice: selectedContract.currentPrice,
      expiresAt: new Date(selectedContract.expiry),
    };

    addTrade(trade);
    toast.success(
      `${orderType} ${quantity} ${selectedContract.asset} contract(s) opened at ${currentLeverage}x leverage!`,
    );
  };

  const calculateLiquidationPrice = () => {
    if (!selectedContract) return 0;

    const maintenanceMargin = 0.005; // 0.5% maintenance margin
    if (orderType === "LONG") {
      return (
        selectedContract.currentPrice *
        (1 - 1 / currentLeverage + maintenanceMargin)
      );
    } else {
      return (
        selectedContract.currentPrice *
        (1 + 1 / currentLeverage - maintenanceMargin)
      );
    }
  };

  return (
    <div className="space-y-6">
      {!isDemoMode && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Enable demo mode in Settings to start futures trading
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Futures Contract Trading
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Available Contracts */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              Available Futures Contracts
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {FUTURES_CONTRACTS.map((contract) => (
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
                    <div className="text-center space-y-2">
                      <div className="font-bold text-lg">{contract.asset}</div>
                      <div className="text-2xl font-bold text-primary">
                        ${contract.currentPrice.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Size: {contract.contractSize} • Expires:{" "}
                        {contract.expiry}
                      </div>
                      <Badge variant="outline">
                        Margin: ${contract.marginRequired.toLocaleString()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Trading Interface */}
          {selectedContract && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Order Setup */}
                  <div className="space-y-4">
                    <div>
                      <Label>Position Direction</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Button
                          variant={orderType === "LONG" ? "default" : "outline"}
                          onClick={() => setOrderType("LONG")}
                          className={
                            orderType === "LONG"
                              ? "bg-green-600 hover:bg-green-700"
                              : ""
                          }
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          LONG
                        </Button>
                        <Button
                          variant={
                            orderType === "SHORT" ? "default" : "outline"
                          }
                          onClick={() => setOrderType("SHORT")}
                          className={
                            orderType === "SHORT"
                              ? "bg-red-600 hover:bg-red-700"
                              : ""
                          }
                        >
                          <TrendingDown className="w-4 h-4 mr-2" />
                          SHORT
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        min="1"
                        disabled={!isDemoMode}
                      />
                    </div>

                    <div>
                      <Label>Leverage: {currentLeverage}x</Label>
                      <div className="mt-2">
                        <Slider
                          value={leverage}
                          onValueChange={setLeverage}
                          max={100}
                          min={1}
                          step={1}
                          disabled={!isDemoMode}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>1x</span>
                          <span>25x</span>
                          <span>50x</span>
                          <span>100x</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Risk Management */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="stopLoss">Stop Loss ($)</Label>
                      <Input
                        id="stopLoss"
                        type="number"
                        value={stopLoss || ""}
                        onChange={(e) =>
                          setStopLoss(parseFloat(e.target.value) || 0)
                        }
                        placeholder="Optional"
                        disabled={!isDemoMode}
                      />
                    </div>

                    <div>
                      <Label htmlFor="takeProfit">Take Profit ($)</Label>
                      <Input
                        id="takeProfit"
                        type="number"
                        value={takeProfit || ""}
                        onChange={(e) =>
                          setTakeProfit(parseFloat(e.target.value) || 0)
                        }
                        placeholder="Optional"
                        disabled={!isDemoMode}
                      />
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Margin Required:</span>
                        <span className="font-medium">
                          ${marginRequired.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Notional Value:</span>
                        <span className="font-medium">
                          ${notionalValue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Liquidation Price:</span>
                        <span className="font-medium text-red-500">
                          ${calculateLiquidationPrice().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <Card className="border-orange-500/20 bg-orange-500/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-medium text-orange-600">
                          High Risk Trading
                        </div>
                        <div className="text-sm text-orange-600/80">
                          Futures trading with leverage can result in
                          significant losses. At {currentLeverage}x leverage, a{" "}
                          {(100 / currentLeverage).toFixed(1)}% adverse price
                          movement could liquidate your position.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={handleContractTrade}
                  disabled={!isDemoMode || marginRequired > demoBalance}
                  className="w-full"
                  size="lg"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Open {orderType} Position - ${marginRequired.toLocaleString()}{" "}
                  Margin
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Trading Info */}
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Futures Trading Guide</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>LONG:</strong> Profit when price increases
                </p>
                <p>
                  <strong>SHORT:</strong> Profit when price decreases
                </p>
                <p>
                  <strong>Leverage:</strong> Amplifies both profits and losses
                </p>
                <p>
                  <strong>Margin:</strong> Required collateral to open position
                </p>
                <p>
                  <strong>Liquidation:</strong> Position closed when losses
                  exceed margin
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
