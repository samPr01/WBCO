// @ts-nocheck
import { useState, useEffect } from "react";

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  last_updated: string;
}

export interface CryptoPricesState {
  prices: CryptoPrice[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Top 15 cryptocurrencies by market cap
const TOP_CRYPTO_IDS = [
  "bitcoin",
  "ethereum", 
  "tether",
  "binancecoin",
  "solana",
  "usd-coin",
  "staked-ether",
  "cardano",
  "avalanche-2",
  "dogecoin",
  "tron",
  "chainlink",
  "polkadot",
  "polygon",
  "litecoin"
];

// Fallback data for when API is unavailable
const FALLBACK_PRICES: CryptoPrice[] = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    current_price: 45000,
    market_cap: 850000000000,
    market_cap_rank: 1,
    total_volume: 25000000000,
    high_24h: 46000,
    low_24h: 44000,
    price_change_24h: 500,
    price_change_percentage_24h: 1.12,
    price_change_percentage_7d_in_currency: 2.5,
    last_updated: new Date().toISOString()
  },
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    current_price: 2800,
    market_cap: 350000000000,
    market_cap_rank: 2,
    total_volume: 15000000000,
    high_24h: 2850,
    low_24h: 2750,
    price_change_24h: 25,
    price_change_percentage_24h: 0.89,
    price_change_percentage_7d_in_currency: 1.8,
    last_updated: new Date().toISOString()
  },
  {
    id: "tether",
    symbol: "usdt",
    name: "Tether",
    current_price: 1.00,
    market_cap: 95000000000,
    market_cap_rank: 3,
    total_volume: 50000000000,
    high_24h: 1.01,
    low_24h: 0.99,
    price_change_24h: 0,
    price_change_percentage_24h: 0,
    price_change_percentage_7d_in_currency: 0,
    last_updated: new Date().toISOString()
  }
];

export function useCryptoPrices() {
  const [state, setState] = useState<CryptoPricesState>({
    prices: FALLBACK_PRICES, // Start with fallback data
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const [retryCount, setRetryCount] = useState(0);
  const [lastErrorTime, setLastErrorTime] = useState<number>(0);

  const fetchPrices = async (isRetry = false) => {
    try {
      // If we got a 429 error recently, wait before retrying
      if (isRetry && lastErrorTime > 0) {
        const timeSinceError = Date.now() - lastErrorTime;
        const minWaitTime = Math.min(60000 * Math.pow(2, retryCount), 300000); // Exponential backoff, max 5 minutes
        
        if (timeSinceError < minWaitTime) {
          console.log(`Waiting ${minWaitTime - timeSinceError}ms before retry...`);
          return;
        }
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const ids = TOP_CRYPTO_IDS.join(",");
      const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=15&page=1&sparkline=false&price_change_percentage=24h,7d&x_cg_demo_api_key=CG-Demo`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'WBCO-App/1.0'
        }
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          setLastErrorTime(Date.now());
          setRetryCount(prev => prev + 1);
          throw new Error(`Rate limited. Retrying in ${Math.min(60000 * Math.pow(2, retryCount), 300000) / 1000}s...`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CryptoPrice[] = await response.json();
      
      // Reset retry count on success
      setRetryCount(0);
      setLastErrorTime(0);
      
      setState({
        prices: data,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Error fetching crypto prices:", error);
      
      // If we have fallback data, use it instead of showing error
      if (state.prices.length > 0 && state.prices !== FALLBACK_PRICES) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "Failed to fetch prices",
        }));
      } else {
        // Use fallback data if we don't have any prices
        setState({
          prices: FALLBACK_PRICES,
          isLoading: false,
          error: "Using cached data due to API limits",
          lastUpdated: new Date(),
        });
      }
    }
  };

  useEffect(() => {
    fetchPrices();

    // Refresh prices every 60 seconds (increased from 30 to reduce rate limiting)
    const interval = setInterval(() => {
      fetchPrices();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Retry mechanism for rate limiting
  useEffect(() => {
    if (retryCount > 0 && lastErrorTime > 0) {
      const retryDelay = Math.min(60000 * Math.pow(2, retryCount - 1), 300000);
      const timer = setTimeout(() => {
        fetchPrices(true);
      }, retryDelay);
      
      return () => clearTimeout(timer);
    }
  }, [retryCount, lastErrorTime]);

  const getCryptoPrice = (symbol: string): CryptoPrice | null => {
    return state.prices.find(crypto => 
      crypto.symbol.toLowerCase() === symbol.toLowerCase()
    ) || null;
  };

  const getCryptoPriceById = (id: string): CryptoPrice | null => {
    return state.prices.find(crypto => crypto.id === id) || null;
  };

  const formatPrice = (price: number): string => {
    if (price < 1) {
      return `$${price.toFixed(4)}`;
    } else if (price < 1000) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toLocaleString("en-US", { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`;
    }
  };

  const formatMarketCap = (cap: number): string => {
    if (cap >= 1e12) {
      return `$${(cap / 1e12).toFixed(2)}T`;
    } else if (cap >= 1e9) {
      return `$${(cap / 1e9).toFixed(2)}B`;
    } else {
      return `$${(cap / 1e6).toFixed(2)}M`;
    }
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    }
    return `$${volume.toLocaleString()}`;
  };

  return {
    ...state,
    getCryptoPrice,
    getCryptoPriceById,
    formatPrice,
    formatMarketCap,
    formatVolume,
    refetch: fetchPrices,
  };
}

