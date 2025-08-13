# Automated Trading System

This document describes the complete automated trading system that has been integrated into the WalletBase platform.

## 🚀 Features

### Real-Time Trading
- **Automated 50-50 Up/Down Logic**: All trades have exactly 50% chance of winning or losing
- **Real-Time Price Updates**: Live crypto prices with 5-second refresh intervals
- **WebSocket Integration**: Real-time trade resolution notifications
- **Multiple Timeframes**: 60s, 120s, 180s, 360s, 7200s, 21600s with different return percentages

### Trading Interface
- **Clickable Crypto Charts**: Click on any crypto in the Live Coin Watch widget to start trading
- **Intuitive UI**: Matches the existing dark theme and design patterns
- **Trade History**: Complete order history with expandable details
- **Buy Again Feature**: Quick re-trade with same parameters

### Admin Panel
- **Complete Trade Monitoring**: View all trades from all users
- **Real-Time Statistics**: Total trades, volume, profit, win rate
- **Advanced Filtering**: Filter by status, symbol, user, trade type
- **Export Functionality**: Download trade data as CSV
- **User Privacy**: Option to show/hide full user IDs

## 🛠️ Setup Instructions

### 1. Backend Setup

#### Install Dependencies
```bash
cd api
npm install ws
```

#### Start Trading API Server
```bash
npm run trading
```

The trading API will run on:
- **HTTP API**: `http://localhost:3003`
- **WebSocket**: `ws://localhost:3004`

#### Environment Variables
Add to your `.env` file:
```env
VITE_TRADING_API_URL=http://localhost:3003
MONGODB_URL=mongodb://localhost:27017
TRADING_PORT=3003
```

### 2. Frontend Integration

The trading system is already integrated into the existing frontend:

- **Trading Page**: `/trading/:symbol` (e.g., `/trading/BTC`)
- **Orders Page**: `/orders` - User's trade history
- **Admin Panel**: `/admin` - Admin trade monitoring

### 3. Database Setup

The system uses MongoDB with the following collections:
- `trades` - All trade records
- Indexes: `userId`, `status`, `symbol`

## 📊 Trading Logic

### Return Percentages
| Duration | Return % |
|----------|----------|
| 60s      | 20%      |
| 120s     | 30%      |
| 180s     | 40%      |
| 360s     | 50%      |
| 7200s    | 60%      |
| 21600s   | 80%      |

### Trade Resolution
1. **Trade Placement**: User selects crypto, amount, duration, and prediction (UP/DOWN)
2. **Price Capture**: System captures current price as open price
3. **Timer**: Trade runs for the specified duration
4. **Resolution**: 50-50 random chance determines actual direction
5. **Payout**: Win = amount + return, Loss = -amount

## 🔌 API Endpoints

### Trading API (`http://localhost:3003`)

#### Place Trade
```http
POST /api/trade
Content-Type: application/json

{
  "userId": "0x...",
  "symbol": "BTC",
  "amount": 100,
  "duration": 60,
  "prediction": "up",
  "tradeType": "option"
}
```

#### Get User Trades
```http
GET /api/trades/:userId?page=1&limit=20&status=completed&symbol=BTC
```

#### Get All Trades (Admin)
```http
GET /api/admin/trades?page=1&limit=50&status=completed&symbol=BTC&userId=0x...
```

#### Get Current Prices
```http
GET /api/prices
```

#### Get Statistics
```http
GET /api/stats
```

### WebSocket Events (`ws://localhost:3004`)

#### Trade Resolution
```json
{
  "type": "trade_resolved",
  "data": {
    "_id": "...",
    "userId": "0x...",
    "symbol": "BTC",
    "amount": 100,
    "prediction": "up",
    "actualDirection": "down",
    "isWin": false,
    "profit": -100,
    "status": "completed"
  }
}
```

## 🎯 Usage Examples

### 1. User Places a Trade
1. Navigate to `/market`
2. Click on any crypto in the Live Coin Watch widget
3. Select trade type (Option/Contract)
4. Choose duration (60s = 20% return)
5. Enter amount ($100)
6. Click UP or DOWN
7. Wait for trade resolution

### 2. View Trade History
1. Navigate to `/orders`
2. See all your trades with status
3. Click expand arrow for detailed view
4. Use "Buy Again" to repeat trade

### 3. Admin Monitoring
1. Navigate to `/admin` (requires admin wallet)
2. View real-time statistics
3. Filter trades by various criteria
4. Export data as CSV

## 🔧 Customization

### Admin Access
Update the admin wallet address in `client/pages/AdminPanel.tsx`:
```typescript
const isAdmin = address === 'YOUR_ADMIN_WALLET_ADDRESS';
```

### Return Percentages
Modify the `getReturnPercentage` function in `api/tradingAPI.js`:
```javascript
function getReturnPercentage(duration) {
  const returns = {
    60: 20,    // 60 seconds = 20% return
    120: 30,   // 120 seconds = 30% return
    // ... add more durations
  };
  return returns[duration] || 20;
}
```

### Supported Cryptocurrencies
Update the `getCurrentPrice` function in `api/tradingAPI.js`:
```javascript
const basePrices = {
  'BTC': 120000,
  'ETH': 3000,
  'SOL': 200,
  // ... add more cryptocurrencies
};
```

## 🚨 Security Considerations

1. **Admin Access**: Only specific wallet addresses can access admin panel
2. **Rate Limiting**: Implement rate limiting on trade placement
3. **Input Validation**: All inputs are validated server-side
4. **Database Indexing**: Proper indexes for performance
5. **Error Handling**: Comprehensive error handling and logging

## 📈 Performance

- **Real-Time Updates**: WebSocket for instant notifications
- **Database Optimization**: Indexed queries for fast retrieval
- **Caching**: Price data cached to reduce API calls
- **Pagination**: Efficient pagination for large datasets

## 🔄 Deployment

### Production Setup
1. Update environment variables for production URLs
2. Set up MongoDB Atlas or production MongoDB
3. Configure WebSocket server for production
4. Set up proper SSL certificates
5. Configure load balancing if needed

### Monitoring
- Monitor trade volume and win rates
- Set up alerts for unusual activity
- Track API performance and response times
- Monitor WebSocket connections

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check if WebSocket server is running on port 3004
   - Verify firewall settings

2. **Trades Not Resolving**
   - Check MongoDB connection
   - Verify trade resolution timers

3. **Admin Panel Access Denied**
   - Verify admin wallet address configuration
   - Check wallet connection

4. **Price Data Not Loading**
   - Check trading API server status
   - Verify API endpoints

### Logs
Check server logs for detailed error information:
```bash
npm run trading
```

## 📞 Support

For technical support or questions about the trading system, please refer to the main project documentation or contact the development team.
