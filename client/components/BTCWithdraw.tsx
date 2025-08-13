// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { Copy, ExternalLink, Send, RefreshCw } from 'lucide-react';

interface BTCWithdrawProps {
  className?: string;
}

interface WithdrawalData {
  ethAddress: string;
  btcAddress: string;
  amount: string;
  transactionHash: string;
  newBalance: string;
  timestamp: string;
}

const BTCWithdraw: React.FC<BTCWithdrawProps> = ({ className = '' }) => {
  const { address: ethAddress, isConnected } = useAccount();
  const [btcAddress, setBtcAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [currentBalance, setCurrentBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentWithdrawals, setRecentWithdrawals] = useState<WithdrawalData[]>([]);

  const API_BASE = 'http://localhost:3001/api/btc';

  // Generate BTC address for the connected ETH wallet
  const generateBTCAddress = async () => {
    if (!ethAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE}/generate-address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ethAddress })
      });

      const data = await response.json();
      if (data.success) {
        setBtcAddress(data.data.btcAddress);
        setCurrentBalance(data.data.balance);
        toast.success('BTC address generated successfully');
      } else {
        toast.error(data.error || 'Failed to generate BTC address');
      }
    } catch (error) {
      console.error('Error generating BTC address:', error);
      toast.error('Failed to generate BTC address');
    } finally {
      setIsGenerating(false);
    }
  };

  // Check current BTC balance
  const checkBalance = async () => {
    if (!ethAddress) return;

    try {
      const response = await fetch(`${API_BASE}/check-deposit/${ethAddress}`);
      const data = await response.json();
      if (data.success) {
        setCurrentBalance(data.data.balance);
      }
    } catch (error) {
      console.error('Error checking balance:', error);
    }
  };

  // Withdraw BTC
  const withdrawBTC = async () => {
    if (!ethAddress || !btcAddress) {
      toast.error('Please generate a BTC address first');
      return;
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawAmount) > parseFloat(currentBalance)) {
      toast.error('Insufficient balance');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ethAddress,
          btcAddress,
          amount: parseFloat(withdrawAmount)
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Successfully withdrew ${withdrawAmount} BTC`);
        setCurrentBalance(data.data.newBalance);
        setWithdrawAmount('');
        
        // Add to recent withdrawals
        setRecentWithdrawals(prev => [data.data, ...prev.slice(0, 4)]);
      } else {
        toast.error(data.error || 'Withdrawal failed');
      }
    } catch (error) {
      console.error('Error withdrawing BTC:', error);
      toast.error('Withdrawal failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy BTC address to clipboard
  const copyBTCAddress = () => {
    if (btcAddress) {
      navigator.clipboard.writeText(btcAddress);
      toast.success('BTC address copied to clipboard');
    }
  };

  // Open BTC address in explorer
  const openInExplorer = () => {
    if (btcAddress) {
      window.open(`https://blockstream.info/address/${btcAddress}`, '_blank');
    }
  };

  // Load initial data when wallet connects
  useEffect(() => {
    if (isConnected && ethAddress) {
      checkBalance();
    }
  }, [isConnected, ethAddress]);

  if (!isConnected) {
    return (
      <div className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">BTC Withdrawal</h3>
          <p className="text-gray-400">Please connect your wallet to use BTC withdrawal</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">BTC Withdrawal</h3>
        <button
          onClick={checkBalance}
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Current Balance */}
      <div className="bg-white/10 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Current Balance:</span>
          <span className="text-xl font-bold text-green-400">
            {parseFloat(currentBalance).toFixed(8)} BTC
          </span>
        </div>
      </div>

      {/* BTC Address Section */}
      {!btcAddress ? (
        <div className="mb-6">
          <button
            onClick={generateBTCAddress}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating BTC Address...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Generate BTC Address
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your BTC Address:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={btcAddress}
              readOnly
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-gray-300"
            />
            <button
              onClick={copyBTCAddress}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Copy address"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={openInExplorer}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="View in explorer"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Withdrawal Form */}
      {btcAddress && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Withdraw to BTC Address:
            </label>
            <input
              type="text"
              placeholder="Enter BTC address to withdraw to"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount (BTC):
            </label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.001"
              min="0.00001"
              max={currentBalance}
              step="0.00001"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Min: 0.00001 BTC</span>
              <span>Max: {currentBalance} BTC</span>
            </div>
          </div>

          <button
            onClick={withdrawBTC}
            disabled={isLoading || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processing Withdrawal...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Withdraw BTC
              </>
            )}
          </button>
        </div>
      )}

      {/* Recent Withdrawals */}
      {recentWithdrawals.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Recent Withdrawals</h4>
          <div className="space-y-2">
            {recentWithdrawals.map((withdrawal, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {withdrawal.amount} BTC
                  </span>
                  <span className="text-green-400">
                    {new Date(withdrawal.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1 truncate">
                  TX: {withdrawal.transactionHash}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BTCWithdraw;
