// @ts-nocheck
import { useState, useEffect } from "react";

interface TokenPrice {
  ethereum: { usd: number };
  "wrapped-bitcoin": { usd: number };
}

interface TokenPrices {
  ETH: number;
  WBTC: number;
}

export function useTokenPrices() {
  const [prices, setPrices] = useState<TokenPrices>({ ETH: 0, WBTC: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,wrapped-bitcoin&vs_currencies=usd"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch prices");
        }

        const data: TokenPrice = await response.json();
        
        setPrices({
          ETH: data.ethereum.usd,
          WBTC: data["wrapped-bitcoin"].usd,
        });
      } catch (err) {
        console.error("Error fetching token prices:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch prices");
        // Set fallback prices
        setPrices({ ETH: 3000, WBTC: 45000 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();

    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);

    return () => clearInterval(interval);
  }, []);

  const getTokenPrice = (symbol: string): number => {
    return prices[symbol as keyof TokenPrices] || 0;
  };

  const getUSDValue = (amount: string, symbol: string): number => {
    const price = getTokenPrice(symbol);
    return parseFloat(amount) * price;
  };

  const formatUSD = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return {
    prices,
    isLoading,
    error,
    getTokenPrice,
    getUSDValue,
    formatUSD,
  };
}

