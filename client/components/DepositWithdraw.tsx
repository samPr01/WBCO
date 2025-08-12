import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  History, 
  AlertCircle,
  CheckCircle,
  Clock,
  Coins
} from "lucide-react";
import { useAccount } from "wagmi";
import { useChainId } from "wagmi";
import { toast } from "sonner";
import { useTransactions } from "@/hooks/useTransactions";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { formatBalance, TOKENS, getTokenInfo, isETH } from "@/lib/contracts";

export function DepositWithdraw() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [selectedToken, setSelectedToken] = useState<string>("0x0000000000000000000000000000000000000000"); // ETH by default
  const [amount, setAmount] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  const {
    deposit,
    withdraw,
    depositToken,
    withdrawToken,
    fetchAllBalances,
    getTransactionHistory,
    userBalance,
    contractBalance,
    tokenBalances,
    contractTokenBalances,
    isLoading,
  } = useTransactions();

  const { getUSDValue, formatUSD } = useTokenPrices();

  // Get available tokens for current chain
  const availableTokens = TOKENS.filter(token => token.chainId === chainId);
  const selectedTokenInfo = getTokenInfo(selectedToken, chainId);

  // Get current balance for selected token
  const getCurrentBalance = () => {
    if (isETH(selectedToken)) {
      return userBalance;
    }
    return tokenBalances[selectedToken] || "0";
  };

  // Get current contract balance for selected token
  const getCurrentContractBalance = () => {
    if (isETH(selectedToken)) {
      return contractBalance;
    }
    return contractTokenBalances[selectedToken] || "0";
  };

  // Get USD value for current balance
  const getBalanceUSD = () => {
    const balance = getCurrentBalance();
    return getUSDValue(balance, selectedTokenInfo?.symbol || "ETH");
  };

  // Get USD value for contract balance
  const getContractBalanceUSD = () => {
    const balance = getCurrentContractBalance();
    return getUSDValue(balance, selectedTokenInfo?.symbol || "ETH");
  };

  // Fetch balances on mount and when connected
  useEffect(() => {
    if (isConnected && chainId) {
      fetchAllBalances();
    }
  }, [isConnected, chainId, fetchAllBalances]);

  // Handle deposit
  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (isETH(selectedToken)) {
      await deposit(amount);
    } else {
      await depositToken(selectedToken, amount);
    }
    setAmount("");
  };

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const currentBalance = getCurrentBalance();
    if (parseFloat(amount) > parseFloat(currentBalance)) {
      toast.error("Insufficient balance");
      return;
    }

    if (isETH(selectedToken)) {
      await withdraw(amount);
    } else {
      await withdrawToken(selectedToken, amount);
    }
    setAmount("");
  };

  // Load transaction history
  const loadTransactionHistory = async () => {
    const history = await getTransactionHistory();
    setTransactions(history);
  };

  // Refresh balances
  const handleRefresh = async () => {
    await fetchAllBalances();
    toast.success("Balances updated");
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground">
            Please connect your wallet to deposit or withdraw funds.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Token Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Select Token
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedToken} onValueChange={setSelectedToken}>
            <SelectTrigger>
              <SelectValue placeholder="Select a token" />
            </SelectTrigger>
            <SelectContent>
              {availableTokens.map((token) => (
                <SelectItem key={token.address} value={token.address}>
                  <div className="flex items-center gap-2">
                    <span>{token.symbol}</span>
                    <span className="text-muted-foreground">({token.name})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Balance</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBalance(getCurrentBalance(), selectedTokenInfo?.decimals)} {selectedTokenInfo?.symbol}
            </div>
            <p className="text-sm text-muted-foreground">
              ≈ {formatUSD(getBalanceUSD())}
            </p>
            <p className="text-xs text-muted-foreground">
              Available for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contract Balance</CardTitle>
            <Badge variant="secondary">
              Chain ID: {chainId || "Unknown"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBalance(getCurrentContractBalance(), selectedTokenInfo?.decimals)} {selectedTokenInfo?.symbol}
            </div>
            <p className="text-sm text-muted-foreground">
              ≈ {formatUSD(getContractBalanceUSD())}
            </p>
            <p className="text-xs text-muted-foreground">
              Total funds in contract
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Deposit & Withdraw</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadTransactionHistory}
                >
                  <History className="w-4 h-4 mr-2" />
                  Transaction History
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Transaction History</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {transactions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No transactions found
                    </p>
                  ) : (
                    transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            tx.type.includes('deposit') 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {tx.type.includes('deposit') ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{tx.type.replace('_', ' ')}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(tx.timestamp).toLocaleDateString()}
                            </p>
                            {tx.token_symbol && (
                              <p className="text-xs text-muted-foreground">
                                {tx.token_symbol}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{tx.amount} {tx.token_symbol || 'ETH'}</p>
                          <Badge variant="outline" className="text-xs">
                            {tx.tx_hash ? 'Confirmed' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "deposit" | "withdraw")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deposit" className="flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4" />
                Deposit
              </TabsTrigger>
              <TabsTrigger value="withdraw" className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4" />
                Withdraw
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deposit" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Amount ({selectedTokenInfo?.symbol})</label>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min={selectedTokenInfo?.symbol === "WBTC" ? "0.0001" : "0.001"}
                    step={selectedTokenInfo?.symbol === "WBTC" ? "0.0001" : "0.001"}
                    className="mt-1"
                  />
                  {amount && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ≈ {formatUSD(getUSDValue(amount, selectedTokenInfo?.symbol || "ETH"))}
                    </p>
                  )}
                </div>
                
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">Important Notes:</span>
                  </div>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    {selectedTokenInfo?.symbol === "WBTC" ? (
                      <>
                        <li>• Minimum deposit: 0.0001 WBTC</li>
                        <li>• Maximum deposit: 10 WBTC</li>
                        <li>• Daily limit: 1000 ETH equivalent</li>
                        <li>• No deposit fees</li>
                        <li>• Gas fees apply</li>
                        <li>• ERC20 approval required for first deposit</li>
                      </>
                    ) : (
                      <>
                        <li>• Minimum deposit: 0.001 ETH</li>
                        <li>• Maximum deposit: 100 ETH</li>
                        <li>• Daily limit: 1000 ETH</li>
                        <li>• No deposit fees</li>
                        <li>• Gas fees apply</li>
                      </>
                    )}
                  </ul>
                </div>

                <Button
                  onClick={handleDeposit}
                  disabled={isLoading || !amount || parseFloat(amount) <= 0}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowDownLeft className="w-4 h-4 mr-2" />
                      Deposit {amount || "0"} {selectedTokenInfo?.symbol}
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="withdraw" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Amount ({selectedTokenInfo?.symbol})</label>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min={selectedTokenInfo?.symbol === "WBTC" ? "0.0001" : "0.001"}
                    max={getCurrentBalance()}
                    step={selectedTokenInfo?.symbol === "WBTC" ? "0.0001" : "0.001"}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: {formatBalance(getCurrentBalance(), selectedTokenInfo?.decimals)} {selectedTokenInfo?.symbol}
                  </p>
                  {amount && (
                    <p className="text-xs text-muted-foreground">
                      ≈ {formatUSD(getUSDValue(amount, selectedTokenInfo?.symbol || "ETH"))}
                    </p>
                  )}
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">Important Notes:</span>
                  </div>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    {selectedTokenInfo?.symbol === "WBTC" ? (
                      <>
                        <li>• Minimum withdrawal: 0.0001 WBTC</li>
                        <li>• Maximum withdrawal: 5 WBTC</li>
                        <li>• Daily limit: 500 ETH equivalent</li>
                        <li>• Withdrawal fee: 0.5%</li>
                        <li>• Gas fees apply</li>
                      </>
                    ) : (
                      <>
                        <li>• Minimum withdrawal: 0.001 ETH</li>
                        <li>• Maximum withdrawal: 50 ETH</li>
                        <li>• Daily limit: 500 ETH</li>
                        <li>• Withdrawal fee: 0.5%</li>
                        <li>• Gas fees apply</li>
                      </>
                    )}
                  </ul>
                </div>

                <Button
                  onClick={handleWithdraw}
                  disabled={
                    isLoading || 
                    !amount || 
                    parseFloat(amount) <= 0 || 
                    parseFloat(amount) > parseFloat(getCurrentBalance())
                  }
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Withdraw {amount || "0"} {selectedTokenInfo?.symbol}
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Network Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Network:</span>
            <Badge variant="outline">
              Chain ID: {chainId || "Unknown"}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Wallet Address:</span>
            <span className="font-mono text-xs">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Selected Token:</span>
            <span className="font-medium">
              {selectedTokenInfo?.symbol} ({selectedTokenInfo?.name})
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
