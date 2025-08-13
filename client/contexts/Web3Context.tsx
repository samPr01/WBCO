// @ts-nocheck
import { createContext, useContext, ReactNode } from "react";
import { useAccount, useBalance, useChainId } from "wagmi";
import { formatAddress, getNetworkName } from "@/lib/web3";

interface Web3ContextType {
  address: string | undefined;
  isConnected: boolean;
  chainId: number;
  networkName: string;
  balance: {
    formatted: string;
    symbol: string;
    value: bigint;
  } | null;
  formattedAddress: string;
  copyAddress: () => void;
  openExplorer: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({
    address,
    query: { enabled: !!address },
  });

  const formattedAddress = address ? formatAddress(address) : "";
  const networkName = getNetworkName(chainId);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard
        .writeText(address)
        .then(() => {
          // Success handled by toast in component
        })
        .catch(() => {
          // Error handled silently
        });
    }
  };

  const openExplorer = () => {
    if (address && chainId) {
      const networks: Record<number, string> = {
        1: "https://etherscan.io/address/",
        137: "https://polygonscan.com/address/",
        56: "https://bscscan.com/address/",
        42161: "https://arbiscan.io/address/",
      };
      const explorerUrl = networks[chainId];
      if (explorerUrl) {
        try {
          window.open(`${explorerUrl}${address}`, "_blank");
        } catch (error) {
          // Error handled silently
        }
      }
    }
  };

  const contextValue: Web3ContextType = {
    address,
    isConnected,
    chainId,
    networkName,
    balance: balance
      ? {
          formatted: balance.formatted,
          symbol: balance.symbol,
          value: balance.value,
        }
      : null,
    formattedAddress,
    copyAddress,
    openExplorer,
  };

  return (
    <Web3Context.Provider value={contextValue}>{children}</Web3Context.Provider>
  );
}

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within Web3Provider");
  }
  return context;
};

// Hook for wallet-based user identification
export const useWalletUser = () => {
  const { address, isConnected } = useWeb3();

  return {
    userId: address, // Use wallet address as user ID
    isAuthenticated: isConnected,
    userAddress: address,
  };
};
