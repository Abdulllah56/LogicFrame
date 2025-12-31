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
const RecentTransactions = dynamic(() => import("../components/dashboard/RecentTransactions").then(mod => mod.RecentTransactions), { ssr: false, loading: () => <div className="h-24 flex items-center justify-center">Loading...</div> });
const SavingsGoals = dynamic(() => import("../components/dashboard/SavingsGoals").then(mod => mod.SavingsGoals), { ssr: false, loading: () => <div className="h-24 flex items-center justify-center">Loading...</div> });
const AddExpenseDialog = dynamic(() => import("../components/expenses/AddExpenseDialog").then(mod => mod.AddExpenseDialog), { ssr: false });
const SetBudgetDialog = dynamic(() => import("../components/dashboard/SetBudgetDialog").then(mod => mod.SetBudgetDialog), { ssr: false });
import { PlusIcon } from "lucide-react";

// Lazy-load the chart component so it doesn't bloat the initial JS
const ExpenseChart = dynamic(
  () => import("../components/dashboard/ExpenseChart").then((mod) => mod.ExpenseChart),
  { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center">Loading chart...</div> }
);

export default function DashboardClient({ summary }: any) {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSetBudget, setShowSetBudget] = useState(false);
  const [period, setPeriod] = useState("day");

  const expenses = summary?.recentTransactions || [];
  const categories = summary?.categoryBreakdown ? summary.categoryBreakdown.map((c: any) => ({ id: c.id, name: c.name, color: c.color })) : [];
  const bills = []; // keep bills minimal in client — summary already has aggregated upcoming amount
  const goals = summary?.goals || [];
  const budgets = [{ categoryId: null, period: 'monthly', amount: summary?.totalBudget || 0 }];

  // Compute totals & chart on the client from the small `summary` payload (cheap for small lists).
  // We'll compute `totalSpent`/`totalBudget` below with useMemo and ensure chart generation uses server data when available.


  const totalSpent = useMemo(() => {
    // For initial render, sum all expenses
    return expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  }, [expenses]);

  const totalBudget = useMemo(() => {
    const monthly = budgets && budgets.find((b: any) => b.categoryId === null && b.period === "monthly");
    return monthly ? monthly.amount : 0;
  }, [budgets]);

  const chartData = useMemo(() => {
    // Replicate server-side helper quickly on client when interaction changes
    const formatChartData = (expensesList: any[], view: string) => {
      if (!expensesList.length) return [];

      if (view === "day") {
        // Prefer server-provided chart data for day view when available (it's pre-aggregated and cheaper).
        if (summary?.chartData && summary.chartData.length) return summary.chartData;
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dailyData = new Array(7).fill(0).map((_, i) => ({ date: days[i], amount: 0 }));
        expensesList.forEach((expense) => {
          const day = new Date(expense.date).getDay();
          dailyData[day].amount += expense.amount;
        });
        return dailyData;
      }

      if (view === "week") {
        const weeksData = new Array(4).fill(0).map((_, i) => ({ date: `Week ${i + 1}`, amount: 0 }));
        expensesList.forEach((expense) => {
          const date = new Date(expense.date);
          const weekOfMonth = Math.floor((date.getDate() - 1) / 7);
          if (weekOfMonth < 4) weeksData[weekOfMonth].amount += expense.amount;
        });
        return weeksData;
      }

      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const monthlyData = new Array(12).fill(0).map((_, i) => ({ date: months[i], amount: 0 }));
      expensesList.forEach((expense) => {
        const month = new Date(expense.date).getMonth();
        monthlyData[month].amount += expense.amount;
      });
      return monthlyData;
    };
    return formatChartData(expenses, period);
  }, [expenses, period]);

  const recentTransactions = useMemo(() => {
    if (!expenses || !categories) return [];
    const sorted = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted.slice(0,5).map((expense) => {
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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
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
                <SummaryCard title="Monthly Spending" value={`$${totalSpent.toFixed(2)}`} trend={{ value: 4.5, positive: true }} progressValue={totalSpent} progressMax={totalBudget} progressLabel={`Budget: $${totalBudget}`} />

                <SummaryCard title="Savings Goals" value={goals && goals.length > 0 ? `$${goals[0].currentAmount} / $${goals[0].targetAmount}` : "$0 / $0"} />

                <SummaryCard title="Upcoming Bills" value={`$${(bills || []).filter((b: any) => !b.isPaid).reduce((s: number, b: any) => s + b.amount, 0).toFixed(2)}`} secondaryInfo={(bills && bills.filter((bill: any) => !bill.isPaid).length > 0) ? (<span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md flex items-center">{bills.filter((bill:any)=>!bill.isPaid).length} due soon</span>) : null} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <ExpenseChart data={chartData} period={period} onPeriodChange={(p: any) => setPeriod(p)} onDateRangeChange={() => {}} />

                <CategoryBreakdown categories={[]} total={totalSpent} />
              </div>

              <RecentTransactions transactions={recentTransactions} />

              <SavingsGoals goals={goals || []} onAddGoal={() => {}} />

              <AddExpenseDialog open={showAddExpense} onOpenChange={setShowAddExpense} />

              <SetBudgetDialog open={showSetBudget} onOpenChange={setShowSetBudget} monthlyBudget={(budgets && budgets.find((b: any) => b.categoryId === null && b.period === "monthly")?.amount) || 0} weeklyBudget={(budgets && budgets.find((b: any) => b.categoryId === null && b.period === "weekly")?.amount) || 0} onSave={() => {}} />
            </div>
          </main>
          <MobileNavigation />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
