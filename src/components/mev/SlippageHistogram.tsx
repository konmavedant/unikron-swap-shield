
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Shield } from "lucide-react";
import { memo } from "react";

interface SlippageData {
  range: string;
  count: number;
  percentage: number;
  protected: number;
  unprotected: number;
}

interface SlippageHistogramProps {
  data?: SlippageData[];
  isLoading?: boolean;
  className?: string;
}

const mockData: SlippageData[] = [
  { range: "0-0.1%", count: 450, percentage: 45, protected: 380, unprotected: 70 },
  { range: "0.1-0.5%", count: 280, percentage: 28, protected: 250, unprotected: 30 },
  { range: "0.5-1%", count: 120, percentage: 12, protected: 100, unprotected: 20 },
  { range: "1-2%", count: 80, percentage: 8, protected: 60, unprotected: 20 },
  { range: "2-5%", count: 50, percentage: 5, protected: 30, unprotected: 20 },
  { range: ">5%", count: 20, percentage: 2, protected: 10, unprotected: 10 },
];

const chartConfig = {
  protected: {
    label: "MEV Protected",
    color: "hsl(var(--shield-cyan))",
  },
  unprotected: {
    label: "Unprotected",
    color: "hsl(var(--destructive))",
  },
};

const SlippageHistogramComponent = ({ 
  data = mockData, 
  isLoading = false, 
  className 
}: SlippageHistogramProps) => {
  const totalTransactions = data.reduce((sum, item) => sum + item.count, 0);
  const protectedPercentage = data.reduce((sum, item) => sum + item.protected, 0) / totalTransactions * 100;

  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-shield-cyan" />
            Slippage Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="h-48 flex items-center justify-center">
            <div className="text-muted-foreground text-sm">Loading slippage data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-shield-cyan" />
            Slippage Distribution
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-shield-cyan text-xs">
              {protectedPercentage.toFixed(1)}% Protected
            </Badge>
            <Badge variant="outline" className="text-xs">
              {totalTransactions.toLocaleString()} Total Swaps
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="w-full">
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis 
                  dataKey="range" 
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent 
                      formatter={(value, name) => [
                        `${value} swaps`,
                        name === 'protected' ? 'MEV Protected' : 'Unprotected'
                      ]}
                    />
                  }
                />
                <Bar 
                  dataKey="protected" 
                  stackId="a" 
                  fill="var(--color-protected)"
                  radius={[0, 0, 2, 2]}
                />
                <Bar 
                  dataKey="unprotected" 
                  stackId="a" 
                  fill="var(--color-unprotected)"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-green-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium">Low Slippage</p>
              <p className="text-xs text-muted-foreground">
                {((data[0].count + data[1].count) / totalTransactions * 100).toFixed(1)}% of swaps
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-3 h-3 text-red-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium">High Slippage</p>
              <p className="text-xs text-muted-foreground">
                {((data[4].count + data[5].count) / totalTransactions * 100).toFixed(1)}% of swaps
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const SlippageHistogram = memo(SlippageHistogramComponent);
