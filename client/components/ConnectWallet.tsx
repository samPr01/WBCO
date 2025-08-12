import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, LogOut, Copy, ExternalLink } from "lucide-react";
import { formatAddress } from "@/lib/web3";
import { toast } from "sonner";

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

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
      <Card className="w-full max-w-md mx-auto mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Connected Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Address:</span>
            <span className="font-mono text-sm">{formatAddress(address!)}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyAddress}
              className="flex-1"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openExplorer}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Explorer
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => disconnect()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Connect Wallet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {connectors.map((connector) => (
            <Button
              key={connector.uid}
              onClick={() => connect({ connector })}
              disabled={!connector.ready || isPending}
              className="w-full justify-start"
              variant="outline"
            >
              {connector.name === "MetaMask" && "🦊"}
              {connector.name === "Coinbase Wallet" && "🔵"}
              {connector.name === "Browser Wallet" && "🌐"}
              {connector.name}
              {!connector.ready && " (unsupported)"}
            </Button>
          ))}
        </div>
        {connectors.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No wallet connectors available. Please install MetaMask or another wallet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
