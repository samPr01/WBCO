// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, QrCode } from "lucide-react";
import { toast } from "sonner";

interface WalletConfig {
  wallets: {
    BTC: string;
    USDT: string;
    Ethereum: string;
  };
  updatedAt: string;
  environment: string;
}

export function WalletAddresses() {
  const [walletConfig, setWalletConfig] = useState<WalletConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWalletConfig = async () => {
      try {
        const response = await fetch('/config/wallets.json');
        if (response.ok) {
          const config = await response.json();
          setWalletConfig(config);
        } else {
          // Fallback to hardcoded addresses
          setWalletConfig({
            wallets: {
              BTC: "bc1qr63h7nzs0lhzumk2stg7fneymwceu2y7erd96l",
              USDT: "TQbchYKr8FbXCVPNTtDVdrfGYKiUnkJVnY",
              Ethereum: "0x2499aDe1b915E12819e8E38B1d915E12819e8E38B1d9ed3493107E2B1"
            },
            updatedAt: new Date().toISOString(),
            environment: "production"
          });
        }
      } catch (error) {
        console.error("Failed to load wallet config:", error);
        // Fallback to hardcoded addresses
        setWalletConfig({
          wallets: {
            BTC: "bc1qr63h7nzs0lhzumk2stg7fneymwceu2y7erd96l",
            USDT: "TQbchYKr8FbXCVPNTtDVdrfGYKiUnkJVnY",
            Ethereum: "0x2499aDe1b915E12819e8E38B1d915E12819e8E38B1d9ed3493107E2B1"
          },
          updatedAt: new Date().toISOString(),
          environment: "production"
        });
      } finally {
        setLoading(false);
      }
    };

    loadWalletConfig();
  }, []);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} address copied to clipboard`);
  };

  const openInExplorer = (address: string, type: string) => {
    let url = "";
    switch (type) {
      case "BTC":
        url = `https://blockstream.info/address/${address}`;
        break;
      case "USDT":
        url = `https://tronscan.org/#/address/${address}`;
        break;
      case "Ethereum":
        url = `https://etherscan.io/address/${address}`;
        break;
    }
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!walletConfig) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Failed to load wallet addresses</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Deposit Addresses</span>
          <Badge variant="secondary">{walletConfig.environment}</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Updated: {new Date(walletConfig.updatedAt).toLocaleString()}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* BTC Address */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">Bitcoin (BTC)</span>
            <Badge variant="outline">TRC20</Badge>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm break-all">{walletConfig.wallets.BTC}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(walletConfig.wallets.BTC, "BTC")}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openInExplorer(walletConfig.wallets.BTC, "BTC")}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* USDT Address */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">Tether (USDT)</span>
            <Badge variant="outline">TRC20</Badge>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm break-all">{walletConfig.wallets.USDT}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(walletConfig.wallets.USDT, "USDT")}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openInExplorer(walletConfig.wallets.USDT, "USDT")}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Ethereum Address */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">Ethereum (ETH)</span>
            <Badge variant="outline">ERC20</Badge>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm break-all">{walletConfig.wallets.Ethereum}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(walletConfig.wallets.Ethereum, "Ethereum")}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openInExplorer(walletConfig.wallets.Ethereum, "Ethereum")}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            💡 Send funds to these addresses to deposit into your account. 
            Make sure to use the correct network for each cryptocurrency.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
