import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Shield, Zap, ExternalLink } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletStore } from "@/store/wallet";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
  onConnect?: (address: string, chainType: 'evm' | 'solana') => void;
}

export const WalletModal = ({ open, onClose, onConnect }: WalletModalProps) => {
  // EVM wallet hooks
  const { address: evmAddress, isConnected: evmConnected, chainId } = useAccount();
  const { connect: evmConnect, connectors } = useConnect();
  const { disconnect: evmDisconnect } = useDisconnect();

  // Solana wallet hooks  
  const { publicKey: solanaAddress, connected: solanaConnected, select, connect: solanaConnect, wallets } = useWallet();

  // Global wallet store
  const { connect: storeConnect, setConnecting } = useWalletStore();

  // Handle EVM connection
  useEffect(() => {
    if (evmConnected && evmAddress) {
      storeConnect(evmAddress, 'evm', chainId);
      onConnect?.(evmAddress, 'evm');
      onClose();
      toast({
        title: "Wallet Connected",
        description: `Connected to ${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}`,
      });
    }
  }, [evmConnected, evmAddress, chainId]);

  // Handle Solana connection
  useEffect(() => {
    if (solanaConnected && solanaAddress) {
      const address = solanaAddress.toString();
      storeConnect(address, 'solana');
      onConnect?.(address, 'solana');
      onClose();
      toast({
        title: "Wallet Connected", 
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    }
  }, [solanaConnected, solanaAddress]);

  const handleEvmWalletConnect = async (connector: any) => {
    try {
      setConnecting(true);
      await evmConnect({ connector });
    } catch (error) {
      console.error('EVM wallet connection failed:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to EVM wallet",
        variant: "destructive",
      });
      setConnecting(false);
    }
  };

  const handleSolanaWalletConnect = async (walletName: string) => {
    try {
      setConnecting(true);
      const wallet = wallets.find(w => w.adapter.name === walletName);
      if (wallet) {
        select(wallet.adapter.name);
        await solanaConnect();
      }
    } catch (error) {
      console.error('Solana wallet connection failed:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Solana wallet",
        variant: "destructive",
      });
      setConnecting(false);
    }
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
              {connectors.map((connector) => (
                <Button
                  key={connector.id}
                  variant="outline"
                  className="w-full justify-between h-12"
                  onClick={() => handleEvmWalletConnect(connector)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                      {connector.name === 'MetaMask' ? '🦊' : 
                       connector.name === 'WalletConnect' ? '🔗' : '💼'}
                    </div>
                    {connector.name}
                  </div>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              ))}
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
              {wallets.filter(wallet => wallet.readyState === 'Installed' || wallet.readyState === 'Loadable').map((wallet) => (
                <Button
                  key={wallet.adapter.name}
                  variant="outline"
                  className="w-full justify-between h-12"
                  onClick={() => handleSolanaWalletConnect(wallet.adapter.name)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                      {wallet.adapter.icon ? (
                        <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <span>{wallet.adapter.name === 'Phantom' ? '👻' : 
                               wallet.adapter.name === 'Solflare' ? '☀️' : '💼'}</span>
                      )}
                    </div>
                    {wallet.adapter.name}
                  </div>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              ))}
              
              {wallets.filter(wallet => wallet.readyState === 'Installed' || wallet.readyState === 'Loadable').length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No Solana wallets detected.</p>
                  <p className="text-xs mt-1">Please install Phantom or Solflare wallet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};