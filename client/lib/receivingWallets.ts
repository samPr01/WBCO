// Receiving wallet addresses for deposits
// These are loaded from environment variables with fallbacks

export const RECEIVING_WALLETS = {
  ETH: import.meta.env.VITE_RECEIVING_WALLET_ETH || "0x2499aDe1b915E12819e8E38B1d9ed3493107E2B1",
  BTC: import.meta.env.VITE_RECEIVING_WALLET_BTC || "bc1qr63h7nzs0lhzumk2stg7fneymwceu2y7erd96l",
  USDT: import.meta.env.VITE_RECEIVING_WALLET_USDT || "TQbchYKr8FbXCVPNTtDVdrfGYKiUnkJVnY"
};

// Get receiving wallet address by token type
export const getReceivingWallet = (tokenType: 'ETH' | 'BTC' | 'USDT'): string => {
  return RECEIVING_WALLETS[tokenType];
};

// Get receiving wallet address by token symbol
export const getReceivingWalletBySymbol = (symbol: string): string => {
  const upperSymbol = symbol.toUpperCase();
  
  if (upperSymbol === 'ETH' || upperSymbol === 'ETHER') {
    return RECEIVING_WALLETS.ETH;
  } else if (upperSymbol === 'BTC' || upperSymbol === 'BITCOIN') {
    return RECEIVING_WALLETS.BTC;
  } else if (upperSymbol === 'USDT' || upperSymbol === 'TETHER') {
    return RECEIVING_WALLETS.USDT;
  }
  
  // Default to ETH wallet for unknown tokens
  return RECEIVING_WALLETS.ETH;
};

// Validate wallet addresses
export const validateWalletAddress = (address: string, type: 'ETH' | 'BTC' | 'USDT'): boolean => {
  if (type === 'ETH') {
    // Ethereum address validation (42 characters, starts with 0x)
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  } else if (type === 'BTC') {
    // Bitcoin address validation (basic check)
    return address.length >= 26 && address.length <= 35;
  } else if (type === 'USDT') {
    // Tron address validation (34 characters, starts with T)
    return /^T[a-zA-Z0-9]{33}$/.test(address);
  }
  return false;
};

// Get all receiving wallets
export const getAllReceivingWallets = () => {
  return RECEIVING_WALLETS;
};
