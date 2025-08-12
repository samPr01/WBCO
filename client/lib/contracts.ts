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
  
  // Events
  "event Deposit(address indexed user, uint256 amount, uint256 timestamp)",
  "event Withdrawal(address indexed user, uint256 amount, uint256 timestamp)",
  "event TokenDeposited(address indexed user, address indexed token, uint256 amount, uint256 timestamp)",
  "event TokenWithdrawn(address indexed user, address indexed token, uint256 amount, uint256 timestamp)",
];

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  1: "0x0000000000000000000000000000000000000000", // Ethereum - Replace with deployed address
  137: "0x0000000000000000000000000000000000000000", // Polygon - Replace with deployed address
  56: "0x0000000000000000000000000000000000000000", // BSC - Replace with deployed address
  42161: "0x0000000000000000000000000000000000000000", // Arbitrum - Replace with deployed address
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
