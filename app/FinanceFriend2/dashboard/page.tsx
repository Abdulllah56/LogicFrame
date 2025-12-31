"use client"

import { useEffect, useState, useCallback } from "react";
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { Button } from "../components/ui/button";
import { SummaryCard } from "../components/dashboard/SummaryCard";
import { ExpenseChart } from "../components/dashboard/ExpenseChart  ";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { SavingsGoals } from "@/components/dashboard/SavingsGoals";
import { PlusIcon } from "lucide-react";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { useExpenses, useCategories } from "@/lib/hooks/useExpenses";
import { useBills } from "@/lib/hooks/useBills";
import { useGoals } from "@/lib/hooks/useGoals";
import { formatCurrency } from "@/lib/utils/date-utils";

export default function Dashboard() {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 7),
    end: new Date(),
  });

  // Get data from API
  const { data: expensesData, isLoading: expensesLoading } = useExpenses();
  const { data: categoriesData } = useCategories();
  const { data: billsData, isLoading: billsLoading, markBillAsPaid } = useBills();
  const { data: goalsData, isLoading: goalsLoading, addGoal, updateGoal } = useGoals();
  
  // State for chart data
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalBudget, setTotalBudget] = useState(1900); // Default budget
  const [upcomingBills, setUpcomingBills] = useState(0);
  
  // Handle date range changes for the chart
  const handleDateRangeChange = useCallback((start: Date, end: Date) => {
    setDateRange({ start, end });
  }, []);
  
  // Process expense data when it changes
  useEffect(() => {
    if (expensesData && categoriesData) {
      // Filter expenses by date range and exclude income
      const filteredExpenses = expensesData.filter((expense: any) => {
        const expenseDate = new Date(expense.date);
        const category = categoriesData.find((c: any) => c.id === expense.categoryId);
        return (
          expenseDate >= dateRange.start && 
          expenseDate <= dateRange.end &&
          category?.name !== "Income"
        );
      });
      
      // Calculate total spent
      const spent = filteredExpenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
      setTotalSpent(spent);
      
      // Format chart data based on period
      const formattedChartData = formatChartData(filteredExpenses, period);
      setChartData(formattedChartData);
      
      // Calculate category breakdown
      const breakdown = calculateCategoryBreakdown(expensesData, categoriesData);
      setCategoryBreakdown(breakdown);
      
      // Get recent transactions
      const sortedTransactions = [...expensesData].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      const transactions = sortedTransactions.slice(0, 5).map((expense) => {
        const category = categoriesData.find((c: any) => c.id === expense.categoryId);
        return {
          id: expense.id,
          description: expense.description,
          category: {
            id: category?.id,
            name: category?.name || "Other",
            color: category?.color || "#94A3B8",
            icon: category?.icon || "ri-money-dollar-circle-line",
          },
          date: new Date(expense.date),
          amount: expense.amount,
          isIncome: category?.name === "Income",
        };
      });
      
      setRecentTransactions(transactions);
    }
  }, [expensesData, categoriesData, dateRange, period]);
  
  // Calculate upcoming bills total
  useEffect(() => {
    if (billsData) {
      const unpaidBills = billsData.filter((bill: any) => !bill.isPaid);
      const total = unpaidBills.reduce((sum: number, bill: any) => sum + bill.amount, 0);
      setUpcomingBills(total);
    }
  }, [billsData]);
  
  // Format chart data based on the selected period
  const formatChartData = (expenses: any[], view: "day" | "week" | "month") => {
    if (!expenses.length) return [];
    
    if (view === "day") {
      // Group by day
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dailyData = new Array(7).fill(0).map((_, i) => ({
        date: days[i],
        amount: 0,
      }));
      
      expenses.forEach(expense => {
        const day = new Date(expense.date).getDay();
        dailyData[day].amount += expense.amount;
      });
      
      return dailyData;
    } else if (view === "week") {
      // Group by week of month
      const weeksData = new Array(4).fill(0).map((_, i) => ({
        date: `Week ${i + 1}`,
        amount: 0,
      }));
      
      expenses.forEach(expense => {
        const date = new Date(expense.date);
        const weekOfMonth = Math.floor((date.getDate() - 1) / 7);
        if (weekOfMonth < 4) {
          weeksData[weekOfMonth].amount += expense.amount;
        }
      });
      
      return weeksData;
    } else {
      // Group by month
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyData = new Array(12).fill(0).map((_, i) => ({
        date: months[i],
        amount: 0,
      }));
      
      expenses.forEach(expense => {
        const month = new Date(expense.date).getMonth();
        monthlyData[month].amount += expense.amount;
      });
      
      return monthlyData;
    }
  };
  
  // Calculate category breakdown with percentages
  const calculateCategoryBreakdown = (expenses: any[], categories: any[]) => {
    if (!expenses || !categories) return [];
    
    // Filter out income
    const filteredExpenses = expenses.filter(expense => {
      const category = categories.find(c => c.id === expense.categoryId);
      return category?.name !== "Income";
    });
    
    // Calculate total (excluding income)
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    if (total === 0) return [];
    
    // Group by category
    const categoryMap = new Map();
    filteredExpenses.forEach(expense => {
      const categoryId = expense.categoryId;
      if (categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, categoryMap.get(categoryId) + expense.amount);
      } else {
        categoryMap.set(categoryId, expense.amount);
      }
    });
    
    // Convert to array and sort by amount (descending)
    const result = Array.from(categoryMap.entries())
      .map(([categoryId, amount]) => {
        const category = categories.find(c => c.id === categoryId);
        if (!category) return null;
        
        return {
          id: categoryId,
          name: category.name,
          amount: amount as number,
          percentage: Math.round(((amount as number) / total) * 100),
          color: category.color,
        };
      })
      .filter(item => item !== null)
      .sort((a, b) => b!.amount - a!.amount);
    
    return result;
  };

  // Date for greeting header
  const currentDate = new Date();
  const formattedDate = format(currentDate, "EEEE, MMMM d, yyyy");
  
  return (
    <div>
      {/* Greeting and Date Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Hello, Jamie!</h1>
          <p className="text-gray-600 text-sm mt-1">{formattedDate}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            className="bg-[#0F172A] text-white hover:bg-[#1E293B] flex items-center space-x-2"
            onClick={() => setShowAddExpense(true)}
          >
            <PlusIcon size={16} />
            <span>Add Expense</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard
          title="Monthly Spending"
          value={formatCurrency(totalSpent)}
          trend={{ value: 4.5, positive: true }}
          progressValue={totalSpent}
          progressMax={totalBudget}
          progressLabel={`Budget: ${formatCurrency(totalBudget)}`}
        />
        
        <SummaryCard
          title="Savings Goals"
          value={goalsData && goalsData.length > 0 
            ? `${formatCurrency(goalsData[0].currentAmount)} / ${formatCurrency(goalsData[0].targetAmount)}`
            : "$0 / $0"
          }
          secondaryInfo={
            goalsData && goalsData.length > 0 ? (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md flex items-center">
                {Math.round((goalsData[0].currentAmount / goalsData[0].targetAmount) * 100)}%
              </span>
            ) : null
          }
          progressValue={goalsData && goalsData.length > 0 ? goalsData[0].currentAmount : 0}
          progressMax={goalsData && goalsData.length > 0 ? goalsData[0].targetAmount : 1}
          progressLabel={goalsData && goalsData.length > 0 ? goalsData[0].name : "No goals"}
        />
        
        <SummaryCard
          title="Upcoming Bills"
          value={formatCurrency(upcomingBills)}
          secondaryInfo={
            billsData && billsData.filter((bill: any) => !bill.isPaid).length > 0 ? (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md flex items-center">
                {billsData.filter((bill: any) => !bill.isPaid).length} due soon
              </span>
            ) : null
          }
        >
          <div className="space-y-2 mt-2">
            {billsData && billsData
              .filter((bill: any) => !bill.isPaid)
              .slice(0, 2)
              .map((bill: any) => {
                const dueDate = new Date(bill.dueDate);
                const daysRemaining = Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={bill.id} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{bill.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(bill.amount)}</span>
                      <span className={`text-xs ${daysRemaining <= 3 ? 'text-red-500' : 'text-yellow-500'}`}>
                        {daysRemaining > 0 ? `${daysRemaining} days` : 'Overdue'}
                      </span>
                    </div>
                  </div>
                );
              })}
              
            {(!billsData || billsData.filter((bill: any) => !bill.isPaid).length === 0) && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">No upcoming bills</span>
              </div>
            )}
          </div>
        </SummaryCard>
      </div>

      {/* Expenses Chart and Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <ExpenseChart 
          data={chartData}
          period={period}
          onPeriodChange={setPeriod}
          onDateRangeChange={handleDateRangeChange}
        />
        
        <CategoryBreakdown
          categories={categoryBreakdown}
          total={totalSpent}
        />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions
        transactions={recentTransactions}
      />

      {/* Savings Goals */}
      <SavingsGoals
        goals={goalsData || []}
        onAddGoal={addGoal}
      />
      
      {/* Add Expense Dialog */}
      <AddExpenseDialog
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
      />
    </div>
  );
}
