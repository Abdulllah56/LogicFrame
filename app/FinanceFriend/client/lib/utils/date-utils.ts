import { format, differenceInDays, addDays, isAfter, isBefore, isSameDay } from "date-fns";

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Get the formatted date range for a period
 */
export function getDateRangeForPeriod(period: 'day' | 'week' | 'month', date: Date = new Date()): { start: Date, end: Date } {
  const start = new Date(date);
  const end = new Date(date);
  
  if (period === 'day') {
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 1);
  } else if (period === 'week') {
    // Get the start of the current month
    start.setDate(1);
    // Get the end of the current month
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
  } else {
    // For month view, show 6 months
    start.setMonth(start.getMonth() - 5);
    start.setDate(1);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
  }
  
  return { start, end };
}

/**
 * Get a readable string for due dates
 */
export function getDueDateText(date: Date): string {
  const now = new Date();
  const days = differenceInDays(date, now);
  
  if (days < 0) return "Overdue";
  if (isSameDay(date, now)) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days <= 7) return `Due in ${days} days`;
  return `Due ${format(date, "MMM d")}`;
}

/**
 * Get a color class for due dates
 */
export function getDueDateColorClass(date: Date): string {
  const now = new Date();
  const days = differenceInDays(date, now);
  
  if (days < 0) return "text-red-600";
  if (days <= 3) return "text-red-500";
  if (days <= 7) return "text-yellow-500";
  return "text-green-500";
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string, formatString: string = "MMM d, yyyy"): string {
  return format(new Date(date), formatString);
}

/**
 * Calculate days remaining until a target date
 */
export function getDaysRemaining(targetDate: Date | null): number | null {
  if (!targetDate) return null;
  
  const now = new Date();
  return Math.max(0, differenceInDays(new Date(targetDate), now));
}

/**
 * Calculate how much to save per day to reach a goal
 */
export function calculateDailySavingsAmount(
  targetAmount: number,
  currentAmount: number,
  targetDate: Date | null
): number {
  if (!targetDate) return 0;
  
  const daysRemaining = getDaysRemaining(targetDate);
  if (!daysRemaining || daysRemaining === 0) return 0;
  
  const remainingAmount = targetAmount - currentAmount;
  return remainingAmount / daysRemaining;
}

/**
 * Check if a date is in the future
 */
export function isFutureDate(date: Date | string): boolean {
  return isAfter(new Date(date), new Date());
}
