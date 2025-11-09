"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../client/lib/queryClient";
import { TooltipProvider } from "../components/ui/tooltip";
import { Toaster } from "../components/ui/toaster";
import Header from "../components/layout/Header";
import MobileNavigation from "../components/layout/MobileNavigation";
import { useGoals } from "../client/lib/hooks/useGoals";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { PlusIcon, PiggyBankIcon } from "lucide-react";
import { GoalCard } from "../components/goals/GoalCard";
import { AddGoalDialog } from "../components/goals/AddGoalDialog";
import { formatCurrency } from "../client/utils/date-utils";
import { Progress } from "../components/ui/progress";
import { useToast } from "../client/hooks/use-toast";

function GoalsContent() {
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const { data: goals = [], isLoading, addGoal, updateGoal } = useGoals();
  const { toast } = useToast();

  const handleAddGoal = async (goal) => {
    try {
      await addGoal(goal);
      toast({
        title: "Goal created",
        description: "Your savings goal has been created successfully",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleUpdateGoal = async (id, amount) => {
    try {
      await updateGoal(id, { currentAmount: amount });
      toast({
        title: "Goal updated",
        description: "Your savings goal has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const totalSaved = goals.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0);
  const totalTarget = goals.reduce((sum, goal) => sum + (goal.targetAmount || 0), 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const sortedGoals = [...goals].sort((a, b) => {
    const percentA = a.targetAmount > 0 ? (a.currentAmount / a.targetAmount) * 100 : 0;
    const percentB = b.targetAmount > 0 ? (b.currentAmount / b.targetAmount) * 100 : 0;
    return percentA - percentB;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">Savings Goals</h1>
        <Button
          className="bg-[#0F172A] text-white hover:bg-[#1E293B] flex items-center space-x-2"
          onClick={() => setIsAddGoalOpen(true)}
        >
          <PlusIcon size={16} />
          <span>New Goal</span>
        </Button>
      </div>

      {goals.length > 0 && (
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Overall Savings Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-gray-500">Total Saved</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalSaved)}</p>
                  <p className="text-gray-500 pb-1">of {formatCurrency(totalTarget)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <PiggyBankIcon className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-lg font-medium text-blue-600">{overallProgress}%</span>
              </div>
            </div>

            <Progress value={overallProgress} className="h-2" />

            <div className="mt-4 text-sm text-gray-500">
              {goals.length} active savings {goals.length === 1 ? 'goal' : 'goals'}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <p>Loading goals...</p>
        </div>
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              id={goal.id}
              name={goal.name}
              targetAmount={goal.targetAmount}
              currentAmount={goal.currentAmount}
              targetDate={goal.targetDate}
              icon={goal.icon}
              onUpdate={handleUpdateGoal}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
              <PiggyBankIcon className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No savings goals yet</h3>
          <p className="text-gray-500 mb-4">Start saving for something special</p>
          <Button onClick={() => setIsAddGoalOpen(true)}>Create Your First Goal</Button>
        </div>
      )}

      <AddGoalDialog
        open={isAddGoalOpen}
        onOpenChange={setIsAddGoalOpen}
        onAddGoal={handleAddGoal}
      />
    </div>
  );
}

export default function Goals() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="flex-grow pb-20 md:pb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <GoalsContent />
            </div>
          </main>
          <MobileNavigation />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}