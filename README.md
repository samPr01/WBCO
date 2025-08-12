# WalletBase - Web3 Trading Platform

A modern Web3 trading platform with wallet connection, Supabase database integration, and admin panel management.

## Features

- 🔗 **Wallet Connection**: RainbowKit/Wagmi integration with multiple chains
- 💾 **Database**: Supabase for user/transaction storage
- 🛡️ **Admin Panel**: Protected admin interface with user management
- 💬 **Support System**: Integrated support chatbot with ticket management
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- ⚡ **Fast Build**: Optimized for Netlify deployment (< 50MB)

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI
- **Web3**: RainbowKit + Wagmi + Ethers
- **Database**: Supabase
- **Deployment**: Netlify

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd WBCO
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin Configuration
VITE_ADMIN_PASSWORD=admin123
```

### 3. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase-schema.sql`
3. Copy your project URL and anon key to the `.env` file

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:8080` to see the application.

## Database Schema

### Users Table
- `id`: UUID primary key
- `wallet_address`: Unique wallet address
- `user_id`: 5-character generated user ID
- `last_login`: Timestamp of last login
- `created_at`: Account creation timestamp

### Transactions Table
- `id`: UUID primary key
- `wallet_address`: User's wallet address
- `amount`: Transaction amount (decimal)
- `type`: 'deposit' or 'transfer'
- `timestamp`: Transaction timestamp
- `created_at`: Record creation timestamp

### Support Requests Table
- `id`: UUID primary key
- `wallet_address`: User's wallet address
- `message`: Support request message
- `timestamp`: Request timestamp
- `status`: 'pending' or 'resolved'
- `response`: Admin response (optional)
- `created_at`: Record creation timestamp

## Admin Panel

Access the admin panel at `/admin` with:
- **Password**: Set in `VITE_ADMIN_PASSWORD` environment variable
- **Admin Wallets**: Configure specific wallet addresses in `AdminPanel.tsx`

### Admin Features
- View all users and their transaction history
- Search and filter users/transactions
- Manage support requests
- Respond to support tickets

## Wallet Connection

The app supports multiple chains:
- Ethereum Mainnet
- Polygon
- BSC
- Arbitrum
- Bitcoin

Users can connect using:
- MetaMask
- WalletConnect
- Coinbase Wallet
- Rainbow Wallet
- And more...

## Support System

### For Users
- "Connect to Agent" button for immediate support
- Detailed support request form
- Real-time status updates

### For Admins
- View all pending support requests
- Respond to tickets
- Mark requests as resolved

## Build and Deploy

### Local Build
```bash
npm run build
```

### Netlify Deployment
1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

### Build Size
- **Total**: ~6.5MB
- **Gzipped**: ~2.5MB
- **Well under 50MB limit** ✅

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_ADMIN_PASSWORD` | Admin panel password | No (default: admin123) |

## Project Structure

```
/
├── client/                 # React application
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   └── lib/              # Utilities and configs
├── public/               # Static assets
├── dist/                 # Build output
├── package.json          # Dependencies
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind configuration
├── supabase-schema.sql   # Database schema
└── env.example           # Environment template
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@walletbase.com or create an issue in the repository.
