// @ts-nocheck
import { toast } from "sonner";

export interface WalletInfo {
  address: string;
  balance: string;
  network: string;
}

export async function connectWallet(): Promise<WalletInfo | null> {
  try {
    if (!window.ethereum) {
      toast.error("No Web3 wallet detected. Please install MetaMask or another Web3 wallet.");
      return null;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (accounts.length === 0) {
      toast.error("No accounts found. Please unlock your wallet and try again.");
      return null;
    }

    const address = accounts[0];
    const balance = await getWalletBalance(address);
    const network = await getNetworkName();

    localStorage.setItem("walletConnected", "true");
    localStorage.setItem("walletAddress", address);

    toast.success("Wallet connected successfully!");

    return {
      address,
      balance,
      network,
    };
  } catch (error) {
    console.error("Wallet connection error:", error);
    toast.error("Failed to connect wallet. Please try again.");
    return null;
  }
}

export async function getWalletBalance(address: string): Promise<string> {
  try {
    if (!window.ethereum) return "0";

    const balance = await window.ethereum.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    });

    // Convert from Wei to ETH
    const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
    return ethBalance.toFixed(4);
  } catch (error) {
    console.error("Error fetching balance:", error);
    return "0";
  }
}

export async function getNetworkName(): Promise<string> {
  try {
    if (!window.ethereum) return "Unknown";

    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    const networks: { [key: string]: string } = {
      "0x1": "Ethereum Mainnet",
      "0x3": "Ropsten Testnet",
      "0x4": "Rinkeby Testnet",
      "0x5": "Goerli Testnet",
      "0x2a": "Kovan Testnet",
      "0x38": "Binance Smart Chain",
      "0x89": "Polygon Mainnet",
      "0xa4b1": "Arbitrum One",
      "0xa": "Optimism",
    };

    return networks[chainId] || `Unknown Network (${chainId})`;
  } catch (error) {
    console.error("Error fetching network:", error);
    return "Unknown";
  }
}

export async function sendTransaction(to: string, amount: string, tokenAddress?: string): Promise<string | null> {
  try {
    if (!window.ethereum) {
      toast.error("No Web3 wallet detected");
      return null;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (accounts.length === 0) {
      toast.error("No accounts found");
      return null;
    }

    const from = accounts[0];

    // For ETH transactions
    if (!tokenAddress) {
      const value = (parseFloat(amount) * Math.pow(10, 18)).toString(16);

      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from,
          to,
          value: `0x${value}`,
        }],
      });

      toast.success("Transaction submitted successfully!");
      return txHash;
    }

    // For token transactions, you would need to implement ERC-20 contract interaction
    toast.info("Token transactions require additional implementation");
    return null;

  } catch (error: any) {
    console.error("Transaction error:", error);
    
    if (error.code === 4001) {
      toast.error("Transaction was rejected by user");
    } else if (error.code === -32603) {
      toast.error("Transaction failed: insufficient funds or network error");
    } else {
      toast.error("Transaction failed. Please try again.");
    }
    
    return null;
  }
}

export function disconnectWallet(): void {
  localStorage.removeItem("walletConnected");
  localStorage.removeItem("walletAddress");
  toast.success("Wallet disconnected");
}

export function isWalletConnected(): boolean {
  return localStorage.getItem("walletConnected") === "true";
}

export function getConnectedWalletAddress(): string | null {
  return localStorage.getItem("walletAddress");
}
