// @ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink
} from "lucide-react";
import { useAccount } from "wagmi";
import { useChainId } from "wagmi";
import { toast } from "sonner";
import { ethers } from "ethers";
import { getReceivingWallet, RECEIVING_WALLETS } from "@/lib/receivingWallets";

// Version-compatible BigNumber handling
const parseEther = ethers.parseEther;
const formatEther = ethers.formatEther;

// USDT Token ABI (simplified)
const USDT_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

// USDT Contract Address (Ethereum Mainnet)
const USDT_CONTRACT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

export function SimpleDeposit() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [selectedToken, setSelectedToken] = useState<string>("ETH");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState("0");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Get receiving wallet address for selected token
  const getReceivingAddress = () => {
    return getReceivingWallet(selectedToken as 'ETH' | 'BTC' | 'USDT');
  };

  // Copy address to clipboard
  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      toast.success("Address copied to clipboard!");
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      toast.error("Failed to copy address");
    }
  };

  // Get provider and signer
  const getProvider = () => {
    if (!window.ethereum) throw new Error("No wallet connected");
    return new ethers.BrowserProvider ? 
      new ethers.BrowserProvider(window.ethereum) : 
      new ethers.providers.Web3Provider(window.ethereum);
  };

  // Fetch user balance
  const fetchBalance = async () => {
    if (!isConnected || !address) return;
    
    try {
      const provider = getProvider();
      
      if (selectedToken === "ETH") {
        const balance = await provider.getBalance(address);
        setUserBalance(formatEther(balance));
      } else if (selectedToken === "USDT") {
        const usdtContract = new ethers.Contract(USDT_CONTRACT, USDT_ABI, provider);
        const balance = await usdtContract.balanceOf(address);
        const decimals = await usdtContract.decimals();
        setUserBalance(ethers.formatUnits(balance, decimals));
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  // Direct ETH transfer
  const sendETH = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const userBalanceNum = parseFloat(userBalance);
    const amountNum = parseFloat(amount);
    
    if (amountNum > userBalanceNum) {
      toast.error("Insufficient balance");
      return;
    }

    setIsLoading(true);
    try {
      const provider = getProvider();
      const signer = await provider.getSigner();
      const receivingAddress = getReceivingAddress();
      
      const tx = await signer.sendTransaction({
        to: receivingAddress,
        value: parseEther(amount)
      });
      
      toast.info("Transaction submitted. Waiting for confirmation...");
      await tx.wait();
      toast.success(`Successfully sent ${amount} ETH to receiving wallet`);
      setAmount("");
      await fetchBalance();
    } catch (error: any) {
      console.error("ETH transfer error:", error);
      toast.error(error.message || "ETH transfer failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Direct USDT transfer
  const sendUSDT = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const userBalanceNum = parseFloat(userBalance);
    const amountNum = parseFloat(amount);
    
    if (amountNum > userBalanceNum) {
      toast.error("Insufficient balance");
      return;
    }

    setIsLoading(true);
    try {
      const provider = getProvider();
      const signer = await provider.getSigner();
      const usdtContract = new ethers.Contract(USDT_CONTRACT, USDT_ABI, signer);
      const decimals = await usdtContract.decimals();
      
      const tx = await usdtContract.transfer(
        getReceivingAddress(),
        ethers.parseUnits(amount, decimals)
      );
      
      toast.info("Transaction submitted. Waiting for confirmation...");
      await tx.wait();
      toast.success(`Successfully sent ${amount} USDT to receiving wallet`);
      setAmount("");
      await fetchBalance();
    } catch (error: any) {
      console.error("USDT transfer error:", error);
      toast.error(error.message || "USDT transfer failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deposit based on token type
  const handleDeposit = async () => {
    if (selectedToken === "ETH") {
      await sendETH();
    } else if (selectedToken === "USDT") {
      await sendUSDT();
    } else if (selectedToken === "BTC") {
      // For BTC, just show the address
      toast.info("Please send BTC to the displayed address");
    }
  };

  // Fetch balance when token changes
  useEffect(() => {
    if (isConnected && address) {
      fetchBalance();
    }
  }, [isConnected, address, selectedToken]);

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground mb-4">
            <Wallet className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground">
            Please connect your wallet to start depositing funds.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Your Balance</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBalance}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <div className="text-2xl font-bold">
            {parseFloat(userBalance).toFixed(4)} {selectedToken}
          </div>
        </CardContent>
      </Card>

      {/* Deposit Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Deposit Funds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Token Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select Token</label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ETH">ETH (Ethereum)</SelectItem>
                <SelectItem value="USDT">USDT (Tether)</SelectItem>
                <SelectItem value="BTC">BTC (Bitcoin)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">Amount</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Receiving Address Display */}
          <div>
            <label className="text-sm font-medium mb-2 block">Receiving Address</label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <code className="flex-1 text-sm break-all">
                {getReceivingAddress()}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyAddress(getReceivingAddress())}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            {copiedAddress === getReceivingAddress() && (
              <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                <CheckCircle className="w-4 h-4" />
                Address copied!
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {selectedToken === "BTC" ? (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => copyAddress(getReceivingAddress())}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy BTC Address
              </Button>
            ) : (
              <Button
                className="flex-1"
                onClick={handleDeposit}
                disabled={isLoading || !amount || parseFloat(amount) <= 0}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Send {selectedToken}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Instructions */}
          {selectedToken === "BTC" && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Bitcoin Deposit Instructions</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    1. Copy the BTC address above<br/>
                    2. Send BTC from your wallet to this address<br/>
                    3. Wait for network confirmations<br/>
                    4. Your deposit will be credited automatically
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receiving Wallets Info */}
      <Card>
        <CardHeader>
          <CardTitle>Receiving Wallets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(RECEIVING_WALLETS).map(([token, address]) => (
              <div key={token} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{token}</Badge>
                  <code className="text-sm">{address}</code>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyAddress(address)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
