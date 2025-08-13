// @ts-nocheck
import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { useWalletClient } from "wagmi";
import { useChainId } from "wagmi";
import { ethers } from "ethers";
import { toast } from "sonner";
import { 
  getContract, 
  parseEther, 
  formatEther, 
  parseTokenAmount,
  formatBalance,
  getERC20Contract,
  getTokenInfo,
  isETH,
  TOKENS,
  TransactionStatus, 
  TransactionType,
  TransactionData,
  GAS_LIMITS 
} from "@/lib/contracts";
import { supabase } from "@/lib/supabase";

export function useTransactions() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<string>("0");
  const [contractBalance, setContractBalance] = useState<string>("0");
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({});
  const [contractTokenBalances, setContractTokenBalances] = useState<Record<string, string>>({});

  // Get user ETH balance from contract
  const fetchUserBalance = useCallback(async () => {
    if (!isConnected || !chainId || !walletClient) return;

    try {
      const contract = getContract(walletClient as any, chainId);
      const balance = await contract.getBalance(address);
      setUserBalance(formatEther(balance));
    } catch (error) {
      console.error("Error fetching user balance:", error);
    }
  }, [isConnected, chainId, walletClient, address]);

  // Get user token balance from contract
  const fetchUserTokenBalance = useCallback(async (tokenAddress: string) => {
    if (!isConnected || !chainId || !walletClient || isETH(tokenAddress)) return;

    try {
      const contract = getContract(walletClient as any, chainId);
      const balance = await contract.getTokenBalance(address, tokenAddress);
      const tokenInfo = getTokenInfo(tokenAddress, chainId);
      const formattedBalance = formatBalance(balance, tokenInfo?.decimals || 18);
      
      setTokenBalances(prev => ({
        ...prev,
        [tokenAddress]: formattedBalance
      }));
    } catch (error) {
      console.error("Error fetching user token balance:", error);
    }
  }, [isConnected, chainId, walletClient, address]);

  // Get contract ETH balance
  const fetchContractBalance = useCallback(async () => {
    if (!chainId || !walletClient) return;

    try {
      const contract = getContract(walletClient as any, chainId);
      const balance = await contract.getContractBalance();
      setContractBalance(formatEther(balance));
    } catch (error) {
      console.error("Error fetching contract balance:", error);
    }
  }, [chainId, walletClient]);

  // Get contract token balance
  const fetchContractTokenBalance = useCallback(async (tokenAddress: string) => {
    if (!chainId || !walletClient || isETH(tokenAddress)) return;

    try {
      const contract = getContract(walletClient as any, chainId);
      const balance = await contract.getContractTokenBalance(tokenAddress);
      const tokenInfo = getTokenInfo(tokenAddress, chainId);
      const formattedBalance = formatBalance(balance, tokenInfo?.decimals || 18);
      
      setContractTokenBalances(prev => ({
        ...prev,
        [tokenAddress]: formattedBalance
      }));
    } catch (error) {
      console.error("Error fetching contract token balance:", error);
    }
  }, [chainId, walletClient]);

  // Fetch all balances
  const fetchAllBalances = useCallback(async () => {
    await fetchUserBalance();
    await fetchContractBalance();
    
    // Fetch token balances for supported tokens
    const chainTokens = TOKENS[chainId as keyof typeof TOKENS];
    if (chainTokens) {
      for (const [symbol, token] of Object.entries(chainTokens)) {
        await fetchUserTokenBalance(token.address);
        await fetchContractTokenBalance(token.address);
      }
    }
  }, [fetchUserBalance, fetchContractBalance, fetchUserTokenBalance, fetchContractTokenBalance, chainId]);

  // Check ERC20 allowance
  const checkAllowance = useCallback(async (tokenAddress: string, amount: string) => {
    if (!walletClient || isETH(tokenAddress)) return true;

    try {
      const tokenContract = getERC20Contract(tokenAddress, walletClient as any);
      const contractAddress = getContract(walletClient as any, chainId).target;
      const allowance = await tokenContract.allowance(address, contractAddress);
      const tokenInfo = getTokenInfo(tokenAddress, chainId);
      const requiredAmount = parseTokenAmount(amount, tokenInfo?.decimals || 18);
      
      return allowance >= requiredAmount;
    } catch (error) {
      console.error("Error checking allowance:", error);
      return false;
    }
  }, [walletClient, chainId, address]);

  // Approve ERC20 tokens
  const approveToken = useCallback(async (tokenAddress: string, amount: string) => {
    if (!walletClient || isETH(tokenAddress)) return true;

    try {
      const tokenContract = getERC20Contract(tokenAddress, walletClient as any);
      const contractAddress = getContract(walletClient as any, chainId).target;
      const tokenInfo = getTokenInfo(tokenAddress, chainId);
      const approveAmount = parseTokenAmount(amount, tokenInfo?.decimals || 18);

      const tx = await tokenContract.approve(contractAddress, approveAmount);
      await tx.wait();
      
      toast.success("Token approval successful");
      return true;
    } catch (error: any) {
      console.error("Error approving token:", error);
      
      if (error.code === 4001) {
        toast.error("Approval was rejected");
      } else {
        toast.error("Token approval failed");
      }
      return false;
    }
  }, [walletClient, chainId]);

  // Deposit ETH
  const deposit = useCallback(async (amount: string) => {
    if (!isConnected || !walletClient || !chainId) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);

    try {
      const contract = getContract(walletClient as any, chainId);
      const amountWei = parseEther(amount);

      const tx = await contract.deposit({
        value: amountWei,
      });

      toast.promise(
        tx.wait().then(async (receipt: any) => {
          // Save to database
          await supabase.from('transactions').insert({
            wallet_address: address,
            amount: amount,
            type: 'deposit',
            timestamp: new Date().toISOString(),
            tx_hash: tx.hash,
            gas_used: receipt.gasUsed.toString(),
            gas_price: tx.gasPrice?.toString(),
            token_symbol: 'ETH',
            token_address: '0x0000000000000000000000000000000000000000',
          });

          // Update balances
          await fetchAllBalances();

          return receipt;
        }),
        {
          loading: "Processing deposit...",
          success: `Successfully deposited ${amount} ETH`,
          error: "Deposit failed",
        }
      );

    } catch (error: any) {
      console.error("Deposit error:", error);
      
      if (error.code === 4001) {
        toast.error("Transaction was rejected");
      } else if (error.message?.includes("insufficient funds")) {
        toast.error("Insufficient funds for deposit");
      } else if (error.message?.includes("below minimum")) {
        toast.error("Amount below minimum deposit");
      } else if (error.message?.includes("above maximum")) {
        toast.error("Amount above maximum deposit");
      } else if (error.message?.includes("Daily deposit limit")) {
        toast.error("Daily deposit limit exceeded");
      } else {
        toast.error("Deposit failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, walletClient, chainId, address, fetchAllBalances]);

  // Deposit token
  const depositToken = useCallback(async (tokenAddress: string, amount: string) => {
    if (!isConnected || !walletClient || !chainId) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (isETH(tokenAddress)) {
      return deposit(amount);
    }

    setIsLoading(true);

    try {
      // Check allowance first
      const hasAllowance = await checkAllowance(tokenAddress, amount);
      if (!hasAllowance) {
        const approved = await approveToken(tokenAddress, amount);
        if (!approved) {
          setIsLoading(false);
          return;
        }
      }

      const contract = getContract(walletClient as any, chainId);
      const tokenInfo = getTokenInfo(tokenAddress, chainId);
      const amountWei = parseTokenAmount(amount, tokenInfo?.decimals || 18);

      const tx = await contract.depositToken(tokenAddress, amountWei);

      toast.promise(
        tx.wait().then(async (receipt: any) => {
          // Save to database
          await supabase.from('transactions').insert({
            wallet_address: address,
            amount: amount,
            type: 'deposit_token',
            timestamp: new Date().toISOString(),
            tx_hash: tx.hash,
            gas_used: receipt.gasUsed.toString(),
            gas_price: tx.gasPrice?.toString(),
            token_symbol: tokenInfo?.symbol || 'UNKNOWN',
            token_address: tokenAddress,
          });

          // Update balances
          await fetchAllBalances();

          return receipt;
        }),
        {
          loading: "Processing token deposit...",
          success: `Successfully deposited ${amount} ${tokenInfo?.symbol}`,
          error: "Token deposit failed",
        }
      );

    } catch (error: any) {
      console.error("Token deposit error:", error);
      
      if (error.code === 4001) {
        toast.error("Transaction was rejected");
      } else if (error.message?.includes("insufficient balance")) {
        toast.error("Insufficient token balance");
      } else if (error.message?.includes("below minimum")) {
        toast.error("Amount below minimum deposit");
      } else if (error.message?.includes("above maximum")) {
        toast.error("Amount above maximum deposit");
      } else if (error.message?.includes("Daily deposit limit")) {
        toast.error("Daily deposit limit exceeded");
      } else {
        toast.error("Token deposit failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, walletClient, chainId, address, deposit, checkAllowance, approveToken, fetchAllBalances]);

  // Withdraw ETH
  const withdraw = useCallback(async (amount: string) => {
    if (!isConnected || !walletClient || !chainId) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > parseFloat(userBalance)) {
      toast.error("Insufficient balance");
      return;
    }

    setIsLoading(true);

    try {
      const contract = getContract(walletClient as any, chainId);
      const amountWei = parseEther(amount);

      const tx = await contract.withdraw(amountWei);

      toast.promise(
        tx.wait().then(async (receipt: any) => {
          // Save to database
          await supabase.from('transactions').insert({
            wallet_address: address,
            amount: amount,
            type: 'withdraw',
            timestamp: new Date().toISOString(),
            tx_hash: tx.hash,
            gas_used: receipt.gasUsed.toString(),
            gas_price: tx.gasPrice?.toString(),
            token_symbol: 'ETH',
            token_address: '0x0000000000000000000000000000000000000000',
          });

          // Update balances
          await fetchAllBalances();

          return receipt;
        }),
        {
          loading: "Processing withdrawal...",
          success: `Successfully withdrew ${amount} ETH`,
          error: "Withdrawal failed",
        }
      );

    } catch (error: any) {
      console.error("Withdrawal error:", error);
      
      if (error.code === 4001) {
        toast.error("Transaction was rejected");
      } else if (error.message?.includes("Insufficient balance")) {
        toast.error("Insufficient balance for withdrawal");
      } else if (error.message?.includes("below minimum")) {
        toast.error("Amount below minimum withdrawal");
      } else if (error.message?.includes("above maximum")) {
        toast.error("Amount above maximum withdrawal");
      } else if (error.message?.includes("Daily withdrawal limit")) {
        toast.error("Daily withdrawal limit exceeded");
      } else {
        toast.error("Withdrawal failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, walletClient, chainId, address, userBalance, fetchAllBalances]);

  // Withdraw token
  const withdrawToken = useCallback(async (tokenAddress: string, amount: string) => {
    if (!isConnected || !walletClient || !chainId) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (isETH(tokenAddress)) {
      return withdraw(amount);
    }

    const currentBalance = tokenBalances[tokenAddress] || "0";
    if (parseFloat(amount) > parseFloat(currentBalance)) {
      toast.error("Insufficient token balance");
      return;
    }

    setIsLoading(true);

    try {
      const contract = getContract(walletClient as any, chainId);
      const tokenInfo = getTokenInfo(tokenAddress, chainId);
      const amountWei = parseTokenAmount(amount, tokenInfo?.decimals || 18);

      const tx = await contract.withdrawToken(tokenAddress, amountWei);

      toast.promise(
        tx.wait().then(async (receipt: any) => {
          // Save to database
          await supabase.from('transactions').insert({
            wallet_address: address,
            amount: amount,
            type: 'withdraw_token',
            timestamp: new Date().toISOString(),
            tx_hash: tx.hash,
            gas_used: receipt.gasUsed.toString(),
            gas_price: tx.gasPrice?.toString(),
            token_symbol: tokenInfo?.symbol || 'UNKNOWN',
            token_address: tokenAddress,
          });

          // Update balances
          await fetchAllBalances();

          return receipt;
        }),
        {
          loading: "Processing token withdrawal...",
          success: `Successfully withdrew ${amount} ${tokenInfo?.symbol}`,
          error: "Token withdrawal failed",
        }
      );

    } catch (error: any) {
      console.error("Token withdrawal error:", error);
      
      if (error.code === 4001) {
        toast.error("Transaction was rejected");
      } else if (error.message?.includes("Insufficient balance")) {
        toast.error("Insufficient token balance for withdrawal");
      } else if (error.message?.includes("below minimum")) {
        toast.error("Amount below minimum withdrawal");
      } else if (error.message?.includes("above maximum")) {
        toast.error("Amount above maximum withdrawal");
      } else if (error.message?.includes("Daily withdrawal limit")) {
        toast.error("Daily withdrawal limit exceeded");
      } else {
        toast.error("Token withdrawal failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, walletClient, chainId, address, tokenBalances, withdraw, fetchAllBalances]);

  // Get transaction history
  const getTransactionHistory = useCallback(async (): Promise<any[]> => {
    if (!address) return [];

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_address', address)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      return [];
    }
  }, [address]);

  // Get gas estimate
  const getGasEstimate = useCallback(async (type: 'deposit' | 'withdraw' | 'depositToken' | 'withdrawToken', amount?: string, tokenAddress?: string) => {
    if (!walletClient || !chainId) return null;

    try {
      const contract = getContract(walletClient as any, chainId);
      
      if (type === 'deposit' && amount) {
        const amountWei = parseEther(amount);
        const gasEstimate = await contract.estimateGas.deposit({
          value: amountWei,
        });
        return gasEstimate;
      } else if (type === 'withdraw' && amount) {
        const amountWei = parseEther(amount);
        const gasEstimate = await contract.estimateGas.withdraw(amountWei);
        return gasEstimate;
      } else if (type === 'depositToken' && amount && tokenAddress) {
        const tokenInfo = getTokenInfo(tokenAddress, chainId);
        const amountWei = parseTokenAmount(amount, tokenInfo?.decimals || 18);
        const gasEstimate = await contract.estimateGas.depositToken(tokenAddress, amountWei);
        return gasEstimate;
      } else if (type === 'withdrawToken' && amount && tokenAddress) {
        const tokenInfo = getTokenInfo(tokenAddress, chainId);
        const amountWei = parseTokenAmount(amount, tokenInfo?.decimals || 18);
        const gasEstimate = await contract.estimateGas.withdrawToken(tokenAddress, amountWei);
        return gasEstimate;
      }
    } catch (error) {
      console.error("Error estimating gas:", error);
      return null;
    }
  }, [walletClient, chainId]);

  return {
    deposit,
    withdraw,
    depositToken,
    withdrawToken,
    fetchUserBalance,
    fetchContractBalance,
    fetchUserTokenBalance,
    fetchContractTokenBalance,
    fetchAllBalances,
    checkAllowance,
    approveToken,
    getTransactionHistory,
    getGasEstimate,
    userBalance,
    contractBalance,
    tokenBalances,
    contractTokenBalances,
    isLoading,
  };
}

