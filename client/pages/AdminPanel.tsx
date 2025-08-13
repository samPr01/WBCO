// @ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Search, Eye, MessageSquare, Users, CreditCard, HelpCircle, Wallet, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase, User, Transaction, SupportRequest } from "@/lib/supabase";
import { useAccount } from "wagmi";
import { AdminWalletManager } from "@/components/AdminWalletManager";
import { AdminProofManager } from "@/components/AdminProofManager";

export default function AdminPanel() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Admin wallet addresses (you can add more)
  const ADMIN_WALLETS = [
    "TQbchYKr8FbXCVPNTtDVdrfGYKiUnkJVnY", // USDT admin wallet
  ];
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "nndp007@+-";

  useEffect(() => {
    checkAuth();
  }, [address]);

  const checkAuth = () => {
    if (ADMIN_WALLETS.includes(address?.toLowerCase() || "") || password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      loadData();
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load users
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      setUsers(usersData || []);

      // Load transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      setTransactions(transactionsData || []);

      // Load support requests
      const { data: supportData } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false });
      setSupportRequests(supportData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkAuth();
  };

  const loadUserTransactions = async (walletAddress: string) => {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false });
    setUserTransactions(data || []);
  };

  const handleSupportResponse = async (requestId: string, response: string) => {
    try {
      await supabase
        .from('support_requests')
        .update({ 
          status: 'resolved',
          response,
        })
        .eq('id', requestId);
      
      toast.success('Response sent successfully');
      loadData(); // Reload data
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Failed to send response');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" onClick={() => navigate(-1)} />
              Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Admin Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                />
              </div>
              <Button type="submit" className="w-full">
                Access Admin Panel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredUsers = users.filter(user =>
    user.wallet_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = transactions.filter(tx =>
    tx.wallet_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingSupportRequests = supportRequests.filter(req => req.status !== 'resolved');

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <Badge variant="secondary">Admin</Badge>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Transactions ({transactions.length})
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Support ({pendingSupportRequests.length})
          </TabsTrigger>
          <TabsTrigger value="wallets" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Wallet Management
          </TabsTrigger>
          <TabsTrigger value="proofs" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Proof Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">User ID: {user.user_id}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last login: {new Date(user.last_login).toLocaleDateString()}
                      </p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            loadUserTransactions(user.wallet_address);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Transactions
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Transactions for {user.user_id}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {userTransactions.length === 0 ? (
                            <p className="text-muted-foreground">No transactions found</p>
                          ) : (
                            userTransactions.map((tx) => (
                              <div key={tx.id} className="flex justify-between items-center p-2 border rounded">
                                <div>
                                  <p className="font-medium">{tx.type.replace('_', ' ')}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(tx.timestamp).toLocaleDateString()}
                                  </p>
                                  {tx.token_symbol && (
                                    <p className="text-xs text-muted-foreground">
                                      {tx.token_symbol}
                                    </p>
                                  )}
                                </div>
                                <Badge variant={tx.type.includes('deposit') ? 'default' : 'secondary'}>
                                  {tx.amount} {tx.token_symbol || 'ETH'}
                                </Badge>
                              </div>
                            ))
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <div className="grid gap-4">
            {filteredTransactions.map((tx) => (
              <Card key={tx.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{tx.type.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">
                        {tx.wallet_address.slice(0, 6)}...{tx.wallet_address.slice(-4)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </p>
                      {tx.token_symbol && (
                        <p className="text-xs text-muted-foreground">
                          Token: {tx.token_symbol}
                        </p>
                      )}
                    </div>
                    <Badge variant={tx.type.includes('deposit') ? 'default' : 'secondary'}>
                      {tx.amount} {tx.token_symbol || 'ETH'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <div className="grid gap-4">
            {pendingSupportRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Support Request</p>
                      <p className="text-sm text-muted-foreground">
                        From: {request.wallet_address.slice(0, 6)}...{request.wallet_address.slice(-4)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(request.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">{request.message}</p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Respond
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Respond to Support Request</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Response</Label>
                            <Textarea
                              placeholder="Enter your response..."
                              id={`response-${request.id}`}
                            />
                          </div>
                          <Button
                            onClick={() => {
                              const response = (document.getElementById(`response-${request.id}`) as HTMLTextAreaElement)?.value;
                              if (response) {
                                handleSupportResponse(request.id, response);
                              }
                            }}
                          >
                            Send Response
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wallets" className="space-y-4">
          <AdminWalletManager />
        </TabsContent>

        <TabsContent value="proofs" className="space-y-4">
          <AdminProofManager isAdmin={isAuthenticated} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

