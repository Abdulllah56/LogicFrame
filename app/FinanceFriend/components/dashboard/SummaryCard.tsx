import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  secondaryInfo?: React.ReactNode;
  progressValue?: number;
  progressMax?: number;
  progressLabel?: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  children?: React.ReactNode;
}

export function SummaryCard({
  title,
  value,
  secondaryInfo,
  progressValue,
  progressMax = 100,
  progressLabel,
  trend,
  children
}: SummaryCardProps) {
  const progressPercentage = progressValue !== undefined
    ? Math.min(100, Math.max(0, (progressValue / progressMax) * 100))
    : undefined;

  return (
    <Card className="border border-border bg-white/[0.02] backdrop-blur-md">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <p className="text-2xl font-semibold text-foreground">{value}</p>
          </div>
          {trend && (
            <span className={`px-2 py-1 ${trend.positive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs rounded-md flex items-center`}>
              {trend.positive ? (
                <TrendingDownIcon className="mr-1 h-3 w-3" />
              ) : (
                <TrendingUpIcon className="mr-1 h-3 w-3" />
              )}
              {trend.value}%
            </span>
          )}
          {secondaryInfo}
        </div>

        {progressPercentage !== undefined && (
          <>
            <Progress value={progressPercentage} className="h-2.5 bg-muted" />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-muted-foreground">{progressLabel}</span>
              <span className="text-xs text-muted-foreground">{progressPercentage}% used</span>
            </div>
          </>
        )}

        {children}
      </CardContent>
    </Card>
  );
}
