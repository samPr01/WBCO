import { ethers } from "ethers";

// Token configuration
export const TOKENS = [
  { 
    symbol: "ETH", 
    address: "0x0000000000000000000000000000000000000000", 
    decimals: 18, 
    chainId: 1,
    name: "Ethereum"
  },
  { 
    symbol: "WBTC", 
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", 
    decimals: 8, 
    chainId: 1,
    name: "Wrapped Bitcoin"
  }
];

// Minimal ERC20 ABI
export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function transferFrom(address sender, address recipient, uint256 amount) public returns (bool)",
  "function transfer(address recipient, uint256 amount) public returns (bool)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

// Contract ABI (updated with token functions)
export const WALLETBASE_ABI = [
  // ETH functions
  {
    "inputs": [],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Token functions
  {
    "inputs": [
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "depositToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "withdrawToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Balance functions
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getBalance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "address", "name": "token", "type": "address"}
    ],
    "name": "getTokenBalance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Contract balance functions
  {
    "inputs": [],
    "name": "getContractBalance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "token", "type": "address"}],
    "name": "getContractTokenBalance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Daily limits functions
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserDailyLimits",
    "outputs": [
      {"internalType": "uint256", "name": "depositUsed", "type": "uint256"},
      {"internalType": "uint256", "name": "withdrawalUsed", "type": "uint256"},
      {"internalType": "uint256", "name": "lastReset", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "address", "name": "token", "type": "address"}
    ],
    "name": "getUserDailyTokenLimits",
    "outputs": [
      {"internalType": "uint256", "name": "depositUsed", "type": "uint256"},
      {"internalType": "uint256", "name": "withdrawalUsed", "type": "uint256"},
      {"internalType": "uint256", "name": "lastReset", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "Deposit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "Withdrawal",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "token", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "TokenDeposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "token", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "TokenWithdrawn",
    "type": "event"
  }
];

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Ethereum Mainnet (replace with actual deployed address)
  1: "0x0000000000000000000000000000000000000000",
  // Polygon
  137: "0x0000000000000000000000000000000000000000",
  // BSC
  56: "0x0000000000000000000000000000000000000000",
  // Arbitrum
  42161: "0x0000000000000000000000000000000000000000",
  // Local/Test networks
  31337: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Hardhat
  11155111: "0x0000000000000000000000000000000000000000", // Sepolia
};

// Gas limits for transactions
export const GAS_LIMITS = {
  deposit: 100000,
  withdraw: 100000,
  depositToken: 150000,
  withdrawToken: 150000,
  approve: 50000,
};

// Utility functions
export const formatEther = (wei: string | number) => {
  return ethers.formatEther(wei.toString());
};

export const parseEther = (ether: string | number) => {
  return ethers.parseEther(ether.toString());
};

export const formatBalance = (balance: string | number, decimals: number = 18) => {
  const divisor = Math.pow(10, decimals);
  const formatted = parseFloat(balance.toString()) / divisor;
  return formatted.toFixed(decimals === 8 ? 4 : 4);
};

export const parseTokenAmount = (amount: string | number, decimals: number) => {
  const multiplier = Math.pow(10, decimals);
  return BigInt(Math.floor(parseFloat(amount.toString()) * multiplier));
};

// Get contract instance
export const getContract = (signer: ethers.Signer, chainId: number) => {
  const address = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`Contract not deployed on chain ${chainId}`);
  }
  return new ethers.Contract(address, WALLETBASE_ABI, signer);
};

// Get contract instance for reading (no signer needed)
export const getContractReadOnly = (provider: ethers.providers.Provider, chainId: number) => {
  const address = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`Contract not deployed on chain ${chainId}`);
  }
  return new ethers.Contract(address, WALLETBASE_ABI, provider);
};

// Get ERC20 contract instance
export const getERC20Contract = (tokenAddress: string, signer: ethers.Signer) => {
  return new ethers.Contract(tokenAddress, ERC20_ABI, signer);
};

// Get token info
export const getTokenInfo = (tokenAddress: string, chainId: number) => {
  return TOKENS.find(token => 
    token.address.toLowerCase() === tokenAddress.toLowerCase() && 
    token.chainId === chainId
  );
};

// Check if address is ETH
export const isETH = (tokenAddress: string) => {
  return tokenAddress === "0x0000000000000000000000000000000000000000";
};

// Transaction status types
export enum TransactionStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  FAILED = "failed",
}

// Transaction types
export enum TransactionType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  DEPOSIT_TOKEN = "deposit_token",
  WITHDRAW_TOKEN = "withdraw_token",
}

// Interface for transaction data
export interface TransactionData {
  hash: string;
  type: TransactionType;
  amount: string;
  status: TransactionStatus;
  timestamp: number;
  gasUsed?: string;
  gasPrice?: string;
  tokenSymbol?: string;
  tokenAddress?: string;
}
