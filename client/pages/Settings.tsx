import {
  Users,
  Shield,
  CreditCard,
  Star,
  Copy,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDemoTrading } from "@/contexts/DemoTradingContext";

export default function Settings() {
  const navigate = useNavigate();
  const { isDemoMode, setDemoMode, demoBalance, resetDemo } = useDemoTrading();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
      </div>

      <div className="bg-gradient-to-r from-gradient-start to-gradient-end rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Invite Friends</h3>
        </div>
        <div className="text-center">
          <p className="text-white/80 mb-4">
            Receive Cashback by Inviting Friends!
          </p>
          <p className="text-sm text-white/60 mb-6">
            Share this link with your friends and join successfully to get
            cryptocurrency rewards
          </p>
        </div>
        <button className="w-full bg-white/20 backdrop-blur-sm rounded-xl p-3 flex items-center justify-center gap-2 font-medium">
          <Copy className="w-4 h-4" />
          Invite Friends
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium">Demo Trading Mode</div>
                <div className="text-sm text-muted-foreground">
                  Practice trading with virtual money (for trading features
                  only)
                  {isDemoMode && (
                    <span className="block mt-1 text-green-600 font-medium">
                      Current balance: $
                      {demoBalance.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isDemoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {isDemoMode && (
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium mb-1">Reset Demo Account</h3>
                <p className="text-sm text-muted-foreground">
                  Reset your demo balance back to $100,000 and clear all trades
                </p>
              </div>
              <button
                onClick={resetDemo}
                className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-medium hover:bg-destructive/90 transition-colors"
              >
                Reset Demo
              </button>
            </div>
          </div>
        )}

        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-medium mb-3">Connected Wallet Address</h3>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-mono text-sm">
              {localStorage.getItem("walletAddress") || "No wallet connected"}
            </span>
            <button className="text-primary hover:text-primary/80">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/personal-verification")}
            className="w-full bg-card rounded-xl p-4 border border-border flex items-center justify-between hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-medium">Personal Verification</div>
                <div className="text-sm text-muted-foreground">
                  Complete your identity verification
                </div>
              </div>
            </div>
            <span className="text-muted-foreground">›</span>
          </button>

          <button
            onClick={() => navigate("/online-support")}
            className="w-full bg-card rounded-xl p-4 border border-border flex items-center justify-between hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="font-medium">Online Support</span>
            </div>
            <span className="text-muted-foreground">›</span>
          </button>

          <button
            onClick={() => navigate("/credit-score")}
            className="w-full bg-card rounded-xl p-4 border border-border flex items-center justify-between hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <span className="font-medium">Credit Score</span>
            </div>
            <span className="text-muted-foreground">›</span>
          </button>

          <button
            onClick={() => navigate("/admin")}
            className="w-full bg-gradient-to-r from-gradient-start to-gradient-end text-white rounded-xl p-4 border border-primary/20 flex items-center justify-between hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-medium">Admin Panel</div>
                <div className="text-sm text-white/80">
                  Manage wallet addresses
                </div>
              </div>
            </div>
            <span className="text-white/80">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
