"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../client/lib/queryClient";
import { TooltipProvider } from "../components/ui/tooltip";
import { Toaster } from "../components/ui/toaster";
import MobileNavigation from "../components/layout/MobileNavigation";

import { Button } from "../components/ui/button";
import { SummaryCard } from "../components/dashboard/SummaryCard";
import { CategoryBreakdown } from "../components/dashboard/CategoryBreakdown";
import { PlusIcon } from "lucide-react";

import { useExpenses, useCategories } from "../client/lib/hooks/useExpenses";
import { useBudgets } from "../client/lib/hooks/useBudgets";
import { useGoals } from "../client/lib/hooks/useGoals";
import { useBills } from "../client/lib/hooks/useBills";

const RecentTransactions = dynamic(() => import("../components/dashboard/RecentTransactions").then(mod => mod.RecentTransactions), { ssr: false, loading: () => <div className="h-24 flex items-center justify-center">Loading...</div> });
const SavingsGoals = dynamic(() => import("../components/dashboard/SavingsGoals").then(mod => mod.SavingsGoals), { ssr: false, loading: () => <div className="h-24 flex items-center justify-center">Loading...</div> });
const AddExpenseDialog = dynamic(() => import("../components/expenses/AddExpenseDialog").then(mod => mod.AddExpenseDialog), { ssr: false });
const SetBudgetDialog = dynamic(() => import("../components/dashboard/SetBudgetDialog").then(mod => mod.SetBudgetDialog), { ssr: false });

// Lazy-load the chart component so it doesn't bloat the initial JS
const ExpenseChart = dynamic(
  () => import("../components/dashboard/ExpenseChart").then((mod) => mod.ExpenseChart),
  { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center">Loading chart...</div> }
);

function DashboardContent({ initialSummary }: { initialSummary: any }) {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSetBudget, setShowSetBudget] = useState(false);
  const [period, setPeriod] = useState("day");

  // Fetch live data
  const { data: expenses = [] } = useExpenses();
  const { data: categories = [] } = useCategories();
  const { data: bills = [] } = useBills();
  const { data: goals = [] } = useGoals();
  const { data: budgets = [] } = useBudgets();

  // Combine live data with initial summary for immediate render if needed, 
  // but client data will take precedence once loaded.
  // Actually, useExpenses defaults to [] so it's fine.

  const totalSpent = useMemo(() => {
    // Filter out Income for spending calculation
    const incomeCat = categories.find((c: any) => c.name === 'Income');
    const spendingExpenses = expenses.filter((e: any) => e.categoryId !== incomeCat?.id);
    return spendingExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  }, [expenses, categories]);

  const totalBudget = useMemo(() => {
    const monthly = budgets && budgets.find((b: any) => b.categoryId === null && b.period === "monthly");
    // Fallback to summary if budget not loaded yet? No, use live data.
    return monthly ? monthly.amount : 0;
  }, [budgets]);

  const chartData = useMemo(() => {
    // Replicate server-side helper on client
    const formatChartData = (expensesList: any[], view: string) => {
      // Filter out income
      const incomeCat = categories.find((c: any) => c.name === 'Income');
      const filteredList = expensesList.filter((e: any) => e.categoryId !== incomeCat?.id);

      if (!filteredList.length) return [];

      if (view === "day") {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dailyData = new Array(7).fill(0).map((_, i) => ({ date: days[i], amount: 0 }));
        filteredList.forEach((expense: any) => {
          const day = new Date(expense.date).getDay();
          dailyData[day].amount += expense.amount;
        });
        return dailyData;
      }

      if (view === "week") {
        const weeksData = new Array(4).fill(0).map((_, i) => ({ date: `Week ${i + 1}`, amount: 0 }));
        filteredList.forEach((expense: any) => {
          const date = new Date(expense.date);
          const weekOfMonth = Math.floor((date.getDate() - 1) / 7);
          if (weekOfMonth < 4) weeksData[weekOfMonth].amount += expense.amount;
        });
        return weeksData;
      }

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyData = new Array(12).fill(0).map((_, i) => ({ date: months[i], amount: 0 }));
      filteredList.forEach((expense: any) => {
        const month = new Date(expense.date).getMonth();
        monthlyData[month].amount += expense.amount;
      });
      return monthlyData;
    };
    return formatChartData(expenses, period);
  }, [expenses, period, categories]);

  const recentTransactions = useMemo(() => {
    if (!expenses || !categories) return [];
    const sorted = [...expenses].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted.slice(0, 5).map((expense: any) => {
      const category = categories.find((c: any) => c.id === expense.categoryId);
      return {
        id: expense.id,
        description: expense.description,
        category: { id: category?.id, name: category?.name || "Other", color: category?.color || "#94A3B8", icon: category?.icon },
        date: new Date(expense.date),
        amount: expense.amount,
        isIncome: category?.name === "Income"
      };
    });
  }, [expenses, categories]);

  const categoriesBreakdown = useMemo(() => {
    if (!expenses.length || !categories.length) return [];

    // Filter out income
    const incomeCat = categories.find((c: any) => c.name === 'Income');
    const spendingExpenses = expenses.filter((e: any) => e.categoryId !== incomeCat?.id);
    const total = spendingExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);

    if (total === 0) return [];

    const breakdownMap = new Map();
    spendingExpenses.forEach((e: any) => {
      const current = breakdownMap.get(e.categoryId) || 0;
      breakdownMap.set(e.categoryId, current + e.amount);
    });

    return Array.from(breakdownMap.entries()).map(([catId, amount]) => {
      const cat = categories.find((c: any) => c.id === catId);
      if (!cat) return null;
      return {
        id: catId as number,
        name: cat.name,
        amount: amount as number,
        percentage: Math.round(((amount as number) / total) * 100),
        color: cat.color
      };
    }).filter(Boolean).sort((a: any, b: any) => b.amount - a.amount);

  }, [expenses, categories]);

  // Handle bill calculation
  const upcomingBillsAmount = useMemo(() => {
    return (bills || [])
      .filter((b: any) => !b.isPaid)
      .reduce((s: number, b: any) => s + b.amount, 0);
  }, [bills]);

  const dueBillsCount = useMemo(() => {
    return (bills || []).filter((bill: any) => !bill.isPaid).length;
  }, [bills]);


  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <main className="flex-grow pb-20 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Welcome!</h1>
              <p className="text-muted-foreground text-sm mt-1">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2 ">
              <Button
                variant="outline"
                className="flex items-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setShowSetBudget(true)}
              >
                <span>Set Budget</span>
              </Button>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center space-x-2"
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
              value={`$${totalSpent.toFixed(2)}`}
              trend={{ value: 0, positive: true }}
              progressValue={totalSpent}
              progressMax={totalBudget}
              progressLabel={`Budget: $${totalBudget}`}
            />

            <SummaryCard
              title="Savings Goals"
              value={goals && goals.length > 0 ? `$${goals[0].currentAmount} / $${goals[0].targetAmount}` : "$0 / $0"}
            />

            <SummaryCard
              title="Upcoming Bills"
              value={`$${upcomingBillsAmount.toFixed(2)}`}
              secondaryInfo={dueBillsCount > 0 ? (<span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md flex items-center">{dueBillsCount} due soon</span>) : null}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <ExpenseChart data={chartData} period={period} onPeriodChange={(p: any) => setPeriod(p)} onDateRangeChange={() => { }} />

            <CategoryBreakdown categories={categoriesBreakdown as any[]} total={totalSpent} />

          </div>

          <RecentTransactions transactions={recentTransactions} />

          <SavingsGoals goals={goals || []} onAddGoal={() => { }} />

          <AddExpenseDialog open={showAddExpense} onOpenChange={setShowAddExpense} />

          <SetBudgetDialog open={showSetBudget} onOpenChange={setShowSetBudget} monthlyBudget={(budgets && budgets.find((b: any) => b.categoryId === null && b.period === "monthly")?.amount) || 0} weeklyBudget={(budgets && budgets.find((b: any) => b.categoryId === null && b.period === "weekly")?.amount) || 0} onSave={() => { }} />
        </div>
      </main>
      <MobileNavigation />
      <Toaster />
    </div>
  );
}

// Wrapper to provide QueryClient
export default function DashboardClient({ summary }: any) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DashboardContent initialSummary={summary} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
