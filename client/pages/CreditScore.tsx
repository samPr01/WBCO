import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Star, Shield, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CreditScore() {
  const navigate = useNavigate();
  const creditScore = 100;
  const scoreGrade = "Excellent";

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Settings
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Credit Score</h1>
          <p className="text-muted-foreground">
            Your financial standing and creditworthiness
          </p>
        </div>
      </div>

      {/* Main Credit Score Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gradient-start/10 to-gradient-end/10" />
        <CardContent className="relative p-8">
          <div className="text-center space-y-6">
            {/* Score Circle */}
            <div className="relative w-48 h-48 mx-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-muted/20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#gradient)"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(creditScore / 100) * 283} 283`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="hsl(var(--gradient-start))" />
                    <stop offset="100%" stopColor="hsl(var(--gradient-end))" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-primary">
                  {creditScore}
                </div>
                <div className="text-sm text-muted-foreground">out of 100</div>
              </div>
            </div>

            {/* Score Grade */}
            <div className="space-y-2">
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary text-lg px-4 py-2"
              >
                <Star className="w-4 h-4 mr-2" />
                {scoreGrade}
              </Badge>
              <p className="text-muted-foreground">
                Your credit score is outstanding! You have excellent financial
                standing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Score</span>
                <span className="font-semibold">35/35</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "100%" }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Perfect payment history
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              Credit Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Score</span>
                <span className="font-semibold">30/30</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: "100%" }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Optimal credit usage
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-500" />
              Account Age
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Score</span>
                <span className="font-semibold">35/35</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: "100%" }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Established credit history
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Factors */}
      <Card>
        <CardHeader>
          <CardTitle>Factors Affecting Your Score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="font-medium">On-time payments</span>
            </div>
            <span className="text-green-600 font-semibold">+35 points</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="font-medium">Low credit utilization</span>
            </div>
            <span className="text-blue-600 font-semibold">+30 points</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span className="font-medium">Length of credit history</span>
            </div>
            <span className="text-purple-600 font-semibold">+35 points</span>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Keep Up the Great Work!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Your credit score is perfect! Here are some tips to maintain it:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                Continue making all payments on time
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                Keep credit utilization below 30%
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                Monitor your credit report regularly
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                Avoid closing old accounts
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
