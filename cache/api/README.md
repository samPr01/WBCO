# BTC Deposit & Withdrawal API

A secure Node.js API for handling Bitcoin deposits and withdrawals with Ethereum wallet integration.

## Features

### ✅ Deposit Features
- **Unique BTC Address Generation**: Deterministic BTC addresses for each ETH wallet
- **Real-time Balance Tracking**: Integration with Blockstream API for live balance updates
- **Transaction History**: Complete transaction tracking and history
- **Address Validation**: Secure BTC address format validation
- **Rate Limiting**: Protection against abuse

### ✅ Withdrawal Features (NEW)
- **Secure Withdrawals**: Validate balance and process BTC withdrawals
- **Address Validation**: Verify both ETH and BTC addresses
- **Balance Checking**: Ensure sufficient funds before withdrawal
- **Transaction Logging**: Complete audit trail for all withdrawals
- **Rate Limiting**: Separate rate limits for withdrawal requests
- **Error Handling**: Comprehensive error messages and validation

### 🔧 Technical Features
- **SQLite Database**: Lightweight, persistent storage
- **BIP32/BIP39**: Deterministic address generation
- **Blockstream Integration**: Real-time blockchain data
- **Express.js**: Fast, secure API framework
- **Input Validation**: Comprehensive request validation
- **Security Middleware**: Helmet, CORS, rate limiting

## Prerequisites

- Node.js 18+ 
- npm or yarn
- SQLite3 (included with Node.js)

## Installation

```bash
cd api
npm install
```

## Quick Start

1. **Set up environment variables:**
```bash
cp env.example .env
# Edit .env with your configuration
```

2. **Start the server:**
```bash
npm start
# or for development
npm run dev
```

3. **Test the API:**
```bash
npm test
```

## API Endpoints

### Health Check
```http
GET /api/btc/health
```

### Generate BTC Address
```http
POST /api/btc/generate-address
Content-Type: application/json

{
  "ethAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
}
```

### Check Balance
```http
GET /api/btc/check-deposit/:ethAddress
```

### Get Address Info
```http
GET /api/btc/address/:ethAddress
```

### Get Transaction History
```http
GET /api/btc/transactions/:ethAddress
```

### Withdraw BTC (NEW)
```http
POST /api/btc/withdraw
Content-Type: application/json

{
  "ethAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "btcAddress": "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
  "amount": 0.001
}
```

**Withdrawal Response:**
```json
{
  "success": true,
  "message": "Withdrawal successful",
  "data": {
    "ethAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "btcAddress": "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
    "amount": "0.00100000",
    "transactionHash": "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
    "newBalance": "0.00000000",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Transaction Details
```http
GET /api/btc/transaction/:txHash
```

### Admin: Get All Users
```http
GET /api/btc/admin/users
```

## Configuration

### Environment Variables

```env
PORT=3001
NODE_ENV=development
BTC_TESTNET=true
BTC_MASTER_SEED=your-secret-master-seed
ADMIN_API_KEY=your-admin-api-key
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Database Schema

**Users Table:**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  eth_address TEXT UNIQUE NOT NULL,
  btc_address TEXT NOT NULL,
  btc_balance TEXT DEFAULT '0',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Transactions Table:**
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  eth_address TEXT NOT NULL,
  btc_address TEXT NOT NULL,
  amount TEXT NOT NULL,
  transaction_hash TEXT,
  transaction_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Security Features

### Rate Limiting
- **General requests**: 100 requests per 15 minutes
- **Withdrawal requests**: 5 requests per 15 minutes
- **Address generation**: 10 requests per 15 minutes

### Input Validation
- Ethereum address format validation
- Bitcoin address format validation
- Amount range validation (0.00001 - 100 BTC)
- SQL injection protection

### Error Handling
- Comprehensive error messages
- Proper HTTP status codes
- Detailed logging for debugging

## Testing

Run the comprehensive test suite:

```bash
npm test
```

**Test Coverage:**
- ✅ Health check endpoint
- ✅ Address generation
- ✅ Balance checking
- ✅ Transaction history
- ✅ Withdrawal validation
- ✅ Error handling
- ✅ Rate limiting
- ✅ Invalid input handling

## Monitoring

### Logs
The API logs all important events:
- Address generation
- Balance updates
- Withdrawals
- Errors and exceptions

### Health Monitoring
```bash
curl http://localhost:3001/api/btc/health
```

## Integration with Frontend

### React Component Example
```jsx
import { useState } from 'react';

const BTCDeposit = () => {
  const [btcAddress, setBtcAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const generateAddress = async (ethAddress) => {
    const response = await fetch('/api/btc/generate-address', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ethAddress })
    });
    const data = await response.json();
    setBtcAddress(data.data.btcAddress);
  };

  const withdrawBTC = async (ethAddress, btcAddress, amount) => {
    const response = await fetch('/api/btc/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ethAddress, btcAddress, amount })
    });
    const data = await response.json();
    if (data.success) {
      setBalance(data.data.newBalance);
    }
  };

  return (
    <div>
      {/* Your UI components */}
    </div>
  );
};
```

## Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Configure secure `BTC_MASTER_SEED`
3. Set up proper `ALLOWED_ORIGINS`
4. Use HTTPS in production
5. Set up monitoring and logging

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Variables for Production
```env
NODE_ENV=production
BTC_TESTNET=false
BTC_MASTER_SEED=your-secure-production-seed
ADMIN_API_KEY=your-secure-admin-key
ALLOWED_ORIGINS=https://yourdomain.com
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 404 | Not Found - User/address not found |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

## Support

For issues and questions:
1. Check the logs for detailed error messages
2. Verify your environment configuration
3. Test with the provided test suite
4. Check the Blockstream API status

## License

MIT License - see LICENSE file for details.
