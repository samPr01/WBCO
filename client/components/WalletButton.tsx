// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Copy, ExternalLink, Download } from "lucide-react";
import { formatAddress } from "@/lib/web3";
import { toast } from "sonner";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WalletButton() {
  const { 
    address, 
    isConnected, 
    isPending, 
    connectors, 
    connect, 
    disconnect,
    getConnectorStatus,
    isMetaMaskInstalled,
    isCoinbaseInstalled,
  } = useWalletConnection();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard!");
    }
  };

  const openExplorer = () => {
    if (address) {
      window.open(`https://etherscan.io/address/${address}`, "_blank");
    }
  };

  if (isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Wallet className="w-4 h-4" />
            {formatAddress(address!)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={copyAddress}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openExplorer}>
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Explorer
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => disconnect()} className="text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {connectors.map((connector) => {
          const isMetaMask = connector.name === "MetaMask";
          const isCoinbase = connector.name === "Coinbase Wallet";
          const isInjected = connector.name === "Browser Wallet" || connector.name === "Injected";
          const status = getConnectorStatus(connector.name);
          
          return (
            <DropdownMenuItem
              key={connector.uid}
              onClick={() => connect({ connector })}
              disabled={isPending || !status.ready}
              className="flex items-center gap-2"
            >
              {isMetaMask && "🦊"}
              {isCoinbase && "🔵"}
              {isInjected && "🌐"}
              <span className="flex-1">{connector.name}</span>
              {!status.ready && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {status.message}
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
        
        {connectors.length === 0 && (
          <DropdownMenuItem disabled>
            <span className="text-sm text-muted-foreground">
              No wallet connectors available
            </span>
          </DropdownMenuItem>
        )}
        
        {/* Installation links */}
        {(!isMetaMaskInstalled || !isCoinbaseInstalled) && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              Install wallets:
            </div>
            {!isMetaMaskInstalled && (
              <DropdownMenuItem
                onClick={() => window.open('https://metamask.io/download/', '_blank')}
              >
                🦊 MetaMask
              </DropdownMenuItem>
            )}
            {!isCoinbaseInstalled && (
              <DropdownMenuItem
                onClick={() => window.open('https://www.coinbase.com/wallet/downloads', '_blank')}
              >
                🔵 Coinbase Wallet
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

