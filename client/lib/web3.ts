import { createConfig, http } from "wagmi";
import { mainnet, polygon, bsc, arbitrum } from "wagmi/chains";
import { injected, metaMask, coinbaseWallet } from "wagmi/connectors";

export const config = createConfig({
  chains: [mainnet, polygon, bsc, arbitrum],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({
      appName: "WalletBase",
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [arbitrum.id]: http(),
  },
});

// Supported wallet types
export const SUPPORTED_WALLETS = [
  {
    name: "MetaMask",
    icon: "🦊",
    connector: "metaMask",
    description: "Connect using MetaMask wallet",
  },
  {
    name: "Browser Wallet",
    icon: "🌐",
    connector: "injected",
    description: "Connect using browser wallet",
  },
  {
    name: "Coinbase Wallet",
    icon: "🔵",
    connector: "coinbaseWallet",
    description: "Connect using Coinbase Wallet",
  },
];

// Network configurations
export const SUPPORTED_NETWORKS = {
  1: {
    name: "Ethereum",
    symbol: "ETH",
    blockExplorer: "https://etherscan.io",
  },
  137: {
    name: "Polygon",
    symbol: "MATIC",
    blockExplorer: "https://polygonscan.com",
  },
  56: {
    name: "BSC",
    symbol: "BNB",
    blockExplorer: "https://bscscan.com",
  },
  42161: {
    name: "Arbitrum",
    symbol: "ETH",
    blockExplorer: "https://arbiscan.io",
  },
} as const;

// Utility functions
export const formatAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (balance: string, decimals: number = 18) => {
  const value = parseFloat(balance) / Math.pow(10, decimals);
  return value.toFixed(4);
};

export const getNetworkName = (chainId: number) => {
  return (
    SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS]?.name ||
    "Unknown Network"
  );
};
