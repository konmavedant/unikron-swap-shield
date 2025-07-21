
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
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-shield-cyan" />
            Slippage Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">Loading slippage data...</div>
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
            <Shield className="w-5 h-5 text-shield-cyan" />
            Slippage Distribution
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-shield-cyan">
              {protectedPercentage.toFixed(1)}% Protected
            </Badge>
            <Badge variant="outline" className="text-xs">
              {totalTransactions.toLocaleString()} Total Swaps
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <BarChart data={data}>
            <XAxis 
              dataKey="range" 
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
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
              radius={[0, 0, 4, 4]}
            />
            <Bar 
              dataKey="unprotected" 
              stackId="a" 
              fill="var(--color-unprotected)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-sm font-medium">Low Slippage</p>
              <p className="text-xs text-muted-foreground">
                {((data[0].count + data[1].count) / totalTransactions * 100).toFixed(1)}% of swaps
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <div>
              <p className="text-sm font-medium">High Slippage</p>
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
