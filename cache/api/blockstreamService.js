const axios = require('axios');

class BlockstreamService {
  constructor() {
    this.baseUrl = 'https://blockstream.info/api';
    this.testnetUrl = 'https://blockstream.info/testnet/api';
    this.useTestnet = process.env.BTC_TESTNET === 'true';
    this.apiUrl = this.useTestnet ? this.testnetUrl : this.baseUrl;
  }

  // Get address info including balance and transactions
  async getAddressInfo(address) {
    try {
      const response = await axios.get(`${this.apiUrl}/address/${address}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching address info:', error.message);
      throw new Error(`Failed to fetch address info: ${error.message}`);
    }
  }

  // Get address balance
  async getAddressBalance(address) {
    try {
      const addressInfo = await this.getAddressInfo(address);
      return {
        address,
        balance: addressInfo.chain_stats.funded_txo_sum - addressInfo.chain_stats.spent_txo_sum,
        totalReceived: addressInfo.chain_stats.funded_txo_sum,
        totalSent: addressInfo.chain_stats.spent_txo_sum,
        txCount: addressInfo.chain_stats.tx_count
      };
    } catch (error) {
      console.error('Error fetching address balance:', error.message);
      throw new Error(`Failed to fetch address balance: ${error.message}`);
    }
  }

  // Get address transactions
  async getAddressTransactions(address) {
    try {
      const response = await axios.get(`${this.apiUrl}/address/${address}/txs`);
      return response.data;
    } catch (error) {
      console.error('Error fetching address transactions:', error.message);
      throw new Error(`Failed to fetch address transactions: ${error.message}`);
    }
  }

  // Get transaction details
  async getTransaction(txHash) {
    try {
      const response = await axios.get(`${this.apiUrl}/tx/${txHash}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction:', error.message);
      throw new Error(`Failed to fetch transaction: ${error.message}`);
    }
  }

  // Get transaction hex (for detailed analysis)
  async getTransactionHex(txHash) {
    try {
      const response = await axios.get(`${this.apiUrl}/tx/${txHash}/hex`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction hex:', error.message);
      throw new Error(`Failed to fetch transaction hex: ${error.message}`);
    }
  }

  // Get latest block height
  async getLatestBlockHeight() {
    try {
      const response = await axios.get(`${this.apiUrl}/blocks/tip/height`);
      return parseInt(response.data);
    } catch (error) {
      console.error('Error fetching latest block height:', error.message);
      throw new Error(`Failed to fetch latest block height: ${error.message}`);
    }
  }

  // Get block info
  async getBlockInfo(blockHeight) {
    try {
      const response = await axios.get(`${this.apiUrl}/block-height/${blockHeight}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching block info:', error.message);
      throw new Error(`Failed to fetch block info: ${error.message}`);
    }
  }

  // Check if transaction is confirmed
  async getTransactionConfirmations(txHash) {
    try {
      const tx = await this.getTransaction(txHash);
      const latestHeight = await this.getLatestBlockHeight();
      return latestHeight - tx.status.block_height + 1;
    } catch (error) {
      console.error('Error checking transaction confirmations:', error.message);
      return 0; // Return 0 confirmations if error
    }
  }

  // Get transaction status
  async getTransactionStatus(txHash) {
    try {
      const tx = await this.getTransaction(txHash);
      const confirmations = await this.getTransactionConfirmations(txHash);
      
      return {
        txHash,
        status: tx.status.confirmed ? 'confirmed' : 'pending',
        confirmations,
        blockHeight: tx.status.block_height,
        blockTime: tx.status.block_time,
        size: tx.size,
        weight: tx.weight,
        fee: tx.fee
      };
    } catch (error) {
      console.error('Error fetching transaction status:', error.message);
      return {
        txHash,
        status: 'unknown',
        confirmations: 0,
        error: error.message
      };
    }
  }

  // Monitor address for new transactions
  async monitorAddress(address, lastCheckedTx = null) {
    try {
      const transactions = await this.getAddressTransactions(address);
      
      if (!lastCheckedTx) {
        return {
          newTransactions: transactions.slice(0, 10), // Return latest 10
          lastTransaction: transactions[0]?.txid || null
        };
      }

      // Find new transactions since last check
      const newTransactions = [];
      for (const tx of transactions) {
        if (tx.txid === lastCheckedTx) {
          break;
        }
        newTransactions.push(tx);
      }

      return {
        newTransactions,
        lastTransaction: transactions[0]?.txid || lastCheckedTx
      };
    } catch (error) {
      console.error('Error monitoring address:', error.message);
      throw new Error(`Failed to monitor address: ${error.message}`);
    }
  }

  // Get network stats
  async getNetworkStats() {
    try {
      const latestHeight = await this.getLatestBlockHeight();
      const latestBlock = await this.getBlockInfo(latestHeight);
      
      return {
        latestBlockHeight: latestHeight,
        latestBlockHash: latestBlock.id,
        latestBlockTime: latestBlock.timestamp,
        network: this.useTestnet ? 'testnet' : 'mainnet'
      };
    } catch (error) {
      console.error('Error fetching network stats:', error.message);
      throw new Error(`Failed to fetch network stats: ${error.message}`);
    }
  }
}

module.exports = BlockstreamService;
