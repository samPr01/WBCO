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
import { Copy, QrCode, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CryptoCurrency {
  symbol: string;
  name: string;
  icon: string;
  address: string;
  network: string;
}

const cryptocurrencies: CryptoCurrency[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    icon: "₿",
    address: "bc1qr63h7nzs0lhzumk2stg7fneymwceu2y7erd96l",
    network: "Bitcoin",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "⟠",
    address: "0x2499aDe1b915E12819e8E38B1d915E12819e8E38B1d9ed3493107E2B1",
    network: "Ethereum (ERC-20)",
  },
  {
    symbol: "USDT",
    name: "Tether",
    icon: "₮",
    address: "TQbchYKr8FbXCVPNTtDVdrfGYKiUnkJVnY",
    network: "Tron (TRC-20)",
  },
  {
    symbol: "SOL",
    name: "Solana",
    icon: "◎",
    address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    network: "Solana",
  },
  {
    symbol: "BNB",
    name: "BNB",
    icon: "🟡",
    address: "0x742d35Cc6634C0532925a3b8D76F2b4648334c50",
    network: "BSC (BEP-20)",
  },
  {
    symbol: "XRP",
    name: "XRP",
    icon: "💧",
    address: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    network: "XRP Ledger",
  },
  {
    symbol: "USDC",
    name: "USDC",
    icon: "🔵",
    address: "0x742d35Cc6634C0532925a3b8D76F2b4648334c50",
    network: "Ethereum (ERC-20)",
  },
  {
    symbol: "ADA",
    name: "Cardano",
    icon: "🔷",
    address: "addr1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    network: "Cardano",
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    icon: "🔺",
    address: "0x742d35Cc6634C0532925a3b8D76F2b4648334c50",
    network: "Avalanche C-Chain",
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    icon: "🐕",
    address: "DG2mPCnCPXzbwiqKpE1husv3FA9s5t1WMt",
    network: "Dogecoin",
  },
  {
    symbol: "TRX",
    name: "TRON",
    icon: "🔴",
    address: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE",
    network: "Tron (TRC-20)",
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    icon: "🔗",
    address: "0x742d35Cc6634C0532925a3b8D76F2b4648334c50",
    network: "Ethereum (ERC-20)",
  },
  {
    symbol: "MATIC",
    name: "Polygon",
    icon: "🟣",
    address: "0x742d35Cc6634C0532925a3b8D76F2b4648334c50",
    network: "Polygon",
  },
  {
    symbol: "DOT",
    name: "Polkadot",
    icon: "⚫",
    address: "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5",
    network: "Polkadot",
  },
  {
    symbol: "LTC",
    name: "Litecoin",
    icon: "Ł",
    address: "ltc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    network: "Litecoin",
  },
];

export function CryptoPayments() {
  const navigate = useNavigate();
  const [selectedCrypto, setSelectedCrypto] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [connectedWallet, setConnectedWallet] = useState<string>("");

  const currentCrypto = cryptocurrencies.find(
    (crypto) => crypto.symbol === selectedCrypto,
  );

  // Get connected wallet and generate QR code
  useEffect(() => {
    const walletAddress = localStorage.getItem("walletAddress");
    setConnectedWallet(walletAddress || "");
  }, []);

  useEffect(() => {
    if (currentCrypto && connectedWallet) {
      // Generate QR code URL using the connected wallet address
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${connectedWallet}`;
      setQrCodeUrl(qrUrl);
    }
  }, [currentCrypto, connectedWallet]);

  const copyAddress = () => {
    if (connectedWallet) {
      navigator.clipboard.writeText(connectedWallet);
      toast.success("Wallet address copied!");
    } else {
      toast.error("No wallet connected");
    }
  };

  const handleUploadProof = () => {
    if (!connectedWallet) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!currentCrypto) {
      toast.error("Please select a cryptocurrency first");
      return;
    }

    // Navigate to upload proof page with transaction details
    const params = new URLSearchParams({
      type: 'deposit',
      crypto: currentCrypto.symbol,
      address: connectedWallet,
      ...(amount && { amount })
    });

    navigate(`/upload-proof?${params}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deposit</h1>
          <p className="text-muted-foreground">
            {connectedWallet
              ? "Choose cryptocurrency and deposit to your connected wallet"
              : "Connect your wallet to enable deposits"}
          </p>
        </div>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Choose Cryptocurrency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
              <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Network
                  </Label>
                  <div className="font-medium">{currentCrypto.network}</div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">
                    Deposit Address
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 p-2 bg-background border rounded font-mono text-sm break-all">
                      {connectedWallet || "No wallet connected"}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyAddress}
                      disabled={!connectedWallet}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* QR Code */}
                <div className="text-center">
                  <Label className="text-sm text-muted-foreground">
                    QR Code
                  </Label>
                  <div className="bg-white p-4 rounded-lg inline-block mt-2">
                    <img
                      src={qrCodeUrl}
                      alt={`${currentCrypto.symbol} QR Code`}
                      className="w-40 h-40"
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="12" fill="%236b7280">QR Code</text></svg>`;
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (Optional)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder={`Enter ${currentCrypto.symbol} amount`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleUploadProof}
                  disabled={!connectedWallet || !currentCrypto}
                  className="w-full bg-gradient-to-r from-gradient-start to-gradient-end text-white disabled:opacity-50"
                >
                  {!connectedWallet ? (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Wallet First
                    </>
                  ) : (
                    "Upload Proof"
                  )}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                <p className="font-medium mb-1">⚠️ Important:</p>
                <p>
                  Only send {currentCrypto.symbol} to this address on the{" "}
                  {currentCrypto.network} network. Sending other tokens or using
                  wrong network will result in loss of funds.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

