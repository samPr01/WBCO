// @ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bitcoin, 
  Copy, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Wallet,
  QrCode
} from "lucide-react";
import { useAccount } from "wagmi";
import { toast } from "sonner";

interface BTCAddressData {
  ethAddress: string;
  btcAddress: string;
  derivationPath?: string;
  balance: number;
  lastUpdated: string;
}

interface BTCBalanceData {
  ethAddress: string;
  btcAddress: string;
  balance: number;
  totalReceived: number;
  totalSent: number;
  transactionCount: number;
  lastUpdated: string;
  recentTransactions: Array<{
    txid: string;
    amount: number;
    confirmations: number;
    blockHeight: number;
    timestamp: number;
  }>;
}

interface Transaction {
  id: number;
  txHash: string;
  amount: number;
  confirmations: number;
  blockHeight: number;
  status: string;
  createdAt: string;
}

export function BTCDeposit() {
  const { address, isConnected } = useAccount();
  const [btcAddressData, setBtcAddressData] = useState<BTCAddressData | null>(null);
  const [btcBalanceData, setBtcBalanceData] = useState<BTCBalanceData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("deposit");

  const API_BASE = import.meta.env.VITE_BTC_API_URL || 'http://localhost:3001/api/btc';
  
  // Expected chain ID for BTC operations (mainnet)
  const EXPECTED_CHAIN_ID = 1;

  // Check network compatibility
  const checkNetwork = async () => {
    if (!window.ethereum) return false;
    
    try {
      const provider = new ethers.BrowserProvider ? 
        new ethers.BrowserProvider(window.ethereum || {}) : 
        new ethers.BrowserProvider(window.ethereum);
      
      const network = await provider.getNetwork();
      if (network.chainId !== EXPECTED_CHAIN_ID) {
        alert("Please switch to the correct network.");
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  };

  // Generate BTC address for connected wallet
  const generateBTCAddress = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    // Check for MetaMask
    if (!window.ethereum) {
      alert("MetaMask not detected");
      return;
    }

    // Check network compatibility
    const isCorrectNetwork = await checkNetwork();
    if (!isCorrectNetwork) {
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE}/generate-address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ethAddress: address })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setBtcAddressData(data.data);
        toast.success("BTC address generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate BTC address");
      }
    } catch (error) {
      console.error('Error generating BTC address:', error);
      toast.error("Failed to generate BTC address. Please check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Check BTC balance
  const checkBTCBalance = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    // Check for MetaMask
    if (!window.ethereum) {
      alert("MetaMask not detected");
      return;
    }

    // Check network compatibility
    const isCorrectNetwork = await checkNetwork();
    if (!isCorrectNetwork) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/check-deposit/${address}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setBtcBalanceData(data.data);
        toast.success("Balance updated!");
      } else {
        toast.error(data.message || "Failed to check balance");
      }
    } catch (error) {
      console.error('Error checking BTC balance:', error);
      toast.error("Failed to check BTC balance. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Get transaction history
  const getTransactionHistory = async () => {
    if (!address) return;

    // Check for MetaMask
    if (!window.ethereum) {
      alert("MetaMask not detected");
      return;
    }

    // Check network compatibility
    const isCorrectNetwork = await checkNetwork();
    if (!isCorrectNetwork) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/transactions/${address}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.data.transactions);
      }
    } catch (error) {
      console.error('Error getting transaction history:', error);
      toast.error("Failed to get transaction history. Please check your connection and try again.");
    }
  };

  // Copy BTC address to clipboard
  const copyBTCAddress = () => {
    if (btcAddressData?.btcAddress) {
      navigator.clipboard.writeText(btcAddressData.btcAddress);
      toast.success("BTC address copied to clipboard!");
    }
  };

  // Open BTC address in explorer
  const openInExplorer = () => {
    if (btcAddressData?.btcAddress) {
      window.open(`https://blockstream.info/address/${btcAddressData.btcAddress}`, '_blank');
    }
  };

  // Load initial data
  useEffect(() => {
    if (isConnected && address) {
      // Check for MetaMask
      if (!window.ethereum) {
        alert("MetaMask not detected");
        return;
      }

      // Try to get existing BTC address
      fetch(`${API_BASE}/address/${address}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            setBtcAddressData(data.data);
            checkBTCBalance();
            getTransactionHistory();
          }
        })
        .catch(error => {
          console.error('Error loading BTC address:', error);
          toast.error("Failed to load BTC address. Please check your connection and try again.");
        });
    }
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground">
            Please connect your wallet to deposit BTC.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bitcoin className="w-5 h-5" />
            BTC Deposit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* ETH Address Display */}
            <div>
              <label className="text-sm font-medium">Your Ethereum Address</label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={address || ""}
                  readOnly
                  className="font-mono text-sm"
                />
                <Badge variant="secondary">Connected</Badge>
              </div>
            </div>

            {/* BTC Address Section */}
            {!btcAddressData ? (
              <div className="text-center py-8">
                <Bitcoin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Generate BTC Address</h3>
                <p className="text-muted-foreground mb-4">
                  Generate a unique BTC address for your wallet to receive deposits.
                </p>
                <Button 
                  onClick={generateBTCAddress} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Bitcoin className="w-4 h-4 mr-2" />
                      Generate BTC Address
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* BTC Address Display */}
                <div>
                  <label className="text-sm font-medium">Your BTC Address</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={btcAddressData.btcAddress}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="sm" onClick={copyBTCAddress}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={openInExplorer}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* QR Code Placeholder */}
                <div className="bg-muted p-4 rounded-lg text-center">
                  <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    QR Code for BTC Address
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (QR code generation can be added here)
                  </p>
                </div>

                {/* Balance Section */}
                {btcBalanceData && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          Current Balance
                        </p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {btcBalanceData.balance.toFixed(8)} BTC
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={checkBTCBalance}
                        disabled={isLoading}
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                      <p>Total Received: {btcBalanceData.totalReceived.toFixed(8)} BTC</p>
                      <p>Total Sent: {btcBalanceData.totalSent.toFixed(8)} BTC</p>
                      <p>Transactions: {btcBalanceData.transactionCount}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">
                      {tx.amount.toFixed(8)} BTC
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-8)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={tx.status === 'confirmed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {tx.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tx.confirmations} confirmations
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Deposit BTC</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium">Generate BTC Address</p>
                <p className="text-muted-foreground">Click "Generate BTC Address" to create your unique BTC deposit address.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium">Send BTC</p>
                <p className="text-muted-foreground">Send BTC from your wallet to the generated address. Minimum deposit: 0.0001 BTC.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium">Wait for Confirmation</p>
                <p className="text-muted-foreground">Wait for 6+ confirmations (usually 1 hour) for your deposit to be credited.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                4
              </div>
              <div>
                <p className="font-medium">Check Balance</p>
                <p className="text-muted-foreground">Click the refresh button to check your updated BTC balance.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

