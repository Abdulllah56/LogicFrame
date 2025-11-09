import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react';

/**
 * @typedef {object} TrendData
 * @property {number} value - The percentage value of the trend (e.g., 5.2).
 * @property {boolean} positive - True if the change is considered a "positive" outcome (e.g., profit growth, expense reduction).
 *
 * @typedef {object} SummaryCardProps
 * @property {string} title - The main title of the card (e.g., "Total Spending").
 * @property {string} value - The main metric value (e.g., "$1,250.00").
 * @property {React.ReactNode=} secondaryInfo - Optional element displayed next to the trend.
 * @property {number=} progressValue - Current value for the progress bar.
 * @property {number=} progressMax - Maximum value for the progress bar (default is 100).
 * @property {string=} progressLabel - Label for the progress bar (e.g., "Budget").
 * @property {TrendData=} trend - Optional object to display a percentage trend icon and value.
 * @property {React.ReactNode=} children - Content to be displayed at the bottom of the card.
 */

/**
 * A versatile card component used to display key financial summaries, trends, and progress.
 *
 * @param {SummaryCardProps} props
 */
export function SummaryCard({
  title,
  value,
  secondaryInfo,
  progressValue,
  progressMax = 100,
  progressLabel,
  trend,
  children
}) {
  // Calculate the progress percentage, ensuring it stays between 0 and 100
  const progressPercentage = progressValue !== undefined 
    ? Math.min(100, Math.max(0, (progressValue / progressMax) * 100)) 
    : undefined;
  
  return (
    <Card className="border border-gray-100 rounded-xl shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
          
          {/* Trend Indicator */}
          {trend && (
            <span className={`px-2 py-1 ${trend.positive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs rounded-md flex items-center`}>
              {/* Note: The icon logic here assumes 'positive' means a down arrow 
                  (e.g., good for reducing expenses) and 'negative' means an up arrow. 
                  You may want to swap these icons depending on the context of the card. */}
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
        
        {/* Progress Bar (Budget Tracking) */}
        {progressPercentage !== undefined && (
          <>
            <Progress value={progressPercentage} className="h-2.5 bg-gray-200" indicatorClassName={progressPercentage > 90 ? "bg-red-500" : "bg-blue-500"} />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">{progressLabel}</span>
              <span className="text-xs text-gray-500">{progressPercentage.toFixed(1)}% used</span>
            </div>
          </>
        )}
        
        {children}
      </CardContent>
    </Card>
  );
}