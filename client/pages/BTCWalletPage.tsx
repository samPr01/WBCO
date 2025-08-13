// @ts-nocheck
import React from 'react';
import { useAccount } from 'wagmi';
import BTCWallet from '../components/BTCWallet';

const BTCWalletPage: React.FC = () => {
  const { address: ethAddress, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">BTC Wallet</h1>
          <p className="text-gray-400 mb-6">Please connect your wallet to access BTC functionality</p>
          <div className="text-sm text-gray-500">
            <p>This page allows you to:</p>
            <ul className="mt-2 space-y-1">
              <li>• Generate a unique BTC address for your ETH wallet</li>
              <li>• View your BTC balance in real-time</li>
              <li>• Withdraw BTC to any address</li>
              <li>• View transaction history</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">BTC Wallet</h1>
          <p className="text-gray-400">Manage your Bitcoin deposits and withdrawals</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* BTC Wallet Component */}
          <div className="lg:col-span-2">
            <BTCWallet ethAddress={ethAddress!} />
          </div>

          {/* Additional Info */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">How it works</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium">Generate BTC Address</p>
                  <p className="text-gray-400">Each ETH wallet gets a unique, deterministic BTC address</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium">Deposit BTC</p>
                  <p className="text-gray-400">Send BTC to your generated address and watch your balance update</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium">Withdraw BTC</p>
                  <p className="text-gray-400">Withdraw your BTC to any address with real-time balance updates</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Real-time balance tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>QR code for easy mobile scanning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Secure withdrawal validation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Transaction history</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Blockchain explorer integration</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Copy to clipboard functionality</span>
              </div>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">API Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">BTC Address Generation:</span>
              <span className="text-green-400">✓ Available</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Balance Checking:</span>
              <span className="text-green-400">✓ Available</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Withdrawal Processing:</span>
              <span className="text-green-400">✓ Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BTCWalletPage;

