// @ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Send, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CryptoCurrency {
  symbol: string;
  name: string;
  icon: string;
  network: string;
}

const cryptocurrencies: CryptoCurrency[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    icon: "₿",
    network: "Bitcoin",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "⟠",
    network: "Ethereum (ERC-20)",
  },
  {
    symbol: "USDT",
    name: "Tether",
    icon: "₮",
    network: "Tron (TRC-20)",
  },
  {
    symbol: "SOL",
    name: "Solana",
    icon: "◎",
    network: "Solana",
  },
  {
    symbol: "BNB",
    name: "BNB",
    icon: "🟡",
    network: "BSC (BEP-20)",
  },
  {
    symbol: "XRP",
    name: "XRP",
    icon: "💧",
    network: "XRP Ledger",
  },
  {
    symbol: "USDC",
    name: "USDC",
    icon: "🔵",
    network: "Ethereum (ERC-20)",
  },
  {
    symbol: "ADA",
    name: "Cardano",
    icon: "🔷",
    network: "Cardano",
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    icon: "🔺",
    network: "Avalanche C-Chain",
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    icon: "🐕",
    network: "Dogecoin",
  },
  {
    symbol: "TRX",
    name: "TRON",
    icon: "🔴",
    network: "Tron (TRC-20)",
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    icon: "🔗",
    network: "Ethereum (ERC-20)",
  },
  {
    symbol: "MATIC",
    name: "Polygon",
    icon: "🟣",
    network: "Polygon",
  },
  {
    symbol: "DOT",
    name: "Polkadot",
    icon: "⚫",
    network: "Polkadot",
  },
  {
    symbol: "LTC",
    name: "Litecoin",
    icon: "Ł",
    network: "Litecoin",
  },
];

export function WithdrawPayments() {
  const navigate = useNavigate();
  const [selectedCrypto, setSelectedCrypto] = useState<string>("");
  const [withdrawAddress, setWithdrawAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [connectedWallet, setConnectedWallet] = useState<string>("");

  const currentCrypto = cryptocurrencies.find(
    (crypto) => crypto.symbol === selectedCrypto,
  );

  // Get connected wallet address
  useEffect(() => {
    const walletAddress = localStorage.getItem("walletAddress");
    setConnectedWallet(walletAddress || "");
  }, []);

  const copyWalletAddress = () => {
    if (connectedWallet) {
      navigator.clipboard.writeText(connectedWallet);
      toast.success("Wallet address copied!");
    }
  };

  const handleWithdraw = () => {
    if (!connectedWallet) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!currentCrypto) {
      toast.error("Please select a cryptocurrency");
      return;
    }
    if (!withdrawAddress) {
      toast.error("Please enter withdrawal address");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Navigate to upload proof page with withdrawal details
    const params = new URLSearchParams({
      type: 'withdrawal',
      crypto: currentCrypto.symbol,
      address: connectedWallet,
      amount: amount
    });

    navigate(`/upload-proof?${params}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Withdraw</h1>
          <p className="text-muted-foreground">
            Withdraw cryptocurrency from your connected wallet
          </p>
        </div>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Withdraw Cryptocurrency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connected Wallet Display */}
          {connectedWallet && (
            <div className="p-3 bg-muted/20 rounded-lg">
              <Label className="text-sm text-muted-foreground">
                From Connected Wallet
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 p-2 bg-background border rounded font-mono text-sm break-all">
                  {connectedWallet}
                </div>
                <Button size="sm" variant="outline" onClick={copyWalletAddress}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Cryptocurrency Selector */}
          <div className="space-y-2">
            <Label htmlFor="crypto-select">Select Cryptocurrency</Label>
            <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
              <SelectTrigger id="crypto-select" className="w-full">
                <SelectValue placeholder="Choose Cryptocurrency">
                  {currentCrypto && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {currentCrypto.symbol}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">
                          {currentCrypto.symbol}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {currentCrypto.name}
                        </div>
                      </div>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {cryptocurrencies.map((crypto) => (
                  <SelectItem key={crypto.symbol} value={crypto.symbol}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {crypto.symbol}
                      </div>
                      <div>
                        <div className="font-medium">{crypto.symbol}</div>
                        <div className="text-sm text-muted-foreground">
                          {crypto.name}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Show details when crypto is selected */}
          {currentCrypto && (
            <>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Network
                  </Label>
                  <div className="font-medium">{currentCrypto.network}</div>
                </div>

                <div>
                  <Label htmlFor="withdraw-address">Withdrawal Address</Label>
                  <Input
                    id="withdraw-address"
                    type="text"
                    placeholder={`Enter ${currentCrypto.symbol} address`}
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder={`Enter ${currentCrypto.symbol} amount`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <Button
                onClick={handleWithdraw}
                className="w-full bg-gradient-to-r from-gradient-start to-gradient-end text-white disabled:opacity-50"
                disabled={!connectedWallet || !currentCrypto || !withdrawAddress || !amount}
              >
                {!connectedWallet ? (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet First
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Withdrawal
                  </>
                )}
              </Button>
              </div>

              <div className="text-xs text-muted-foreground p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                <p className="font-medium mb-1">⚠️ Important:</p>
                <p>
                  Double-check the withdrawal address. Transactions are
                  irreversible. Make sure the address supports{" "}
                  {currentCrypto.network}.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

