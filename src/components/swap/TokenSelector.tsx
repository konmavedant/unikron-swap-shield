import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Token } from "@/types";

interface TokenSelectorProps {
  selectedToken?: Token;
  onTokenSelect: (token: Token) => void;
  tokens: Token[];
  label?: string;
  disabled?: boolean;
}

export const TokenSelector = ({ 
  selectedToken, 
  onTokenSelect, 
  tokens,
  label = "Select Token",
  disabled = false
}: TokenSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTokens = tokens.filter(token =>
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <Button
        variant="outline"
        className="h-12 px-4 justify-between"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        {selectedToken ? (
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full bg-gradient-cosmic"
              style={{
                backgroundImage: selectedToken.logoURI ? `url(${selectedToken.logoURI})` : undefined
              }}
            />
            <span>{selectedToken.symbol}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">{label}</span>
        )}
        <ChevronDown className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Token</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredTokens.map((token) => (
                <Button
                  key={token.address}
                  variant="ghost"
                  className="w-full h-16 p-3 justify-between hover:bg-secondary/50"
                  onClick={() => handleTokenSelect(token)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full bg-gradient-cosmic flex items-center justify-center"
                      style={{
                        backgroundImage: token.logoURI ? `url(${token.logoURI})` : undefined
                      }}
                    >
                      {!token.logoURI && (
                        <span className="text-sm font-bold">
                          {token.symbol.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-sm text-muted-foreground">{token.name}</div>
                    </div>
                  </div>
                  
                  {token.balance && (
                    <div className="text-right">
                      <div className="text-sm font-medium">{token.balance}</div>
                      <Badge variant="outline" className="text-xs">
                        {token.chainId ? `Chain ${token.chainId}` : 'Solana'}
                      </Badge>
                    </div>
                  )}
                </Button>
              ))}

              {filteredTokens.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No tokens found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};