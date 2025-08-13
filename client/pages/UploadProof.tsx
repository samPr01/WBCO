// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function UploadProof() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [transactionHash, setTransactionHash] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get parameters from URL
  const transactionType = searchParams.get("type") || "deposit";
  const cryptocurrency = searchParams.get("crypto") || "";
  const amount = searchParams.get("amount") || "";
  const address = searchParams.get("address") || "";

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setUploadedFile(file);
      toast.success("Screenshot uploaded successfully");
    }
  };

  const handleSubmit = async () => {
    if (!uploadedFile) {
      toast.error("Please upload a screenshot");
      return;
    }

    if (!transactionHash || transactionHash.length < 6) {
      toast.error("Please enter at least the last 6 digits of the transaction hash");
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real application, this would send data to backend
      // For now, we'll simulate the submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success(`${transactionType === "deposit" ? "Deposit" : "Withdrawal"} proof submitted successfully!`);
      
      // Redirect back to the appropriate page
      navigate(transactionType === "deposit" ? "/deposits" : "/withdraw");
    } catch (error) {
      toast.error("Failed to submit proof. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Upload Transaction Proof</h1>
          <p className="text-muted-foreground">
            Upload screenshot and transaction details for verification
          </p>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            {transactionType === "deposit" ? "Deposit" : "Withdrawal"} Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Transaction Summary */}
          <div className="p-4 bg-muted/20 rounded-lg space-y-2">
            <h3 className="font-medium mb-3">Transaction Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Type</Label>
                <div className="font-medium capitalize">{transactionType}</div>
              </div>
              {cryptocurrency && (
                <div>
                  <Label className="text-muted-foreground">Cryptocurrency</Label>
                  <div className="font-medium">{cryptocurrency}</div>
                </div>
              )}
              {amount && (
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <div className="font-medium">{amount} {cryptocurrency}</div>
                </div>
              )}
              {address && (
                <div className="col-span-2">
                  <Label className="text-muted-foreground">
                    {transactionType === "deposit" ? "To Address" : "From Address"}
                  </Label>
                  <div className="font-mono text-sm break-all">{address}</div>
                </div>
              )}
            </div>
          </div>

          {/* Screenshot Upload */}
          <div className="space-y-3">
            <Label htmlFor="screenshot">Upload Transaction Screenshot *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              {uploadedFile ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-500/10 rounded-full">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-600">Screenshot uploaded</p>
                    <p className="text-sm text-muted-foreground">{uploadedFile.name}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("screenshot")?.click()}
                  >
                    Change Screenshot
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-muted rounded-full">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Upload screenshot</p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, or JPEG (max 10MB)
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("screenshot")?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Hash */}
          <div className="space-y-2">
            <Label htmlFor="tx-hash">Transaction Hash (Last 6+ digits) *</Label>
            <Input
              id="tx-hash"
              type="text"
              placeholder="e.g., a1b2c3 or full hash"
              value={transactionHash}
              onChange={(e) => setTransactionHash(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Enter at least the last 6 digits of your transaction hash for verification
            </p>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about this transaction..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !uploadedFile || !transactionHash}
              className="flex-1 bg-gradient-to-r from-gradient-start to-gradient-end text-white"
            >
              {isSubmitting ? "Submitting..." : "Submit Proof"}
            </Button>
          </div>

          {/* Information Box */}
          <div className="text-xs text-muted-foreground p-3 bg-blue-500/10 border border-blue-500/20 rounded">
            <p className="font-medium mb-1">ℹ️ Verification Process:</p>
            <p>
              Your transaction proof will be reviewed within 24 hours. You'll receive
              confirmation once the transaction is verified and processed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

