// @ts-nocheck
// Real wallet addresses - these should be managed via admin panel
export interface WalletAddress {
  address: string;
  label: string;
  network: string;
  symbol: string;
  qrCodeData?: string; // Optional QR code data if different from address
}

// IMPORTANT: Replace these placeholder addresses with your actual wallet addresses
export const REAL_WALLET_ADDRESSES: Record<string, WalletAddress> = {
  // Bitcoin addresses
  BTC: {
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", // Example BTC address - Replace with your actual BTC address
    label: "Bitcoin",
    network: "Bitcoin",
    symbol: "BTC",
  },

  // Ethereum addresses
  ETH: {
    address: "0x742d35Cc6634C0532925a3b8D76F2b4648334c50", // Example ETH address - Replace with your actual ETH address
    label: "Ethereum",
    network: "Ethereum",
    symbol: "ETH",
  },

  // USDT addresses
  USDT_ETH: {
    address: "0x742d35Cc6634C0532925a3b8D76F2b4648334c50", // Same as ETH address for ERC-20 tokens
    label: "Tether (USDT) ERC-20",
    network: "Ethereum",
    symbol: "USDT",
  },

  USDT_TRC20: {
    address: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE", // Example TRC-20 address - Replace with your actual USDT TRC-20 address
    label: "Tether (USDT) TRC-20",
    network: "Tron (TRC-20)",
    symbol: "USDT",
  },

  // Additional addresses for other networks
  USDC_ETH: {
    address: "0x742d35Cc6634C0532925a3b8D76F2b4648334c50", // Same as ETH address for ERC-20 tokens
    label: "USD Coin",
    network: "Ethereum",
    symbol: "USDC",
  },

  BNB: {
    address: "0x742d35Cc6634C0532925a3b8D76F2b4648334c50", // Example BSC address - Replace with your actual BNB address
    label: "Binance Coin",
    network: "BSC",
    symbol: "BNB",
  },

  MATIC: {
    address: "0x742d35Cc6634C0532925a3b8D76F2b4648334c50", // Example Polygon address - Replace with your actual MATIC address
    label: "Polygon",
    network: "Polygon",
    symbol: "MATIC",
  },

  // Additional cryptocurrencies
  SOL: {
    address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU", // Example Solana address
    label: "Solana",
    network: "Solana",
    symbol: "SOL",
  },

  XRP: {
    address: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH", // Example XRP address
    label: "XRP",
    network: "XRP Ledger",
    symbol: "XRP",
  },

  ADA: {
    address: "addr1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", // Example Cardano address
    label: "Cardano",
    network: "Cardano",
    symbol: "ADA",
  },

  AVAX: {
    address: "0x742d35Cc6634C0532925a3b8D76F2b4648334c50", // Example Avalanche address
    label: "Avalanche",
    network: "Avalanche C-Chain",
    symbol: "AVAX",
  },

  DOGE: {
    address: "DG2mPCnCPXzbwiqKpE1husv3FA9s5t1WMt", // Example Dogecoin address
    label: "Dogecoin",
    network: "Dogecoin",
    symbol: "DOGE",
  },

  TRX: {
    address: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE", // Example Tron address
    label: "TRON",
    network: "Tron (TRC-20)",
    symbol: "TRX",
  },

  LINK: {
    address: "0x742d35Cc6634C0532925a3b8D76F2b4648334c50", // Same as ETH address for ERC-20 tokens
    label: "Chainlink",
    network: "Ethereum",
    symbol: "LINK",
  },

  DOT: {
    address: "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5", // Example Polkadot address
    label: "Polkadot",
    network: "Polkadot",
    symbol: "DOT",
  },

  LTC: {
    address: "ltc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", // Example Litecoin address
    label: "Litecoin",
    network: "Litecoin",
    symbol: "LTC",
  },
};

// Function to get wallet address by symbol and network
export function getWalletAddress(
  symbol: string,
  network?: string,
): WalletAddress | null {
  // Try to get from localStorage first
  const savedAddresses = localStorage.getItem("walletAddresses");
  const addresses = savedAddresses
    ? JSON.parse(savedAddresses)
    : REAL_WALLET_ADDRESSES;

  const key = network ? `${symbol}_${network.toUpperCase()}` : symbol;
  return addresses[key] || addresses[symbol] || null;
}

// Function to generate QR code data URL for an address
export function generateQRCodeURL(
  address: string,
  amount?: string,
  label?: string,
): string {
  // Using QR Server API for QR code generation
  let qrData = address;

  // For Bitcoin addresses, we can use the bitcoin: URI scheme
  if (
    address.startsWith("bc1") ||
    address.startsWith("1") ||
    address.startsWith("3")
  ) {
    qrData = `bitcoin:${address}`;
    if (amount) qrData += `?amount=${amount}`;
    if (label)
      qrData += `${amount ? "&" : "?"}label=${encodeURIComponent(label)}`;
  }

  // For Ethereum addresses, we can use the ethereum: URI scheme
  if (address.startsWith("0x")) {
    qrData = `ethereum:${address}`;
    if (amount) qrData += `?value=${amount}`;
  }

  // Generate QR code using qr-server.com API
  const size = 256;
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrData)}`;
}

// Admin configuration - this would typically come from an API
export interface AdminWalletConfig {
  isEnabled: boolean;
  supportedNetworks: string[];
  minimumDeposits: Record<string, number>;
  notifications: {
    email: string;
    webhook: string;
  };
}

export const ADMIN_CONFIG: AdminWalletConfig = {
  isEnabled: true,
  supportedNetworks: [
    "Bitcoin",
    "Ethereum",
    "BSC",
    "Polygon",
    "Tron",
    "Solana",
    "XRP Ledger",
    "Cardano",
    "Avalanche",
    "Dogecoin",
    "Litecoin",
  ],
  minimumDeposits: {
    BTC: 0.0001,
    ETH: 0.001,
    USDT: 1,
    USDC: 1,
    BNB: 0.001,
    MATIC: 0.1,
    SOL: 0.001,
    XRP: 1,
    ADA: 1,
    AVAX: 0.001,
    DOGE: 1,
    TRX: 1,
    LINK: 0.1,
    DOT: 0.1,
    LTC: 0.001,
  },
  notifications: {
    email: "admin@yourplatform.com", // Replace with your admin email
    webhook: "https://your-admin-panel.com/webhook/deposits", // Replace with your webhook URL
  },
};

