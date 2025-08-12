const express = require('express');
const { body, param, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const Database = require('../database');
const BTCAddressGenerator = require('../btcAddressGenerator');
const BlockstreamService = require('../blockstreamService');

const router = express.Router();
const db = new Database();
const btcGenerator = new BTCAddressGenerator();
const blockstream = new BlockstreamService();

// Rate limiting for withdrawal requests
const withdrawalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 withdrawal requests per windowMs
  message: 'Too many withdrawal requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

router.use(limiter);

// Validation middleware
const validateEthAddress = [
  body('ethAddress')
    .isEthereumAddress()
    .withMessage('Invalid Ethereum address format')
    .normalizeEmail(),
];

const validateBtcAddress = [
  body('btcAddress')
    .isLength({ min: 26, max: 35 })
    .withMessage('Invalid BTC address length')
    .matches(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/)
    .withMessage('Invalid BTC address format'),
];

// Generate BTC address for ETH address
router.post('/generate-address', validateEthAddress, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { ethAddress } = req.body;

    // Check if user already exists
    const existingUser = await db.getUserByEthAddress(ethAddress);
    if (existingUser) {
      return res.json({
        success: true,
        message: 'Address already generated',
        data: {
          ethAddress: existingUser.eth_address,
          btcAddress: existingUser.btc_address,
          balance: existingUser.btc_balance,
          lastUpdated: existingUser.last_updated
        }
      });
    }

    // Generate new BTC address
    const btcAddressData = btcGenerator.generateAddressForEthAddress(ethAddress);
    
    // Store in database
    await db.addUser(ethAddress, btcAddressData.address);

    res.json({
      success: true,
      message: 'BTC address generated successfully',
      data: {
        ethAddress,
        btcAddress: btcAddressData.address,
        derivationPath: btcAddressData.derivationPath,
        balance: 0,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating BTC address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate BTC address',
      error: error.message
    });
  }
});

// Check BTC deposit balance
router.get('/check-deposit/:ethAddress', async (req, res) => {
  try {
    const { ethAddress } = req.params;

    // Validate ETH address
    if (!ethAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Ethereum address format'
      });
    }

    // Get user from database
    const user = await db.getUserByEthAddress(ethAddress);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No BTC address found for this ETH address. Generate one first.'
      });
    }

    // Fetch current balance from Blockstream
    const balanceData = await blockstream.getAddressBalance(user.btc_address);
    
    // Update database with new balance
    await db.updateBtcBalance(ethAddress, balanceData.balance);

    // Get recent transactions
    const transactions = await blockstream.getAddressTransactions(user.btc_address);
    const recentTransactions = transactions.slice(0, 5); // Last 5 transactions

    // Process new transactions and add to database
    for (const tx of recentTransactions) {
      const existingTx = await db.getTransactionByHash(tx.txid);
      if (!existingTx) {
        // Calculate amount for this address
        let amount = 0;
        for (const output of tx.vout) {
          if (output.scriptpubkey_address === user.btc_address) {
            amount += output.value;
          }
        }
        
        if (amount > 0) {
          await db.addTransaction(
            ethAddress,
            user.btc_address,
            tx.txid,
            amount / 100000000, // Convert satoshis to BTC
            tx.status.confirmed ? 6 : 0, // Assume 6+ confirmations if confirmed
            tx.status.block_height
          );
        }
      }
    }

    res.json({
      success: true,
      data: {
        ethAddress: user.eth_address,
        btcAddress: user.btc_address,
        balance: balanceData.balance / 100000000, // Convert satoshis to BTC
        totalReceived: balanceData.totalReceived / 100000000,
        totalSent: balanceData.totalSent / 100000000,
        transactionCount: balanceData.txCount,
        lastUpdated: new Date().toISOString(),
        recentTransactions: recentTransactions.map(tx => ({
          txid: tx.txid,
          amount: tx.vout.reduce((sum, output) => {
            if (output.scriptpubkey_address === user.btc_address) {
              return sum + output.value;
            }
            return sum;
          }, 0) / 100000000,
          confirmations: tx.status.confirmed ? 6 : 0,
          blockHeight: tx.status.block_height,
          timestamp: tx.status.block_time
        }))
      }
    });

  } catch (error) {
    console.error('Error checking BTC deposit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check BTC deposit',
      error: error.message
    });
  }
});

// Get user's BTC address
router.get('/address/:ethAddress', async (req, res) => {
  try {
    const { ethAddress } = req.params;

    if (!ethAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Ethereum address format'
      });
    }

    const user = await db.getUserByEthAddress(ethAddress);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No BTC address found for this ETH address'
      });
    }

    res.json({
      success: true,
      data: {
        ethAddress: user.eth_address,
        btcAddress: user.btc_address,
        balance: user.btc_balance,
        lastUpdated: user.last_updated
      }
    });

  } catch (error) {
    console.error('Error getting BTC address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get BTC address',
      error: error.message
    });
  }
});

// Get transaction history for user
router.get('/transactions/:ethAddress', async (req, res) => {
  try {
    const { ethAddress } = req.params;

    if (!ethAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Ethereum address format'
      });
    }

    const transactions = await db.getUserTransactions(ethAddress);

    res.json({
      success: true,
      data: {
        ethAddress,
        transactions: transactions.map(tx => ({
          id: tx.id,
          txHash: tx.tx_hash,
          amount: tx.amount,
          confirmations: tx.confirmations,
          blockHeight: tx.block_height,
          status: tx.status,
          createdAt: tx.created_at
        }))
      }
    });

  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions',
      error: error.message
    });
  }
});

// Get transaction status
router.get('/transaction/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;

    const txStatus = await blockstream.getTransactionStatus(txHash);
    
    res.json({
      success: true,
      data: txStatus
    });

  } catch (error) {
    console.error('Error getting transaction status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction status',
      error: error.message
    });
  }
});

// POST /api/btc/withdraw - Withdraw BTC to specified address
router.post('/withdraw', 
  withdrawalLimiter,
  [
    body('ethAddress')
      .isEthereumAddress()
      .withMessage('Invalid Ethereum address'),
    body('btcAddress')
      .isLength({ min: 26, max: 35 })
      .matches(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/)
      .withMessage('Invalid Bitcoin address'),
    body('amount')
      .isFloat({ min: 0.00001, max: 100 })
      .withMessage('Amount must be between 0.00001 and 100 BTC'),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { ethAddress, btcAddress, amount } = req.body;

      // Get user from database
      const user = await db.getUserByEthAddress(ethAddress);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found. Please generate a BTC address first.'
        });
      }

      // Check if user has sufficient balance
      const currentBalance = parseFloat(user.btc_balance || 0);
      const withdrawalAmount = parseFloat(amount);
      
      if (currentBalance < withdrawalAmount) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient balance',
          details: {
            currentBalance: currentBalance.toFixed(8),
            requestedAmount: withdrawalAmount.toFixed(8),
            shortfall: (withdrawalAmount - currentBalance).toFixed(8)
          }
        });
      }

      // Validate BTC address format
      if (!btcGenerator.validateAddress(btcAddress)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Bitcoin address format'
        });
      }

      // Simulate BTC withdrawal (in production, this would use a real BTC service)
      const withdrawalResult = await simulateBTCWithdrawal(btcAddress, withdrawalAmount);
      
      if (!withdrawalResult.success) {
        return res.status(500).json({
          success: false,
          error: 'Withdrawal failed',
          details: withdrawalResult.error
        });
      }

      // Update user balance in database
      const newBalance = currentBalance - withdrawalAmount;
      await db.updateBtcBalance(ethAddress, newBalance.toFixed(8));

      // Log the withdrawal transaction
      const transactionData = {
        eth_address: ethAddress,
        btc_address: btcAddress,
        amount: withdrawalAmount.toFixed(8),
        transaction_hash: withdrawalResult.txHash,
        transaction_type: 'withdrawal',
        status: 'completed',
        timestamp: new Date().toISOString()
      };

      await db.addTransaction(transactionData);

      // Log withdrawal for monitoring
      console.log(`[WITHDRAWAL] ${ethAddress} withdrew ${withdrawalAmount} BTC to ${btcAddress}. TX: ${withdrawalResult.txHash}`);

      res.json({
        success: true,
        message: 'Withdrawal successful',
        data: {
          ethAddress,
          btcAddress,
          amount: withdrawalAmount.toFixed(8),
          transactionHash: withdrawalResult.txHash,
          newBalance: newBalance.toFixed(8),
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Withdrawal error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
      });
    }
  }
);

// Simulate BTC withdrawal (replace with real BTC service in production)
async function simulateBTCWithdrawal(btcAddress, amount) {
  try {
    // In production, this would integrate with:
    // - NOWPayments API
    // - Blockstream API (if you have a wallet)
    // - Coinbase Commerce API
    // - BitGo API
    // - Or your own BTC node

    // For now, simulate a successful withdrawal
    const txHash = generateMockTxHash();
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate 95% success rate (5% failure for testing)
    if (Math.random() < 0.05) {
      throw new Error('Network error - please try again');
    }

    return {
      success: true,
      txHash,
      message: 'Withdrawal processed successfully'
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Generate a mock transaction hash for testing
function generateMockTxHash() {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

// Admin route: Get all users (protected)
router.get('/admin/users', async (req, res) => {
  try {
    // Simple admin check - in production, use proper authentication
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const users = await db.getAllUsers();

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.id,
          ethAddress: user.eth_address,
          btcAddress: user.btc_address,
          balance: user.btc_balance,
          lastUpdated: user.last_updated,
          createdAt: user.created_at
        })),
        totalUsers: users.length
      }
    });

  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const networkStats = await blockstream.getNetworkStats();
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        network: networkStats.network,
        latestBlockHeight: networkStats.latestBlockHeight,
        uptime: process.uptime()
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Service unhealthy',
      error: error.message
    });
  }
});

module.exports = router;
