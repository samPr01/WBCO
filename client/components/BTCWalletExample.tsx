// @ts-nocheck
import React from 'react';
import { useAccount } from 'wagmi';
import BTCWallet from './BTCWallet';

// Example 1: Basic usage with connected wallet
export const BasicBTCWalletExample: React.FC = () => {
  const { address: ethAddress, isConnected } = useAccount();

  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">BTC Wallet</h2>
      <BTCWallet ethAddress={ethAddress!} />
    </div>
  );
};

// Example 2: With custom styling
export const StyledBTCWalletExample: React.FC = () => {
  const { address: ethAddress, isConnected } = useAccount();

  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }

  return (
    <div className="p-4 bg-gradient-to-r from-blue-900 to-purple-900 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          My Bitcoin Wallet
        </h2>
        <BTCWallet 
          ethAddress={ethAddress!} 
          className="shadow-2xl border border-white/10"
        />
      </div>
    </div>
  );
};

// Example 3: In a dashboard layout
export const DashboardBTCWalletExample: React.FC = () => {
  const { address: ethAddress, isConnected } = useAccount();

  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
      {/* Other dashboard components */}
      <div className="lg:col-span-2">
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Other Dashboard Content</h3>
          <p className="text-gray-400">Your other dashboard components go here...</p>
        </div>
      </div>

      {/* BTC Wallet in sidebar */}
      <div className="lg:col-span-1">
        <BTCWallet ethAddress={ethAddress!} />
      </div>
    </div>
  );
};

// Example 4: With loading states and error handling
export const AdvancedBTCWalletExample: React.FC = () => {
  const { address: ethAddress, isConnected, isConnecting } = useAccount();

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Connecting wallet...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400 mb-4">
          Connect your Ethereum wallet to access BTC functionality
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold">BTC Wallet</h2>
        <p className="text-sm text-gray-400">
          Connected: {ethAddress?.slice(0, 6)}...{ethAddress?.slice(-4)}
        </p>
      </div>
      <BTCWallet ethAddress={ethAddress!} />
    </div>
  );
};

// Example 5: Modal/Dialog usage
export const ModalBTCWalletExample: React.FC = () => {
  const { address: ethAddress, isConnected } = useAccount();
  const [isOpen, setIsOpen] = React.useState(false);

  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }

  return (
    <div className="p-4">
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
      >
        Open BTC Wallet
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">BTC Wallet</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <BTCWallet ethAddress={ethAddress!} />
          </div>
        </div>
      )}
    </div>
  );
};

// Usage instructions
export const BTCWalletUsageInstructions: React.FC = () => {
  return (
    <div className="bg-white/5 rounded-xl p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">BTCWallet Component Usage</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Basic Usage</h3>
          <pre className="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto">
{`import BTCWallet from './components/BTCWallet';
import { useAccount } from 'wagmi';

const MyComponent = () => {
  const { address: ethAddress, isConnected } = useAccount();
  
  if (!isConnected) return <div>Connect wallet first</div>;
  
  return <BTCWallet ethAddress={ethAddress!} />;
};`}
          </pre>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Props</h3>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>ethAddress</strong> (string, required)
                <p className="text-gray-400">The connected Ethereum wallet address</p>
              </div>
              <div>
                <strong>className</strong> (string, optional)
                <p className="text-gray-400">Additional CSS classes for styling</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Features</h3>
          <ul className="space-y-2 text-sm">
            <li>• <strong>BTC Address Generation:</strong> Creates unique BTC addresses for ETH wallets</li>
            <li>• <strong>Real-time Balance:</strong> Shows current BTC balance with auto-refresh</li>
            <li>• <strong>QR Code Display:</strong> Generates QR codes for easy mobile scanning</li>
            <li>• <strong>Withdrawal Form:</strong> Secure BTC withdrawal with validation</li>
            <li>• <strong>Transaction History:</strong> Shows recent withdrawal transactions</li>
            <li>• <strong>Copy to Clipboard:</strong> Easy address copying functionality</li>
            <li>• <strong>Blockchain Explorer:</strong> Direct links to view transactions</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">API Integration</h3>
          <p className="text-sm text-gray-400 mb-2">
            The component automatically integrates with the BTC API endpoints:
          </p>
          <ul className="space-y-1 text-sm text-gray-400">
            <li>• POST /api/btc/generate-address - Generate BTC address</li>
            <li>• GET /api/btc/address/:ethAddress - Get BTC address info</li>
            <li>• GET /api/btc/check-deposit/:ethAddress - Get current balance</li>
            <li>• POST /api/btc/withdraw - Process BTC withdrawals</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

