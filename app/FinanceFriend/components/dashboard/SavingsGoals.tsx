"use client"
import { Link } from "wouter";
import { format } from "date-fns";
import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { AddGoalDialog } from "../goals/AddGoalDialog";

interface SavingsGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date | null;
  icon: string;
}

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, "id">) => Promise<void>;
}

export function SavingsGoals({ goals, onAddGoal }: SavingsGoalsProps) {
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);

  // Calculate percentage completed and daily savings needed
  const calculateGoalStats = (goal: SavingsGoal) => {
    const percentComplete = Math.round((goal.currentAmount / goal.targetAmount) * 100);

    let dailyAmount = 0;
    if (goal.targetDate) {
      const daysLeft = Math.max(1, Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
      dailyAmount = (goal.targetAmount - goal.currentAmount) / daysLeft;
    }

    return { percentComplete, dailyAmount };
  };

  return (
    <Card className="bg-white/[0.02] rounded-xl shadow-sm border border-border backdrop-blur-md">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">Savings Goals</h3>
          <Button
            variant="link"
            className="text-primary hover:text-primary/80 font-medium"
            onClick={() => setIsAddGoalOpen(true)}
          >
            + New Goal
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const { percentComplete, dailyAmount } = calculateGoalStats(goal);
            return (
              <div key={goal.id} className="bg-muted/30 rounded-lg p-4 border border-border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-foreground">{goal.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {goal.targetDate
                        ? `Target date: ${format(new Date(goal.targetDate), 'MMM yyyy')}`
                        : 'Ongoing'}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary/10">
                    <i className={`${goal.icon} text-primary`}></i>
                  </div>
                </div>

                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Goal: ${goal.targetAmount.toFixed(2)}</p>
                    <p className="text-lg font-semibold text-foreground">${goal.currentAmount.toFixed(2)} saved</p>
                  </div>
                  <span className="text-sm font-medium text-primary">{percentComplete}%</span>
                </div>

                <Progress className="h-2 bg-muted" value={percentComplete} />

                <p className="text-xs text-muted-foreground mt-2">
                  {goal.targetDate
                    ? `$${dailyAmount.toFixed(2)}/day to reach your goal`
                    : `$${(goal.targetAmount * 0.05).toFixed(2)}/month recommended saving`}
                </p>
              </div>
            );
          })}

          {goals.length === 0 && (
            <div className="col-span-full py-8 text-center">
              <p className="text-muted-foreground mb-4">You don&apos;t have any savings goals yet</p>
              <Button
                size="sm"
                onClick={() => setIsAddGoalOpen(true)}
              >
                Create Your First Goal
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <AddGoalDialog
        open={isAddGoalOpen}
        onOpenChange={setIsAddGoalOpen}
        onAddGoal={onAddGoal}
      />
    </Card>
  );
}
