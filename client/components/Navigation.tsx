// @ts-nocheck
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  TrendingUp,
  DollarSign,
  Settings,
  User,
  BarChart3,
  FileText,
  ArrowDownToLine,
  LogOut,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDemoTrading } from "@/contexts/DemoTradingContext";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { connectWallet, disconnectWallet, getWalletBalance } from "@/lib/walletUtils";
import { WalletButton } from "@/components/WalletButton";
import { MobileWalletButton } from "@/components/MobileWalletButton";

const navigationItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/market", icon: BarChart3, label: "Market" },
  { href: "/orders", icon: FileText, label: "Orders" },
  { href: "/loans", icon: DollarSign, label: "Intelligent AI Trading" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Navigation() {
  const location = useLocation();

  return (
    <>
      {/* Mobile Top Navigation with Wallet Button */}
      <nav className="fixed top-0 left-0 right-0 bg-card/80 backdrop-blur-md border-b border-border z-50 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-gradient-start to-gradient-end rounded-lg" />
            <span className="font-bold text-lg">WalletBase</span>
          </Link>
          <MobileWalletButton />
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
        <div className="flex items-center justify-around py-2">
          {navigationItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export function DesktopNavigation() {
  const location = useLocation();
  const { isDemoMode, demoBalance: demoBal } = useDemoTrading();
  const [walletConnected, setWalletConnected] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState("");
  const [ethBalance, setEthBalance] = useState("0.0000");

  useEffect(() => {
    const checkConnection = async () => {
      const savedConnection = localStorage.getItem("walletConnected");
      const savedAddress = localStorage.getItem("walletAddress");
      const isConnected = savedConnection === "true";

      setWalletConnected(isConnected);
      setConnectedAddress(savedAddress || "");

      // Fetch real balance if wallet is connected and not in demo mode
      if (isConnected && savedAddress && !isDemoMode) {
        try {
          const balance = await getWalletBalance(savedAddress);
          setEthBalance(balance);
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, [isDemoMode]);

  const displayAddress = walletConnected
    ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`
    : "Not Connected";
  const displayBalance = walletConnected
    ? isDemoMode
      ? `$${demoBal.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD`
      : `${ethBalance} ETH`
    : "No Balance";

  const handleConnectWallet = async () => {
    const walletInfo = await connectWallet();
    if (walletInfo) {
      setWalletConnected(true);
      setConnectedAddress(walletInfo.address);
      setEthBalance(walletInfo.balance);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setWalletConnected(false);
    setConnectedAddress("");
    setEthBalance("0.0000");
  };

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-card/80 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-gradient-start to-gradient-end rounded-lg" />
          <span className="font-bold text-xl">WalletBase</span>
        </Link>

        <div className="flex items-center gap-6">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <WalletButton />
        </div>
      </div>
    </nav>
  );
}

