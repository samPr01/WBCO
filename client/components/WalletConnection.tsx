// @ts-nocheck
import { useState, useEffect } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useChainId,
} from "wagmi";
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
  LogOut,
  Copy,
  ExternalLink,
  Shield,
  Zap,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { formatAddress, getNetworkName, SUPPORTED_WALLETS } from "@/lib/web3";

export function WalletConnection() {
  const { address, isConnecting, isConnected } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { data: balance } = useBalance({
    address: address,
  });

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard!");
    }
  };

  const openExplorer = () => {
    if (address && chainId) {
      const networks: Record<number, string> = {
        1: "https://etherscan.io/address/",
        137: "https://polygonscan.com/address/",
        56: "https://bscscan.com/address/",
        42161: "https://arbiscan.io/address/",
      };
      const explorerUrl = networks[chainId];
      if (explorerUrl) {
        window.open(`${explorerUrl}${address}`, "_blank");
      }
    }
  };

  if (isConnecting || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full mx-auto flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <div className="text-lg font-semibold">Connecting to wallet...</div>
          <div className="text-sm text-muted-foreground">
            Please check your wallet for connection request
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full mx-auto mb-4 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Connect Your Wallet
            </CardTitle>
            <CardDescription>
              WalletBase is a decentralized platform. Connect your crypto wallet
              to access all features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {connectors.map((connector) => {
                const walletInfo = SUPPORTED_WALLETS.find(
                  (w) =>
                    w.connector === connector.id ||
                    (connector.id === "injected" && w.connector === "injected"),
                );

                return (
                  <Button
                    key={connector.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => connect({ connector })}
                    disabled={isPending}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {walletInfo?.icon || "🔗"}
                      </span>
                      <div className="text-left">
                        <div className="font-semibold">
                          {walletInfo?.name || connector.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {walletInfo?.description || "Connect wallet"}
                        </div>
                      </div>
                    </div>
                    {connector.type === "injected" && (
                      <Badge variant="secondary" className="ml-auto">
                        Detected
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>

            <div className="border-t pt-4">
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Your wallet stays secure and in your control</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Instant transactions on multiple networks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>No registration required - wallet-based access</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null; // Return null when connected, let other components handle the UI
}

export function WalletGuard({ children }: { children: React.ReactNode }) {
  const { isConnected, isConnecting } = useAccount();

  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full mx-auto flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <div className="text-lg font-semibold">Connecting to wallet...</div>
          <div className="text-sm text-muted-foreground">
            Please check your wallet for connection request
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return <WalletConnection />;
  }

  return <>{children}</>;
}

// Separate component for wallet info display
export function WalletInfo() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied!");
    }
  };

  const openExplorer = () => {
    if (address && chainId) {
      const networks: Record<number, string> = {
        1: "https://etherscan.io/address/",
        137: "https://polygonscan.com/address/",
        56: "https://bscscan.com/address/",
        42161: "https://arbiscan.io/address/",
      };
      const explorerUrl = networks[chainId];
      if (explorerUrl) {
        window.open(`${explorerUrl}${address}`, "_blank");
      }
    }
  };

  if (!isConnected) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm">Wallet Connected</CardTitle>
                <CardDescription className="text-xs">
                  {getNetworkName(chainId)}
                </CardDescription>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-chart-positive/10 text-chart-positive"
            >
              <div className="w-2 h-2 bg-chart-positive rounded-full mr-1" />
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div>
              <div className="text-sm font-medium">Address</div>
              <div className="text-xs text-muted-foreground font-mono">
                {formatAddress(address || "")}
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

          {balance && (
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <div className="text-sm font-medium">Balance</div>
                <div className="text-xs text-muted-foreground">
                  {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  {parseFloat(balance.formatted).toFixed(4)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {balance.symbol}
                </div>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => disconnect()}
          >
            <LogOut className="w-3 h-3 mr-2" />
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

