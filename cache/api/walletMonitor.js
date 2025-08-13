/**********************************************
  Direct Wallet Monitoring for WalletBase.co
  Coins: ETH, USDT (ERC20), BTC
  Backend: Node.js + Express + ethers.js + axios
**********************************************/

const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const axios = require("axios");
const { MongoClient, ObjectId } = require("mongodb");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// -------------------- Your Wallet Addresses --------------------
const WALLET_ETH = process.env.VITE_RECEIVING_WALLET_ETH || "0x2499aDe1b915E12819e8E38B1d9ed3493107E2B1";
const WALLET_USDT = process.env.VITE_RECEIVING_WALLET_USDT || "TQbchYKr8FbXCVPNTtDVdrfGYKiUnkJVnY";
const WALLET_BTC = process.env.VITE_RECEIVING_WALLET_BTC || "bc1qr63h7nzs0lhzumk2stg7fneymwceu2y7erd96l";

// USDT Contract Address (Ethereum Mainnet)
const USDT_CONTRACT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

// -------------------- MongoDB Setup --------------------
const mongoUrl = process.env.MONGODB_URL || "mongodb://localhost:27017";
const dbName = "walletbase";
let db, paymentsCollection, usersCollection;

async function connectToMongoDB() {
  try {
    const client = await MongoClient.connect(mongoUrl, { useUnifiedTopology: true });
    db = client.db(dbName);
    paymentsCollection = db.collection("payments");
    usersCollection = db.collection("users");
    
    // Create indexes for better performance
    await paymentsCollection.createIndex({ hash: 1 }, { unique: true });
    await paymentsCollection.createIndex({ timestamp: -1 });
    await paymentsCollection.createIndex({ from: 1 });
    await paymentsCollection.createIndex({ coin: 1 });
    
    console.log("✅ Connected to MongoDB");
    return client;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}

// -------------------- Ethereum Provider --------------------
const provider = new ethers.JsonRpcProvider(
  process.env.ETHEREUM_RPC_URL || "https://mainnet.infura.io/v3/YOUR_INFURA_API_KEY"
);

// -------------------- Helper: Link Payment to User --------------------
async function linkPaymentToUser(fromAddress, coin, amount, hash, blockNumber = null) {
  try {
    // Check if payment already exists
    const existingPayment = await paymentsCollection.findOne({ hash });
    if (existingPayment) {
      console.log(`Payment ${hash} already recorded`);
      return existingPayment;
    }

    // Find user by wallet address in your users collection
    const user = await usersCollection.findOne({ 
      wallet: fromAddress.toLowerCase() 
    });

    const paymentData = {
      coin,
      from: fromAddress.toLowerCase(),
      to: coin === 'BTC' ? WALLET_BTC : (coin === 'USDT' ? WALLET_USDT : WALLET_ETH).toLowerCase(),
      amount: parseFloat(amount),
      hash,
      blockNumber,
      timestamp: new Date(),
      userId: user ? user._id : null,
      status: 'confirmed',
      network: coin === 'BTC' ? 'bitcoin' : 'ethereum'
    };

    const result = await paymentsCollection.insertOne(paymentData);
    console.log("✅ Payment recorded:", {
      coin,
      from: fromAddress,
      amount,
      hash,
      userId: user ? user._id : null
    });

    return result;
  } catch (error) {
    console.error("❌ Error recording payment:", error);
    throw error;
  }
}

// -------------------- Monitor ETH Payments --------------------
async function monitorETHPayments() {
  try {
    console.log("🔍 Monitoring ETH payments...");
    
    // Get latest block
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = latestBlock - 10; // Check last 10 blocks
    
    // Get all transactions in recent blocks
    for (let blockNumber = fromBlock; blockNumber <= latestBlock; blockNumber++) {
      const block = await provider.getBlock(blockNumber, true);
      
      for (const tx of block.transactions) {
        // Check ETH transfers
        if (tx.to && tx.to.toLowerCase() === WALLET_ETH.toLowerCase() && tx.value > 0) {
          await linkPaymentToUser(
            tx.from, 
            "ETH", 
            ethers.formatEther(tx.value), 
            tx.hash,
            blockNumber
          );
        }

        // Check USDT transfers
        if (tx.to && tx.to.toLowerCase() === USDT_CONTRACT_ADDRESS.toLowerCase()) {
          try {
            // Decode USDT transfer
            const iface = new ethers.Interface([
              "event Transfer(address indexed from, address indexed to, uint256 value)"
            ]);
            
            const logs = await provider.getLogs({
              address: USDT_CONTRACT_ADDRESS,
              topics: [
                iface.getEventTopic("Transfer"),
                null,
                ethers.zeroPadValue(WALLET_ETH, 32)
              ],
              fromBlock: blockNumber,
              toBlock: blockNumber
            });

            for (const log of logs) {
              const parsedLog = iface.parseLog(log);
              const from = parsedLog.args[0];
              const amount = parsedLog.args[2];
              
              await linkPaymentToUser(
                from, 
                "USDT", 
                ethers.formatUnits(amount, 6), 
                log.transactionHash,
                blockNumber
              );
            }
          } catch (error) {
            console.error("Error processing USDT transfer:", error);
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ Error monitoring ETH payments:", error);
  }
}

// -------------------- Monitor BTC Payments --------------------
async function checkBTCPayments() {
  try {
    console.log("🔍 Checking BTC payments...");
    
    const url = `https://blockchain.info/rawaddr/${WALLET_BTC}?limit=10`;
    const response = await axios.get(url);
    
    for (const tx of response.data.txs) {
      // Check if transaction is already recorded
      const existingPayment = await paymentsCollection.findOne({ hash: tx.hash });
      if (existingPayment) continue;
      
      // Process outputs to our address
      for (const output of tx.out) {
        if (output.addr === WALLET_BTC && output.value > 0) {
          // Find the input address (sender)
          const inputAddress = tx.inputs[0]?.prev_out?.addr || 'unknown';
          const amount = output.value / 1e8; // Convert satoshis to BTC
          
          await linkPaymentToUser(
            inputAddress, 
            "BTC", 
            amount.toString(), 
            tx.hash,
            tx.block_height
          );
        }
      }
    }
  } catch (error) {
    console.error("❌ Error checking BTC payments:", error);
  }
}

// -------------------- API Endpoints --------------------
app.get("/api/payments", async (req, res) => {
  try {
    const { page = 1, limit = 50, coin, from, to } = req.query;
    const skip = (page - 1) * limit;
    
    let filter = {};
    if (coin) filter.coin = coin.toUpperCase();
    if (from) filter.from = from.toLowerCase();
    if (to) filter.to = to.toLowerCase();
    
    const payments = await paymentsCollection
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await paymentsCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/api/payments/stats", async (req, res) => {
  try {
    const stats = await paymentsCollection.aggregate([
      {
        $group: {
          _id: "$coin",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          lastPayment: { $max: "$timestamp" }
        }
      }
    ]).toArray();
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/api/payments/:hash", async (req, res) => {
  try {
    const payment = await paymentsCollection.findOne({ hash: req.params.hash });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Wallet Monitor is running",
    timestamp: new Date().toISOString(),
    wallets: {
      ETH: WALLET_ETH,
      USDT: WALLET_USDT,
      BTC: WALLET_BTC
    }
  });
});

// -------------------- Start Monitoring --------------------
async function startMonitoring() {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Start monitoring loops
    setInterval(monitorETHPayments, 30000); // Check ETH every 30 seconds
    setInterval(checkBTCPayments, 30000);   // Check BTC every 30 seconds
    
    console.log("🚀 Wallet monitoring started");
    console.log("📊 Monitoring addresses:");
    console.log(`   ETH: ${WALLET_ETH}`);
    console.log(`   USDT: ${WALLET_USDT}`);
    console.log(`   BTC: ${WALLET_BTC}`);
    
    // Initial check
    await monitorETHPayments();
    await checkBTCPayments();
    
  } catch (error) {
    console.error("❌ Failed to start monitoring:", error);
    process.exit(1);
  }
}

// -------------------- Start Server --------------------
const PORT = process.env.MONITOR_PORT || 3002;

app.listen(PORT, () => {
  console.log(`🔗 Wallet monitor API running on port ${PORT}`);
  console.log(`📚 API docs: http://localhost:${PORT}/api/health`);
});

// Start monitoring
startMonitoring();

module.exports = app;
