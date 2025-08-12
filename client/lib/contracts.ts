import { ethers } from "ethers";
import { toast } from "sonner";

// WalletBase Contract ABI (simplified for key functions)
export const WALLET_BASE_ABI = [
  // Deposit functions
  "function deposit() external payable",
  "function depositToken(address token, uint256 amount) external",
  
  // Withdrawal functions
  "function withdraw(uint256 amount) external",
  "function withdrawToken(address token, uint256 amount) external",
  
  // Balance queries
  "function balances(address user) external view returns (uint256)",
  "function tokenBalances(address user, address token) external view returns (uint256)",
  "function getBalance(address user) external view returns (uint256)",
  "function getTokenBalance(address user, address token) external view returns (uint256)",
  "function getContractBalance() external view returns (uint256)",
  "function getContractTokenBalance(address token) external view returns (uint256)",
  
  // Events
  "event Deposit(address indexed user, uint256 amount, uint256 timestamp)",
  "event Withdrawal(address indexed user, uint256 amount, uint256 timestamp)",
  "event TokenDeposited(address indexed user, address indexed token, uint256 amount, uint256 timestamp)",
  "event TokenWithdrawn(address indexed user, address indexed token, uint256 amount, uint256 timestamp)",
];

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  1: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Ethereum - Deployed contract
  137: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Polygon - Same for now
  56: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // BSC - Same for now
  42161: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Arbitrum - Same for now
};

// Supported tokens
export const SUPPORTED_TOKENS = {
  1: { // Ethereum
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    USDC: "0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8",
    WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  },
  137: { // Polygon
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  },
  56: { // BSC
    USDT: "0x55d398326f99059fF775485246999027B3197955",
    USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    WBNB: "0xbb4CdB9CBd36B01bD1cBaEF2aF3C7c7c7c7c7c7c7",
  },
  42161: { // Arbitrum
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    USDC: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  },
};

// Utility functions
export const parseEther = (value: string) => ethers.parseEther(value);
export const formatEther = (value: bigint) => ethers.formatEther(value);

export const parseTokenAmount = (value: string, decimals: number = 18) => {
  return ethers.parseUnits(value, decimals);
};

export const formatBalance = (value: bigint, decimals: number = 18) => {
  return ethers.formatUnits(value, decimals);
};

export const isETH = (address: string) => {
  return address.toLowerCase() === "0x0000000000000000000000000000000000000000" || 
         address.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
};

// Token information
export const TOKENS = {
  1: { // Ethereum
    USDT: { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6, symbol: "USDT" },
    USDC: { address: "0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8", decimals: 6, symbol: "USDC" },
    WBTC: { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8, symbol: "WBTC" },
  },
  137: { // Polygon
    USDT: { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6, symbol: "USDT" },
    USDC: { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", decimals: 6, symbol: "USDC" },
    WMATIC: { address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", decimals: 18, symbol: "WMATIC" },
  },
  56: { // BSC
    USDT: { address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18, symbol: "USDT" },
    USDC: { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18, symbol: "USDC" },
    WBNB: { address: "0xbb4CdB9CBd36B01bD1cBaEF2aF3C7c7c7c7c7c7c7", decimals: 18, symbol: "WBNB" },
  },
  42161: { // Arbitrum
    USDT: { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", decimals: 6, symbol: "USDT" },
    USDC: { address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", decimals: 6, symbol: "USDC" },
    WETH: { address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", decimals: 18, symbol: "WETH" },
  },
};

export const getTokenInfo = (address: string, chainId: number) => {
  const chainTokens = TOKENS[chainId as keyof typeof TOKENS];
  if (!chainTokens) return null;
  
  for (const [symbol, token] of Object.entries(chainTokens)) {
    if (token.address.toLowerCase() === address.toLowerCase()) {
      return { ...token, symbol };
    }
  }
  return null;
};

export const getERC20Contract = (address: string, signer: ethers.Signer) => {
  const abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
  ];
  return new ethers.Contract(address, abi, signer);
};

// Transaction types
export enum TransactionStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

export enum TransactionType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRADE = "trade",
}

export interface TransactionData {
  hash: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: string;
  token?: string;
  timestamp: number;
}

export const GAS_LIMITS = {
  DEPOSIT: 100000,
  WITHDRAW: 100000,
  TRADE: 200000,
};

// Get contract instance
export const getContract = (walletClient: any, chainId: number) => {
  const address = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`Contract not deployed on chain ${chainId}`);
  }
  
  // Create a provider from the wallet client
  const provider = new ethers.BrowserProvider(walletClient);
  const signer = provider.getSigner();
  
  return new ethers.Contract(address, WALLET_BASE_ABI, signer);
};

// Contract interaction functions
export class WalletBaseContract {
  private contract: ethers.Contract;
  private signer: ethers.Signer;

  constructor(provider: ethers.BrowserProvider, chainId: number) {
    const address = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
    if (!address || address === "0x0000000000000000000000000000000000000000") {
      throw new Error(`Contract not deployed on chain ${chainId}`);
    }
    
    this.signer = provider.getSigner();
    this.contract = new ethers.Contract(address, WALLET_BASE_ABI, this.signer);
  }

  // Deposit ETH
  async depositETH(amount: string) {
    try {
      const tx = await this.contract.deposit({
        value: ethers.parseEther(amount)
      });
      
      toast.promise(tx.wait(), {
        loading: "Processing deposit...",
        success: "Deposit successful!",
        error: "Deposit failed"
      });
      
      return await tx.wait();
    } catch (error) {
      console.error("Deposit error:", error);
      toast.error("Deposit failed");
      throw error;
    }
  }

  // Deposit ERC20 token
  async depositToken(tokenAddress: string, amount: string, decimals: number = 18) {
    try {
      // First approve the contract to spend tokens
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ["function approve(address spender, uint256 amount) external returns (bool)"],
        this.signer
      );
      
      const amountWei = ethers.parseUnits(amount, decimals);
      await tokenContract.approve(this.contract.target, amountWei);
      
      // Then deposit
      const tx = await this.contract.depositToken(tokenAddress, amountWei);
      
      toast.promise(tx.wait(), {
        loading: "Processing token deposit...",
        success: "Token deposit successful!",
        error: "Token deposit failed"
      });
      
      return await tx.wait();
    } catch (error) {
      console.error("Token deposit error:", error);
      toast.error("Token deposit failed");
      throw error;
    }
  }

  // Withdraw ETH
  async withdrawETH(amount: string) {
    try {
      const tx = await this.contract.withdraw(ethers.parseEther(amount));
      
      toast.promise(tx.wait(), {
        loading: "Processing withdrawal...",
        success: "Withdrawal successful!",
        error: "Withdrawal failed"
      });
      
      return await tx.wait();
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error("Withdrawal failed");
      throw error;
    }
  }

  // Withdraw ERC20 token
  async withdrawToken(tokenAddress: string, amount: string, decimals: number = 18) {
    try {
      const amountWei = ethers.parseUnits(amount, decimals);
      const tx = await this.contract.withdrawToken(tokenAddress, amountWei);
      
      toast.promise(tx.wait(), {
        loading: "Processing token withdrawal...",
        success: "Token withdrawal successful!",
        error: "Token withdrawal failed"
      });
      
      return await tx.wait();
    } catch (error) {
      console.error("Token withdrawal error:", error);
      toast.error("Token withdrawal failed");
      throw error;
    }
  }

  // Get ETH balance
  async getETHBalance(userAddress: string): Promise<string> {
    try {
      const balance = await this.contract.balances(userAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Get ETH balance error:", error);
      return "0";
    }
  }

  // Get token balance
  async getTokenBalance(userAddress: string, tokenAddress: string, decimals: number = 18): Promise<string> {
    try {
      const balance = await this.contract.tokenBalances(userAddress, tokenAddress);
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error("Get token balance error:", error);
      return "0";
    }
  }
}

// Hook for using the contract
export function useWalletBaseContract(provider: ethers.BrowserProvider | null, chainId: number) {
  if (!provider) return null;
  
  try {
    return new WalletBaseContract(provider, chainId);
  } catch (error) {
    console.error("Contract initialization error:", error);
    return null;
  }
}
