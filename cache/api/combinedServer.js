const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { MongoClient, ObjectId } = require('mongodb');
const WebSocket = require('ws');
require('dotenv').config();

// Import routes
const btcRoutes = require('./routes/btc');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000', 
    'http://localhost:5173',
    'http://localhost:3001',
    'https://your-frontend-domain.netlify.app' // Add your Netlify domain
  ],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// MongoDB connection
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const DB_NAME = 'trading_platform';
let db;

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

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ 
  server: app.listen(PORT + 1, () => {
    console.log(`🚀 WebSocket server running on port ${PORT + 1}`);
  })
});

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

// Routes
app.use('/api/btc', btcRoutes);

// Trading API Routes

// Place a new trade
app.post('/api/trade', async (req, res) => {
  try {
    const { userId, symbol, prediction, amount, duration } = req.body;
    
    if (!userId || !symbol || !prediction || !amount || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const openPrice = getCurrentPrice(symbol);
    const returnPercentage = getReturnPercentage(duration);
    const expectedReturn = amount * (returnPercentage / 100);
    
    const trade = {
      _id: new ObjectId(),
      userId,
      symbol: symbol.toUpperCase(),
      prediction: prediction.toLowerCase(),
      amount: parseFloat(amount),
      duration: parseInt(duration),
      openPrice,
      expectedReturn,
      returnPercentage,
      status: 'open',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + duration * 1000)
    };

    await db.collection('trades').insertOne(trade);
    
    // Broadcast new trade to all connected clients
    broadcast({
      type: 'new_trade',
      trade
    });

    // Schedule trade resolution
    setTimeout(() => resolveTrade(trade._id.toString()), duration * 1000);

    res.json({
      success: true,
      message: 'Trade placed successfully',
      trade
    });
  } catch (error) {
    console.error('Error placing trade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place trade'
    });
  }
});

// Resolve trade with 50-50 chance
async function resolveTrade(tradeId) {
  try {
    const trade = await db.collection('trades').findOne({ _id: new ObjectId(tradeId) });
    if (!trade || trade.status !== 'open') return;

    const isWin = Math.random() > 0.5; // 50-50 chance
    const closePrice = simulatePriceMovement(trade.openPrice, trade.duration);
    
    const updateData = {
      status: isWin ? 'won' : 'lost',
      closePrice,
      closedAt: new Date(),
      profit: isWin ? trade.expectedReturn : -trade.amount
    };

    await db.collection('trades').updateOne(
      { _id: new ObjectId(tradeId) },
      { $set: updateData }
    );

    // Broadcast trade resolution
    broadcast({
      type: 'trade_resolved',
      tradeId,
      result: updateData
    });
  } catch (error) {
    console.error('Error resolving trade:', error);
  }
}

// Get user's trade history
app.get('/api/trades/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const trades = await db.collection('trades')
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('trades').countDocuments({ userId });

    res.json({
      success: true,
      trades,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching trades:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trades'
    });
  }
});

// Get all trades (admin)
app.get('/api/admin/trades', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, symbol } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    
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
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching admin trades:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trades'
    });
  }
});

// Get current prices
app.get('/api/prices', (req, res) => {
  const symbols = ['BTC', 'ETH', 'SOL', 'XRP', 'BNB', 'ADA', 'DOT', 'LINK', 'MATIC', 'AVAX'];
  const prices = {};
  
  symbols.forEach(symbol => {
    prices[symbol] = getCurrentPrice(symbol);
  });

  res.json({
    success: true,
    prices,
    timestamp: new Date().toISOString()
  });
});

// Get trading statistics
app.get('/api/stats', async (req, res) => {
  try {
    const totalTrades = await db.collection('trades').countDocuments();
    const wonTrades = await db.collection('trades').countDocuments({ status: 'won' });
    const totalVolume = await db.collection('trades').aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    
    const totalProfit = await db.collection('trades').aggregate([
      { $match: { status: { $in: ['won', 'lost'] } } },
      { $group: { _id: null, total: { $sum: '$profit' } } }
    ]).toArray();

    res.json({
      success: true,
      stats: {
        totalTrades,
        wonTrades,
        winRate: totalTrades > 0 ? (wonTrades / totalTrades * 100).toFixed(2) : 0,
        totalVolume: totalVolume[0]?.total || 0,
        totalProfit: totalProfit[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    services: {
      main: 'running',
      trading: 'running',
      websocket: wss.clients.size + ' connected'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'WBCO Combined API Server',
    version: '1.0.0',
    services: {
      'BTC API': '/api/btc/*',
      'Trading API': '/api/trade',
      'WebSocket': `ws://localhost:${PORT + 1}`,
      'Health Check': '/api/health'
    },
    endpoints: {
      'POST /api/trade': 'Place a new trade',
      'GET /api/trades/:userId': 'Get user trade history',
      'GET /api/admin/trades': 'Get all trades (admin)',
      'GET /api/prices': 'Get current crypto prices',
      'GET /api/stats': 'Get trading statistics',
      'GET /api/health': 'Health check'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
async function startServer() {
  await connectDB();
  console.log(`🚀 Combined API server running on port ${PORT}`);
  console.log(`📡 WebSocket server running on port ${PORT + 1}`);
}

startServer().catch(console.error);
