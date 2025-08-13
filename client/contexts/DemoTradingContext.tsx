// @ts-nocheck
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface DemoTrade {
  id: string;
  asset: string;
  timeframe: string;
  amount: number;
  prediction: "UP" | "DOWN";
  result: "WIN" | "LOSS" | "PENDING";
  expectedReturn: number;
  actualReturn: number;
  timestamp: Date;
  expiresAt: Date;
  entryPrice: number;
  exitPrice?: number;
}

interface DemoTradingContextType {
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  demoBalance: number;
  trades: DemoTrade[];
  addTrade: (
    trade: Omit<
      DemoTrade,
      "id" | "timestamp" | "result" | "actualReturn" | "exitPrice"
    >,
  ) => void;
  updateTradeResult: (
    tradeId: string,
    result: "WIN" | "LOSS",
    exitPrice: number,
  ) => void;
  resetDemo: () => void;
}

const DemoTradingContext = createContext<DemoTradingContextType | undefined>(
  undefined,
);

const INITIAL_DEMO_BALANCE = 100000; // $100,000 USD

export function DemoTradingProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoBalance, setDemoBalance] = useState(INITIAL_DEMO_BALANCE);
  const [trades, setTrades] = useState<DemoTrade[]>([]);

  // Load demo state from localStorage
  useEffect(() => {
    const savedDemoMode = localStorage.getItem("isDemoMode");
    const savedBalance = localStorage.getItem("demoBalance");
    const savedTrades = localStorage.getItem("demoTrades");

    if (savedDemoMode) {
      setIsDemoMode(JSON.parse(savedDemoMode));
    }
    if (savedBalance) {
      setDemoBalance(parseFloat(savedBalance));
    }
    if (savedTrades) {
      const parsedTrades = JSON.parse(savedTrades).map((trade: any) => ({
        ...trade,
        timestamp: new Date(trade.timestamp),
        expiresAt: new Date(trade.expiresAt),
      }));
      setTrades(parsedTrades);
    }
  }, []);

  // Save demo state to localStorage
  useEffect(() => {
    localStorage.setItem("isDemoMode", JSON.stringify(isDemoMode));
  }, [isDemoMode]);

  useEffect(() => {
    localStorage.setItem("demoBalance", demoBalance.toString());
  }, [demoBalance]);

  useEffect(() => {
    localStorage.setItem("demoTrades", JSON.stringify(trades));
  }, [trades]);

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    if (enabled && demoBalance <= 0) {
      // Reset balance if enabling demo mode with no funds
      setDemoBalance(INITIAL_DEMO_BALANCE);
    }
  };

  const addTrade = (
    tradeData: Omit<
      DemoTrade,
      "id" | "timestamp" | "result" | "actualReturn" | "exitPrice"
    >,
  ) => {
    if (!isDemoMode) return;

    // Calculate 2% trading fee if not already included
    const tradingFee = tradeData.amount * 0.02;
    const totalCost = tradeData.amount; // Assume amount already includes fee from UI

    if (totalCost > demoBalance) return; // Insufficient funds

    const newTrade: DemoTrade = {
      ...tradeData,
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      result: "PENDING",
      actualReturn: 0,
    };

    setTrades((prev) => [newTrade, ...prev]);
    setDemoBalance((prev) => prev - totalCost);

    // Auto-resolve trade after expiration (for demo purposes)
    setTimeout(() => {
      resolveTradeAutomatically(newTrade.id);
    }, getTimeframeMs(tradeData.timeframe));
  };

  const resolveTradeAutomatically = (tradeId: string) => {
    // Simulate trade result with 60% win rate for demo
    const isWin = Math.random() < 0.6;
    const mockExitPrice = Math.random() * 100000; // Mock exit price
    updateTradeResult(tradeId, isWin ? "WIN" : "LOSS", mockExitPrice);
  };

  const updateTradeResult = (
    tradeId: string,
    result: "WIN" | "LOSS",
    exitPrice: number,
  ) => {
    setTrades((prev) =>
      prev.map((trade) => {
        if (trade.id === tradeId) {
          const actualReturn =
            result === "WIN" ? trade.expectedReturn : -trade.amount;

          // Update balance
          if (result === "WIN") {
            setDemoBalance(
              (prevBalance) => prevBalance + trade.amount + actualReturn,
            );
          }
          // Note: For LOSS, amount was already deducted when trade was placed

          return {
            ...trade,
            result,
            actualReturn,
            exitPrice,
          };
        }
        return trade;
      }),
    );
  };

  const resetDemo = () => {
    setDemoBalance(INITIAL_DEMO_BALANCE);
    setTrades([]);
    localStorage.removeItem("demoBalance");
    localStorage.removeItem("demoTrades");
  };

  const contextValue: DemoTradingContextType = {
    isDemoMode,
    setDemoMode,
    demoBalance,
    trades,
    addTrade,
    updateTradeResult,
    resetDemo,
  };

  return (
    <DemoTradingContext.Provider value={contextValue}>
      {children}
    </DemoTradingContext.Provider>
  );
}

export const useDemoTrading = () => {
  const context = useContext(DemoTradingContext);
  if (!context) {
    throw new Error("useDemoTrading must be used within DemoTradingProvider");
  }
  return context;
};

// Utility function to convert timeframe to milliseconds
function getTimeframeMs(timeframe: string): number {
  const timeMap: { [key: string]: number } = {
    "60s": 60 * 1000,
    "120s": 120 * 1000,
    "300s": 300 * 1000,
    "600s": 600 * 1000,
    "3600s": 3600 * 1000,
    "21600s": 21600 * 1000,
  };
  return timeMap[timeframe] || 60 * 1000; // Default to 60s
}

