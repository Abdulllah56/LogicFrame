"use client"
import { useState } from "react";
import { useGoals } from "../client/lib/hooks/useGoals";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { PlusIcon, PiggyBankIcon } from "lucide-react";
import { GoalCard } from "../components/goals/GoalCard";
import { AddGoalDialog } from "../components/goals/AddGoalDialog";
import { formatCurrency } from "../client/lib/utils/date-utils";
import { Progress } from "../components/ui/progress";
import { useToast } from "../client/hooks/use-toast";
import { apiRequest } from "../client/lib/queryClient";
import { queryClient } from "../client/lib/queryClient";

export default function Goals() {
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const { data: goals, isLoading, addGoal, updateGoal } = useGoals();
  const { toast } = useToast();

  const handleAddGoal = async (goal: any) => {
    try {
      console.log("handleAddGoal called with:", goal);
      const result = await addGoal(goal);
      console.log("addGoal result:", result);
      toast({
        title: "Goal created",
        description: "Your savings goal has been created successfully",
      });
      return result;
    } catch (error) {
      console.error("Error in handleAddGoal:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create goal. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateGoal = async (id: number, amount: number) => {
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

  const handleDeleteGoal = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/goals/${id}`);
      await queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal deleted",
        description: "Your goal has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate total progress
  const goalsArray = Array.isArray(goals) ? goals : [];
  const totalSaved = goalsArray.reduce((sum: number, goal: any) => sum + goal.currentAmount, 0);
  const totalTarget = goalsArray.reduce((sum: number, goal: any) => sum + goal.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  // Sort goals by percentage complete (ascending)
  const sortedGoals = goalsArray.length > 0 ? [...goalsArray].sort((a: any, b: any) => {
    const percentA = (a.currentAmount / a.targetAmount) * 100;
    const percentB = (b.currentAmount / b.targetAmount) * 100;
    return percentA - percentB;
  }) : [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white mb-4 sm:mb-0">Savings Goals</h1>
        <Button
          className="bg-[#0F172A] text-white border border-cyan-500/30 hover:bg-[#1E293B] hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-cyan-900/20"
          onClick={() => setIsAddGoalOpen(true)}
        >
          <PlusIcon size={16} className="text-cyan-400" />
          <span>New Goal</span>
        </Button>
      </div>

      {/* Overall Progress Card */}
      {goalsArray.length > 0 && (
        <Card className="mb-8 bg-slate-900 border-slate-800 text-white shadow-xl shadow-black/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-cyan-50">Overall Savings Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-slate-400">Total Saved</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-semibold text-white">{formatCurrency(totalSaved)}</p>
                  <p className="text-slate-500 pb-1">of {formatCurrency(totalTarget)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-center">
                  <PiggyBankIcon className="h-6 w-6 text-cyan-400" />
                </div>
                <span className="text-lg font-medium text-cyan-400">{overallProgress}%</span>
              </div>
            </div>

            <Progress value={overallProgress} className="h-2 bg-slate-800 [&>div]:bg-cyan-500" />

            <div className="mt-4 text-sm text-slate-400">
              {goalsArray.length} active savings {goalsArray.length === 1 ? 'goal' : 'goals'}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <p className="text-slate-400">Loading goals...</p>
        </div>
      ) : (
        <>
          {goalsArray.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedGoals.map((goal: any) => (
                <GoalCard
                  key={goal.id}
                  id={goal.id}
                  name={goal.name}
                  targetAmount={goal.targetAmount}
                  currentAmount={goal.currentAmount}
                  targetDate={goal.targetDate}
                  icon={goal.icon}
                  onUpdate={handleUpdateGoal}
                  onDelete={handleDeleteGoal}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-900 rounded-lg border border-slate-800 shadow-xl">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center">
                  <PiggyBankIcon className="h-8 w-8 text-slate-500" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-white mb-1">No savings goals yet</h3>
              <p className="text-slate-400 mb-4">Start saving for something special</p>
              <Button
                onClick={() => setIsAddGoalOpen(true)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                Create Your First Goal
              </Button>
            </div>
          )}
        </>
      )}

      {/* Add Goal Dialog */}
      <AddGoalDialog
        open={isAddGoalOpen}
        onOpenChange={setIsAddGoalOpen}
      />
    </div>
  );
}
