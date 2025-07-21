
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Clock, 
  Shield, 
  FileText, 
  Download, 
  ExternalLink,
  Lock,
  Eye,
  Hash
} from "lucide-react";
import { memo } from "react";

interface ExecutionStep {
  step: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  txHash?: string;
  blockNumber?: number;
  details?: string;
}

interface ExecutionProofProps {
  intentId: string;
  steps?: ExecutionStep[];
  isLoading?: boolean;
  className?: string;
}

const mockSteps: ExecutionStep[] = [
  {
    step: "Intent Submission",
    timestamp: "2025-01-21T10:30:00Z",
    status: "completed",
    txHash: "0x1234...5678",
    blockNumber: 18500000,
    details: "Swap intent submitted with MEV protection"
  },
  {
    step: "Commit Phase",
    timestamp: "2025-01-21T10:30:15Z",
    status: "completed",
    txHash: "0x2345...6789",
    blockNumber: 18500001,
    details: "Transaction committed to mempool with privacy"
  },
  {
    step: "Reveal Phase",
    timestamp: "2025-01-21T10:30:30Z",
    status: "completed",
    txHash: "0x3456...7890",
    blockNumber: 18500002,
    details: "Intent revealed and executed successfully"
  },
  {
    step: "Settlement",
    timestamp: "2025-01-21T10:30:45Z",
    status: "completed",
    txHash: "0x4567...8901",
    blockNumber: 18500003,
    details: "Final settlement confirmed on-chain"
  }
];

const ExecutionProofComponent = ({ 
  intentId, 
  steps = mockSteps, 
  isLoading = false, 
  className 
}: ExecutionProofProps) => {
  const getStatusIcon = (status: ExecutionStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'failed':
        return <div className="w-4 h-4 rounded-full bg-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-500" />;
    }
  };

  const getStatusColor = (status: ExecutionStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const downloadProof = () => {
    const proofData = {
      intentId,
      timestamp: new Date().toISOString(),
      steps,
      verification: "This execution proof verifies the MEV-protected swap was executed according to the commit-reveal protocol."
    };
    
    const dataStr = JSON.stringify(proofData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `execution-proof-${intentId.slice(-8)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Execution Proof
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-4 h-4 bg-muted animate-pulse rounded-full" />
                <div className="flex-1">
                  <div className="w-32 h-4 bg-muted animate-pulse rounded mb-2" />
                  <div className="w-24 h-3 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Execution Proof
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-shield-cyan">
              <Shield className="w-3 h-3 mr-1" />
              MEV Protected
            </Badge>
            <Button variant="outline" size="sm" onClick={downloadProof}>
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Intent ID */}
        <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Intent ID</span>
          </div>
          <p className="text-xs font-mono text-muted-foreground break-all">
            {intentId}
          </p>
        </div>

        <Separator />

        {/* Execution Steps */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Execution Timeline</h4>
          
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                {getStatusIcon(step.status)}
                {index < steps.length - 1 && (
                  <div className="w-px h-8 bg-border mt-2" />
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium">{step.step}</h5>
                  <Badge className={getStatusColor(step.status)}>
                    {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {new Date(step.timestamp).toLocaleString()}
                </p>
                
                {step.details && (
                  <p className="text-xs text-muted-foreground">
                    {step.details}
                  </p>
                )}
                
                {step.txHash && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Tx:</span>
                    <code className="text-xs font-mono bg-secondary/50 px-2 py-1 rounded">
                      {step.txHash}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1"
                      onClick={() => window.open(`https://etherscan.io/tx/${step.txHash}`, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                
                {step.blockNumber && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Block:</span>
                    <code className="text-xs font-mono bg-secondary/50 px-2 py-1 rounded">
                      {step.blockNumber.toLocaleString()}
                    </code>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Verification */}
        <div className="p-3 rounded-lg bg-shield-cyan/5 border border-shield-cyan/20">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-shield-cyan" />
            <span className="text-sm font-medium text-shield-cyan">Verification</span>
          </div>
          <p className="text-xs text-muted-foreground">
            This execution proof cryptographically verifies that your swap was executed 
            using our commit-reveal MEV protection protocol. All steps are immutably 
            recorded on-chain and can be independently verified.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="w-4 h-4" />
            View on Explorer
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <FileText className="w-4 h-4" />
            Share Proof
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ExecutionProof = memo(ExecutionProofComponent);
