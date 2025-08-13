// @ts-nocheck
import { createConfig, configureChains } from "wagmi";
import { mainnet, polygon, bsc, arbitrum } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon, bsc, arbitrum],
  [publicProvider()]
);

export const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: "WalletBase",
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: "Injected",
        shimDisconnect: true,
      },
    }),
  ],
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
