"use client";

import { useEffect, useState, useCallback } from "react";
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../client/lib/queryClient";
import { TooltipProvider } from "../components/ui/tooltip";
import { Toaster } from "../components/ui/toaster";
import Header from "../components/layout/Header";
import MobileNavigation from "../components/layout/MobileNavigation";
import { Button } from "../components/ui/button";
import { SummaryCard } from "../components/dashboard/SummaryCard";
import { ExpenseChart } from "../components/dashboard/ExpenseChart";
import { CategoryBreakdown } from "../components/dashboard/CategoryBreakdown";
import { RecentTransactions } from "../components/dashboard/RecentTransactions";
import { SavingsGoals } from "../components/dashboard/SavingsGoals";
import { PlusIcon } from "lucide-react";
import { AddExpenseDialog } from "../components/expenses/AddExpenseDialog";
import { useExpenses, useCategories } from "../client/lib/hooks/useExpenses";
import { useBills } from "../client/lib/hooks/useBills";
import { useGoals } from "../client/lib/hooks/useGoals";
import { formatCurrency } from "../client/utils/date-utils";

function DashboardContent() {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [period, setPeriod] = useState("day");
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
  const [chartData, setChartData] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalBudget, setTotalBudget] = useState(1900);
  const [upcomingBills, setUpcomingBills] = useState(0);
  
  const handleDateRangeChange = useCallback((start, end) => {
    setDateRange({ start, end });
  }, []);
  
  useEffect(() => {
    if (expensesData && categoriesData) {
      const filteredExpenses = expensesData.filter((expense) => {
        const expenseDate = new Date(expense.date);
        const category = categoriesData.find((c) => c.id === expense.categoryId);
        return (
          expenseDate >= dateRange.start && 
          expenseDate <= dateRange.end &&
          category?.name !== "Income"
        );
      });
      
      const spent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      setTotalSpent(spent);
      
      const formattedChartData = formatChartData(filteredExpenses, period);
      setChartData(formattedChartData);
      
      const breakdown = calculateCategoryBreakdown(expensesData, categoriesData);
      setCategoryBreakdown(breakdown);
      
      const sortedTransactions = [...expensesData].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      const transactions = sortedTransactions.slice(0, 5).map((expense) => {
        const category = categoriesData.find((c) => c.id === expense.categoryId);
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
  
  useEffect(() => {
    if (billsData) {
      const unpaidBills = billsData.filter((bill) => !bill.isPaid);
      const total = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);
      setUpcomingBills(total);
    }
  }, [billsData]);
  
  const formatChartData = (expenses, view) => {
    if (!expenses.length) return [];
    
    if (view === "day") {
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
  
  const calculateCategoryBreakdown = (expenses, categories) => {
    if (!expenses || !categories) return [];
    
    const filteredExpenses = expenses.filter(expense => {
      const category = categories.find(c => c.id === expense.categoryId);
      return category?.name !== "Income";
    });
    
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    if (total === 0) return [];
    
    const categoryMap = new Map();
    filteredExpenses.forEach(expense => {
      const categoryId = expense.categoryId;
      if (categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, categoryMap.get(categoryId) + expense.amount);
      } else {
        categoryMap.set(categoryId, expense.amount);
      }
    });
    
    const result = Array.from(categoryMap.entries())
      .map(([categoryId, amount]) => {
        const category = categories.find(c => c.id === categoryId);
        if (!category) return null;
        
        return {
          id: categoryId,
          name: category.name,
          amount: amount,
          percentage: Math.round((amount / total) * 100),
          color: category.color,
        };
      })
      .filter(item => item !== null)
      .sort((a, b) => b.amount - a.amount);
    
    return result;
  };

  const currentDate = new Date();
  const formattedDate = format(currentDate, "EEEE, MMMM d, yyyy");
  
  return (
    <div>
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
            billsData && billsData.filter((bill) => !bill.isPaid).length > 0 ? (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md flex items-center">
                {billsData.filter((bill) => !bill.isPaid).length} due soon
              </span>
            ) : null
          }
        >
          <div className="space-y-2 mt-2">
            {billsData && billsData
              .filter((bill) => !bill.isPaid)
              .slice(0, 2)
              .map((bill) => {
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
              
            {(!billsData || billsData.filter((bill) => !bill.isPaid).length === 0) && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">No upcoming bills</span>
              </div>
            )}
          </div>
        </SummaryCard>
      </div>

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

      <RecentTransactions
        transactions={recentTransactions}
      />

      <SavingsGoals
        goals={goalsData || []}
        onAddGoal={addGoal}
      />
      
      <AddExpenseDialog
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
      />
    </div>
  );
}

export default function Dashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="flex-grow pb-20 md:pb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <DashboardContent />
            </div>
          </main>
          <MobileNavigation />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}