// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Copy, ExternalLink, Send, RefreshCw, QrCode, Download } from 'lucide-react';

interface BTCWalletProps {
  ethAddress: string;
  className?: string;
}

interface BTCAddressData {
  ethAddress: string;
  btcAddress: string;
  balance: string;
  lastUpdated: string;
}

interface WithdrawalData {
  ethAddress: string;
  btcAddress: string;
  amount: string;
  transactionHash: string;
  newBalance: string;
  timestamp: string;
}

const BTCWallet: React.FC<BTCWalletProps> = ({ ethAddress, className = '' }) => {
  const [btcData, setBtcData] = useState<BTCAddressData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [recentWithdrawals, setRecentWithdrawals] = useState<WithdrawalData[]>([]);
  const [showQR, setShowQR] = useState(false);

  const API_BASE = 'http://localhost:3001/api/btc';

  // Generate BTC address for the ETH wallet
  const generateBTCAddress = async () => {
    if (!ethAddress) {
      toast.error('No Ethereum address provided');
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
        setBtcData({
          ethAddress: data.data.ethAddress,
          btcAddress: data.data.btcAddress,
          balance: data.data.balance,
          lastUpdated: data.data.lastUpdated
        });
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

  // Fetch BTC address and balance
  const fetchBTCData = async () => {
    if (!ethAddress) return;

    setIsLoading(true);
    try {
      const [addressResponse, balanceResponse] = await Promise.all([
        fetch(`${API_BASE}/address/${ethAddress}`),
        fetch(`${API_BASE}/check-deposit/${ethAddress}`)
      ]);

      const addressData = await addressResponse.json();
      const balanceData = await balanceResponse.json();

      if (addressData.success && balanceData.success) {
        setBtcData({
          ethAddress: addressData.data.ethAddress,
          btcAddress: addressData.data.btcAddress,
          balance: balanceData.data.balance,
          lastUpdated: balanceData.data.lastUpdated
        });
      } else if (!addressData.success && addressData.error?.includes('not found')) {
        // Address doesn't exist yet, don't show error
        setBtcData(null);
      } else {
        toast.error('Failed to fetch BTC data');
      }
    } catch (error) {
      console.error('Error fetching BTC data:', error);
      toast.error('Failed to fetch BTC data');
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw BTC
  const withdrawBTC = async () => {
    if (!btcData || !withdrawAddress || !withdrawAmount) {
      toast.error('Please fill in all fields');
      return;
    }

    if (parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawAmount) > parseFloat(btcData.balance)) {
      toast.error('Insufficient balance');
      return;
    }

    setIsWithdrawing(true);
    try {
      const response = await fetch(`${API_BASE}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ethAddress,
          btcAddress: withdrawAddress,
          amount: parseFloat(withdrawAmount)
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Successfully withdrew ${withdrawAmount} BTC`);
        
        // Update balance
        setBtcData(prev => prev ? {
          ...prev,
          balance: data.data.newBalance
        } : null);
        
        // Add to recent withdrawals
        setRecentWithdrawals(prev => [data.data, ...prev.slice(0, 4)]);
        
        // Clear form
        setWithdrawAmount('');
        setWithdrawAddress('');
      } else {
        toast.error(data.error || 'Withdrawal failed');
      }
    } catch (error) {
      console.error('Error withdrawing BTC:', error);
      toast.error('Withdrawal failed. Please try again.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Copy BTC address to clipboard
  const copyBTCAddress = () => {
    if (btcData?.btcAddress) {
      navigator.clipboard.writeText(btcData.btcAddress);
      toast.success('BTC address copied to clipboard');
    }
  };

  // Open BTC address in explorer
  const openInExplorer = () => {
    if (btcData?.btcAddress) {
      window.open(`https://blockstream.info/address/${btcData.btcAddress}`, '_blank');
    }
  };

  // Generate QR code data URL
  const generateQRCode = (text: string): string => {
    // Simple QR code generation using a public API
    // In production, you might want to use a library like qrcode.react
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
    return qrUrl;
  };

  // Download QR code
  const downloadQRCode = () => {
    if (btcData?.btcAddress) {
      const link = document.createElement('a');
      link.href = generateQRCode(btcData.btcAddress);
      link.download = `btc-address-${btcData.btcAddress.slice(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code downloaded');
    }
  };

  // Load data when component mounts or ethAddress changes
  useEffect(() => {
    if (ethAddress) {
      fetchBTCData();
    }
  }, [ethAddress]);

  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">BTC Wallet</h3>
        <button
          onClick={fetchBTCData}
          disabled={isLoading}
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ETH Address Display */}
      <div className="bg-white/10 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm">Connected ETH Address:</span>
          <span className="text-sm font-mono text-blue-400 truncate max-w-xs">
            {ethAddress}
          </span>
        </div>
      </div>

      {/* BTC Address Section */}
      {!btcData ? (
        <div className="mb-6">
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No BTC address generated yet</p>
            <button
              onClick={generateBTCAddress}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 mx-auto"
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
        </div>
      ) : (
        <>
          {/* Current Balance */}
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Current BTC Balance:</span>
              <span className="text-xl font-bold text-green-400">
                {parseFloat(btcData.balance).toFixed(8)} BTC
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Last updated: {new Date(btcData.lastUpdated).toLocaleString()}
            </div>
          </div>

          {/* BTC Address Display */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your BTC Deposit Address:
            </label>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={btcData.btcAddress}
                readOnly
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-gray-300 font-mono"
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
              <button
                onClick={() => setShowQR(!showQR)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Show QR code"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>

            {/* QR Code */}
            {showQR && (
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <div className="flex flex-col items-center">
                  <img
                    src={generateQRCode(btcData.btcAddress)}
                    alt="BTC Address QR Code"
                    className="w-48 h-48 rounded-lg border border-white/20"
                  />
                  <button
                    onClick={downloadQRCode}
                    className="mt-3 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download QR Code
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Withdrawal Form */}
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <h4 className="text-md font-semibold mb-4">Withdraw BTC</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Withdraw to BTC Address:
                </label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
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
                  max={btcData.balance}
                  step="0.00001"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Min: 0.00001 BTC</span>
                  <span>Max: {btcData.balance} BTC</span>
                </div>
              </div>

              <button
                onClick={withdrawBTC}
                disabled={isWithdrawing || !withdrawAmount || !withdrawAddress || parseFloat(withdrawAmount) <= 0}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isWithdrawing ? (
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
          </div>

          {/* Recent Withdrawals */}
          {recentWithdrawals.length > 0 && (
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-md font-semibold mb-3">Recent Withdrawals</h4>
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
                      To: {withdrawal.btcAddress}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      TX: {withdrawal.transactionHash}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Loading State */}
      {isLoading && !btcData && (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-400" />
          <p className="text-gray-400">Loading BTC wallet data...</p>
        </div>
      )}
    </div>
  );
};

export default BTCWallet;
