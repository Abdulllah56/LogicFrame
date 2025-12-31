import { Card, CardContent } from "../ui/card";
import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ExpenseChartProps {
  data: {
    date: string;
    amount: number;
  }[];
  period: 'day' | 'week' | 'month';
  onPeriodChange: (period: 'day' | 'week' | 'month') => void;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

export function ExpenseChart({
  data,
  period,
  onPeriodChange,
  onDateRangeChange
}: ExpenseChartProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Format the tooltip to display currency
  const formatTooltip = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  // Move date range forward
  const moveForward = () => {
    const newDate = new Date(currentDate);
    if (period === 'day') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (period === 'week') {
      newDate.setDate(newDate.getDate() + 28);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Move date range backward
  const moveBackward = () => {
    const newDate = new Date(currentDate);
    if (period === 'day') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (period === 'week') {
      newDate.setDate(newDate.getDate() - 28);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  // Update date range when period or current date changes
  useEffect(() => {
    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);

    if (period === 'day') {
      startDate.setDate(startDate.getDate() - 3);
      endDate.setDate(endDate.getDate() + 3);
    } else if (period === 'week') {
      startDate.setDate(1);
      endDate.setMonth(endDate.getMonth() + 1, 0);
    } else {
      startDate.setMonth(startDate.getMonth() - 5);
      endDate.setMonth(endDate.getMonth() + 1, 0);
    }

    if (onDateRangeChange) {
      onDateRangeChange(startDate, endDate);
    }
  }, [period, currentDate]);

  // Get formatted date range text
  const getDateRangeText = () => {
    if (period === 'day') {
      return `${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    } else if (period === 'week') {
      return `${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    } else {
      return `${currentDate.toLocaleDateString('en-US', { year: 'numeric' })}`;
    }
  };

  return (
    <Card className="lg:col-span-2 bg-white/[0.02] rounded-xl shadow-sm border border-border backdrop-blur-md">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h3 className="text-lg font-medium text-foreground mb-3 sm:mb-0">Spending by Category</h3>

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center w-full sm:w-auto">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                className={`px-4 py-2 text-sm font-medium text-foreground bg-muted/30 border border-border rounded-l-lg hover:bg-muted/50 focus:z-10 ${period === 'day' ? 'bg-primary/20 text-primary border-primary' : ''}`}
                onClick={() => onPeriodChange('day')}
              >
                Day
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium text-foreground bg-muted/30 border-t border-b border-border hover:bg-muted/50 focus:z-10 ${period === 'week' ? 'bg-primary/20 text-primary border-primary' : ''}`}
                onClick={() => onPeriodChange('week')}
              >
                Week
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium text-foreground bg-muted/30 border border-border rounded-r-lg hover:bg-muted/50 focus:z-10 ${period === 'month' ? 'bg-primary/20 text-primary border-primary' : ''}`}
                onClick={() => onPeriodChange('month')}
              >
                Month
              </button>
            </div>

            <div className="flex items-center space-x-2 sm:ml-4">
              <button
                className="p-2 text-muted-foreground hover:text-foreground focus:outline-none"
                onClick={moveBackward}
              >
                <i className="ri-arrow-left-s-line"></i>
              </button>
              <span className="text-sm font-medium">{getDateRangeText()}</span>
              <button
                className="p-2 text-muted-foreground hover:text-foreground focus:outline-none"
                onClick={moveForward}
              >
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>
          </div>
        </div>

        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 217, 255, 0.1)" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  color: 'white'
                }}
                itemStyle={{ color: 'white' }}
                labelStyle={{ color: 'white', fontWeight: 'bold' }}
              />
              <Bar
                dataKey="amount"
                fill="#00D9FF"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
                name="Amount"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
