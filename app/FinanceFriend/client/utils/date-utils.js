import { format, differenceInDays, addDays, isAfter, isBefore, isSameDay } from "date-fns";

/**
 * Format a number as currency
 */
export function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get the formatted date range for a period
 */
export function getDateRangeForPeriod(period, date = new Date()) {
  const start = new Date(date);
  const end = new Date(date);

  if (period === 'day') {
    // Last 7 days + today
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 1);
  } else if (period === 'week') {
    // Current month
    start.setDate(1);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0); // Last day of current month
  } else {
    // Default: last 6 months
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
export function getDueDateText(date) {
  if (!date) return "No due date";
  
  const dueDate = new Date(date);
  const now = new Date();
  const days = differenceInDays(dueDate, now);

  if (days < 0) return "Overdue";
  if (isSameDay(dueDate, now)) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days <= 7) return `Due in ${days} days`;
  return `Due ${format(dueDate, "MMM d")}`;
}

/**
 * Get a color class for due dates
 */
export function getDueDateColorClass(date) {
  if (!date) return "text-gray-500";

  const dueDate = new Date(date);
  const now = new Date();
  const days = differenceInDays(dueDate, now);

  if (days < 0) return "text-red-600";
  if (days <= 3) return "text-red-500";
  if (days <= 7) return "text-yellow-500";
  return "text-green-500";
}

/**
 * Format a date for display
 */
export function formatDate(date, formatString = "MMM d, yyyy") {
  if (!date) return "—";

  try {
    return format(new Date(date), formatString);
  } catch (error) {
    return "Invalid date";
  }
}

/**
 * Calculate days remaining until a target date
 */
export function getDaysRemaining(targetDate) {
  if (!targetDate) return null;

  const now = new Date();
  const target = new Date(targetDate);
  const days = differenceInDays(target, now);
  return Math.max(0, days);
}

/**
 * Calculate how much to save per day to reach a goal
 */
export function calculateDailySavingsAmount(targetAmount, currentAmount, targetDate) {
  if (!targetDate) return 0;

  const daysRemaining = getDaysRemaining(targetDate);
  if (!daysRemaining || daysRemaining === 0) return 0;

  const remainingAmount = targetAmount - currentAmount;
  if (remainingAmount <= 0) return 0;

  return Math.max(0, remainingAmount / daysRemaining);
}

/**
 * Check if a date is in the future
 */
export function isFutureDate(date) {
  if (!date) return false;
  return isAfter(new Date(date), new Date());
}