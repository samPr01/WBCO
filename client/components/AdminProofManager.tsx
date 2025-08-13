// @ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter,
  Search,
  Download,
  RefreshCw,
  AlertTriangle,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { ProofData } from "./ProofUpload";

interface AdminProofManagerProps {
  isAdmin?: boolean;
}

export function AdminProofManager({ isAdmin = true }: AdminProofManagerProps) {
  const [proofs, setProofs] = useState<ProofData[]>([]);
  const [filteredProofs, setFilteredProofs] = useState<ProofData[]>([]);
  const [selectedProof, setSelectedProof] = useState<ProofData | null>(null);
  const [showProofDetails, setShowProofDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load proofs from localStorage
  useEffect(() => {
    loadProofs();
  }, []);

  // Filter proofs based on status and search term
  useEffect(() => {
    let filtered = proofs;

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(proof => proof.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(proof => 
        proof.hashNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proof.userAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proof.amount.includes(searchTerm) ||
        proof.token.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProofs(filtered);
  }, [proofs, filterStatus, searchTerm]);

  const loadProofs = () => {
    try {
      const storedProofs = localStorage.getItem('transactionProofs');
      if (storedProofs) {
        const parsedProofs = JSON.parse(storedProofs);
        setProofs(parsedProofs);
      }
    } catch (error) {
      console.error("Error loading proofs:", error);
      toast.error("Failed to load proofs");
    }
  };

  const updateProofStatus = (proofId: string, status: "approved" | "rejected", adminNote?: string) => {
    const updatedProofs = proofs.map(proof => {
      if (proof.id === proofId) {
        return {
          ...proof,
          status,
          adminNote,
          reviewedAt: new Date(),
        };
      }
      return proof;
    });

    setProofs(updatedProofs);
    localStorage.setItem('transactionProofs', JSON.stringify(updatedProofs));
    
    const action = status === 'approved' ? 'approved' : 'rejected';
    toast.success(`Proof ${action} successfully`);
  };

  const approveProof = (proofId: string) => {
    updateProofStatus(proofId, "approved", "Transaction verified and approved");
  };

  const rejectProof = (proofId: string, reason: string) => {
    updateProofStatus(proofId, "rejected", reason);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "approved": return <CheckCircle className="w-4 h-4" />;
      case "rejected": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const exportProofs = () => {
    const csvContent = [
      "ID,Type,Amount,Token,Hash,User Address,Status,Timestamp,Description",
      ...filteredProofs.map(proof => 
        `"${proof.id}","${proof.type}","${proof.amount}","${proof.token}","${proof.hashNumber}","${proof.userAddress}","${proof.status}","${proof.timestamp}","${proof.description}"`
      ).join('\n')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proofs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("Proofs exported successfully");
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            You don't have permission to access the admin proof manager.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Transaction Proof Manager
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={loadProofs} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" onClick={exportProofs}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by hash, address, amount..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Status Filter</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Badge variant="outline" className="text-sm">
                {filteredProofs.length} of {proofs.length} proofs
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proofs List */}
      <div className="space-y-4">
        {filteredProofs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Proofs Found</h3>
              <p className="text-muted-foreground">
                {proofs.length === 0 ? "No proofs have been submitted yet." : "No proofs match your current filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProofs.map((proof) => (
            <Card key={proof.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={proof.type === 'deposit' ? 'default' : 'secondary'}>
                        {proof.type}
                      </Badge>
                      <Badge className={getStatusColor(proof.status)}>
                        {getStatusIcon(proof.status)}
                        <span className="ml-1 capitalize">{proof.status}</span>
                      </Badge>
                    </div>
                    <div>
                      <p className="font-semibold">
                        {proof.amount} {proof.token}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Hash: {proof.hashNumber.slice(0, 10)}...{proof.hashNumber.slice(-8)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {proof.userAddress.slice(0, 6)}...{proof.userAddress.slice(-4)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(proof.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedProof(proof);
                          setShowProofDetails(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {proof.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => approveProof(proof.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => rejectProof(proof.id, "Transaction verification failed")}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Proof Details Dialog */}
      <Dialog open={showProofDetails} onOpenChange={setShowProofDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Proof Details</DialogTitle>
          </DialogHeader>
          {selectedProof && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                  <p className="font-semibold capitalize">{selectedProof.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                  <p className="font-semibold">{selectedProof.amount} {selectedProof.token}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(selectedProof.status)}>
                    {getStatusIcon(selectedProof.status)}
                    <span className="ml-1 capitalize">{selectedProof.status}</span>
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">User Address</Label>
                  <p className="font-mono text-sm">{selectedProof.userAddress}</p>
                </div>
              </div>

              {/* Hash Number */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Transaction Hash</Label>
                <p className="font-mono text-sm bg-muted p-2 rounded">{selectedProof.hashNumber}</p>
              </div>

              {/* Description */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm bg-muted p-2 rounded">{selectedProof.description}</p>
              </div>

              {/* Screenshot */}
              {selectedProof.screenshotUrl && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Screenshot</Label>
                  <img
                    src={selectedProof.screenshotUrl}
                    alt="Transaction screenshot"
                    className="w-full max-h-64 object-contain rounded border"
                  />
                </div>
              )}

              {/* Timestamp */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Submitted</Label>
                <p className="text-sm">{new Date(selectedProof.timestamp).toLocaleString()}</p>
              </div>

              {/* Admin Actions */}
              {selectedProof.status === "pending" && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => {
                      approveProof(selectedProof.id);
                      setShowProofDetails(false);
                    }}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      rejectProof(selectedProof.id, "Transaction verification failed");
                      setShowProofDetails(false);
                    }}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

