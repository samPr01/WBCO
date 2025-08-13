// @ts-nocheck
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileImage, 
  Hash, 
  Send, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface ProofUploadProps {
  type: "deposit" | "withdraw";
  amount: string;
  token: string;
  onProofSubmitted: (proofData: ProofData) => void;
  onCancel: () => void;
}

export interface ProofData {
  id: string;
  type: "deposit" | "withdraw";
  amount: string;
  token: string;
  hashNumber: string;
  screenshot: File | null;
  screenshotUrl: string;
  description: string;
  timestamp: Date;
  status: "pending" | "approved" | "rejected";
  userAddress: string;
}

export function ProofUpload({ 
  type, 
  amount, 
  token, 
  onProofSubmitted, 
  onCancel 
}: ProofUploadProps) {
  const [hashNumber, setHashNumber] = useState("");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file (PNG, JPG, JPEG)");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setScreenshot(file);
      const url = URL.createObjectURL(file);
      setScreenshotUrl(url);
      toast.success("Screenshot uploaded successfully");
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!hashNumber.trim()) {
      toast.error("Please enter the transaction hash number");
      return;
    }

    if (!screenshot) {
      toast.error("Please upload a screenshot of the transaction");
      return;
    }

    if (!description.trim()) {
      toast.error("Please provide a description");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create proof data
      const proofData: ProofData = {
        id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        amount,
        token,
        hashNumber: hashNumber.trim(),
        screenshot,
        screenshotUrl,
        description: description.trim(),
        timestamp: new Date(),
        status: "pending",
        userAddress: "", // Will be filled by parent component
      };

      // Send to admin panel (you can implement API call here)
      await submitProofToAdmin(proofData);

      // Call parent callback
      onProofSubmitted(proofData);

      toast.success(`${type === 'deposit' ? 'Deposit' : 'Withdrawal'} proof submitted successfully!`);
    } catch (error) {
      console.error("Error submitting proof:", error);
      toast.error("Failed to submit proof. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitProofToAdmin = async (proofData: ProofData) => {
    // Simulate API call to admin panel
    // In a real implementation, you would send this to your backend
    console.log("Submitting proof to admin panel:", proofData);
    
    // Store in localStorage for demo purposes
    const existingProofs = JSON.parse(localStorage.getItem('transactionProofs') || '[]');
    existingProofs.push(proofData);
    localStorage.setItem('transactionProofs', JSON.stringify(existingProofs));
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge variant={type === 'deposit' ? 'default' : 'secondary'}>
            {type === 'deposit' ? 'Deposit' : 'Withdrawal'} Proof
          </Badge>
          <span>Submit Transaction Proof</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Transaction Details */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Type</Label>
            <p className="font-semibold capitalize">{type}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
            <p className="font-semibold">{amount} {token}</p>
          </div>
        </div>

        {/* Hash Number Input */}
        <div className="space-y-2">
          <Label htmlFor="hashNumber" className="flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Transaction Hash Number *
          </Label>
          <Input
            id="hashNumber"
            placeholder="Enter the transaction hash number"
            value={hashNumber}
            onChange={(e) => setHashNumber(e.target.value)}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Copy the transaction hash from your wallet or exchange
          </p>
        </div>

        {/* Screenshot Upload */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <FileImage className="w-4 h-4" />
            Transaction Screenshot *
          </Label>
          
          {!screenshotUrl ? (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Upload a screenshot of your transaction
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2"
              >
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <img
                  src={screenshotUrl}
                  alt="Transaction screenshot"
                  className="w-full max-h-64 object-contain rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={removeScreenshot}
                  className="absolute top-2 right-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {screenshot?.name} ({(screenshot?.size || 0 / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="flex items-center gap-2">
            Additional Details *
          </Label>
          <Textarea
            id="description"
            placeholder="Provide any additional details about your transaction..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Include any relevant information that might help verify your transaction
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !hashNumber.trim() || !screenshot || !description.trim()}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Proof
              </>
            )}
          </Button>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Proof Submission Required
              </p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                All {type === 'deposit' ? 'deposits' : 'withdrawals'} require proof submission for verification. 
                Your transaction will be reviewed by our admin team.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
