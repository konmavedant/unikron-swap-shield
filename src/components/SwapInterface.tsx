import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowDownUp, Shield, Zap, Settings } from "lucide-react";
import { useState } from "react";

export const SwapInterface = () => {
  const [mevProtection, setMevProtection] = useState(true);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  return (
    <Card className="w-full max-w-md mx-auto shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Swap Tokens</CardTitle>
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-shield-cyan" />
            <span className="text-sm font-medium">MEV Protection</span>
          </div>
          <Switch 
            checked={mevProtection}
            onCheckedChange={setMevProtection}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* From Token */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">From</span>
            <span className="text-muted-foreground">Balance: 0.00</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="text-lg h-12"
              />
            </div>
            <Button variant="outline" className="h-12 px-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-cosmic"></div>
                <span>ETH</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button variant="ghost" size="icon" className="rounded-full border border-border/50">
            <ArrowDownUp className="w-4 h-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">To</span>
            <span className="text-muted-foreground">Balance: 0.00</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="0.0"
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                className="text-lg h-12"
                readOnly
              />
            </div>
            <Button variant="outline" className="h-12 px-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-shield"></div>
                <span>USDC</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Swap Details */}
        {mevProtection && (
          <div className="p-3 rounded-lg bg-shield-cyan/5 border border-shield-cyan/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-shield-cyan" />
              <span className="text-sm font-medium text-shield-cyan">MEV Protection Active</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your swap will use commit-reveal protocol to prevent front-running and MEV attacks.
            </p>
          </div>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rate</span>
            <span>1 ETH = 3,456.78 USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Protocol Fee</span>
            <span>0.25%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimated Gas</span>
            <span>~$12.34</span>
          </div>
        </div>

        <Button 
          variant={mevProtection ? "shield" : "cosmic"} 
          className="w-full h-12 text-base font-semibold"
        >
          {mevProtection ? (
            <>
              <Shield className="w-4 h-4" />
              Protected Swap
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Instant Swap
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};