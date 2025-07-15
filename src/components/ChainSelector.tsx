import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

type Chain = "EVM" | "Solana";

export const ChainSelector = () => {
  const [selectedChain, setSelectedChain] = useState<Chain>("EVM");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Select Chain</h2>
        <Badge variant="outline" className="text-shield-cyan border-shield-cyan/50">
          Cross-Chain Ready
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant={selectedChain === "EVM" ? "cosmic" : "outline"}
          onClick={() => setSelectedChain("EVM")}
          className="h-20 flex-col gap-2"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-cosmic flex items-center justify-center">
            <span className="text-sm font-bold">E</span>
          </div>
          <span>Ethereum</span>
          <span className="text-xs opacity-70">& EVM Chains</span>
        </Button>
        
        <Button
          variant={selectedChain === "Solana" ? "cosmic" : "outline"}
          onClick={() => setSelectedChain("Solana")}
          className="h-20 flex-col gap-2"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-shield flex items-center justify-center">
            <span className="text-sm font-bold">S</span>
          </div>
          <span>Solana</span>
          <span className="text-xs opacity-70">SOL Network</span>
        </Button>
      </div>
    </div>
  );
};