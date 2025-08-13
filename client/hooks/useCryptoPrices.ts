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

export function useCryptoPrices() {
  const [state, setState] = useState<CryptoPricesState>({
    prices: [],
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchPrices = async () => {
    try {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CryptoPrice[] = await response.json();
      
      setState({
        prices: data,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Error fetching crypto prices:", error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch prices",
      }));
    }
  };

  useEffect(() => {
    fetchPrices();

    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);

    return () => clearInterval(interval);
  }, []);

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
