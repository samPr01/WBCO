// @ts-nocheck
import { SimpleDeposit } from "@/components/SimpleDeposit";

export default function Deposits() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Deposit Funds</h1>
          <p className="text-muted-foreground mt-2">
            Send ETH, USDT, or BTC directly to our receiving wallets
          </p>
        </div>
        <SimpleDeposit />
      </div>
    </div>
  );
}

