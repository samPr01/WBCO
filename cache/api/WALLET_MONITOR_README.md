# Wallet Monitoring System

## Overview
This is a comprehensive wallet monitoring system for WalletBase.co that tracks ETH, USDT (ERC-20), and BTC payments in real-time. The system monitors specified wallet addresses and records all incoming transactions to a MongoDB database.

## Features

### 🔍 **Real-time Monitoring**
- **ETH Payments**: Monitors Ethereum mainnet for ETH transfers
- **USDT Transfers**: Tracks USDT (ERC-20) token transfers
- **BTC Payments**: Monitors Bitcoin blockchain for payments
- **Auto-refresh**: Checks for new transactions every 30 seconds

### 📊 **Payment Tracking**
- **Transaction Recording**: Stores all payment details in MongoDB
- **User Linking**: Links payments to user accounts (if available)
- **Duplicate Prevention**: Prevents duplicate transaction recording
- **Block Information**: Records block numbers and timestamps

### 🛡️ **Security Features**
- **Address Validation**: Validates wallet addresses before processing
- **Error Handling**: Comprehensive error handling and logging
- **Rate Limiting**: Built-in rate limiting for API endpoints
- **CORS Support**: Secure cross-origin resource sharing

### 📈 **Analytics & Reporting**
- **Payment Statistics**: Real-time payment statistics by coin
- **Transaction History**: Complete transaction history with filtering
- **Export Functionality**: CSV export of payment data
- **Pagination**: Efficient pagination for large datasets

## Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- Ethereum RPC endpoint (Infura, Alchemy, etc.)

### Setup

1. **Install Dependencies**
```bash
cd api
npm install
```

2. **Environment Configuration**
Create a `.env` file in the `api` directory:
```env
# Wallet Addresses
VITE_RECEIVING_WALLET_ETH=0x2499aDe1b915E12819e8E38B1d9ed3493107E2B1
VITE_RECEIVING_WALLET_BTC=bc1qr63h7nzs0lhzumk2stg7fneymwceu2y7erd96l
VITE_RECEIVING_WALLET_USDT=TQbchYKr8FbXCVPNTtDVdrfGYKiUnkJVnY

# Database
MONGODB_URL=mongodb://localhost:27017

# Ethereum RPC
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_API_KEY

# Server Configuration
MONITOR_PORT=3002
NODE_ENV=production
```

3. **Start the Monitor**
```bash
# Development mode
npm run dev

# Production mode
npm run monitor
```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns system status and monitored wallet addresses.

### Get Payments
```
GET /api/payments?page=1&limit=50&coin=ETH&from=0x123...
```
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `coin`: Filter by coin type (ETH, USDT, BTC)
- `from`: Filter by sender address

### Get Payment Statistics
```
GET /api/payments/stats
```
Returns aggregated payment statistics by coin.

### Get Specific Payment
```
GET /api/payments/:hash
```
Returns details for a specific transaction hash.

## Database Schema

### Payments Collection
```javascript
{
  _id: ObjectId,
  coin: "ETH" | "USDT" | "BTC",
  from: "sender_address",
  to: "receiver_address", 
  amount: Number,
  hash: "transaction_hash",
  blockNumber: Number,
  timestamp: Date,
  userId: ObjectId, // Optional user reference
  status: "confirmed" | "pending",
  network: "ethereum" | "bitcoin"
}
```

### Users Collection
```javascript
{
  _id: ObjectId,
  wallet: "wallet_address",
  // ... other user fields
}
```

## Frontend Integration

The system includes a React component (`PaymentMonitor.tsx`) that provides:

- **Real-time Dashboard**: Live payment statistics
- **Transaction List**: Filterable transaction history
- **Export Functionality**: CSV export of payment data
- **Block Explorer Links**: Direct links to transaction details
- **Auto-refresh**: Automatic data refresh every 30 seconds

### Usage in Admin Panel
```tsx
import { PaymentMonitor } from "@/components/PaymentMonitor";

// In your admin component
<TabsContent value="payments">
  <PaymentMonitor />
</TabsContent>
```

## Monitoring Configuration

### Ethereum Monitoring
- **Network**: Ethereum Mainnet
- **Check Interval**: 30 seconds
- **Block Range**: Last 10 blocks
- **Supported Tokens**: ETH, USDT (ERC-20)

### Bitcoin Monitoring
- **API**: Blockchain.info
- **Check Interval**: 30 seconds
- **Transaction Limit**: 10 most recent
- **Address Format**: Legacy and SegWit

## Security Considerations

### Environment Variables
- Store sensitive data in environment variables
- Use strong, unique API keys
- Regularly rotate credentials

### Database Security
- Use MongoDB authentication
- Implement proper access controls
- Regular backups

### Network Security
- Use HTTPS in production
- Implement rate limiting
- Monitor for suspicious activity

## Deployment

### Local Development
```bash
# Start MongoDB
mongod

# Start the monitor
npm run monitor

# Start the frontend
cd ../client
npm run dev
```

### Production Deployment
1. Set up MongoDB (Atlas recommended)
2. Configure environment variables
3. Deploy to your preferred hosting service
4. Set up SSL certificates
5. Configure monitoring and alerts

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3002
CMD ["npm", "run", "monitor"]
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB service status
   - Verify connection string
   - Check network connectivity

2. **Ethereum RPC Errors**
   - Verify API key validity
   - Check rate limits
   - Ensure correct network endpoint

3. **Bitcoin API Errors**
   - Check internet connectivity
   - Verify address format
   - Monitor API rate limits

### Logs
The system provides detailed logging:
- ✅ Success operations
- ❌ Error conditions
- 🔍 Monitoring activities
- 📊 Statistics updates

## Support

For issues or questions:
1. Check the logs for error details
2. Verify environment configuration
3. Test API endpoints manually
4. Review MongoDB connection status

## License

This project is part of the WalletBase.co platform.
