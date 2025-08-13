// @ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Shield, Link as LinkIcon, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface WalletConnectGateProps {
  children: React.ReactNode;
}

export function WalletConnectGate({ children }: WalletConnectGateProps) {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet is already connected on mount and listen for account changes
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10; // Increased retries
    let retryInterval: NodeJS.Timeout;

    const checkWalletConnection = async () => {
      try {
        // Better mobile detection
        const isMobile =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent,
          );

        // Check for various wallet providers (mobile and desktop)
        const providers = [
          window.ethereum,
          window.web3?.currentProvider,
          window.trustWallet,
          window.imToken,
          window.bitkeep,
          window.coin98,
        ].filter(Boolean);

        // Also check for mobile wallet user agents
        const mobileWalletDetected =
          navigator.userAgent.includes("MetaMaskMobile") ||
          navigator.userAgent.includes("Trust") ||
          navigator.userAgent.includes("CoinbaseWallet") ||
          navigator.userAgent.includes("imToken") ||
          navigator.userAgent.includes("BitKeep");

        if (providers.length > 0) {
          const provider = providers[0];
          try {
            const accounts = await provider.request({
              method: "eth_accounts",
            });
            if (accounts.length > 0) {
              setWalletAddress(accounts[0]);
              setIsWalletConnected(true);
              // Save connection state
              localStorage.setItem("walletConnected", "true");
              localStorage.setItem("walletAddress", accounts[0]);
              clearTimeout(retryInterval);
              return;
            }
          } catch (error) {
            console.log("Wallet found but no accounts connected");
          }
        }

        // Aggressive retry for mobile wallets
        if ((isMobile || mobileWalletDetected) && retryCount < maxRetries) {
          retryCount++;
          retryInterval = setTimeout(() => checkWalletConnection(), 200);
          return;
        }

        // For wallet browsers, try to trigger connection
        if (mobileWalletDetected && providers.length === 0 && retryCount < 3) {
          // Wait for wallet injection
          retryCount++;
          retryInterval = setTimeout(() => checkWalletConnection(), 1000);
        }
      } catch (error) {
        console.log("Error checking wallet connection:", error);
      }
    };

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        disconnectWallet();
      } else {
        // User switched accounts
        setWalletAddress(accounts[0]);
        localStorage.setItem("walletAddress", accounts[0]);
      }
    };

    checkWalletConnection();

    // Add event listeners for multiple providers
    const providers = [window.ethereum, window.trustWallet].filter(Boolean);
    providers.forEach((provider) => {
      if (provider && provider.on) {
        provider.on("accountsChanged", handleAccountsChanged);
      }
    });

    // Cleanup event listeners
    return () => {
      providers.forEach((provider) => {
        if (provider && provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
        }
      });
    };
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);

    try {
      // Comprehensive mobile and wallet detection
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );

      // Check for wallet browsers by user agent
      const isMetaMaskMobile = navigator.userAgent.includes("MetaMaskMobile");
      const isTrustWallet = navigator.userAgent.includes("Trust");
      const isImToken = navigator.userAgent.includes("imToken");
      const isCoinbaseWallet = navigator.userAgent.includes("CoinbaseWallet");

      // Find available wallet providers
      const providers = [
        window.ethereum,
        window.trustWallet,
        window.imToken,
        window.bitkeep,
        window.coin98,
        window.web3?.currentProvider,
      ].filter(Boolean);

      // Also check for multiple providers in ethereum
      if (
        window.ethereum?.providers &&
        Array.isArray(window.ethereum.providers)
      ) {
        providers.push(...window.ethereum.providers);
      }

      if (providers.length > 0) {
        // Select the most appropriate provider
        let provider = providers[0];

        // Prioritize based on detected wallet browser
        if (isMetaMaskMobile && providers.find((p) => p.isMetaMask)) {
          provider = providers.find((p) => p.isMetaMask) || provider;
        } else if (isTrustWallet && providers.find((p) => p.isTrust)) {
          provider = providers.find((p) => p.isTrust) || provider;
        } else if (isImToken && providers.find((p) => p.isImToken)) {
          provider = providers.find((p) => p.isImToken) || provider;
        }

        console.log("Attempting to connect with provider:", provider);

        // Request account access
        const accounts = await provider.request({
          method: "eth_requestAccounts",
        });

        if (accounts && accounts.length > 0) {
          const address = accounts[0];
          setWalletAddress(address);
          setIsWalletConnected(true);

          // Save connection state
          localStorage.setItem("walletConnected", "true");
          localStorage.setItem("walletAddress", address);

          // Detect wallet type more accurately
          let walletType = "Web3 Wallet";
          if (provider.isMetaMask || isMetaMaskMobile) {
            walletType = "MetaMask";
          } else if (provider.isTrust || isTrustWallet) {
            walletType = "Trust Wallet";
          } else if (provider.isImToken || isImToken) {
            walletType = "imToken";
          } else if (provider.isCoinbaseWallet || isCoinbaseWallet) {
            walletType = "Coinbase Wallet";
          }

          toast.success(`${walletType} connected successfully!`);
        } else {
          toast.error(
            "No accounts found. Please unlock your wallet and try again.",
          );
        }
      } else {
        // Handle cases where no provider is immediately available
        const isLikelyWalletBrowser =
          isMetaMaskMobile || isTrustWallet || isImToken || isCoinbaseWallet;

        if (isMobile && isLikelyWalletBrowser) {
          // We're in a wallet browser but provider not injected yet
          toast.error(
            "Wallet not ready. Please refresh the page and try again.",
          );
        } else if (isMobile) {
          // Not in a wallet browser
          toast.error(
            "Please open this website in your mobile wallet's browser (MetaMask, Trust Wallet, etc.)",
          );
        } else {
          // Desktop
          toast.error(
            "No Web3 wallet detected. Please install MetaMask, Trust Wallet, or another Web3 wallet.",
          );
        }
      }
    } catch (error: any) {
      console.error("Wallet connection error:", error);

      if (error.code === 4001) {
        toast.error("Wallet connection was rejected by user.");
      } else if (error.code === -32002) {
        toast.error(
          "Wallet connection request already pending. Please check your wallet app.",
        );
      } else if (error.code === -32603) {
        toast.error("Internal wallet error. Please try refreshing the page.");
      } else {
        toast.error(
          "Failed to connect wallet. Please try again or refresh the page.",
        );
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsWalletConnected(false);
    localStorage.removeItem("walletConnected");
    localStorage.removeItem("walletAddress");
    toast.success("Wallet disconnected");
  };

  // If wallet is connected, render the app
  if (isWalletConnected && walletAddress) {
    return <>{children}</>;
  }

  // Otherwise, show wallet connection interface
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full mx-auto mb-4 flex items-center justify-center">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Connect Your Wallet
          </CardTitle>
          <p className="text-muted-foreground">
            WalletBase is a fully decentralized platform. Connect your Web3
            wallet to access all features securely.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Decentralization Benefits */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium">Your Keys, Your Crypto</div>
                <div className="text-sm text-muted-foreground">
                  Full custody and control
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <LinkIcon className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium">On-Chain Transparency</div>
                <div className="text-sm text-muted-foreground">
                  All transactions on blockchain
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Detection Status */}
          {(() => {
            const providers = [
              window.ethereum,
              window.trustWallet,
              window.imToken,
            ].filter(Boolean);
            const isMobile =
              /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent,
              );
            const isInWalletBrowser =
              window.ethereum ||
              navigator.userAgent.includes("MetaMaskMobile") ||
              navigator.userAgent.includes("Trust");

            if (providers.length === 0 && !isInWalletBrowser) {
              return (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-600 text-center">
                    {isMobile
                      ? "Please open this website in your MetaMask mobile browser or install a Web3 wallet."
                      : "No Web3 wallet detected. Please install MetaMask or another Web3 wallet first."}
                  </p>
                </div>
              );
            }
            return null;
          })()}

          {/* Wallet Options */}
          <div className="space-y-3">
            <Button
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-gradient-start to-gradient-end text-white disabled:opacity-50"
              size="lg"
            >
              <Wallet className="w-5 h-5 mr-2" />
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  // Always try to connect first - most aggressive approach
                  connectWallet();
                }}
                className="text-center p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 h-8 bg-orange-500 rounded-full mx-auto mb-1 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">M</span>
                </div>
                <div className="text-xs">MetaMask</div>
              </button>

              <button
                onClick={() => {
                  // Always try to connect first - most aggressive approach
                  connectWallet();
                }}
                className="text-center p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-1 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">T</span>
                </div>
                <div className="text-xs">Trust Wallet</div>
              </button>

              <button
                onClick={() => {
                  // Always try to connect first - most aggressive approach
                  connectWallet();
                }}
                className="text-center p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-1 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">W</span>
                </div>
                <div className="text-xs">Any Wallet</div>
              </button>
            </div>
          </div>

          {/* Help Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Don't have a wallet?
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="https://metamask.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-sm hover:underline flex items-center gap-1"
              >
                Get MetaMask <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://trustwallet.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-sm hover:underline flex items-center gap-1"
              >
                Get Trust Wallet <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Security Note */}
          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              Your wallet stays secure - we never store your private keys
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
    web3?: any;
    trustWallet?: any;
    imToken?: any;
    bitkeep?: any;
    coin98?: any;
  }
}
