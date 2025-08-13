// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  ArrowLeft,
  Bot,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAccount } from "wagmi";
import { Chatbot } from "@/components/Chatbot";

const supportCategories = [
  "General Inquiry",
  "Technical Issue",
  "Account Problem",
  "Payment Issue",
  "Trading Question",
  "Other",
];

export default function OnlineSupport() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"chatbot" | "agent" | "form">("chatbot");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!formData.message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('support_requests')
        .insert({
          wallet_address: address,
          message: `Category: ${formData.category}\nSubject: ${formData.subject}\nMessage: ${formData.message}`,
          timestamp: new Date().toISOString(),
          status: 'pending',
        });

      if (error) {
        console.error('Error submitting support request:', error);
        toast.error('Failed to submit support request');
      } else {
        setIsSubmitted(true);
        toast.success('Support request submitted successfully!');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to submit support request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectAgent = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('support_requests')
        .insert({
          wallet_address: address,
          message: "User requested to connect with support agent",
          timestamp: new Date().toISOString(),
          status: 'pending',
        });

      if (error) {
        console.error('Error creating support request:', error);
        toast.error('Failed to connect with agent');
      } else {
        toast.success('Support agent will contact you soon!');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to connect with agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Support Request Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              We've received your support request and will get back to you as soon as possible.
            </p>
            <div className="space-y-4">
              <Button onClick={() => setIsSubmitted(false)}>
                Submit Another Request
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Online Support</h1>
          <p className="text-muted-foreground">
            Get help from our AI assistant or connect with a human agent
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === "chatbot" ? "default" : "outline"}
          onClick={() => setActiveTab("chatbot")}
          className="flex items-center gap-2"
        >
          <Bot className="w-4 h-4" />
          AI Assistant
        </Button>
        <Button
          variant={activeTab === "agent" ? "default" : "outline"}
          onClick={() => setActiveTab("agent")}
          className="flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          Connect to Agent
            </Button>
        <Button
          variant={activeTab === "form" ? "default" : "outline"}
          onClick={() => setActiveTab("form")}
          className="flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Submit Request
            </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "chatbot" && (
        <div className="space-y-6">
          <Chatbot />
          
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@walletbase.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Support Hours</p>
                    <p className="text-sm text-muted-foreground">24/7 Available</p>
                  </div>
                </div>
              </div>
          </CardContent>
        </Card>
      </div>
      )}

      {activeTab === "agent" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Quick Connect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Connect to Human Agent
          </CardTitle>
        </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Need immediate assistance? Connect with our support agent instantly.
              </p>
              <Button 
                onClick={handleConnectAgent}
                disabled={!isConnected || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  "Connecting..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Connect to Agent
                  </>
                )}
              </Button>
              {!isConnected && (
                <p className="text-xs text-muted-foreground">
                  Please connect your wallet to use this feature
                </p>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">support@walletbase.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
            <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                </div>
            </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
                  <p className="font-medium">Support Hours</p>
                  <p className="text-sm text-muted-foreground">24/7 Available</p>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      )}

      {activeTab === "form" && (
      <Card>
        <CardHeader>
            <CardTitle>Submit Support Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief description of your issue"
              />
                </div>
            </div>

              <div>
                <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please describe your issue in detail..."
                  rows={5}
                required
              />
            </div>

              <div className="flex items-center gap-4">
            <Button
              type="submit"
                  disabled={!isConnected || isSubmitting}
                  className="flex-1"
            >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
                {!isConnected && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Wallet Required
                  </Badge>
                )}
              </div>
            </form>
        </CardContent>
      </Card>
      )}
    </div>
  );
}

