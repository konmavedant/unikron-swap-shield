import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
type Chain = "EVM" | "Solana";
export const ChainSelector = () => {
  const [selectedChain, setSelectedChain] = useState<Chain>("EVM");
  return <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Select Chain</h2>
        
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        
        
        
      </div>
    </div>;
};