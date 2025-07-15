import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Shield, Zap, ExternalLink } from "lucide-react";

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
  onConnect?: (address: string, chainType: 'evm' | 'solana') => void;
}

export const WalletModal = ({ open, onClose, onConnect }: WalletModalProps) => {
  const handleWalletConnect = async (walletType: string, chainType: 'evm' | 'solana') => {
    // This would integrate with actual wallet adapters
    console.log(`Connecting to ${walletType} on ${chainType}`);
    
    // Mock connection for now
    const mockAddress = chainType === 'evm' 
      ? '0x742d35Cc6635C0532925a3b8D94c9D0C' 
      : 'DsVmA5hWGAnPs2htdZxdu4mYNMagZ8cFQc8kk5qCBbJ6';
    
    onConnect?.(mockAddress, chainType);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="evm" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="evm" className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-cosmic"></div>
              EVM
            </TabsTrigger>
            <TabsTrigger value="solana" className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-shield"></div>
              Solana
            </TabsTrigger>
          </TabsList>

          <TabsContent value="evm" className="space-y-3 mt-4">
            <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
              <Badge variant="outline" className="text-shield-cyan border-shield-cyan/50">
                <Shield className="w-3 h-3 mr-1" />
                MEV Protected
              </Badge>
              <span className="text-xs text-muted-foreground">Ethereum & L2s</span>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-between h-12"
                onClick={() => handleWalletConnect('MetaMask', 'evm')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                    🦊
                  </div>
                  MetaMask
                </div>
                <ExternalLink className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between h-12"
                onClick={() => handleWalletConnect('WalletConnect', 'evm')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    🔗
                  </div>
                  WalletConnect
                </div>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="solana" className="space-y-3 mt-4">
            <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
              <Badge variant="outline" className="text-shield-cyan border-shield-cyan/50">
                <Zap className="w-3 h-3 mr-1" />
                Fast & Cheap
              </Badge>
              <span className="text-xs text-muted-foreground">Solana Network</span>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-between h-12"
                onClick={() => handleWalletConnect('Phantom', 'solana')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                    👻
                  </div>
                  Phantom
                </div>
                <ExternalLink className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between h-12"
                onClick={() => handleWalletConnect('Solflare', 'solana')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                    ☀️
                  </div>
                  Solflare
                </div>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};