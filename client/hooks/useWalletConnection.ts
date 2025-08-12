import { useEffect, useState, useMemo } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function useWalletConnection() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [isWalletReady, setIsWalletReady] = useState(false);

  // Use memoized wallet detection
  const { isMetaMaskInstalled, isCoinbaseInstalled, isInjectedAvailable } = walletDetection;

  // Memoized wallet detection to avoid unnecessary re-renders
  const walletDetection = useMemo(() => ({
    isMetaMaskInstalled: typeof window !== 'undefined' && window.ethereum?.isMetaMask,
    isCoinbaseInstalled: typeof window !== 'undefined' && window.ethereum?.isCoinbaseWallet,
    isInjectedAvailable: typeof window !== 'undefined' && !!window.ethereum,
  }), []);

  useEffect(() => {
    // Update localStorage when wallet connects/disconnects
    if (isConnected && address) {
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', address);
    } else {
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('walletAddress');
    }
  }, [isConnected, address]);

  useEffect(() => {
    // Check if any wallet is ready
    const hasReadyConnector = connectors.some(connector => connector.ready);
    setIsWalletReady(hasReadyConnector);
  }, [connectors]);

  const getConnectorStatus = (connectorName: string) => {
    const connector = connectors.find(c => c.name === connectorName);
    
    if (!connector) return { ready: false, message: 'Not available' };
    
    if (connector.ready) return { ready: true, message: 'Ready' };
    
    // Check specific wallet installations
    if (connectorName === 'MetaMask' && !isMetaMaskInstalled) {
      return { ready: false, message: 'Install MetaMask' };
    }
    
    if (connectorName === 'Coinbase Wallet' && !isCoinbaseInstalled) {
      return { ready: false, message: 'Install Coinbase Wallet' };
    }
    
    if (connectorName === 'Browser Wallet' && !isInjectedAvailable) {
      return { ready: false, message: 'No wallet detected' };
    }
    
    return { ready: false, message: 'Not ready' };
  };

  return {
    address,
    isConnected,
    isPending,
    isWalletReady,
    connectors,
    connect,
    disconnect,
    getConnectorStatus,
    isMetaMaskInstalled,
    isCoinbaseInstalled,
    isInjectedAvailable,
  };
}
