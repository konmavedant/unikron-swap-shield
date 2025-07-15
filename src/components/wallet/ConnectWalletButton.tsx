import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Zap, Shield } from "lucide-react";
import { useState } from "react";
import { WalletModal } from "./WalletModal";

interface ConnectWalletButtonProps {
  onConnect?: (address: string, chainType: 'evm' | 'solana') => void;
}

export const ConnectWalletButton = ({ onConnect }: ConnectWalletButtonProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        variant="cosmic"
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 h-12 px-6"
      >
        <Wallet className="w-5 h-5" />
        Connect Wallet
        <Badge variant="outline" className="ml-2 text-xs border-white/20 text-white/90">
          Multi-Chain
        </Badge>
      </Button>

      <WalletModal 
        open={showModal}
        onClose={() => setShowModal(false)}
        onConnect={onConnect}
      />
    </>
  );
};