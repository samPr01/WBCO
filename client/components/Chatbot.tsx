// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, ArrowLeft } from "lucide-react";

// Lightweight predefined responses
const CHATBOT_RESPONSES = {
  "hello": "Hello! How can I help you today? You can ask me about wallet connection, trading, or general support.",
  "wallet": "To connect your wallet, click the 'Connect Wallet' button in the top right corner. We support MetaMask, WalletConnect, and many other wallets.",
  "connect": "To connect your wallet, click the 'Connect Wallet' button in the top right corner. We support MetaMask, WalletConnect, and many other wallets.",
  "trading": "Our trading platform supports multiple cryptocurrencies. You can view market data, place orders, and track your portfolio in the Trading section.",
  "deposit": "To deposit funds, go to the Deposits page and follow the instructions. We support multiple payment methods including crypto transfers.",
  "withdraw": "To withdraw funds, go to the Withdraw page. Make sure your account is verified and you have sufficient balance.",
  "account": "You can manage your account settings in the Settings page. This includes profile information, security settings, and preferences.",
  "support": "For additional support, you can use the 'Connect to Agent' button to speak with a human agent, or submit a detailed support request.",
  "help": "I'm here to help! You can ask me about wallet connection, trading, deposits, withdrawals, or account management. For complex issues, use 'Connect to Agent'.",
  "default": "I'm not sure I understand. Could you please rephrase your question? You can also use 'Connect to Agent' to speak with a human representative."
};

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Simple keyword matching
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return CHATBOT_RESPONSES.hello;
    }
    if (lowerMessage.includes("wallet") || lowerMessage.includes("connect")) {
      return CHATBOT_RESPONSES.wallet;
    }
    if (lowerMessage.includes("trading") || lowerMessage.includes("trade")) {
      return CHATBOT_RESPONSES.trading;
    }
    if (lowerMessage.includes("deposit") || lowerMessage.includes("add funds")) {
      return CHATBOT_RESPONSES.deposit;
    }
    if (lowerMessage.includes("withdraw") || lowerMessage.includes("withdrawal")) {
      return CHATBOT_RESPONSES.withdraw;
    }
    if (lowerMessage.includes("account") || lowerMessage.includes("profile")) {
      return CHATBOT_RESPONSES.account;
    }
    if (lowerMessage.includes("support") || lowerMessage.includes("help")) {
      return CHATBOT_RESPONSES.support;
    }
    
    return CHATBOT_RESPONSES.default;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">AI Assistant</h3>
          <Badge variant="secondary" className="ml-auto">Live</Badge>
        </div>

        {/* Messages */}
        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-start gap-2 max-w-[80%] ${
                  message.isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  message.isUser 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {message.isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                </div>
                <div
                  className={`px-3 py-2 rounded-lg text-sm ${
                    message.isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs">
                  <Bot className="w-3 h-3" />
                </div>
                <div className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {["Wallet", "Trading", "Deposit", "Withdraw", "Account"].map((action) => (
            <Button
              key={action}
              variant="outline"
              size="sm"
              onClick={() => setInputValue(action.toLowerCase())}
              disabled={isTyping}
            >
              {action}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

