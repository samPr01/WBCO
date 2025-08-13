const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.TRADING_PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const DB_NAME = 'trading_platform';
let db;

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ port: 3004 });

// Connect to MongoDB
async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URL);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB');
    
    // Create indexes for better performance
    await db.collection('trades').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('trades').createIndex({ status: 1 });
    await db.collection('trades').createIndex({ symbol: 1 });
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Broadcast to all connected clients
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Get current crypto price (simulated for demo)
function getCurrentPrice(symbol) {
  const basePrices = {
    'BTC': 120000,
    'ETH': 3000,
    'SOL': 200,
    'XRP': 0.5,
    'BNB': 500,
    'ADA': 0.4,
    'DOT': 5,
    'LINK': 15,
    'MATIC': 0.8,
    'AVAX': 25
  };
  
  const basePrice = basePrices[symbol] || 100;
  const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
  return basePrice * (1 + variation);
}

// Simulate price movement for trade resolution
function simulatePriceMovement(openPrice, duration) {
  const volatility = 0.01; // 1% volatility
  const movement = (Math.random() - 0.5) * volatility * 2;
  return openPrice * (1 + movement);
}

// Calculate return percentage based on duration
function getReturnPercentage(duration) {
  const returns = {
    60: 20,    // 60 seconds = 20% return
    120: 30,   // 120 seconds = 30% return
    180: 40,   // 180 seconds = 40% return
    360: 50,   // 360 seconds = 50% return
    7200: 60,  // 7200 seconds = 60% return
    21600: 80  // 21600 seconds = 80% return
  };
  return returns[duration] || 20;
}

// API Routes

// Place a new trade
app.post('/api/trade', async (req, res) => {
  try {
    const { userId, symbol, amount, duration, prediction, tradeType = 'option' } = req.body;
    
    if (!userId || !symbol || !amount || !duration || !prediction) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const openPrice = getCurrentPrice(symbol);
    const returnPercentage = getReturnPercentage(duration);
    const fee = amount * 0.02; // 2% fee
    const expectedReturn = amount * (returnPercentage / 100);
    
    // Create trade document
    const trade = {
      userId,
      symbol,
      amount: parseFloat(amount),
      duration: parseInt(duration),
      prediction: prediction.toLowerCase(), // 'up' or 'down'
      tradeType,
      openPrice,
      returnPercentage,
      fee,
      expectedReturn,
      status: 'pending',
      openTime: new Date(),
      closeTime: new Date(Date.now() + duration * 1000),
      createdAt: new Date()
    };
    
    // Insert trade into database
    const result = await db.collection('trades').insertOne(trade);
    trade._id = result.insertedId;
    
    // Schedule trade resolution
    setTimeout(async () => {
      await resolveTrade(trade._id);
    }, duration * 1000);
    
    // Broadcast new trade to all clients
    broadcast({
      type: 'new_trade',
      data: trade
    });
    
    res.json({
      success: true,
      message: 'Trade placed successfully',
      trade: {
        id: trade._id,
        symbol: trade.symbol,
        amount: trade.amount,
        duration: trade.duration,
        prediction: trade.prediction,
        openPrice: trade.openPrice,
        expectedReturn: trade.expectedReturn,
        status: trade.status,
        openTime: trade.openTime
      }
    });
    
  } catch (error) {
    console.error('Error placing trade:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Resolve a trade (automated 50-50 chance)
async function resolveTrade(tradeId) {
  try {
    const trade = await db.collection('trades').findOne({ _id: new ObjectId(tradeId) });
    if (!trade || trade.status !== 'pending') return;
    
    const closePrice = simulatePriceMovement(trade.openPrice, trade.duration);
    
    // 50-50 chance for up/down
    const random = Math.random();
    const actualDirection = random < 0.5 ? 'up' : 'down';
    const isWin = trade.prediction === actualDirection;
    
    const profit = isWin ? trade.expectedReturn : -trade.amount;
    const totalReturn = isWin ? trade.amount + trade.expectedReturn : 0;
    
    // Update trade with results
    const updateData = {
      status: 'completed',
      closePrice,
      actualDirection,
      isWin,
      profit,
      totalReturn,
      closeTime: new Date()
    };
    
    await db.collection('trades').updateOne(
      { _id: new ObjectId(tradeId) },
      { $set: updateData }
    );
    
    // Get updated trade
    const updatedTrade = await db.collection('trades').findOne({ _id: new ObjectId(tradeId) });
    
    // Broadcast trade resolution
    broadcast({
      type: 'trade_resolved',
      data: updatedTrade
    });
    
  } catch (error) {
    console.error('Error resolving trade:', error);
  }
}

// Get user's trade history
app.get('/api/trades/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, status, symbol } = req.query;
    
    const skip = (page - 1) * limit;
    const filter = { userId };
    
    if (status) filter.status = status;
    if (symbol) filter.symbol = symbol.toUpperCase();
    
    const trades = await db.collection('trades')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await db.collection('trades').countDocuments(filter);
    
    res.json({
      success: true,
      trades,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching trades:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all trades for admin panel
app.get('/api/admin/trades', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, symbol, userId } = req.query;
    
    const skip = (page - 1) * limit;
    const filter = {};
    
    if (status) filter.status = status;
    if (symbol) filter.symbol = symbol.toUpperCase();
    if (userId) filter.userId = userId;
    
    const trades = await db.collection('trades')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await db.collection('trades').countDocuments(filter);
    
    // Calculate statistics
    const stats = await db.collection('trades').aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalTrades: { $sum: 1 },
          totalVolume: { $sum: '$amount' },
          totalProfit: { $sum: '$profit' },
          winRate: {
            $avg: { $cond: [{ $eq: ['$isWin', true] }, 1, 0] }
          }
        }
      }
    ]).toArray();
    
    res.json({
      success: true,
      trades,
      stats: stats[0] || {
        totalTrades: 0,
        totalVolume: 0,
        totalProfit: 0,
        winRate: 0
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching admin trades:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get current prices for all symbols
app.get('/api/prices', (req, res) => {
  const symbols = ['BTC', 'ETH', 'SOL', 'XRP', 'BNB', 'ADA', 'DOT', 'LINK', 'MATIC', 'AVAX'];
  const prices = {};
  
  symbols.forEach(symbol => {
    prices[symbol] = getCurrentPrice(symbol);
  });
  
  res.json({
    success: true,
    prices,
    timestamp: new Date()
  });
});

// Get trade statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await db.collection('trades').aggregate([
      {
        $group: {
          _id: null,
          totalTrades: { $sum: 1 },
          totalVolume: { $sum: '$amount' },
          totalProfit: { $sum: '$profit' },
          winRate: {
            $avg: { $cond: [{ $eq: ['$isWin', true] }, 1, 0] }
          },
          avgTradeSize: { $avg: '$amount' }
        }
      }
    ]).toArray();
    
    const symbolStats = await db.collection('trades').aggregate([
      {
        $group: {
          _id: '$symbol',
          trades: { $sum: 1 },
          volume: { $sum: '$amount' },
          profit: { $sum: '$profit' }
        }
      },
      { $sort: { volume: -1 } }
    ]).toArray();
    
    res.json({
      success: true,
      overall: stats[0] || {
        totalTrades: 0,
        totalVolume: 0,
        totalProfit: 0,
        winRate: 0,
        avgTradeSize: 0
      },
      bySymbol: symbolStats
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Trading API is running' });
});

// Start server
async function startServer() {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`Trading API server running on port ${PORT}`);
    console.log(`WebSocket server running on port 3004`);
  });
}

startServer().catch(console.error);

module.exports = app;
