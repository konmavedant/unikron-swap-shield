import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Shield, Clock, CheckCircle, AlertCircle, Eye, Timer } from "lucide-react";
import { SwapIntent } from "@/types";
import { useState, useEffect } from "react";

interface SwapCommitRevealProps {
  swapIntent: SwapIntent;
  onReveal?: () => void;
  onCancel?: () => void;
  timeRemaining?: number;
}

export const SwapCommitReveal = ({
  swapIntent,
  onReveal,
  onCancel,
  timeRemaining = 0
}: SwapCommitRevealProps) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'commit' | 'reveal' | 'executed' | 'expired'>('commit');

  useEffect(() => {
    if (swapIntent.status === 'committed') {
      setPhase('reveal');
    } else if (swapIntent.status === 'executed') {
      setPhase('executed');
    } else if (swapIntent.status === 'expired') {
      setPhase('expired');
    }
  }, [swapIntent.status]);

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - swapIntent.createdAt;
      const total = 300000; // 5 minutes commit window
      const currentProgress = Math.min((elapsed / total) * 100, 100);
      setProgress(currentProgress);
    }, 1000);

    return () => clearInterval(timer);
  }, [swapIntent.createdAt]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (): "default" | "destructive" | "secondary" | "outline" => {
    switch (phase) {
      case 'commit': return 'secondary';
      case 'reveal': return 'default';
      case 'executed': return 'default';
      case 'expired': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (phase) {
      case 'commit': return <Clock className="w-4 h-4" />;
      case 'reveal': return <Eye className="w-4 h-4" />;
      case 'executed': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">MEV Protected Swap</CardTitle>
          <Badge variant={getStatusColor()} className="flex items-center gap-1">
            {getStatusIcon()}
            {phase.charAt(0).toUpperCase() + phase.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Phase Information */}
        <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-shield-cyan" />
            <span className="font-medium text-shield-cyan">
              {phase === 'commit' && 'Commit Phase'}
              {phase === 'reveal' && 'Reveal Phase'}
              {phase === 'executed' && 'Executed'}
              {phase === 'expired' && 'Expired'}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {phase === 'commit' && 'Your swap commitment is secured. You can reveal when ready.'}
            {phase === 'reveal' && 'Ready to reveal and execute your protected swap.'}
            {phase === 'executed' && 'Your swap has been successfully executed!'}
            {phase === 'expired' && 'The commit window has expired. Please start a new swap.'}
          </p>
        </div>

        <Separator />

        {/* Swap Details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Intent ID</span>
            <span className="text-sm font-mono text-right break-all max-w-[200px]">
              {swapIntent.intentId.slice(0, 16)}...
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">From</span>
            <span className="text-sm font-medium">
              {swapIntent.inputAmount} {swapIntent.inputToken.symbol}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">To (Expected)</span>
            <span className="text-sm font-medium">
              {swapIntent.outputAmount} {swapIntent.outputToken.symbol}
            </span>
          </div>

          {timeRemaining > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Time Remaining</span>
              <div className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                <span className="text-sm font-medium">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {phase === 'commit' && (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                variant="shield"
                className="flex-1"
                onClick={onReveal}
                disabled={!onReveal}
              >
                <Eye className="w-4 h-4" />
                Reveal Now
              </Button>
            </>
          )}

          {phase === 'reveal' && (
            <Button
              variant="shield"
              className="w-full"
              onClick={onReveal}
              disabled={!onReveal}
            >
              <Eye className="w-4 h-4" />
              Execute Swap
            </Button>
          )}

          {(phase === 'executed' || phase === 'expired') && (
            <Button
              variant="outline"
              className="w-full"
              onClick={onCancel}
            >
              Close
            </Button>
          )}
        </div>

        {/* Warning for commit phase */}
        {phase === 'commit' && (
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-500">Commit Window Active</span>
            </div>
            <p className="text-xs text-muted-foreground">
              You have 5 minutes to reveal your swap. The longer you wait, the better MEV protection.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};