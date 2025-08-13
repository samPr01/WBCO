// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Copy, ExternalLink, Download, ChevronDown } from "lucide-react";
import { formatAddress } from "@/lib/web3";
import { toast } from "sonner";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileWalletButton() {
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

  const [isOpen, setIsOpen] = useState(false);

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

  const handleConnect = async (connector: any) => {
    try {
      await connect({ connector });
      setIsOpen(false);
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setIsOpen(false);
  };

  if (isConnected) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
            <Wallet className="w-4 h-4" />
            <span className="hidden sm:inline">{formatAddress(address!)}</span>
            <span className="sm:hidden">Connected</span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Wallet Connected</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Address</div>
              <div className="font-mono text-sm break-all">{address}</div>
            </div>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={copyAddress}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Address
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={openExplorer}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </Button>
              
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={handleDisconnect}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect Wallet
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          size="sm" 
          className="bg-gradient-to-r from-gradient-start to-gradient-end text-white hover:opacity-90"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connect
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Connect Wallet</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-3">
            {connectors.map((connector) => {
              const isMetaMask = connector.name === "MetaMask";
              const isCoinbase = connector.name === "Coinbase Wallet";
              const isInjected = connector.name === "Browser Wallet" || connector.name === "Injected";
              const status = getConnectorStatus(connector.name);
              
              return (
                <Button
                  key={connector.uid}
                  variant="outline"
                  className="w-full justify-start h-12"
                  onClick={() => handleConnect(connector)}
                  disabled={isPending || !status.ready}
                >
                  <span className="text-lg mr-3">
                    {isMetaMask && "🦊"}
                    {isCoinbase && "🔵"}
                    {isInjected && "🌐"}
                  </span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{connector.name}</div>
                    {!status.ready && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {status.message}
                      </div>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
          
          {connectors.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              No wallet connectors available
            </div>
          )}
          
          {/* Installation links */}
          {(!isMetaMaskInstalled || !isCoinbaseInstalled) && (
            <div className="pt-4 border-t">
              <div className="text-sm font-medium mb-3">Install Wallets:</div>
              <div className="space-y-2">
                {!isMetaMaskInstalled && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open('https://metamask.io/download/', '_blank')}
                  >
                    🦊 MetaMask
                  </Button>
                )}
                {!isCoinbaseInstalled && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open('https://www.coinbase.com/wallet/downloads', '_blank')}
                  >
                    🔵 Coinbase Wallet
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
