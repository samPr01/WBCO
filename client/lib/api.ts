import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  BalanceResponse,
  CreateTransactionRequest,
  Transaction,
  CryptoPricesResponse,
  CryptoChartData,
  TradingSignal,
  TradingSignalsResponse,
  OrdersResponse,
  CreateOrderRequest,
  Order,
  InvestmentPlan,
  InvestmentsResponse,
  CreateInvestmentRequest,
  Investment,
  WatchlistResponse,
  WatchlistItem,
} from "@shared/api";

class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
    this.authToken = localStorage.getItem("walletbase_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.authToken = response.data.token;
      localStorage.setItem("walletbase_token", response.data.token);
    }

    return response.data!;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      this.authToken = response.data.token;
      localStorage.setItem("walletbase_token", response.data.token);
    }

    return response.data!;
  }

  async getProfile() {
    const response = await this.request("/auth/profile");
    return response.data;
  }

  logout(): void {
    this.authToken = null;
    localStorage.removeItem("walletbase_token");
  }

  // Account & Balance
  async getBalance(): Promise<BalanceResponse> {
    const response = await this.request<BalanceResponse>("/account/balance");
    return response.data!;
  }

  async createTransaction(
    transaction: CreateTransactionRequest,
  ): Promise<Transaction> {
    const response = await this.request<Transaction>("/account/transactions", {
      method: "POST",
      body: JSON.stringify(transaction),
    });
    return response.data!;
  }

  async getTransactions(params?: { page?: number; limit?: number }) {
    const queryString = params
      ? new URLSearchParams(params as any).toString()
      : "";
    const response = await this.request(`/account/transactions?${queryString}`);
    return response.data;
  }

  // Crypto & Market Data
  async getCryptoPrices(symbols?: string[]): Promise<CryptoPricesResponse> {
    const queryString = symbols ? `?symbols=${symbols.join(",")}` : "";
    const response = await this.request<CryptoPricesResponse>(
      `/crypto/prices${queryString}`,
    );
    return response.data!;
  }

  async getCryptoChart(
    symbol: string,
    timeframe: string = "24h",
  ): Promise<CryptoChartData> {
    const response = await this.request<CryptoChartData>(
      `/crypto/chart/${symbol}/${timeframe}`,
    );
    return response.data!;
  }

  async getMarketStats() {
    const response = await this.request("/crypto/market-stats");
    return response.data;
  }

  // Trading Signals
  async getTradingSignals(symbol?: string): Promise<TradingSignal[]> {
    const queryString = symbol ? `?symbol=${symbol}` : "";
    const response = await this.request<TradingSignal[]>(
      `/crypto/signals${queryString}`,
    );
    return response.data!;
  }

  async getTradingSignal(symbol: string): Promise<TradingSignal> {
    const response = await this.request<TradingSignal>(
      `/crypto/signals?symbol=${symbol}`,
    );
    return response.data!;
  }

  // Real-time price stream
  createPriceStream(): EventSource {
    return new EventSource(`${this.baseUrl}/crypto/live-stream`);
  }

  // Orders & Trading
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    symbol?: string;
  }): Promise<OrdersResponse> {
    const queryString = params
      ? new URLSearchParams(params as any).toString()
      : "";
    const response = await this.request<OrdersResponse>(
      `/orders?${queryString}`,
    );
    return response.data!;
  }

  async createOrder(order: CreateOrderRequest): Promise<Order> {
    const response = await this.request<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(order),
    });
    return response.data!;
  }

  async cancelOrder(orderId: string): Promise<Order> {
    const response = await this.request<Order>(`/orders/${orderId}`, {
      method: "DELETE",
    });
    return response.data!;
  }

  async getOrderById(orderId: string): Promise<Order> {
    const response = await this.request<Order>(`/orders/${orderId}`);
    return response.data!;
  }

  async getOrderStats() {
    const response = await this.request("/orders/stats");
    return response.data;
  }

  // Investments & AI Trading
  async getInvestmentPlans(): Promise<InvestmentPlan[]> {
    const response = await this.request<InvestmentPlan[]>("/investments/plans");
    return response.data!;
  }

  async getInvestments(): Promise<InvestmentsResponse> {
    const response = await this.request<InvestmentsResponse>("/investments");
    return response.data!;
  }

  async createInvestment(
    investment: CreateInvestmentRequest,
  ): Promise<Investment> {
    const response = await this.request<Investment>("/investments", {
      method: "POST",
      body: JSON.stringify(investment),
    });
    return response.data!;
  }

  async getInvestmentById(investmentId: string) {
    const response = await this.request(`/investments/${investmentId}`);
    return response.data;
  }

  async withdrawInvestment(investmentId: string) {
    const response = await this.request(
      `/investments/${investmentId}/withdraw`,
      {
        method: "POST",
      },
    );
    return response.data;
  }

  // Watchlist
  async getWatchlist(): Promise<WatchlistResponse> {
    const response = await this.request<WatchlistResponse>("/watchlist");
    return response.data!;
  }

  async addToWatchlist(symbol: string, name: string): Promise<WatchlistItem> {
    const response = await this.request<WatchlistItem>("/watchlist", {
      method: "POST",
      body: JSON.stringify({ symbol, name }),
    });
    return response.data!;
  }

  async removeFromWatchlist(symbol: string): Promise<WatchlistItem> {
    const response = await this.request<WatchlistItem>(`/watchlist/${symbol}`, {
      method: "DELETE",
    });
    return response.data!;
  }

  async toggleWatchlist(symbol: string, name?: string) {
    const response = await this.request("/watchlist/toggle", {
      method: "POST",
      body: JSON.stringify({ symbol, name }),
    });
    return response.data;
  }

  async checkWatchlistStatus(symbol: string) {
    const response = await this.request(`/watchlist/status/${symbol}`);
    return response.data;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for custom instances if needed
export { ApiClient };
