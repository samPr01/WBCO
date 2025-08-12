import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Copy,
  ExternalLink,
  LogOut,
  Minimize2,
  Move,
} from "lucide-react";
import { toast } from "sonner";
import { useDemoTrading } from "@/contexts/DemoTradingContext";
import { connectWallet, getWalletBalance } from "@/lib/walletUtils";

interface DemoWalletProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function DemoWallet({ onConnect, onDisconnect }: DemoWalletProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [walletConnected, setWalletConnected] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState("");
  const [ethBalance, setEthBalance] = useState("0.0000");
  const walletRef = useRef<HTMLDivElement>(null);
  const { isDemoMode, demoBalance } = useDemoTrading();

  // Check for wallet connection and fetch balance
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
    const interval = setInterval(checkConnection, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [isDemoMode]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const copyAddress = () => {
    const addressToCopy = connectedAddress || "No address";
    navigator.clipboard.writeText(addressToCopy);
    toast.success("Wallet address copied!");
  };

  const openExplorer = () => {
    if (connectedAddress) {
      window.open(`https://etherscan.io/address/${connectedAddress}`, "_blank");
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("walletConnected");
    localStorage.removeItem("walletAddress");
    setWalletConnected(false);
    setConnectedAddress("");
    toast.success("Wallet disconnected");
    onDisconnect?.();
  };

  const handleConnectWallet = async () => {
    const walletInfo = await connectWallet();
    if (walletInfo) {
      setWalletConnected(true);
      setConnectedAddress(walletInfo.address);
      onConnect?.();
    }
  };

  return (
    <div
      ref={walletRef}
      className="fixed top-4 right-4 z-50 cursor-move"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? "none" : "transform 0.1s ease-out",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Card
        className={`${isMinimized ? "w-auto" : "w-80"} hover:shadow-lg transition-shadow`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              {!isMinimized && (
                <div>
                  <CardTitle className="text-sm">
                    {walletConnected ? "Connected Wallet" : "No Wallet"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {walletConnected ? "Ethereum Mainnet" : "Not Connected"}
                  </CardDescription>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isMinimized && walletConnected && (
                <Badge
                  variant="secondary"
                  className="bg-green-500/10 text-green-600"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                  Connected
                </Badge>
              )}
              {!isMinimized && isDemoMode && (
                <Badge
                  variant="secondary"
                  className="bg-yellow-500/10 text-yellow-600"
                >
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1" />
                  Demo Mode
                </Badge>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                }}
              >
                <Minimize2 className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="cursor-grab active:cursor-grabbing"
              >
                <Move className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        {!isMinimized && walletConnected && (
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <div className="text-sm font-medium">Address</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={copyAddress}>
                  <Copy className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={openExplorer}>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <div className="text-sm font-medium">Balance</div>
                <div className="text-xs text-muted-foreground">
                  {isDemoMode ? `$${demoBalance.toFixed(2)} USD` : `${ethBalance} ETH`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  {isDemoMode ? demoBalance.toFixed(2) : ethBalance}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isDemoMode ? "USD" : "ETH"}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleDisconnect}
            >
              <LogOut className="w-3 h-3 mr-2" />
              Disconnect Wallet
            </Button>
          </CardContent>
        )}
        {!isMinimized && !walletConnected && (
          <CardContent className="space-y-3">
            <div className="text-center p-4 space-y-3">
              <div className="text-sm text-muted-foreground">
                No wallet connected
              </div>
              <Button
                onClick={handleConnectWallet}
                size="sm"
                className="w-full bg-gradient-to-r from-gradient-start to-gradient-end text-white"
              >
                <Wallet className="w-3 h-3 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
