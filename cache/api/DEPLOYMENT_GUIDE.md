# 🚀 Railway Deployment Guide

## Quick Setup (5 minutes)

### 1. Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with GitHub
- Create a new project

### 2. Connect Your Repository
- Click "Deploy from GitHub repo"
- Select your WBCO repository
- Set the root directory to: `cache/api`

### 3. Add Environment Variables
In Railway dashboard, add these environment variables:

```env
NODE_ENV=production
PORT=3001
MONGODB_URL=mongodb://localhost:27017
ALLOWED_ORIGINS=https://your-frontend-domain.netlify.app,http://localhost:3000,http://localhost:5173
VITE_RECEIVING_WALLET_ETH=0x2499aDe1b915E12819e8E38B1d9ed3493107E2B1
VITE_RECEIVING_WALLET_BTC=bc1qr63h7nzs0lhzumk2stg7fneymwceu2y7erd96l
VITE_RECEIVING_WALLET_USDT=TQbchYKr8FbXCVPNTtDVdrfGYKiUnkJVnY
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_API_KEY
```

### 4. Add MongoDB Database
- In Railway dashboard, click "New"
- Select "Database" → "MongoDB"
- Copy the connection string
- Update `MONGODB_URL` in environment variables

### 5. Deploy
- Railway will automatically deploy when you push to GitHub
- Get your domain from Railway dashboard

## Alternative: Render Deployment

### 1. Create Render Account
- Go to [render.com](https://render.com)
- Sign up with GitHub

### 2. Create Web Service
- Click "New" → "Web Service"
- Connect your GitHub repo
- Set root directory to: `cache/api`
- Build command: `npm install`
- Start command: `npm start`

### 3. Add Environment Variables
Same as Railway above

### 4. Add MongoDB
- Create a new MongoDB service in Render
- Use the connection string in environment variables

## Alternative: Vercel Deployment

### 1. Create Vercel Account
- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub

### 2. Deploy API Routes
- Import your GitHub repo
- Set root directory to: `cache/api`
- Vercel will automatically detect Node.js

### 3. Add Environment Variables
Same as above

### 4. Note: WebSocket Limitation
Vercel doesn't support WebSocket connections. You'll need to:
- Remove WebSocket functionality
- Use polling for real-time updates

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (production/development) | Yes |
| `PORT` | Server port (Railway sets this) | No |
| `MONGODB_URL` | MongoDB connection string | Yes |
| `ALLOWED_ORIGINS` | CORS allowed origins | Yes |
| `VITE_RECEIVING_WALLET_*` | Your receiving wallet addresses | Yes |
| `ETHEREUM_RPC_URL` | Infura/Alchemy RPC URL | Yes |

## Testing Your Deployment

### 1. Health Check
```bash
curl https://your-railway-domain.railway.app/api/health
```

### 2. Test Trading API
```bash
curl -X POST https://your-railway-domain.railway.app/api/trade \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "symbol": "BTC",
    "prediction": "up",
    "amount": 100,
    "duration": 60
  }'
```

### 3. Test BTC API
```bash
curl https://your-railway-domain.railway.app/api/btc/health
```

## Update Frontend Configuration

After deployment, update your frontend environment variables:

```env
VITE_API_URL=https://your-railway-domain.railway.app/api
VITE_BTC_API_URL=https://your-railway-domain.railway.app/api/btc
VITE_MONITOR_API_URL=https://your-railway-domain.railway.app
VITE_TRADING_API_URL=https://your-railway-domain.railway.app
```

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**
   - Check if MongoDB service is running
   - Verify connection string format
   - Ensure network access is allowed

2. **CORS Errors**
   - Add your frontend domain to `ALLOWED_ORIGINS`
   - Check if domain includes protocol (https://)

3. **Port Issues**
   - Railway sets PORT automatically
   - Don't hardcode port in code

4. **Build Failures**
   - Check if all dependencies are in package.json
   - Ensure Node.js version is compatible

### Logs
- Check Railway/Render/Vercel logs for errors
- Use `console.log()` for debugging
- Monitor application performance

## Cost Estimation

### Railway
- Free tier: $5/month credit
- Paid: $0.000463 per second
- MongoDB: $7/month

### Render
- Free tier: 750 hours/month
- Paid: $7/month per service
- MongoDB: $7/month

### Vercel
- Free tier: 100GB bandwidth
- Paid: $20/month
- MongoDB: $7/month (external)

## Security Checklist

- [ ] Environment variables set
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Helmet security headers
- [ ] MongoDB connection secured
- [ ] API keys not in code
- [ ] HTTPS enabled
- [ ] Error handling implemented

## Next Steps

1. Deploy backend to Railway
2. Update frontend environment variables
3. Deploy frontend to Netlify
4. Test full functionality
5. Monitor performance and logs
