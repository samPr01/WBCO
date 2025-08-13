// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Wallet,
  Copy,
  Edit,
  Save,
  Eye,
  EyeOff,
  Shield,
  Bell,
  Settings,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  REAL_WALLET_ADDRESSES,
  ADMIN_CONFIG,
  WalletAddress,
} from "@/lib/walletConfig";

export function AdminWalletManager() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPrivateKeys, setShowPrivateKeys] = useState(false);
  const [walletAddresses, setWalletAddresses] = useState(() => {
    // Load from localStorage if available, otherwise use defaults
    const saved = localStorage.getItem("walletAddresses");
    return saved ? JSON.parse(saved) : REAL_WALLET_ADDRESSES;
  });
  const [adminConfig, setAdminConfig] = useState(() => {
    // Load from localStorage if available, otherwise use defaults
    const saved = localStorage.getItem("adminConfig");
    return saved ? JSON.parse(saved) : ADMIN_CONFIG;
  });

  const updateWalletAddress = (key: string, newAddress: string) => {
    const updated = {
      ...walletAddresses,
      [key]: { ...walletAddresses[key], address: newAddress },
    };
    setWalletAddresses(updated);
    // Auto-save to localStorage
    localStorage.setItem("walletAddresses", JSON.stringify(updated));
    toast.success(`${key} address updated and saved`);
  };

  const saveConfiguration = () => {
    // In a real implementation, this would save to your backend
    localStorage.setItem("walletAddresses", JSON.stringify(walletAddresses));
    localStorage.setItem("adminConfig", JSON.stringify(adminConfig));
    setIsEditing(false);
    toast.success("Configuration saved successfully!");
  };

  const copyAddress = (address: string, label: string) => {
    navigator.clipboard.writeText(address);
    toast.success(`${label} address copied!`);
  };

  const resetToDefaults = () => {
    setWalletAddresses(REAL_WALLET_ADDRESSES);
    setAdminConfig(ADMIN_CONFIG);
    toast.success("Configuration reset to defaults");
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Wallet Management</h1>
          <p className="text-muted-foreground">
            Manage deposit addresses and platform configuration
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isEditing ? "default" : "outline"}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
          {isEditing && (
            <Button onClick={saveConfiguration}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="addresses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="addresses">Wallet Addresses</TabsTrigger>
          <TabsTrigger value="settings">Platform Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="addresses" className="space-y-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Wallet Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Platform Wallet Status:</span>
                  <Badge variant="secondary">Functional</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Admin Config:</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Auto-Save:</span>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Cryptocurrency Wallet Addresses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(walletAddresses).map(([key, wallet]: [string, WalletAddress]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{wallet.symbol}</Badge>
                      <span className="font-medium">{wallet.label}</span>
                      <span className="text-sm text-muted-foreground">
                        ({wallet.network})
                      </span>
                    </div>

                    {isEditing ? (
                      <Input
                        value={wallet.address}
                        onChange={(e) =>
                          updateWalletAddress(key, e.target.value)
                        }
                        className="font-mono text-sm"
                        placeholder="Enter wallet address"
                      />
                    ) : (
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {wallet.address}
                      </code>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyAddress(wallet.address, wallet.label)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {isEditing && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Reset to Defaults
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset Configuration?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will reset all wallet addresses to their default
                        values. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={resetToDefaults}>
                        Reset
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Platform Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Enable Deposits</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to deposit cryptocurrencies
                  </p>
                </div>
                <Switch
                  checked={adminConfig.isEnabled}
                  onCheckedChange={(checked) =>
                    setAdminConfig((prev) => ({ ...prev, isEnabled: checked }))
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-base">Minimum Deposit Amounts</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(adminConfig.minimumDeposits).map(
                    ([symbol, amount]) => (
                      <div key={symbol} className="flex items-center gap-2">
                        <Badge variant="outline" className="w-16">
                          {symbol}
                        </Badge>
                        <Input
                          type="number"
                          step="any"
                          value={amount}
                          onChange={(e) =>
                            setAdminConfig((prev) => ({
                              ...prev,
                              minimumDeposits: {
                                ...prev.minimumDeposits,
                                [symbol]: parseFloat(e.target.value) || 0,
                              },
                            }))
                          }
                          disabled={!isEditing}
                          className="text-sm"
                        />
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base">Supported Networks</Label>
                <div className="flex flex-wrap gap-2">
                  {adminConfig.supportedNetworks.map((network) => (
                    <Badge key={network} variant="secondary">
                      {network}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={adminConfig.notifications.email}
                  onChange={(e) =>
                    setAdminConfig((prev) => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        email: e.target.value,
                      },
                    }))
                  }
                  disabled={!isEditing}
                  placeholder="admin@yourplatform.com"
                />
                <p className="text-sm text-muted-foreground">
                  Email address to receive deposit notifications
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  value={adminConfig.notifications.webhook}
                  onChange={(e) =>
                    setAdminConfig((prev) => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        webhook: e.target.value,
                      },
                    }))
                  }
                  disabled={!isEditing}
                  placeholder="https://your-admin-panel.com/webhook/deposits"
                />
                <p className="text-sm text-muted-foreground">
                  Webhook endpoint for real-time deposit notifications
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

